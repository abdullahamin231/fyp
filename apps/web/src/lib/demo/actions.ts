"use server";

import { headers } from "next/headers";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";
import { runLinkingScenario, type LinkingCheck } from "./linking";
import {
  DEMO_TICKETS,
  LINKING_WORKSPACE,
  deliverJiraIssue,
  reverifyPullRequest,
  type DeliveryResult,
} from "./scenario";

/**
 * Server actions behind /demo. Every one is gated by `requireWorkspaceAdmin`
 * and drives the real pipeline through the real webhook endpoint (see
 * `scenario.ts`); the only direct write is the T10 switch row.
 */

export type FaultMode = "none" | "extra" | "only";

export interface StepOutcome {
  ok: boolean;
  message: string;
  detail?: string;
}

function admin(): SupabaseClient {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** This deployment's own origin, so deliveries hit the endpoint serving the page. */
async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (!host) throw new Error("Cannot resolve this deployment's host");
  return `${proto}://${host}`;
}

function failure(error: unknown): StepOutcome {
  return { ok: false, message: error instanceof Error ? error.message : String(error) };
}

function summarise(result: DeliveryResult): string {
  return `${result.status} ${JSON.stringify(result.body)}`;
}

export async function deliverDemoTicket(slug: string, key: string): Promise<StepOutcome> {
  try {
    const { workspaceId } = await requireWorkspaceAdmin(slug);
    const ticket = DEMO_TICKETS.find((entry) => entry.key === key);
    if (!ticket) throw new Error(`Unknown demo ticket ${key}`);
    const result = await deliverJiraIssue(await origin(), workspaceId, {
      key: ticket.key,
      summary: ticket.summary,
      criteria: ticket.criteria,
      status: "To Do",
      category: "new",
    });
    const criteria = result.body?.criteria as { created?: number; updated?: number } | undefined;
    return {
      ok: result.status === 200,
      message:
        result.status === 200
          ? `${key} delivered — ${ticket.criteria.length} acceptance criteria as Criterion nodes`
          : `Jira delivery refused (${result.status})`,
      detail: criteria ? `criteria ${JSON.stringify(criteria)}` : summarise(result),
    };
  } catch (error) {
    return failure(error);
  }
}

