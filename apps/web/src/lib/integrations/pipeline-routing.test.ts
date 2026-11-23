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
      expect.objectContaining({ recipient_id: "ada", channel: "in_app", delivery_status: "pending", finding_id: expect.any(String) }),
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
