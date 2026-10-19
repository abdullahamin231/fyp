import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { gate, type GateOutcome, type StopReason, type VerdictStatus } from "@unify/contracts";
import type { Config } from "./config.js";
import { ensureEvidence } from "./analyser/enrich.js";
import { loadCriterion, loadLinkPolicy } from "./graph/nodes.js";
import type { ModelClient } from "./model/types.js";
import { buildPacket } from "./packet/builder.js";
import type { EvidenceProvider } from "./packet/provider.js";
import { gateInputsFrom } from "./verifier/gateInputs.js";
import { runVerifierLoop } from "./verifier/loop.js";
import {
  finishJob,
  insertContextPacket,
  insertPasses,
  completeVerificationJob,
} from "./verifier/persist.js";

/**
 * One job, end to end:
 *
 *   claim → gather evidence → build packet → bounded verifier loop →
 *   gate → persist verdict (+ finding) → finish job
 *
 * Failure handling is the point of this file. Whatever breaks — no model, a
 * malformed reply, a database error — the job ends in a terminal state with a
 * recorded reason, and a *decisive verdict is never written as a side effect
 * of something going wrong*. The gate is the only path to a stored verdict.
 */
export interface JobRow {
  id: string;
  workspace_id: string;
  criterion_node_id: string;
  base_commit: string;
  head_commit: string;
  state: string;
  attempts: number;
  criterion_version: string | null;
  criterion_text: string;
}

export interface RunnerDeps {
  client: SupabaseClient;
  config: Config;
  model: ModelClient;
  provider: EvidenceProvider;
  logger?: (message: string, fields?: Record<string, unknown>) => void;
}

export interface JobOutcome {
  jobId: string;
  criterionNodeId: string;
  state: "succeeded" | "failed" | "cancelled";
  packetId: string | null;
  verdictId: string | null;
  status: VerdictStatus | null;
  gateOutcome: GateOutcome | null;
  stopReason: StopReason | null;
  findingId: string | null;
  passes: number;
  error?: string;
}

/** Claim exactly one queued job, or `null` when the queue is empty. */
export async function claimJob(client: SupabaseClient): Promise<JobRow | null> {
  const { data, error } = await client.rpc("claim_verification_job");
  if (error) throw new Error(`claimJob: ${error.message}`);
  const rows = (data ?? []) as JobRow[];
  return rows[0] ?? null;
}

