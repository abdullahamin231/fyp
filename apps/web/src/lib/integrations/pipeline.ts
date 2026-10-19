/**
 * What happens to a webhook after it has been verified and recorded:
 *
 *   Jira issue event   -> ingest_jira_issue (migration 00036): Ticket node and its
 *                         Criterion nodes (created, changed, retired), or a
 *                         Requirement node for an `nfr`-labelled issue; changed
 *                         criteria are re-queued on every tracking PR
 *                      -> re-resolve pull requests that named this key before it existed
 *   GitHub PR event    -> deterministic linker (link_pull_request_event, migration 00015):
 *                         PullRequest node + TRACKS edge to each ticket it names
 *                      -> verification job per criterion of the linked ticket,
 *                         pinned to the delivery's base/head commit pair
 *   either             -> Rule 2, workflow-state inconsistency, on the affected links
 *
 * Everything here runs with the service-role client inside the webhook request,
 * so a provider event shows up as graph changes, findings and queued
 * verification work straight away.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractJiraKeys } from "@unify/contracts";
import { asRecord, text } from "./common";
import { guessCategory, jiraIssueSync } from "./jira-issue";

/** Project prefixes of the tickets this workspace already has, e.g. ["UNI"]. */
async function workspaceProjectKeys(db: SupabaseClient, workspaceId: string): Promise<string[] | null> {
  const { data, error } = await db.from("nodes").select("external_id").eq("workspace_id", workspaceId).eq("type", "Ticket");
  if (error) throw new Error(`nodes (tickets): ${error.message}`);
  const prefixes = new Set((data ?? []).map((row) => String(row.external_id).split("-")[0]!));
  // No tickets yet: accept any prefix so the keys are still recorded on the event
  // (an unknown key never creates an edge, and is re-resolved when the ticket arrives).
  return prefixes.size ? [...prefixes] : null;
}

// ---------------------------------------------------------------------------
// Jira -> Ticket node
// ---------------------------------------------------------------------------

export type TicketResult = {
  kind: "ticket" | "nfr";
  nodeId: string;
  key: string;
  relinked: number;
  criteria: { created: string[]; changed: string[]; unchanged: string[]; retired: string[]; jobIds: string[] } | null;
};

/**
 * Bring the graph in line with one Jira issue: Ticket + criteria, or a
 * Requirement for an `nfr`-labelled issue (see jira-issue.ts and the
 * `ingest_jira_issue` function, migration 00036). New and changed criteria are
 * queued for verification on every PR that tracks the ticket, in the same
 * transaction.
 */
export async function ingestJiraIssue(
  db: SupabaseClient,
  workspaceId: string,
  eventId: string,
  body: Record<string, unknown>,
  criteriaField: string | null,
  occurredAt: string,
): Promise<TicketResult | null> {
  const issue = jiraIssueSync(body, criteriaField, occurredAt);
  if (!issue) return null;
  const { data, error } = await db.rpc("ingest_jira_issue", {
    p_workspace_id: workspaceId,
    p_event_id: eventId,
    p_issue: issue,
  });
  if (error) throw new Error(`Could not ingest Jira issue ${issue.key}: ${error.message}`);
  const result = data as { kind: "ticket" | "nfr"; nodeId?: string; skipped?: boolean; criteria?: TicketResult["criteria"] };
  if (result.skipped || !result.nodeId) return null;
  const relinked = result.kind === "ticket" ? await relinkUnknownKey(db, workspaceId, issue.key, result.nodeId) : 0;
  return { kind: result.kind, nodeId: result.nodeId, key: issue.key, relinked, criteria: result.criteria ?? null };
}

/**
 * A PR may have named this key before the ticket was ingested (outcome
 * `unknown_key`). The key was kept on that PR's event, so link it now.
 */
async function relinkUnknownKey(db: SupabaseClient, workspaceId: string, key: string, ticketNodeId: string): Promise<number> {
  const { data: events, error } = await db
    .from("events")
    .select("event_id, entity_id")
    .eq("workspace_id", workspaceId)
    .eq("source_tool", "github")
    .eq("entity_type", "PullRequest")
    // jsonb containment needs a JSON literal; supabase-js would format a JS array
    // as a Postgres array literal here.
    .filter("references", "cs", JSON.stringify([{ entityId: key }]));
  if (error) throw new Error(`events (re-resolve ${key}): ${error.message}`);
  let linked = 0;
  for (const prExternalId of new Set((events ?? []).map((e) => e.entity_id as string))) {
    const pr = await db
      .from("nodes")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("type", "PullRequest")
      .eq("external_id", prExternalId)
      .maybeSingle();
    if (pr.error || !pr.data) continue;
    const ins = await db.from("edges").insert({
      from_id: pr.data.id,
      to_id: ticketNodeId,
      type: "TRACKS",
      source_class: "observed",
      confidence: 1.0,
      resolver: "explicit-reference",
      metadata: { key, resolvedLater: true },
    });
    if (!ins.error) linked++;
    else if (ins.error.code !== "23505") throw new Error(`edges (re-resolve ${key}): ${ins.error.message}`);
  }
  return linked;
}

