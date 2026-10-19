/**
 * What happens to a webhook after it has been verified and recorded:
 *
 *   Jira issue event   -> Ticket node (created or updated)
 *                      -> re-resolve pull requests that named this key before it existed
 *                      -> Criterion nodes for the ticket's acceptance criteria
 *                         (one per criterion, from the configured field or a strict
 *                         description section; none when the ticket states none)
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
import { criterionExternalIds, extractCriteria } from "./criteria";

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

export type TicketResult = { ticketNodeId: string; key: string; status: string | null; relinked: number };

export async function upsertTicketFromJira(
  db: SupabaseClient,
  workspaceId: string,
  payload: Record<string, unknown>,
  occurredAt: string,
): Promise<TicketResult | null> {
  const issue = asRecord(payload.issue);
  const key = text(issue.key);
  if (!key) return null;
  const fields = asRecord(issue.fields);
  const status = asRecord(fields.status);
  const changelogItems = Array.isArray(asRecord(payload.changelog).items) ? (asRecord(payload.changelog).items as unknown[]) : [];
  const statusChange = asRecord(changelogItems.find((item) => text(asRecord(item).field) === "status"));
  const deleted = text(payload.webhookEvent) === "jira:issue_deleted";
  const statusName = deleted ? "Deleted" : (text(status.name) ?? text(statusChange.toString));
  // Jira's own grouping of statuses: "new" (To Do), "indeterminate" (In Progress), "done".
  const statusCategory = deleted ? "deleted" : (text(asRecord(status.statusCategory).key) ?? guessCategory(statusName));
  const self = text(issue.self);
  const browseUrl = self ? `${new URL(self).origin}/browse/${key}` : null;

  const { data, error } = await db
    .from("nodes")
    .upsert(
      {
        workspace_id: workspaceId,
        type: "Ticket",
        external_id: key,
        version: text(fields.updated) ?? occurredAt,
        status: statusName,
        owner: text(asRecord(fields.assignee).displayName),
        last_modified: occurredAt,
        payload: {
          key,
          summary: text(fields.summary),
          text: text(fields.summary),
          status: statusName,
          statusCategory,
          url: browseUrl,
        },
      },
      { onConflict: "workspace_id,type,external_id" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`Could not save ticket ${key}: ${error.message}`);

  const relinked = await relinkUnknownKey(db, workspaceId, key, data.id as string);
  return { ticketNodeId: data.id as string, key, status: statusName, relinked };
}

function guessCategory(status: string | null): string | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (["done", "closed", "resolved", "complete", "completed"].includes(s)) return "done";
  if (["to do", "todo", "open", "backlog", "new"].includes(s)) return "new";
  return "indeterminate";
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
// Jira acceptance criteria -> Criterion nodes
// ---------------------------------------------------------------------------

export interface CriteriaResult {
  created: number;
  /** Node ids of every criterion this ticket now has (created or already present). */
  criterionNodeIds: string[];
  externalIds: string[];
}

/**
 * One Criterion node per acceptance criterion, linked from the ticket with a
 * `REFERENCES` edge.
 *
 * The edge values are load-bearing, not cosmetic: the verdict gate only lets a
 * *decisive* status stand when the criterion's incident edges are
 * decisive-eligible, and `eligibilityFor` (packages/contracts) maps a
 * `derived` source to `system-confirmed`. Anything weaker (model_candidate,
 * unresolved) would silently downgrade every verdict built on it.
 */
export async function upsertCriteriaFromJira(
  db: SupabaseClient,
  workspaceId: string,
  payload: Record<string, unknown>,
  ticketKey: string,
  ticketNodeId: string,
  criteriaField: string | null,
  occurredAt: string,
): Promise<CriteriaResult> {
  const { texts, source } = extractCriteria(payload, criteriaField) ?? { texts: [], source: null };
  const externalIds = criterionExternalIds(ticketKey, texts.length);
  if (externalIds.length === 0) return { created: 0, criterionNodeIds: [], externalIds };

  const criterionNodeIds: string[] = [];
  let created = 0;
  for (const [index, externalId] of externalIds.entries()) {
    const text_ = texts[index]!;
    const selectExisting = async () => {
      const { data } = await db
        .from("nodes")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("type", "Criterion")
        .eq("external_id", externalId)
        .maybeSingle();
      return (data?.id as string | undefined) ?? null;
    };
    const existingId = await selectExisting();
    if (existingId) {
      criterionNodeIds.push(existingId);
      continue;
    }
    const { data, error } = await db
      .from("nodes")
      .insert({
        workspace_id: workspaceId,
        type: "Criterion",
        external_id: externalId,
        version: occurredAt,
        last_modified: occurredAt,
        payload: {
          text: text_,
          ticketKey,
          source,
          // `loadCriterion` (worker) reads these three; defaults mirror the
          // fixture bundle so live and dataset paths stay byte-identical.
          requirementRef: ticketKey,
          ruleApplicable: true,
          policyId: null,
        },
      })
      .select("id")
      .single();
    if (error) {
      // A concurrent delivery of the same issue created it first: adopt the
      // existing row rather than failing the redelivery.
      if (error.code !== "23505") {
        throw new Error(`Could not save criterion ${externalId}: ${error.message}`);
      }
      const raced = await selectExisting();
      if (!raced) throw new Error(`Could not save criterion ${externalId}: ${error.message}`);
      criterionNodeIds.push(raced);
      continue;
    }
    criterionNodeIds.push(data.id as string);
    created += 1;

    // Ticket -> Criterion, decisive-eligible (see the note above).
    const edge = await db.from("edges").insert({
      from_id: ticketNodeId,
      to_id: data.id as string,
      type: "REFERENCES",
      source_class: "derived",
      confidence: 1.0,
      resolver: source === "field" ? `jira:customfield:${criteriaField}` : "jira:description",
    });
    if (edge.error && edge.error.code !== "23505") {
      throw new Error(`Could not link criterion ${externalId}: ${edge.error.message}`);
    }
  }
  return { created, criterionNodeIds, externalIds };
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
