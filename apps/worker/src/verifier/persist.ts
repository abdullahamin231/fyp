import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextPacket, GatedVerdict, StopReason } from "@unify/contracts";
import { unwrap } from "../db.js";
import type { PassRecord } from "../verifier/loop.js";

/**
 * Persistence for one verified criterion — the rows a reviewer will read.
 *
 * Every write is append-only by design: packets, verdicts and pass logs are
 * inserted once and re-readable forever (00005/00013 triggers), and a
 * re-verification appends a *new* packet + verdict pair. The only mutable row
 * is the finding, whose lifecycle (open → acknowledged/disputed/resolved, or
 * superseded by a newer verdict) is what FR-18 describes.
 */

/** `context_packets` has no workspace column — tenancy flows through the criterion node. */
export async function insertContextPacket(
  client: SupabaseClient,
  packet: ContextPacket,
): Promise<void> {
  await unwrap(
    client.from("context_packets").insert({
      id: packet.id,
      criterion_node_id: packet.criterionNodeId,
      base_commit: packet.baseCommit,
      head_commit: packet.headCommit,
      token_budget: packet.tokenBudget,
      slot_budgets: packet.slotBudgets,
      manifest: packet.manifest,
      prompt_hash: packet.promptHash,
      packet_hash: packet.packetHash,
    }),
    "insertContextPacket",
  );
}

export async function insertPasses(
  client: SupabaseClient,
  jobId: string,
  passes: readonly PassRecord[],
): Promise<void> {
  if (passes.length === 0) return;
  await unwrap(
    client.from("verifier_passes").insert(
      passes.map((pass) => ({
        job_id: jobId,
        pass_no: pass.passNo,
        prompt_hash: pass.promptHash,
        input_refs: pass.inputRefs,
        raw_output: pass.rawOutput,
        parsed_ok: pass.parsedOk,
        stop_reason: pass.stopReason,
        model_and_run: pass.modelAndRun,
        duration_ms: pass.durationMs,
      })),
    ),
    "insertPasses",
  );
}

export async function insertVerdict(
  client: SupabaseClient,
  verdict: GatedVerdict,
  jobId: string,
): Promise<void> {
  await unwrap(
    client.from("verdicts").insert({
      id: verdict.id,
      packet_id: verdict.packetId,
      job_id: jobId,
      status: verdict.status,
      evidence: verdict.evidence,
      reason: verdict.reason,
      missing_evidence: verdict.missingEvidence,
      divergence_tag: verdict.divergenceTag,
      freshness_state: verdict.freshnessState,
      review_required: verdict.reviewRequired,
      reason_code: verdict.reasonCode,
      pass_count: verdict.passCount,
      stop_reason: verdict.stopReason,
      gate_outcome: verdict.gateOutcome,
      model_and_run: verdict.modelAndRun,
    }),
    "insertVerdict",
  );
}

const SEVERITY: Record<GatedVerdict["status"], "critical" | "high" | "medium" | "low"> = {
  CONTRADICTED: "critical",
  PARTIAL: "high",
  INSUFFICIENT_EVIDENCE: "medium",
  SUPPORTED: "low",
};

/**
 * The finding states a re-verification may supersede (team decision, recorded
 * in `docs/adr/0001-verification-queue.md`).
 *
 * Only findings a reviewer is still looking at are replaced: `resolved` and
 * `suppressed` are closures a human chose, and silently wiping them because a
 * job re-ran would erase a decision the product exists to record. A new
 * evidence state is still recorded — the verdict row is always appended — it
 * simply does not force a closed finding back open.
 */
export const LIVE_FINDING_STATES = ["open", "acknowledged", "disputed"] as const;

/**
 * Does this verdict need a row in the reviewer's queue?
 *
 * Yes — always. A decisive, well-cited, gate-passing `SUPPORTED` verdict is
 * not a *conflict*, but it is still an outcome of the one workflow the product
 * runs, and "the evidence supports this change" is exactly what a reviewer
 * needs to see. Severity carries the difference instead: a contradiction is
 * `critical`, an abstention `medium`, a verified change `low`, so the same
 * inbox reads as a priority-ordered list of verification results rather than a
 * pile of problems.
 *
 * (An earlier revision skipped `SUPPORTED` and kept it readable only as a
 * verdict row — which made the product's normal case invisible in the surface
 * it exists to inform.)
 */
