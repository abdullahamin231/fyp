/**
 * Jira acceptance criteria → Criterion node inputs.
 *
 * Deterministic by construction: the only two sources of criteria text are
 * (a) a structured custom field the workspace names once, and (b) a strictly
 * delimited "Acceptance Criteria" section in the issue description. Both are
 * recorded on the criterion node (`payload.source`) so a reviewer can see
 * where each criterion's text came from — nothing is paraphrased, merged or
 * reordered.
 *
 * A description arrives in one of three notations: Jira wiki markup (what
 * webhooks and REST v2 send), markdown (text pasted or written through the
 * API), or an Atlassian Document Format tree (REST v3). Each is lowered to the
 * same list of blocks, and one section reader runs over that list.
 *
 * Keeping this free of database access is deliberate: the ingestion path stays
 * thin, and the parsing rules are unit-testable without Supabase (see
 * `criteria.test.ts`).
 */

export type CriteriaSource = "field" | "description";

export interface CriteriaExtraction {
  texts: string[];
  source: CriteriaSource | null;
}

/** Sanity bound: a ticket with 20+ criteria is a ticket, not a criterion list. */
export const MAX_CRITERIA_PER_TICKET = 20;

/** An Atlassian Document Format node, as far as this parser reads it. */
export interface AdfNode {
  type: string;
  version?: number;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string }[];
  content?: AdfNode[];
}

/** One line-level unit of a document. Both notations lower to this. */
type Block = { kind: "heading" | "item" | "text"; text: string };

function isAdfDocument(value: unknown): value is AdfNode {
  return value !== null && typeof value === "object" && (value as AdfNode).type === "doc";
}

// ---------------------------------------------------------------------------
// Line markup: markdown and Jira wiki
// ---------------------------------------------------------------------------

/**
 * `#` starts a heading in markdown and a numbered item in wiki markup, so a
 * document is read in one dialect. Markdown is chosen only when the criteria
 * heading itself is written in markdown (`## …` or `**…**`); everything else
 * is wiki, Jira's own notation.
 */
