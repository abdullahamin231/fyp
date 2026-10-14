/**
 * What happens to a webhook after it has been verified and recorded:
 *
 *   Jira issue event   -> Ticket node (created or updated)
 *                      -> re-resolve pull requests that named this key before it existed
 *   GitHub PR event    -> deterministic linker (link_pull_request_event, migration 00015):
 *                         PullRequest node + TRACKS edge to each ticket it names
 *   either             -> Rule 2, workflow-state inconsistency, on the affected links
 *
 * Everything here runs with the service-role client inside the webhook request,
 * so a provider event shows up as graph changes and findings straight away.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { asRecord, text } from "./common";

// ---------------------------------------------------------------------------
// Key extraction. Same rules as apps/worker/src/linking/extract-keys.ts (kept in
// step with it; see that file for the reasoning behind each part of the pattern).
// ---------------------------------------------------------------------------

export type KeySource = "title" | "branch" | "body" | `commit:${string}`;
export interface ExtractedKey {
  key: string;
  foundIn: KeySource[];
}

const KEY_PATTERN = /(?<![A-Za-z0-9])([A-Z][A-Z0-9]+)-([1-9][0-9]*)(?![A-Za-z0-9])/g;

export function findKeysInText(value: string, projectKeys: readonly string[] | null): string[] {
  const found: string[] = [];
  for (const match of value.matchAll(KEY_PATTERN)) {
    if (projectKeys !== null && !projectKeys.includes(match[1]!)) continue;
    if (!found.includes(match[0])) found.push(match[0]);
  }
  return found;
}

export function extractJiraKeys(
  sources: [KeySource, string | null | undefined][],
  projectKeys: readonly string[] | null,
): ExtractedKey[] {
  const byKey = new Map<string, KeySource[]>();
  for (const [source, value] of sources) {
    if (!value) continue;
    for (const key of findKeysInText(value, projectKeys)) {
      const list = byKey.get(key) ?? [];
      if (!list.includes(source)) list.push(source);
      byKey.set(key, list);
    }
  }
  return [...byKey].map(([key, foundIn]) => ({ key, foundIn }));
}

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
    .contains("references", [{ entityId: key }]);
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
  const number = text(payload.number) ?? text(pr.number) ?? "0";
  const head = asRecord(pr.head);
  const title = text(pr.title) ?? "";
  const branch = text(head.ref) ?? "";
  const state = pr.merged === true ? "merged" : (text(pr.state) ?? "open");
  const keys = extractJiraKeys(
    [
      ["title", title],
      ["branch", branch],
      ["body", text(pr.body)],
    ],
    await workspaceProjectKeys(db, workspaceId),
  );

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

type NodeRow = { id: string; type: string; external_id: string; status: string | null; last_modified: string; payload: Record<string, unknown> };

/**
 * For every active TRACKS link touching `nodeId`, check whether the ticket and
 * the pull request disagree about the state of the work:
 *   A. the PR is merged but the ticket is not Done
 *   B. the ticket is Done but the PR is still open
 * Each case produces at most one finding per link (idempotency key, FR-15).
 * The grace period comes from the RULE_2 record; UNIFY_RULE_GRACE_HOURS
 * overrides it (0 for a live demonstration, since nothing here re-evaluates later).
 */
export async function evaluateWorkflowRule(db: SupabaseClient, nodeId: string): Promise<number> {
  const rule = await db.from("rules").select("id, version, grace_period_hours, severity").eq("id", "RULE_2").eq("active", true).order("version", { ascending: false }).limit(1).maybeSingle();
  if (rule.error) throw new Error(`rules: ${rule.error.message}`);
  if (!rule.data) return 0;
  const override = process.env.UNIFY_RULE_GRACE_HOURS;
  const graceHours = override !== undefined && override !== "" ? Number(override) : Number(rule.data.grace_period_hours ?? 0);

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