export async function runJob(deps: RunnerDeps, job: JobRow): Promise<JobOutcome> {
  const { client, config, model, provider } = deps;
  const log = deps.logger ?? (() => {});
  let packetId: string | null = null;
  let verdictId: string | null = null;
  let findingId: string | null = null;
  let passes = 0;
  let stopReason: StopReason | null = null;

  try {
    const criterion = await loadCriterion(client, job.criterion_node_id);
    if (criterion.version !== job.criterion_version || criterion.text !== job.criterion_text) {
      await finishJob(client, job.id, "cancelled", null, "criterion changed before verification");
      return { jobId: job.id, criterionNodeId: criterion.id, state: "cancelled", packetId: null,
        verdictId: null, status: null, gateOutcome: null, stopReason: null, findingId: null, passes: 0 };
    }

    // Evidence first: on the live path the webhook path created only tickets
    // and pull requests, so the worker analyses the repository itself before
    // the packet is built. Fixed on in src/config.ts (WORKER_SETTINGS); tests
    // construct their own deps instead.
    if (config.analysisEnabled) {
      const enrichment = await ensureEvidence({ client, config, logger: (m, f) => log(m, f) }, job, criterion);
      log("evidence enrichment", { jobId: job.id, ...enrichment });
    }

    const bundle = await provider.load({
      criterionNodeId: criterion.id,
      workspaceId: criterion.workspaceId,
      // The packet is pinned to this revision pair: evidence from another
      // change's head is dropped by the provider, not mixed in.
      baseCommit: job.base_commit,
      headCommit: job.head_commit,
    });

    const built = buildPacket({
      packetId: randomUUID(),
      criterion: {
        id: criterion.id,
        text: criterion.text,
        requirementRef: criterion.requirementRef,
      },
      baseCommit: job.base_commit,
      headCommit: job.head_commit,
      tokenBudget: config.tokenBudget,
      slotBudgets: config.slotBudgets,
      sources: bundle.sources,
    });
    packetId = built.packet.id;
    await insertContextPacket(client, built.packet);

    const loop = await runVerifierLoop({
      model,
      packet: built,
      criterionId: criterion.id,
      timeoutMs: config.modelTimeoutMs,
      weakCitationThreshold: config.weakCitationThreshold,
    });
    passes = loop.passCount;
    stopReason = loop.stopReason;
    await insertPasses(client, job.id, loop.passes);

    const policy = await loadLinkPolicy(client, criterion.workspaceId);
    const inputs = gateInputsFrom(bundle.summary, policy);
    const result = gate(loop.gateInput, {
      verdictId: randomUUID(),
      packetId: built.packet.id,
      manifestItemIds: built.itemIds,
      manifestContentShas: built.contentHashes,
      ruleApplicable: inputs.ruleApplicable,
      linksEligible: inputs.linksEligible,
      thresholdsOk: inputs.thresholdsOk,
      freshnessState: inputs.freshnessState,
      passCount: loop.passCount,
      stopReason: loop.stopReason,
    });

    const completion = await completeVerificationJob(client, job.id, result.verdict, criterion.externalId);
    if (completion.state === "cancelled") {
      log("verification cancelled", { jobId: job.id, reason: "criterion changed or retired" });
      return { jobId: job.id, criterionNodeId: criterion.id, state: "cancelled", packetId,
        verdictId: null, status: null, gateOutcome: null, stopReason, findingId: null, passes };
    }
    verdictId = completion.verdictId;
    findingId = completion.findingId;

    log("verification finished", {
      jobId: job.id,
      criterion: criterion.externalId,
      status: result.verdict.status,
      gateOutcome: result.outcome,
      stopReason: loop.stopReason,
      passes: loop.passCount,
      evidence: result.verdict.evidence.length,
      findingId,
      provider: provider.name,
      model: model.describe().modelId,
    });

    return {
      jobId: job.id,
      criterionNodeId: criterion.id,
      state: "succeeded",
      packetId,
      verdictId,
      status: result.verdict.status,
      gateOutcome: result.outcome,
      stopReason: loop.stopReason,
      findingId,
      passes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("verification failed", { jobId: job.id, error: message, stopReason });
    await finishJob(client, job.id, "failed", stopReason, message).catch((finishError) => {
      log("could not mark job failed", {
        jobId: job.id,
        error: finishError instanceof Error ? finishError.message : String(finishError),
      });
    });
    return {
      jobId: job.id,
      criterionNodeId: job.criterion_node_id,
      state: "failed",
      packetId,
      verdictId,
      status: null,
      gateOutcome: null,
      stopReason,
      findingId,
      passes,
      error: message,
    };
  }
}

/** Claim and run one job; `null` when the queue is empty. */
export async function claimAndRun(deps: RunnerDeps): Promise<JobOutcome | null> {
  const job = await claimJob(deps.client);
  if (!job) return null;
  return runJob(deps, job);
}

/**
 * Drain the queue: run jobs until `maxIdle` consecutive claims come back
 * empty. Used by `npm run once` and by the demo.
 */
export async function drainQueue(deps: RunnerDeps, maxIdle = 3): Promise<JobOutcome[]> {
  const outcomes: JobOutcome[] = [];
  let idle = 0;
  while (idle < maxIdle) {
    const outcome = await claimAndRun(deps);
    if (!outcome) {
      idle += 1;
      continue;
    }
    idle = 0;
    outcomes.push(outcome);
  }
  return outcomes;
}

/** Long-running poll loop — the production entry point. */
export async function pollForever(deps: RunnerDeps): Promise<never> {
  const log = deps.logger ?? (() => {});
  log("worker started", {
    model: deps.model.describe().modelId,
    provider: deps.provider.name,
    pollIntervalMs: deps.config.pollIntervalMs,
    analysisEnabled: deps.config.analysisEnabled,
  });
  for (;;) {
    const outcome = await claimAndRun(deps);
    if (!outcome) await sleep(deps.config.pollIntervalMs);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
