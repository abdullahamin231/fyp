import { z } from "zod";
import {
  MAX_VERIFIER_PASSES,
  divergenceTagSchema,
  freshnessStateSchema,
  gateOutcomeSchema,
  packetSlotSchema,
  reasonCodeSchema,
  stopReasonSchema,
  verdictStatusSchema,
} from "./enums.js";
import { commitSha, isoDateTime, nonEmpty, sha256Hex, uuid } from "./scalars.js";

/**
 * Verifier-output and verdict contracts (ERD `verdicts`, FR-09–FR-11, §11.4–§11.8).
 *
 * Two shapes, deliberately separate:
 *
 * 1. `verifierOutputSchema` — what the local model returns. Parsed strictly:
 *    a malformed output is rejected outright, never leniently coerced (§11.8).
 * 2. `gatedVerdictSchema` — what the deterministic gate emits and the system
 *    stores. The gate may only lower a status; it can never raise one.
 */

/** A citation into the immutable packet the verdict was computed from. */
export const evidenceSpanSchema = z.strictObject({
  /**
   * Must match a `PacketItem.id` present in the packet manifest. A citation
   * that resolves to nothing is `INVALID_CITATION` and the verdict is downgraded
   * or rejected — a verdict cannot cite a span the model was not shown.
   */
  spanId: nonEmpty,
  /** The slot the span came from, so the gate can check the packet manifest. */
  slot: packetSlotSchema,
  file: nonEmpty,
  symbol: nonEmpty.optional(),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  /** SHA-256 of the cited text — lets a stale citation be detected (FR-10). */
  contentSha256: sha256Hex,
});
export type EvidenceSpan = z.infer<typeof evidenceSpanSchema>;

/** What the model reports about the run that produced this output (§3.3). */
export const modelAndRunSchema = z.strictObject({
  runId: uuid,
  /** Pinned open-weight model id, e.g. `qwen2.5-coder-7b-instruct`. */
  modelId: nonEmpty,
  modelVersion: nonEmpty,
  /** e.g. `Q4_K_M`. Recorded so a run can be reproduced or ruled out. */
  quantisation: nonEmpty,
  tokenizer: nonEmpty,
  settings: z.strictObject({
    /** Hard gate 2 measures repeat agreement at temperature 0. */
    temperature: z.number().min(0).max(2),
    topP: z.number().min(0).max(1).optional(),
    maxTokens: z.number().int().positive().optional(),
    seed: z.number().int().optional(),
  }),
  startedAt: isoDateTime,
  durationMs: z.number().int().nonnegative(),
});
export type ModelAndRun = z.infer<typeof modelAndRunSchema>;

/**
 * Structured output of the bounded verifier loop (TODO §3.3 output schema).
 * Strict: unknown keys are an error, because a silently ignored extra field is
 * exactly how a fabricated citation reaches a reviewer.
 */
export const verifierOutputSchema = z.strictObject({
  criterionId: nonEmpty,
  status: verdictStatusSchema,
  /** Cited spans. Empty only for `INSUFFICIENT_EVIDENCE` (hard gate 1). */
  evidence: z.array(evidenceSpanSchema),
  reason: nonEmpty,
  /** What the packet lacked, in the model's words; `null` when nothing. */
  missingEvidence: z.string().nullable(),
  /** Set only when the run observed a P4 divergence (FR-24). */
  divergenceTag: divergenceTagSchema.nullable(),
  modelAndRun: modelAndRunSchema,
});
export type VerifierOutput = z.infer<typeof verifierOutputSchema>;

/**
 * A decisive status (`SUPPORTED`, `CONTRADICTED`, `PARTIAL`) with no evidence
 * span is not an answer — it is an abstention. Hard gate 1 (100% enforced).
 */
export function isAbstention(output: Pick<VerifierOutput, "status" | "evidence">): boolean {
  const decisive = output.status !== "INSUFFICIENT_EVIDENCE";
  return decisive && output.evidence.length === 0;
}

/**
 * Verdict as stored after the gate (ERD `verdicts`, FR-10, FR-11).
 *
 * `freshnessState`, `reviewRequired` and `reasonCode` are separate fields on
 * purpose: they are not derivable from `status` and the dataset taxonomy
 * requires them independently of it.
 */
export const gatedVerdictSchema = z.strictObject({
  id: uuid,
  /** The immutable packet this verdict was computed from (FR-11). */
  packetId: uuid,
  /** Post-gate status — the gate may only lower this. */
  status: verdictStatusSchema,
  evidence: z.array(evidenceSpanSchema),
  reason: nonEmpty,
  missingEvidence: z.string().nullable(),
  divergenceTag: divergenceTagSchema.nullable(),

  freshnessState: freshnessStateSchema,
  reviewRequired: z.boolean(),
  /** Why the status was lowered or held; `null` when nothing was questionable. */
  reasonCode: reasonCodeSchema.nullable(),

  passCount: z.number().int().min(1).max(MAX_VERIFIER_PASSES),
  stopReason: stopReasonSchema,
  gateOutcome: gateOutcomeSchema,
  modelAndRun: modelAndRunSchema,
});
export type GatedVerdict = z.infer<typeof gatedVerdictSchema>;

/** A verdict may only cite spans that exist in the packet it judged. */
export function unresolvedCitations(
  output: Pick<VerifierOutput, "evidence">,
  manifestItemIds: ReadonlySet<string>,
): string[] {
  return output.evidence.filter((span) => !manifestItemIds.has(span.spanId)).map((span) => span.spanId);
}

/** Base/head pair every verification is pinned to (FR-06, §22.2). */
export const revisionPairSchema = z.strictObject({
  baseCommit: commitSha,
  headCommit: commitSha,
});
export type RevisionPair = z.infer<typeof revisionPairSchema>;
