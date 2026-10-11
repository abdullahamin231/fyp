import type { FreshnessState, GateOutcome, ReasonCode, StopReason } from "./enums.js";
import type { EvidenceSpan, GatedVerdict, VerifierOutput } from "./verdict.js";
import { gatedVerdictSchema, verifierOutputSchema } from "./verdict.js";

/**
 * The verdict / provenance gate (FR-10, proposal §11.8).
 *
 * A pure function — no I/O, no model, no clock — so the worker, the API and
 * the tests all execute literally the same five ordered checks that the
 * activity diagram draws:
 *
 *   1 · schema validation      malformed output is rejected, never coerced
 *   2 · citation resolution    every span must exist in the immutable packet
 *   3 · applicability          rule applicability · link eligibility ·
 *                              freshness · thresholds
 *   4 · HARD GATE 1            a decisive status citing no evidence span is
 *                              rejected and counted as an abstention
 *   5 · provenance             packet · model/settings · pass · citations
 *
 * The two invariants this file exists to guarantee:
 *
 * - **The gate may only lower a status.** There is no code path that raises
 *   one; the tests assert it.
 * - **No LLM output writes to the graph of truth.** What the gate returns is
 *   what gets stored, and what gets stored is allowed to be decisive only when
 *   every check passed.
 */

/** One recorded check, in the order the gate ran it (provenance, §11.8). */
export interface GateCheck {
  name:
    | "schema_validation"
    | "citation_resolution"
    | "rule_applicability"
    | "link_eligibility"
    | "freshness"
    | "threshold"
    | "hard_gate_1"
    | "provenance";
  ok: boolean;
  /** Why it failed (or what passed), verbatim for the audit trail. */
  detail: string;
}

/** What the gate needs to know about the world — all supplied by the caller. */
export interface GateContext {
  /** Id for the verdict row about to be written. */
  verdictId: string;
  /** The immutable packet this output was computed from. */
  packetId: string;
  /**
   * Citation handles present in the packet manifest — `PacketItem.id` values.
   * A span not in this set was never shown to the model (FR-10).
   */
  manifestItemIds: ReadonlySet<string>;
  /**
   * `PacketItem.id → sha256 of the cited text`, when the packet recorded one.
   * A mismatch means the model quoted something other than what it was given.
   */
  manifestContentShas?: ReadonlyMap<string, string>;
  /** Does the governing rule apply to this criterion at all? */
  ruleApplicable: boolean;
  /** Are the links the verdict would rest on decisive-eligible (FR-05)? */
  linksEligible: boolean;
  /** Confidence band check; `false` = below the floor for a decisive verdict. */
  thresholdsOk: boolean;
  /** Freshness of the sources behind the evidence (FR-10 / §8.4). */
  freshnessState: FreshnessState;
  /** Passes actually run (1..MAX_VERIFIER_PASSES). */
  passCount: number;
  /** Why the loop stopped. */
  stopReason: StopReason;
}

export interface GateResult {
  outcome: GateOutcome;
  /** Store this. `status` is never higher than the model asked for. */
  verdict: GatedVerdict;
  /** Every failed check's reason code, in evaluation order. Empty when passed. */
  reasons: ReasonCode[];
  /** All checks, passed and failed — the provenance record. */
  checks: GateCheck[];
}

/** Detail text used when the model output could not be parsed at all. */
const SCHEMA_FAILURE_REASON =
  "Verifier output failed strict schema validation and was rejected by the gate.";

/** Detail text used for hard gate 1. */
const NO_EVIDENCE_REASON =
  "Hard gate 1: a decisive status citing no evidence span is an abstention, not an answer.";

