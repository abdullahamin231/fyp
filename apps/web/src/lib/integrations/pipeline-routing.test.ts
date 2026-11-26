import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { evaluateWorkflowRule } from "./pipeline";

const NOTIFY = { channels: ["in_app"], roles: ["developer"], hops: 2, template: "rule_2_workflow_state_inconsistency" };
const edge = (from_id: string, to_id: string, type: string) => ({ id: `${from_id}-${to_id}`, from_id, to_id, type, valid_to: null, link_state: "active" });

function world(roleEdges: ReturnType<typeof edge>[]) {
  return fakeSupabase({
    tables: {
      rules: [{ id: "RULE_2", version: 1, grace_period_hours: 4, severity: "medium", active: true, notify: NOTIFY }],
      nodes: [
        { id: "pr", type: "PullRequest", external_id: "#1", status: "merged", last_modified: "2026-01-01T00:00:00Z", payload: {} },
        { id: "tk", type: "Ticket", external_id: "UNI-1", status: "In Progress", last_modified: "2026-01-01T00:00:00Z", payload: { statusCategory: "indeterminate" } },
        { id: "ada", type: "Person", external_id: "ada", status: null, last_modified: "2026-01-01T00:00:00Z", payload: { role: "developer" } },
      ],
      edges: [edge("pr", "tk", "TRACKS"), ...roleEdges],
      findings: [],
      notifications: [],
      routing_outcomes: [],
    },
  });
}

describe("FR-14: a new finding is routed or recorded as unroutable", () => {
  it("queues a notification for the ticket's assignee", async () => {
    const fake = world([edge("ada", "tk", "ASSIGNED_TO")]);
    expect(await evaluateWorkflowRule(fake.client as never, "pr")).toBe(1);
    expect(fake.tables.notifications).toEqual([
      expect.objectContaining({ recipient_id: "ada", channel: "in_app", delivery_status: "sent", finding_id: expect.any(String) }),
    ]);
    expect(fake.tables.routing_outcomes).toEqual([]);
  });

  it("records an unroutable outcome when nobody is responsible", async () => {
    const fake = world([]);
    expect(await evaluateWorkflowRule(fake.client as never, "pr")).toBe(1);
    expect(fake.tables.notifications).toEqual([]);
    expect(fake.tables.routing_outcomes).toEqual([
      expect.objectContaining({ node_id: "tk", outcome: "unroutable", reason: "no_role_edge", hops: 2 }),
    ]);
  });
});

// ---------------------------------------------------------------------------
// End to end: a Jira payload becomes role edges, and Rule 2 routes on them.
// ---------------------------------------------------------------------------

import { ingestJiraIssue } from "./pipeline";
import { jiraIssueWebhook } from "./jira-webhook.fixture";

const WS = "ws-1";

function jiraWorld(options: { connection?: Record<string, unknown>; nodes?: Record<string, unknown>[] } = {}) {
  return fakeSupabase({
    tables: {
      rules: [{ id: "RULE_2", version: 1, grace_period_hours: 4, severity: "medium", active: true, notify: NOTIFY }],
      nodes: [
        { id: "pr", type: "PullRequest", external_id: "#1", status: "merged", last_modified: "2026-01-01T00:00:00Z", payload: {} },
        { id: "tk", type: "Ticket", external_id: "UNI-42", status: "In Progress", last_modified: "2026-01-01T00:00:00Z", payload: { statusCategory: "indeterminate" } },
        ...(options.nodes ?? []),
      ],
      edges: [edge("pr", "tk", "TRACKS")],
      events: [],
      person_identities: [],
      integration_connections: options.connection ? [options.connection] : [],
      findings: [],
      notifications: [],
      routing_outcomes: [],
    },
    rpc: { ingest_jira_issue: () => ({ kind: "ticket", nodeId: "tk" }) },
  });
}

async function ingestThenRule2(fake: ReturnType<typeof jiraWorld>, body: Record<string, unknown>) {
  const ticket = await ingestJiraIssue(fake.client as never, WS, "ev-1", body, null, "2026-10-17T10:00:00.000Z");
  return evaluateWorkflowRule(fake.client as never, ticket!.nodeId);
}

const withAssignee = (assignee: unknown) => jiraIssueWebhook({ extraFields: { assignee } });
const CONNECTION = { workspace_id: WS, provider: "jira", connected_account_id: "acc-ada", external_account_id: "cloud-1", created_by: "auth-1" };

describe("FR-14 end to end: Jira assignee -> role edge -> routed finding", () => {
  it("before: an unassigned ticket's finding is recorded unroutable / no_role_edge", async () => {
    const fake = jiraWorld();
    expect(await ingestThenRule2(fake, withAssignee(null))).toBe(1);
    expect(fake.tables.edges.filter((e) => e.type === "ASSIGNED_TO")).toEqual([]);
    expect(fake.tables.routing_outcomes).toEqual([expect.objectContaining({ outcome: "unroutable", reason: "no_role_edge" })]);
    expect(fake.tables.notifications).toEqual([]);
  });

  it("after: assigning to a bound member queues their notification and records no unroutable outcome", async () => {
    const fake = jiraWorld({ connection: CONNECTION });
    expect(await ingestThenRule2(fake, withAssignee({ accountId: "acc-ada", displayName: "Ada" }))).toBe(1);
    const person = fake.tables.nodes.find((n) => n.external_id === "user:auth-1")!;
    expect(fake.tables.edges).toContainEqual(expect.objectContaining({ from_id: person.id, to_id: "tk", type: "ASSIGNED_TO", resolver: "jira:assignee" }));
    expect(fake.tables.notifications).toEqual([
      expect.objectContaining({ recipient_id: person.id, channel: "in_app", delivery_status: "sent" }),
    ]);
    expect(fake.tables.routing_outcomes).toEqual([]);
  });

  it("an unbound assignee gets an edge but no notification: nobody would read it", async () => {
    const fake = jiraWorld();
    await ingestThenRule2(fake, withAssignee({ accountId: "acc-stranger", displayName: "Stranger" }));
    expect(fake.tables.edges).toContainEqual(expect.objectContaining({ to_id: "tk", type: "ASSIGNED_TO" }));
    expect(fake.tables.notifications).toEqual([]);
    expect(fake.tables.routing_outcomes).toEqual([expect.objectContaining({ reason: "no_matching_user" })]);
    expect(fake.tables.person_identities).toEqual([expect.objectContaining({ external_account_id: "acc-stranger", source_class: "unresolved" })]);
  });

  it("missing role: a bound Person without payload.role is dropped as unroutable / no_matching_user", async () => {
    const fake = jiraWorld({
      connection: CONNECTION,
      nodes: [{ id: "legacy", workspace_id: WS, type: "Person", external_id: "user:auth-1", payload: { name: "Ada", userId: "auth-1" } }],
    });
    await ingestThenRule2(fake, withAssignee({ accountId: "acc-ada", displayName: "Ada" }));
    expect(fake.tables.notifications).toEqual([]);
    expect(fake.tables.routing_outcomes).toEqual([expect.objectContaining({ outcome: "unroutable", reason: "no_matching_user" })]);
  });

  it("re-ingesting the same issue does not duplicate the edge or the notification", async () => {
    const fake = jiraWorld({ connection: CONNECTION });
    const body = withAssignee({ accountId: "acc-ada", displayName: "Ada" });
    await ingestThenRule2(fake, body);
    await ingestThenRule2(fake, body);
    expect(fake.tables.edges.filter((e) => e.type === "ASSIGNED_TO")).toHaveLength(1);
    expect(fake.tables.person_identities).toHaveLength(1);
  });
});
