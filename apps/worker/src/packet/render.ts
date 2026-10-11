import type { AssembledSlot } from "./assemble.js";

/**
 * Prompt rendering (FR-08, §11.5).
 *
 * The rendered packet is **data only**: sections in assembly order, every item
 * prefixed with its citation handle, no instructions, no interpretation. The
 * instructions belong to the pass that runs (`src/verifier/prompts.ts`), which
 * is why `prompt_hash` on the packet row hashes template + version while each
 * `verifier_passes` row hashes its own pass instruction. Keeping the two apart
 * means a change to *how we ask* does not change the packet hash, and a change
 * to *what we feed* does — exactly the distinction reproducibility needs.
 */

export const PACKET_TEMPLATE_VERSION = "unify-packet-v1";

export interface RenderInput {
  criterion: {
    id: string;
    text: string;
    requirementRef?: string | null;
  };
  baseCommit: string;
  headCommit: string;
  slots: readonly AssembledSlot[];
  /** Sum of admitted tokens — echoed so a run can be checked against budgets. */
  tokensUsed: number;
}

function header(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** Section body for one slot, in packet order. */
function section(slot: AssembledSlot): string {
  if (slot.items.length === 0) {
    return `## ${slot.slot}\n(empty)`;
  }
  const lines = slot.items.map((item) => {
    const where = item.cite
      ? [
          item.cite.file,
          item.cite.symbol ? `#${item.cite.symbol}` : null,
          item.cite.startLine
            ? `:${item.cite.startLine}${item.cite.endLine && item.cite.endLine !== item.cite.startLine ? `-${item.cite.endLine}` : ""}`
            : null,
        ]
          .filter(Boolean)
          .join("")
      : null;
    const locator = where ? ` ${where}` : "";
    return `\n[${item.id}] (${item.kind})${locator}\n${item.content.trimEnd()}\n`;
  });
  return `## ${slot.slot}\n${lines.join("")}`;
}

/**
 * Render the packet body handed to every pass. Byte-identical for identical
 * inputs — no timestamps, no map iteration order, no locale-dependent
 * formatting.
 */
export function renderPacket(input: RenderInput): string {
  const lines = [
    header("packet_template", PACKET_TEMPLATE_VERSION),
    header("criterion_id", input.criterion.id),
    header("criterion", input.criterion.text),
    header("requirement_ref", input.criterion.requirementRef ?? "(none)"),
    header("revision_base", input.baseCommit),
    header("revision_head", input.headCommit),
    header("tokens_used", String(input.tokensUsed)),
    "",
  ];
  const body = input.slots.map(section).join("\n\n");
  return `${lines.join("\n")}\n${body}\n`;
}
