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
 * Keeping this free of database access is deliberate: the ingestion path in
 * `pipeline.ts` stays thin, and the parsing rules are unit-testable without
 * Supabase (see `criteria.test.ts`).
 */

export type CriteriaSource = "field" | "description";

export interface CriteriaExtraction {
  texts: string[];
  source: CriteriaSource | null;
}

/** Sanity bound: a ticket with 20+ criteria is a ticket, not a criterion list. */
export const MAX_CRITERIA_PER_TICKET = 20;

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

/**
 * Criteria from the configured custom field. Accepted shapes:
 *   ["as a shopper, …", …]                  array of strings
 *   [{value: "…"}, {name: "…"}]             array of objects (multi-select, radio)
 *   "line 1\nline 2"                        multi-line string → split per non-empty line
 */
export function criteriaFromField(value: unknown): string[] {
  const texts: string[] = [];
  const push = (text: string | null) => {
    if (text && !texts.includes(text)) texts.push(text);
  };
  if (Array.isArray(value)) {
    for (const entry of value) push(fieldEntryText(entry));
  } else if (typeof value === "string") {
    for (const line of value.split(/\r?\n/)) push(line.trim() || null);
  } else {
    push(fieldEntryText(value));
  }
  return texts.slice(0, MAX_CRITERIA_PER_TICKET);
}

const HEADING = /^\s*(?:#{1,6}\s*)?\**\s*acceptance criteria\s*\**\s*:?\s*$/i;
const BULLET = /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/;

/**
 * Criteria from a strictly delimited description section: a heading line
 * containing "acceptance criteria", then bullet (`-`, `*`, `+`, `1.`) lines.
 * Parsing stops at the first non-list, non-blank line, so a later "Notes"
 * paragraph can never leak into the criterion set. A single criterion on one
 * line after the heading (no bullet) is accepted — that is still the author
 * writing it as a list of one.
 */
export function criteriaFromDescription(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const lines = value.split(/\r?\n/);
  const start = lines.findIndex((line) => HEADING.test(line));
  if (start < 0) return [];

  const texts: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "") continue;
    const bullet = BULLET.exec(line);
    if (bullet) {
      const text = bullet[1]!.trim();
      if (text && !texts.includes(text)) texts.push(text);
      continue;
    }
    // Not a bullet: as long as we already have bullets this ends the section;
    // with nothing yet it is a single unbulleted criterion.
    if (texts.length > 0) break;
    if (HEADING.test(line)) break;
    texts.push(line.trim());
    break;
  }
  return texts.slice(0, MAX_CRITERIA_PER_TICKET);
}

/**
 * Resolve the criteria of one Jira issue. The configured field wins when it
 * yields at least one criterion; otherwise the description fallback. Returning
 * `source: null` means the ticket states no criteria, and ingestion records
 * none — the absence is never papered over by inventing a criterion.
 */
export function extractCriteria(
  payload: Record<string, unknown>,
  fieldKey: string | null | undefined,
): CriteriaExtraction {
  const fields = (payload.issue as Record<string, unknown> | undefined)?.fields as
    | Record<string, unknown>
    | undefined;
  if (!fields) return { texts: [], source: null };

  if (fieldKey) {
    const texts = criteriaFromField(fields[fieldKey]);
    if (texts.length > 0) return { texts, source: "field" };
  }
  const description = criteriaFromDescription(fields.description);
  if (description.length > 0) return { texts: description, source: "description" };
  return { texts: [], source: null };
}
