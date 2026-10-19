import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextPacket, GatedVerdict, StopReason } from "@unify/contracts";
import { unwrap } from "../db.js";
import type { PassRecord } from "../verifier/loop.js";

type Completion =
  | { state: "cancelled" }
  | { state: "succeeded"; verdictId: string; findingId: string };

/** Publish only while this job's criterion revision is still current. */
export async function completeVerificationJob(
  client: SupabaseClient,
  jobId: string,
  verdict: GatedVerdict,
  criterionExternalId: string,
): Promise<Completion> {
  const result = await unwrap(client.rpc("complete_verification_job", {
    p_job_id: jobId,
    p_annotation: findingAnnotation(verdict, criterionExternalId),
    p_verdict: {
      id: verdict.id, packet_id: verdict.packetId, status: verdict.status,
      evidence: verdict.evidence, reason: verdict.reason, missing_evidence: verdict.missingEvidence,
      divergence_tag: verdict.divergenceTag, freshness_state: verdict.freshnessState,
      review_required: verdict.reviewRequired, reason_code: verdict.reasonCode,
      pass_count: verdict.passCount, stop_reason: verdict.stopReason,
      gate_outcome: verdict.gateOutcome, model_and_run: verdict.modelAndRun,
    },
  }), "completeVerificationJob") as Completion | null;
  if (!result) throw new Error("completeVerificationJob returned no result");
  return result;
}

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
