import { sha256 } from "../packet/tokens.js";
import { PACKET_TEMPLATE_VERSION } from "../packet/render.js";

/**
 * Pass instructions for the bounded verifier loop (FR-09, §11.4–§11.6).
 *
 * Each pass gets a *fixed* instruction plus the *same* rendered packet. The
 * instruction is hashed into `verifier_passes.prompt_hash`, so "which prompt
 * template ran" is answerable per pass, and the packet body is hashed into
 * `context_packets.packet_hash`, so "what evidence it saw" is answerable per
 * run — the two provenance axes stay separate on purpose.
 *
 * The output shapes are stated exactly, and the schema check after extraction
 * is strict: a model that answers in prose, adds a field, or invents a
 * citation is rejected rather than repaired (§11.8 check 1).
 */
export type PassKind = "scope" | "verify" | "critic";

const SCOPE_INSTRUCTION = `You are the retrieval-scope stage of the UNIFY evidence verifier.
Decide whether the evidence packet contains anything that could decide the criterion above.
Changed code counts as applicable evidence even when no test covers it: a missing test is a gap to report in missingEvidence, not a reason to call the criterion inapplicable.
Do not evaluate the change. Do not use tools. Reply with exactly one JSON object and nothing else:

{"applicable": true|false, "reason": "<one sentence>", "missingEvidence": "<what is missing, or null>"}`;

const VERIFY_INSTRUCTION = `You are the verification stage of the UNIFY evidence verifier.
Judge the criterion against the evidence packet only. Reply with exactly one JSON object and nothing else:

{
  "criterionId": "<the criterion_id from the packet header>",
  "status": "SUPPORTED" | "CONTRADICTED" | "PARTIAL" | "INSUFFICIENT_EVIDENCE",
  "evidence": [
    {
      "spanId": "<an id printed in the packet>",
      "slot": "<the slot that id appeared under>",
      "file": "<file from the span header>",
      "symbol": "<the symbol from the span header, or null when it has none>",
      "startLine": 1,
      "endLine": 2,
      "contentSha256": "<the sha256 of that span's full text>"
    }
  ],
  "reason": "<one or two sentences>",
  "missingEvidence": null,
  "divergenceTag": null
}

Rules:
- Do not use any tools and do not run commands. Everything you need is in the packet.
- Write nothing before or after the JSON object: no prose, no markdown fences, no comments.
- Every span in the packet is printed as a header line: [spanId] (kind) file#symbol:startLine-endLine sha256=<digest>, followed by its text.
- spanId is the text inside the square brackets, copied exactly (for example SYM-01#card). Do not invent ids such as commit hashes or hunk labels.
- slot is the "## SLOT_NAME" heading the span appears under, copied exactly (for example SYMBOL_CARDS, DIFF_HUNKS, TEST_EVIDENCE). It is never the (kind) label.
- file, symbol, startLine and endLine repeat that header. symbol and startLine/endLine are null when the header has no #symbol or :range.
- contentSha256 is the digest after "sha256=" in that header, copied exactly. Never compute a hash yourself.
- evidence may cite ONLY spans printed in the packet. Citing anything else invalidates the answer.
- SUPPORTED or CONTRADICTED require at least one evidence span. If the packet cannot decide, answer INSUFFICIENT_EVIDENCE.
- PARTIAL means the evidence supports only part of the criterion; say what is missing in "missingEvidence".
- divergenceTag is null unless the requirement and the anchored code visibly diverge: "REQUIREMENT_CHANGED_ANCHOR_UNCHANGED" or "ANCHOR_CHANGED_REQUIREMENT_UNCHANGED". Use no other value.
- Do not emit "modelAndRun": run metadata is recorded by the verifier, not by you.`;

const CRITIC_INSTRUCTION = `You are the critic stage of the UNIFY evidence verifier (pass 3 of at most 3).
A draft verdict follows the evidence packet. Audit it: re-derive the answer from the packet yourself, then correct it if it over-claims, under-claims, or cites something the packet does not contain.
The critic may only LOWER a status — SUPPORTED/CONTRADICTED may become PARTIAL or INSUFFICIENT_EVIDENCE, never the other way round.
Reply with exactly one JSON object in the same shape the verification stage uses, and nothing else.`;

export const INSTRUCTIONS: Record<PassKind, string> = {
  scope: SCOPE_INSTRUCTION,
  verify: VERIFY_INSTRUCTION,
  critic: CRITIC_INSTRUCTION,
};

/**
 * Assemble one pass's prompt: `# pass: <kind>` marker (which the stub uses to
 * answer the right question), the fixed instruction, the packet, and — for the
 * critic — the draft it is auditing.
 */
export function passPrompt(kind: PassKind, packetText: string, draft?: unknown): string {
  const parts = [
    `# pass: ${kind}`,
    INSTRUCTIONS[kind],
    "--- evidence packet ---",
    packetText,
  ];
  if (draft !== undefined) {
    parts.push("--- draft verdict to audit ---", JSON.stringify(draft, null, 2));
  }
  return `${parts.join("\n\n")}\n`;
}

/** SHA-256 over template version + pass kind + instruction (the prompt contract). */
export function passPromptHash(kind: PassKind): string {
  return sha256(`${PACKET_TEMPLATE_VERSION}|${kind}|${INSTRUCTIONS[kind]}`);
}