function schemaDetail(error: { issues: { path: readonly PropertyKey[]; message: string }[] }): string {
  return error.issues
    .map((issue) => `${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

/**
 * Build the stored verdict for a rejected run. The taxonomy still gets its
 * four-verdict shape: a rejection is recorded as `INSUFFICIENT_EVIDENCE` with
 * `gateOutcome = REJECTED`, so a rejected run can never be read as decisive.
 */
function rejectedVerdict(
  ctx: GateContext,
  reason: string,
  reasonCode: ReasonCode,
  evidence: EvidenceSpan[],
  base: Omit<VerifierOutput, "status" | "evidence" | "reason">,
): GatedVerdict {
  return gatedVerdictSchema.parse({
    id: ctx.verdictId,
    packetId: ctx.packetId,
    status: "INSUFFICIENT_EVIDENCE",
    evidence,
    reason,
    missingEvidence: base.missingEvidence,
    divergenceTag: base.divergenceTag,
    freshnessState: ctx.freshnessState,
    reviewRequired: true,
    reasonCode,
    passCount: ctx.passCount,
    stopReason: ctx.stopReason,
    gateOutcome: "REJECTED",
    modelAndRun: base.modelAndRun,
  });
}

/** Fallback run metadata when the output was too malformed to carry its own. */
function unknownRun(): VerifierOutput["modelAndRun"] {
  return {
    runId: "00000000-0000-4000-8000-000000000000",
    modelId: "unknown",
    modelVersion: "unknown",
    quantisation: "unknown",
    tokenizer: "unknown",
    settings: { temperature: 0 },
    startedAt: "1970-01-01T00:00:00Z",
    durationMs: 0,
  };
}

export function gate(raw: unknown, ctx: GateContext): GateResult {
  const checks: GateCheck[] = [];

  // ---- 1 · schema validation ------------------------------------------------
  const parsed = verifierOutputSchema.safeParse(raw);
  if (!parsed.success) {
    checks.push({
      name: "schema_validation",
      ok: false,
      detail: schemaDetail(parsed.error),
    });
    const asOutput = raw as Partial<VerifierOutput> | null;
    const base: Omit<VerifierOutput, "status" | "evidence" | "reason"> = {
      criterionId:
        typeof asOutput?.criterionId === "string" ? asOutput.criterionId : "(unparseable)",
      missingEvidence:
        typeof asOutput?.missingEvidence === "string" ? asOutput.missingEvidence : null,
      divergenceTag: null,
      modelAndRun: unknownRun(),
    };
    return {
      outcome: "REJECTED",
      verdict: rejectedVerdict(ctx, SCHEMA_FAILURE_REASON, "OTHER", [], base),
      reasons: ["OTHER"],
      checks,
    };
  }

  const output = parsed.data;
  checks.push({ name: "schema_validation", ok: true, detail: "strict schema parse passed" });

  const reasons: ReasonCode[] = [];
  const record = (name: GateCheck["name"], ok: boolean, detail: string, reason?: ReasonCode) => {
    checks.push({ name, ok, detail });
    if (!ok && reason) reasons.push(reason);
  };

  // ---- 2 · citation resolution ---------------------------------------------
  const kept: EvidenceSpan[] = [];
  const unresolved: string[] = [];
  const staleText: string[] = [];
  for (const span of output.evidence) {
    if (!ctx.manifestItemIds.has(span.spanId)) {
      unresolved.push(span.spanId);
      continue;
    }
    const expected = ctx.manifestContentShas?.get(span.spanId);
    if (expected !== undefined && expected !== span.contentSha256) {
      staleText.push(span.spanId);
      continue;
    }
    kept.push(span);
  }

  const citationOk = unresolved.length === 0 && staleText.length === 0;
  record(
    "citation_resolution",
    citationOk,
    citationOk
      ? `${kept.length}/${output.evidence.length} citations resolved against the packet`
      : [
          unresolved.length > 0
            ? `never shown to the model: ${unresolved.join(", ")}`
            : null,
          staleText.length > 0 ? `content hash mismatch: ${staleText.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("; "),
    "INVALID_CITATION",
  );

  // ---- 3 · applicability · link eligibility · freshness · thresholds --------
  record(
    "rule_applicability",
    ctx.ruleApplicable,
    ctx.ruleApplicable
      ? "the governing rule applies to this criterion"
      : "the governing rule does not apply to this criterion, so no decisive status may stand",
    "OTHER",
  );
  record(
    "link_eligibility",
    ctx.linksEligible,
    ctx.linksEligible
      ? "every supporting link is confirmed or system-confirmed (FR-05)"
      : "the verdict would rest on an inferred or unconfirmed link (FR-05)",
    "AMBIGUOUS_LINK",
  );
  const freshnessOk = ctx.freshnessState !== "STALE";
  record(
    "freshness",
    freshnessOk,
    freshnessOk
      ? `freshness ${ctx.freshnessState}`
      : "a linked source is SOURCE_STALE, so the affected criterion shows no verdict (UC-01)",
    "SOURCE_STALE",
  );
  record(
    "threshold",
    ctx.thresholdsOk,
    ctx.thresholdsOk
      ? "confidence band satisfied"
      : "supporting confidence is below the decisive threshold",
    "AMBIGUOUS_LINK",
  );

  const downgraded = reasons.length > 0;
  const status: VerifierOutput["status"] = downgraded ? "INSUFFICIENT_EVIDENCE" : output.status;
  const firstReason = reasons[0] ?? null;

  // ---- 4 · HARD GATE 1 ------------------------------------------------------
  // "A verdict citing no evidence span" is read literally (TODO §1.8): the
  // model claimed a decisive status and put nothing in `evidence`. An invalid
  // citation is FR-10's case — dropped and downgraded above — because a status
  // whose citations all failed resolution still lands as a downgrade, never as
  // a decisive answer.
  const noEvidence = output.status !== "INSUFFICIENT_EVIDENCE" && output.evidence.length === 0;
  if (noEvidence) {
    checks.push({ name: "hard_gate_1", ok: false, detail: NO_EVIDENCE_REASON });
    return {
      outcome: "REJECTED",
      verdict: rejectedVerdict(
        ctx,
        NO_EVIDENCE_REASON,
        firstReason ?? "OTHER",
        [],
        output,
      ),
      reasons: [...reasons, ...(firstReason ? [] : (["OTHER"] as const))],
      checks,
    };
  }
  checks.push({
    name: "hard_gate_1",
    ok: true,
    detail:
      output.status === "INSUFFICIENT_EVIDENCE"
        ? "an abstention needs no evidence span"
        : `${output.evidence.length} evidence span(s) cited — the model did not answer empty-handed`,
  });

  // ---- 5 · provenance -------------------------------------------------------
  // Unknown freshness never hides a citation, but it does force a human look.
  const reviewRequired = downgraded || ctx.freshnessState === "UNKNOWN";
  const outcome: GateOutcome = downgraded ? "DOWNGRADED" : "PASSED";

  const verdict = gatedVerdictSchema.parse({
    id: ctx.verdictId,
    packetId: ctx.packetId,
    status,
    evidence: kept,
    reason: downgraded
      ? `${output.reason} [gate: downgraded to INSUFFICIENT_EVIDENCE — ${reasons.join(", ")}]`
      : output.reason,
    missingEvidence: output.missingEvidence,
    divergenceTag: output.divergenceTag,
    freshnessState: ctx.freshnessState,
    reviewRequired,
    reasonCode: firstReason,
    passCount: ctx.passCount,
    stopReason: ctx.stopReason,
    gateOutcome: outcome,
    modelAndRun: output.modelAndRun,
  });

  checks.push({
    name: "provenance",
    ok: true,
    detail: `packet ${ctx.packetId} · model ${output.modelAndRun.modelId} · ${ctx.passCount} pass(es) · ${ctx.stopReason}`,
  });

  return { outcome, verdict, reasons, checks };
}

/** Convenience: has this output been rejected outright by the gate? */
export function isRejected(result: GateResult): boolean {
  return result.outcome === "REJECTED";
}

/**
 * Hard gate 2 (TODO §1.8): the same packet run N times at temperature 0 must
 * agree, or the configuration is not fit to be measured. Returns the share of
 * runs holding the modal `(status, sorted citations)` pair.
 */
export function repeatAgreement(outputs: readonly VerifierOutput[]): number {
  if (outputs.length === 0) return 1;
  const keys = outputs.map((o) =>
    JSON.stringify([o.status, [...o.evidence.map((e) => e.spanId)].sort()]),
  );
  const counts = new Map<string, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  const best = Math.max(...counts.values());
  return best / keys.length;
}