// ---------------------------------------------------------------------------
// Verification queue (migration 00013/00017)
// ---------------------------------------------------------------------------

const SHA40 = /^[0-9a-f]{40}$/;

export interface EnqueueResult {
  /** Job ids returned by `enqueue_verification`, one per criterion. */
  jobIds: string[];
  criterionNodeIds: string[];
}

/**
 * Queue a verification job for every criterion of the given tickets, pinned to
 * one commit pair.
 *
 * The RPC is idempotent by construction (00017): a queued/running job for the
 * same (criterion, base, head) is returned rather than duplicated, and a new
 * job is only created once the previous one finished. A malformed or missing
 * SHA pair is skipped rather than coerced — a packet without a pinned revision
 * pair is meaningless (FR-06, §22.2).
 */
export async function enqueueVerificationForTickets(
  db: SupabaseClient,
  input: {
    workspaceId: string;
    ticketKeys: string[];
    baseCommit: string | null | undefined;
    headCommit: string | null | undefined;
  },
): Promise<EnqueueResult> {
  const { baseCommit, headCommit } = input;
  if (!baseCommit || !headCommit || !SHA40.test(baseCommit) || !SHA40.test(headCommit)) {
    return { jobIds: [], criterionNodeIds: [] };
  }
  if (input.ticketKeys.length === 0) return { jobIds: [], criterionNodeIds: [] };

  // One exact-prefix query per key: `or(...)` value quoting for keys
  // containing `/` and `-` is a PostgREST foot-gun, and a delivery names at
  // most a handful of tickets.
  const criterionNodeIds: string[] = [];
  for (const key of input.ticketKeys) {
    const { data, error } = await db
      .from("nodes")
      .select("id")
      .eq("workspace_id", input.workspaceId)
      .eq("type", "Criterion")
      .is("valid_to", null)
      .like("external_id", `${key}/AC-%`);
    if (error) throw new Error(`Could not load criteria for ${key}: ${error.message}`);
    for (const row of (data ?? []) as { id: string }[]) {
      if (!criterionNodeIds.includes(row.id)) criterionNodeIds.push(row.id);
    }
  }
  const jobIds: string[] = [];
  for (const criterionNodeId of criterionNodeIds) {
    const { data, error: rpcError } = await db.rpc("enqueue_verification", {
      p_criterion_node_id: criterionNodeId,
      p_base_commit: baseCommit,
      p_head_commit: headCommit,
    });
    if (rpcError) throw new Error(`Could not enqueue verification: ${rpcError.message}`);
    if (typeof data === "string") jobIds.push(data);
  }
  return { jobIds, criterionNodeIds };
}

// ---------------------------------------------------------------------------
// GitHub pull request -> linker
// ---------------------------------------------------------------------------

export type LinkResult = {
  status: "duplicate_event" | "no_key" | "processed";
  eventId: string;
  prNodeId?: string;
  keys?: { key: string; status: string }[];
};

export async function linkPullRequestFromGithub(
  db: SupabaseClient,
  workspaceId: string,
  deliveryId: string,
  payload: Record<string, unknown>,
  rawHash: string,
  receivedAt: Date,
): Promise<LinkResult> {
  const pr = asRecord(payload.pull_request);
  const repo = text(asRecord(payload.repository).full_name) ?? "unknown";
  // GitHub sends the PR number as a JSON number, so text() (strings only) would miss it.
  const number = String(payload.number ?? pr.number ?? "0");
  const head = asRecord(pr.head);
  const title = text(pr.title) ?? "";
  const branch = text(head.ref) ?? "";
  const state = pr.merged === true ? "merged" : (text(pr.state) ?? "open");
  const keys = extractJiraKeys({ title, branch, body: text(pr.body) }, await workspaceProjectKeys(db, workspaceId));

  const { data, error } = await db.rpc("link_pull_request_event", {
    p_workspace_id: workspaceId,
    p_delivery_id: deliveryId,
    p_action: text(payload.action) ?? "unknown",
    p_actor: text(asRecord(payload.sender).login) ?? "github",
    p_occurred_at: text(pr.updated_at) ?? receivedAt.toISOString(),
    p_raw_hash: rawHash,
    p_pr: { repo, number: Number(number) || 0, title, branch, headSha: text(head.sha), state },
    p_keys: keys,
  });
  if (error) throw new Error(`Linker failed: ${error.message}`);
  return data as LinkResult;
}