export async function reverifyDemoPr(slug: string, number: number): Promise<StepOutcome> {
  try {
    const { workspaceId } = await requireWorkspaceAdmin(slug);
    const { mode, result } = await reverifyPullRequest(await origin(), workspaceId, number);
    if (mode === "github") {
      return { ok: true, message: `PR #${number} closed and reopened on GitHub — GitHub is delivering the webhook` };
    }
    const verification = result?.body?.verification;
    return {
      ok: result?.status === 200,
      message:
        result?.status === 200
          ? `PR #${number} "reopened" delivered (replayed from GitHub's current PR data) — jobs enqueued`
          : `GitHub delivery refused (${result?.status})`,
      detail: verification ? `verification ${JSON.stringify(verification)}` : result ? summarise(result) : undefined,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function runLinkingDemo(): Promise<StepOutcome & { checks?: LinkingCheck[] }> {
  try {
    const { workspaceId } = await requireWorkspaceAdmin(LINKING_WORKSPACE);
    const checks = await runLinkingScenario(admin(), await origin(), workspaceId);
    const passed = checks.filter((entry) => entry.ok).length;
    return { ok: passed === checks.length, message: `${passed}/${checks.length} checks passed`, checks };
  } catch (error) {
    return failure(error);
  }
}

export async function setDemoFault(slug: string, mode: FaultMode): Promise<StepOutcome> {
  try {
    const { workspaceId, userId } = await requireWorkspaceAdmin(slug);
    const { error } = await admin()
      .from("demo_controls")
      .upsert(
        { workspace_id: workspaceId, stub_fabricate: mode, updated_by: userId, updated_at: new Date().toISOString() },
        { onConflict: "workspace_id" },
      );
    if (error) throw new Error(`Could not set the fault switch: ${error.message}`);
    return {
      ok: true,
      message:
        mode === "none"
          ? "Fault disarmed — the model answers strictly from the packet"
          : `Fault armed — the model now cites evidence it was never shown (${mode})`,
    };
  } catch (error) {
    return failure(error);
  }
}

export interface PipelineRow {
  jobId: string;
  criterion: string;
  head: string;
  state: string;
  enqueuedAt: string;
  finishedAt: string | null;
  stopReason: string | null;
  error: string | null;
  verdict: string | null;
  gateOutcome: string | null;
  reasonCode: string | null;
  findingId: string | null;
}

export interface DemoStatus {
  fault: FaultMode;
  rows: PipelineRow[];
}

/** What the live pipeline monitor polls: recent jobs and what each produced. */
export async function getDemoStatus(slug: string): Promise<DemoStatus> {
  const { workspaceId } = await requireWorkspaceAdmin(slug);
  const db = admin();
  const [faultRes, jobsRes] = await Promise.all([
    db.from("demo_controls").select("stub_fabricate").eq("workspace_id", workspaceId).maybeSingle(),
    db
      .from("verification_jobs")
      .select("id, criterion_node_id, head_commit, state, enqueued_at, finished_at, last_stop_reason, last_error")
      .eq("workspace_id", workspaceId)
      .order("enqueued_at", { ascending: false })
      .limit(10),
  ]);
  if (jobsRes.error) throw new Error(`verification_jobs: ${jobsRes.error.message}`);
  const jobs = (jobsRes.data ?? []) as {
    id: string;
    criterion_node_id: string;
    head_commit: string;
    state: string;
    enqueued_at: string;
    finished_at: string | null;
    last_stop_reason: string | null;
    last_error: string | null;
  }[];

  const nodeIds = [...new Set(jobs.map((job) => job.criterion_node_id))];
  const jobIds = jobs.map((job) => job.id);
  const [nodesRes, verdictsRes] = await Promise.all([
    nodeIds.length ? db.from("nodes").select("id, external_id").in("id", nodeIds) : { data: [], error: null },
    jobIds.length
      ? db.from("verdicts").select("id, job_id, status, gate_outcome, reason_code").in("job_id", jobIds)
      : { data: [], error: null },
  ]);
  const verdicts = (verdictsRes.data ?? []) as {
    id: string;
    job_id: string;
    status: string;
    gate_outcome: string;
    reason_code: string | null;
  }[];
  const verdictIds = verdicts.map((verdict) => verdict.id);
  const findingsRes = verdictIds.length
    ? await db.from("findings").select("id, verdict_id").in("verdict_id", verdictIds)
    : { data: [] };

  const externalId = new Map(((nodesRes.data ?? []) as { id: string; external_id: string }[]).map((n) => [n.id, n.external_id]));
  const verdictByJob = new Map(verdicts.map((verdict) => [verdict.job_id, verdict]));
  const findingByVerdict = new Map(
    ((findingsRes.data ?? []) as { id: string; verdict_id: string }[]).map((f) => [f.verdict_id, f.id]),
  );
  const fault = (faultRes.data as { stub_fabricate?: FaultMode } | null)?.stub_fabricate ?? "none";

  return {
    fault,
    rows: jobs.map((job) => {
      const verdict = verdictByJob.get(job.id);
      return {
        jobId: job.id,
        criterion: externalId.get(job.criterion_node_id) ?? "—",
        head: job.head_commit.slice(0, 7),
        state: job.state,
        enqueuedAt: job.enqueued_at,
        finishedAt: job.finished_at,
        stopReason: job.last_stop_reason,
        error: job.last_error,
        verdict: verdict?.status ?? null,
        gateOutcome: verdict?.gate_outcome ?? null,
        reasonCode: verdict?.reason_code ?? null,
        findingId: verdict ? (findingByVerdict.get(verdict.id) ?? null) : null,
      };
    }),
  };
}