const MARKDOWN_CRITERIA_HEADING = /^\s*(?:#{1,6}|\*\*)\s*acceptance criteria/i;

const MARKDOWN = {
  heading: /^\s*#{1,6}\s*(\S.*)$/,
  item: /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/,
};

// Nested wiki lists repeat the marker (`**`, `##`, `#*`); depth is flattened.
const WIKI = {
  heading: /^\s*h[1-6]\.\s*(.*)$/,
  item: /^\s*(?:[*#-]+|\d+[.)])\s+(.+)$/,
};

function blocksFromMarkup(value: string): Block[] {
  const lines = value.split(/\r?\n/);
  const dialect = lines.some((line) => MARKDOWN_CRITERIA_HEADING.test(line)) ? MARKDOWN : WIKI;
  const blocks: Block[] = [];
  for (const line of lines) {
    if (line.trim() === "") continue;
    const heading = dialect.heading.exec(line);
    const item = dialect.item.exec(line);
    if (heading) blocks.push({ kind: "heading", text: heading[1]!.trim() });
    else if (item) blocks.push({ kind: "item", text: item[1]!.trim() });
    else blocks.push({ kind: "text", text: line.trim() });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Atlassian Document Format
// ---------------------------------------------------------------------------

/** Block nodes whose children are themselves blocks of the same document. */
const ADF_CONTAINERS = new Set(["doc", "blockquote", "panel", "expand", "nestedExpand", "layoutSection", "layoutColumn"]);
const ADF_LISTS = new Set(["bulletList", "orderedList"]);

function inlineText(node: AdfNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  if (node.type === "mention" || node.type === "emoji") {
    const label = node.attrs?.text ?? node.attrs?.shortName;
    return typeof label === "string" ? label : "";
  }
  if (node.type === "inlineCard") return typeof node.attrs?.url === "string" ? node.attrs.url : "";
  return (node.content ?? []).map(inlineText).join("");
}

const squash = (value: string) => value.replace(/\s+/g, " ").trim();

function listBlocks(list: AdfNode): Block[] {
  const blocks: Block[] = [];
  for (const item of list.content ?? []) {
    const children = item.content ?? [];
    const own = squash(children.filter((child) => !ADF_LISTS.has(child.type)).map(inlineText).join(" "));
    if (own) blocks.push({ kind: "item", text: own });
    for (const nested of children.filter((child) => ADF_LISTS.has(child.type))) blocks.push(...listBlocks(nested));
  }
  return blocks;
}

function blocksFromAdf(node: AdfNode): Block[] {
  if (ADF_CONTAINERS.has(node.type)) return (node.content ?? []).flatMap(blocksFromAdf);
  if (ADF_LISTS.has(node.type)) return listBlocks(node);
  const text = squash(inlineText(node));
  if (!text) return [];
  return [{ kind: node.type === "heading" ? "heading" : "text", text }];
}

function toBlocks(value: unknown): Block[] {
  if (typeof value === "string") return blocksFromMarkup(value);
  if (isAdfDocument(value)) return blocksFromAdf(value);
  return [];
}

// ---------------------------------------------------------------------------
// Readers
// ---------------------------------------------------------------------------

/** "Acceptance Criteria", in any case, bold or not, with an optional colon. */
const CRITERIA_HEADING = /^[*_\s]*acceptance criteria[\s:*_]*$/i;

function distinct(texts: string[]): string[] {
  return [...new Set(texts.filter((text) => text !== ""))].slice(0, MAX_CRITERIA_PER_TICKET);
}

/** `KEY/AC-1`, `KEY/AC-2`, … — stable, per-ticket, one-based. */
export function criterionExternalIds(ticketKey: string, count: number): string[] {
  return Array.from({ length: Math.min(count, MAX_CRITERIA_PER_TICKET) }, (_, i) => `${ticketKey}/AC-${i + 1}`);
}

/** Text from one criterion entry in the configured field, or null. */
function fieldEntryText(entry: unknown): string | null {
  if (typeof entry === "string") return entry.trim() || null;
  if (entry && typeof entry === "object") {
    const record = entry as Record<string, unknown>;
    // Jira shapes seen in the wild: {value}, {name}, {text} (rich text), {label}.
    for (const key of ["value", "name", "text", "label"] as const) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}

const LIST_MARKER = /^\s*(?:[*#+-]+|\d+[.)])\s+/;

/**
 * Criteria from the configured custom field. Accepted shapes:
 *   ["as a shopper, …", …]                  array of strings
 *   [{value: "…"}, {name: "…"}]             array of objects (multi-select, radio)
 *   "line 1\nline 2" or "# one\n# two"      text → one per non-empty line, list markers dropped
 *   {type: "doc", …}                         rich text (ADF) → its list items, else its paragraphs
 */
export function criteriaFromField(value: unknown): string[] {
  if (Array.isArray(value)) return distinct(value.map((entry) => fieldEntryText(entry) ?? ""));
  if (typeof value === "string") return distinct(value.split(/\r?\n/).map((line) => line.replace(LIST_MARKER, "").trim()));
  if (isAdfDocument(value)) {
    const blocks = blocksFromAdf(value);
    const items = blocks.filter((block) => block.kind === "item");
    return distinct((items.length > 0 ? items : blocks).map((block) => block.text));
  }
  return distinct([fieldEntryText(value) ?? ""]);
}

/**
 * Criteria from a strictly delimited description section: a heading or line
 * reading "Acceptance Criteria", then list items (nested levels flattened, in
 * document order). Reading stops at the first block that is not a list item,
 * so a later "Notes" paragraph can never leak into the criterion set. A single
 * unlisted line right after the heading is accepted: that is still the author
 * writing a list of one.
 */
export function criteriaFromDescription(value: unknown): string[] {
  const blocks = toBlocks(value);
  const start = blocks.findIndex((block) => block.kind !== "item" && CRITERIA_HEADING.test(block.text));
  if (start < 0) return [];

  const texts: string[] = [];
  for (const block of blocks.slice(start + 1)) {
    if (block.kind === "item") {
      texts.push(block.text);
      continue;
    }
    if (texts.length === 0 && block.kind === "text" && !CRITERIA_HEADING.test(block.text)) texts.push(block.text);
    break;
  }
  return distinct(texts);
}

/** The text of a description in any notation, markup removed, one block per line. */
export function plainText(value: unknown): string {
  return toBlocks(value)
    .map((block) => block.text)
    .join("\n");
}

/**
 * Resolve the criteria of one Jira issue. The configured field wins when it
 * yields at least one criterion; otherwise the description fallback. Returning
 * `source: null` means the ticket states no criteria, and ingestion records
 * none — the absence is never papered over by inventing a criterion.
 *
 * Returns `null` when the payload does not carry the issue's description at
 * all. Comment and worklog webhooks send a trimmed issue; treating their
 * missing description as "no criteria" would retire every criterion.
 */
export function extractCriteria(
  payload: Record<string, unknown>,
  fieldKey: string | null | undefined,
): CriteriaExtraction | null {
  const fields = (payload.issue as Record<string, unknown> | undefined)?.fields as
    | Record<string, unknown>
    | undefined;
  if (!fields || !("description" in fields)) return null;

  if (fieldKey) {
    const texts = criteriaFromField(fields[fieldKey]);
    if (texts.length > 0) return { texts, source: "field" };
  }
  const description = criteriaFromDescription(fields.description);
  if (description.length > 0) return { texts: description, source: "description" };
  return { texts: [], source: null };
}