// ---------------------------------------------------------------------------
// Rule 2: workflow-state inconsistency (FR-12)
// ---------------------------------------------------------------------------

/** Grace period used for Rule 2 until a scheduled re-check exists (see evaluateWorkflowRule). */
const RULE_2_GRACE_HOURS = 0;

type NodeRow = { id: string; type: string; external_id: string; status: string | null; last_modified: string; payload: Record<string, unknown> };

/**
 * For every active TRACKS link touching `nodeId`, check whether the ticket and
 * the pull request disagree about the state of the work:
 *   A. the PR is merged but the ticket is not Done
 *   B. the ticket is Done but the PR is still open
 * Each case produces at most one finding per link (idempotency key, FR-15).
 * The grace period is RULE_2_GRACE_HOURS (0) for now; see the note in the body.
 */
export async function evaluateWorkflowRule(db: SupabaseClient, nodeId: string): Promise<number> {
  const rule = await db.from("rules").select("id, version, grace_period_hours, severity").eq("id", "RULE_2").eq("active", true).order("version", { ascending: false }).limit(1).maybeSingle();
  if (rule.error) throw new Error(`rules: ${rule.error.message}`);
  if (!rule.data) return 0;
  // Fixed for now: the RULE_2 record specifies a grace period (4 h), but nothing
  // re-evaluates later yet, so a finding could never appear after the event.
  // Until a scheduled re-check exists, findings are raised as soon as the
  // inconsistency is observed. Restore `rule.data.grace_period_hours` then.
  const graceHours = RULE_2_GRACE_HOURS;

  const links = await db
    .from("edges")
    .select("id, from_id, to_id")
    .eq("type", "TRACKS")
    .eq("link_state", "active")
    .or(`from_id.eq.${nodeId},to_id.eq.${nodeId}`);
  if (links.error) throw new Error(`edges (rule 2): ${links.error.message}`);

  let created = 0;
  for (const link of links.data ?? []) {
    const nodes = await db.from("nodes").select("id, type, external_id, status, last_modified, payload").in("id", [link.from_id, link.to_id]);
    if (nodes.error) throw new Error(`nodes (rule 2): ${nodes.error.message}`);
    const pr = (nodes.data as NodeRow[]).find((n) => n.type === "PullRequest");
    const ticket = (nodes.data as NodeRow[]).find((n) => n.type === "Ticket");
    if (!pr || !ticket) continue;

    const ticketCategory = String(ticket.payload?.statusCategory ?? guessCategory(ticket.status) ?? "");
    const ticketStatus = ticket.status ?? "unknown";
    let kase: "merged_not_done" | "done_not_merged" | null = null;
    let since = "";
    if (pr.status === "merged" && ticketCategory !== "done") {
      kase = "merged_not_done";
      since = pr.last_modified;
    } else if (ticketCategory === "done" && pr.status === "open") {
      kase = "done_not_merged";
      since = ticket.last_modified;
    }
    if (!kase) continue;
    if ((Date.now() - new Date(since).getTime()) / 3_600_000 < graceHours) continue;

    const annotation =
      kase === "merged_not_done"
        ? `${pr.external_id} was merged but ${ticket.external_id} is still "${ticketStatus}".`
        : `${ticket.external_id} is marked "${ticketStatus}" but its pull request ${pr.external_id} is still open.`;
    const ins = await db.from("findings").insert({
      subject_node_id: ticket.id,
      origin: "rule",
      rule_id: rule.data.id,
      rule_version: rule.data.version,
      kind: "workflow_state_inconsistency",
      idempotency_key: `RULE_2:${rule.data.version}:${pr.id}:${ticket.id}:${kase}`,
      annotation,
      severity: rule.data.severity,
    });
    if (!ins.error) created++;
    else if (ins.error.code !== "23505") throw new Error(`findings (rule 2): ${ins.error.message}`);
  }
  return created;
}
