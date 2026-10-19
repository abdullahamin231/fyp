import { createHash } from "node:crypto";
import { admin } from "@/lib/supabase/admin";
import { jiraAdapter } from "./adapters";
import { asRecord, text } from "./common";
import { loadJiraCriteriaField } from "./pipeline-settings";
import { evaluateWorkflowRule, ingestJiraIssue, upsertNormalizedEvents, type TicketResult } from "./pipeline";
import { persistDelivery } from "./server";
import { getProviderToken } from "./tokens";

/**
 * Jira webhooks are best effort. Reconciliation asks Jira which issues changed
 * recently (enhanced JQL search) and replays, through the webhook path, every
 * issue whose `updated` time the graph has not recorded. The delivery id is
 * `reconcile:<key>@<updated>`, so a repeat run, or the real webhook arriving
 * late, changes nothing.
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/
 */

export interface JiraReconcileResult {
  seen: number;
  replayed: { key: string; updated: string; result: TicketResult | null }[];
}

const MAX_PAGES = 10;

/** Issues updated in the window, with the fields ingestion reads. */
export async function searchUpdatedIssues(
  token: string,
  cloudId: string,
  input: { windowMinutes: number; extraFields: string[] },
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>[]> {
  const fields = ["summary", "description", "labels", "status", "assignee", "updated", ...input.extraFields].join(",");
  const jql = `updated >= -${input.windowMinutes}m ORDER BY updated ASC`;
  const issues: Record<string, unknown>[] = [];
  const tokens = new Set<string>();
  let next: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ jql, fields, maxResults: "100" });
    if (next) params.set("nextPageToken", next);
    const response = await fetchImpl(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql?${params}`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Jira search returned ${response.status}`);
    const body = (await response.json()) as { issues?: Record<string, unknown>[]; nextPageToken?: string; isLast?: boolean };
    issues.push(...(body.issues ?? []));
    // Guard against a token chain that never ends.
    if (body.isLast !== false || !body.nextPageToken || tokens.has(body.nextPageToken)) break;
    tokens.add(body.nextPageToken);
    next = body.nextPageToken;
  }
  return issues;
}

export async function reconcileJiraWorkspace(
  workspaceId: string,
  deps: { search?: (extraFields: string[]) => Promise<Record<string, unknown>[]>; windowMinutes?: number; now?: () => Date } = {},
): Promise<JiraReconcileResult> {
  const db = admin();
  const criteriaField = await loadJiraCriteriaField(workspaceId, db);
  const extraFields = criteriaField ? [criteriaField] : [];
  const search =
    deps.search ??
    (async (fields: string[]) => {
      const { accessToken, account } = await getProviderToken(workspaceId, "jira");
      if (!account.id) throw new Error("The Jira connection has no site (cloudId); reconnect Jira");
      return searchUpdatedIssues(accessToken, account.id, { windowMinutes: deps.windowMinutes ?? 24 * 60, extraFields: fields });
    });
  const issues = await search(extraFields);

  const keys = issues.map((issue) => text(issue.key)).filter((key): key is string => Boolean(key));
  const known = await db
    .from("nodes")
    .select("external_id, version")
    .eq("workspace_id", workspaceId)
    .in("type", ["Ticket", "Requirement"])
    .is("valid_to", null)
    .in("external_id", keys);
  if (known.error) throw new Error(`nodes: ${known.error.message}`);
  const seenVersion = new Map(((known.data ?? []) as { external_id: string; version: string | null }[]).map((n) => [n.external_id, n.version]));

  const replayed: JiraReconcileResult["replayed"] = [];
  for (const issue of issues) {
    const key = text(issue.key);
    const updated = text(asRecord(issue.fields).updated);
    if (!key || !updated || seenVersion.get(key) === updated) continue;
    const receivedAt = deps.now?.() ?? new Date();
    const payload = { webhookEvent: "jira:issue_updated", timestamp: Date.parse(updated) || receivedAt.getTime(), issue, user: { displayName: "unify-reconcile" } };
    const deliveryId = `reconcile:${key}@${updated}`;
    const events = jiraAdapter.normalise(payload, receivedAt, new Headers({ "x-atlassian-webhook-identifier": deliveryId }));
    const event = events[0];
    if (!event) continue;
    await persistDelivery({ workspaceId, provider: "jira", deliveryId, eventId: event.eventId, payload });
    await upsertNormalizedEvents(db, workspaceId, "jira", events, createHash("sha256").update(JSON.stringify(payload)).digest("hex"));
    const result = await ingestJiraIssue(db, workspaceId, event.eventId, payload, criteriaField, event.occurredAt);
    if (result?.kind === "ticket") await evaluateWorkflowRule(db, result.nodeId);
    replayed.push({ key, updated, result });
  }
  return { seen: issues.length, replayed };
}

/** Workspaces with a Jira connection, for the scheduled pass. */
export async function jiraConnectedWorkspaces(): Promise<{ id: string; slug: string }[]> {
  const { data, error } = await admin().from("integration_connections").select("workspace_id, workspaces(slug)").eq("provider", "jira");
  if (error) throw new Error(`integration_connections: ${error.message}`);
  return ((data ?? []) as unknown as { workspace_id: string; workspaces: { slug: string } | null }[]).map((row) => ({
    id: row.workspace_id,
    slug: row.workspaces?.slug ?? row.workspace_id,
  }));
}
