import { createHash } from "node:crypto";

/**
 * Deterministic token counting for packet budgets (TODO §1.7).
 *
 * The estimator is a pinned, offline formula rather than a model tokenizer
 * download: it must run identically on a laptop, in CI and at the evaluation
 * tag, and its name is recorded in the packet manifest (`tokenEstimator`) so a
 * budget is never ambiguous about how it was measured.
 *
 * `chars_div_4_v1` — ceil(length / 4) — tracks real subword token counts to
 * within ~10% on code and prose, which is the accuracy a *budget* needs. It is
 * not a claim about the serving model's tokenizer; swapping in a real one is a
 * one-line change here plus a manifest note, and old packets keep their own
 * recorded estimator.
 */
export const TOKEN_ESTIMATOR = "chars_div_4_v1";

export function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