export function shouldCreateFinding(_verdict: GatedVerdict): boolean {
  return true;
}

export function findingAnnotation(verdict: GatedVerdict, criterionExternalId: string): string {
  const citations = verdict.evidence.length;
  const gateNote = verdict.gateOutcome === "PASSED" ? "" : ` [gate: ${verdict.gateOutcome}]`;
  return `${criterionExternalId}: ${verdict.status} — ${verdict.reason} (${citations} citation(s), ${verdict.passCount} pass(es), ${verdict.stopReason})${gateNote}`;
}

export interface VerdictFindingParams {
  verdict: GatedVerdict;
  criterionNodeId: string;
  criterionExternalId: string;
  /** Supersede any still-live verdict finding for the same criterion (FR-15). */
  supersedeLive?: boolean;
}

/**
 * Create the evidence-case finding for a verdict, or `null` when the verdict
 * needs no queue entry.
 *
 * The idempotency key is the verdict id, so a retried job can never create two
 * findings for one verdict, and superseding keeps at most one *live* finding
 * per criterion: predecessors in `LIVE_FINDING_STATES` become `superseded` and
 * point at the new row (00012), so the older verdict stays readable against the
 * evidence it cited. A `resolved` or `suppressed` finding is a decision a
 * reviewer made; re-verification records a new verdict but does not reopen it.
 */
export async function upsertVerdictFinding(
  client: SupabaseClient,
  params: VerdictFindingParams,
): Promise<string | null> {
  const { verdict } = params;
  if (!shouldCreateFinding(verdict)) return null;

  const key = `verdict:${verdict.id}`;
  const existing = await client
    .from("findings")
    .select("id")
    .eq("idempotency_key", key)
    .maybeSingle();
  if (existing.error) throw new Error(`upsertVerdictFinding: ${existing.error.message}`);
  let findingId = (existing.data as { id: string } | null)?.id ?? null;

  if (!findingId) {
    const id = randomUUID();
    const inserted = await client
      .from("findings")
      .insert({
        id,
        subject_node_id: params.criterionNodeId,
        origin: "verdict",
        verdict_id: verdict.id,
        kind: "criterion_verification",
        idempotency_key: key,
        annotation: findingAnnotation(verdict, params.criterionExternalId),
        severity: SEVERITY[verdict.status],
        state: "open",
      })
      .select("id")
      .single();
    if (inserted.error) throw new Error(`upsertVerdictFinding: ${inserted.error.message}`);
    findingId = (inserted.data as { id: string }).id;
  }

  if (params.supersedeLive !== false) {
    const stale = await client
      .from("findings")
      .select("id")
      .eq("subject_node_id", params.criterionNodeId)
      .eq("origin", "verdict")
      .neq("id", findingId)
      .in("state", [...LIVE_FINDING_STATES]);
    if (stale.error) throw new Error(`upsertVerdictFinding: ${stale.error.message}`);
    const staleIds = ((stale.data ?? []) as { id: string }[]).map((row) => row.id);
    if (staleIds.length > 0) {
      const updated = await client
        .from("findings")
        .update({ state: "superseded", superseded_by_id: findingId })
        .in("id", staleIds);
      if (updated.error) throw new Error(`upsertVerdictFinding: ${updated.error.message}`);
    }
  }

  return findingId;
}

/** Close out a job. Terminal states only — the RPC enforces that too. */
export async function finishJob(
  client: SupabaseClient,
  jobId: string,
  state: "succeeded" | "failed" | "cancelled",
  stopReason: StopReason | null,
  error?: string,
): Promise<void> {
  await unwrap(
    client.rpc("finish_verification_job", {
      p_job_id: jobId,
      p_state: state,
      p_stop_reason: stopReason,
      p_error: error ?? null,
    }),
    "finishJob",
  );
}
