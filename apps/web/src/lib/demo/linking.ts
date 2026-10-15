import { randomBytes, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deliverJiraIssue, deliverPullRequest, type DeliveryResult } from "./scenario";

/**
 * The linking edge cases (`scripts/demo-linking.mjs`), runnable from /demo.
 *
 * Each check sends one signed delivery to the real webhook endpoint and reads
 * the route's own answer — duplicate deliveries, a PR that names a ticket
 * before the ticket exists, the late ticket that links it, and Rule 2 on
 * merge. Runs in a scratch workspace so the main demo graph stays clean.
 */

export interface LinkingCheck {
  name: string;
  ok: boolean;
  detail: string;
}

type Linking = { status?: string; keys?: { key: string; status: string }[] };

export async function runLinkingScenario(
  db: SupabaseClient,
  origin: string,
  workspaceId: string,
): Promise<LinkingCheck[]> {
  const checks: LinkingCheck[] = [];
  const check = (name: string, ok: boolean, res: DeliveryResult, shown: unknown) =>
    checks.push({ name, ok, detail: `${res.status} ${JSON.stringify(shown ?? res.body)}` });
  const linkingOf = (res: DeliveryResult) => res.body?.linking as Linking | undefined;
  const keyStatus = (res: DeliveryResult, key: string) =>
    linkingOf(res)?.keys?.find((entry) => entry.key === key)?.status;

  const run = Date.now().toString(36);
  const repo = `demo/${run}`;
  const pr = (number: number, title: string, branch: string, action = "opened", merged = false) => ({
    action,
    number,
    repository: { full_name: repo },
    sender: { login: "demo-dev" },
    pull_request: {
      number,
      title,
      body: "",
      state: action === "closed" ? "closed" : "open",
      merged,
      updated_at: new Date().toISOString(),
      head: { ref: branch, sha: randomBytes(20).toString("hex") },
      base: { ref: "main", sha: randomBytes(20).toString("hex") },
    },
  });
  const jira = (key: string, summary: string, status: string, category: string) =>
    deliverJiraIssue(origin, workspaceId, { key, summary, status, category }, `${run}-${randomUUID()}`);

  for (const [key, summary, status, category] of [
    ["UNI-1", "Sign-up form", "To Do", "new"],
    ["UNI-2", "Login page", "In Progress", "indeterminate"],
    ["UNI-3", "Password reset", "To Do", "new"],
  ]) {
    const res = await jira(key, summary, status, category);
    const ticket = res.body?.ticket as { key?: string } | undefined;
    check(`Jira ${key} → Ticket node`, res.status === 200 && ticket?.key === key, res, ticket);
  }

  const first = `demo-${run}-pr1-opened`;
  const opened = await deliverPullRequest(origin, workspaceId, pr(1, "UNI-2: add login page", "feature/UNI-2-login"), first);
  check(
    'PR #1 "UNI-2: add login page" → linked to UNI-2',
    opened.status === 200 && keyStatus(opened, "UNI-2") === "linked",
    opened,
    linkingOf(opened),
  );

  const again = await deliverPullRequest(origin, workspaceId, pr(1, "UNI-2: add login page", "feature/UNI-2-login"), first);
  check(
    "Same delivery again → duplicate, nothing written",
    again.status === 200 && linkingOf(again)?.status === "duplicate_event",
    again,
    linkingOf(again),
  );

  // A ticket number that does not exist yet, so "unknown key" is real on every run.
  const existing = await db
    .from("nodes")
    .select("external_id")
    .eq("workspace_id", workspaceId)
    .eq("type", "Ticket")
    .like("external_id", "UNI-%");
  const highest = Math.max(
    3,
    ...((existing.data ?? []) as { external_id: string }[]).map(
      (row) => Number(String(row.external_id).split("-")[1]) || 0,
    ),
  );
  const late = `UNI-${highest + 1}`;
  const early = await deliverPullRequest(
    origin,
    workspaceId,
    pr(2, `${late}: profile settings (UTF-8 names)`, "feature/profile"),
    `demo-${run}-pr2-opened`,
  );
  check(
    `PR #2 names ${late} before the ticket exists → unknown_key, no edge ("UTF-8" is not a key)`,
    early.status === 200 && keyStatus(early, late) === "unknown_key" && !keyStatus(early, "UTF-8"),
    early,
    linkingOf(early),
  );

  const arrives = await jira(late, "Profile settings", "To Do", "new");
  const relinked = (arrives.body?.ticket as { relinked?: number } | undefined)?.relinked ?? 0;
  check(`Jira ${late} arrives later → PR #2 linked to it`, arrives.status === 200 && relinked >= 1, arrives, arrives.body?.ticket);

  const merged = await deliverPullRequest(
    origin,
    workspaceId,
    pr(1, "UNI-2: add login page", "feature/UNI-2-login", "closed", true),
    `demo-${run}-pr1-merged`,
  );
  check(
    "PR #1 merged while UNI-2 is In Progress → Rule 2 finding",
    merged.status === 200 && merged.body?.findingsCreated === 1,
    merged,
    { findingsCreated: merged.body?.findingsCreated },
  );

  return checks;
}
