import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { routeFinding } from "./route-finding";

const rule = { roles: ["developer" as const, "designer" as const], channels: ["slack" as const, "in_app" as const], hops: 1 };
const edge = (from_id: string, to_id: string, type: string) => ({ from_id, to_id, type, valid_to: null, link_state: "active" });
const person = (id: string, role: string, extra: object = {}) => ({ id, type: "Person", payload: { role, ...extra } });

function world(extra: Parameters<typeof fakeSupabase>[0] = {}) {
  return fakeSupabase({
    tables: {
      findings: [{ id: "f1", subject_node_id: "pr1" }],
      nodes: [person("ada", "developer"), person("grace", "designer", { muted_channels: ["slack"] })],
      edges: [],
      notifications: [],
      routing_outcomes: [],
      ...extra.tables,
    },
  });
}

describe("routeFinding (FR-14)", () => {
  it("queues a pending notification for the assignee on each channel", async () => {
    const fake = world({ tables: { edges: [edge("ada", "pr1", "ASSIGNED_TO")] } });
    const result = await routeFinding(fake.client as never, "f1", rule);
    expect(result.outcome).toBe("routed");
    expect(fake.tables.notifications).toEqual([
      expect.objectContaining({ finding_id: "f1", recipient_id: "ada", channel: "slack", delivery_status: "pending" }),
      expect.objectContaining({ finding_id: "f1", recipient_id: "ada", channel: "in_app", delivery_status: "pending" }),
    ]);
    expect(fake.tables.routing_outcomes).toEqual([]);
  });

  it("records an unroutable outcome for a node with no role edge", async () => {
    const fake = world();
    const result = await routeFinding(fake.client as never, "f1", rule);
    expect(result).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
    expect(fake.tables.routing_outcomes).toEqual([
      expect.objectContaining({ finding_id: "f1", node_id: "pr1", outcome: "unroutable", reason: "no_role_edge", hops: 1 }),
    ]);
    expect(fake.tables.notifications).toEqual([]);
  });

  it("is idempotent: re-routing an unroutable finding keeps one outcome row", async () => {
    const fake = world();
    await routeFinding(fake.client as never, "f1", rule);
    await routeFinding(fake.client as never, "f1", rule);
    expect(fake.tables.routing_outcomes).toHaveLength(1);
  });

  it("finds an owner one hop away only when the rule allows it", async () => {
    const edges = [edge("pr1", "frame1", "SATISFIES"), edge("grace", "frame1", "OWNS")];
    const near = world({ tables: { edges } });
    expect(await routeFinding(near.client as never, "f1", { ...rule, hops: 1 })).toMatchObject({ outcome: "routed" });
    expect(near.tables.notifications).toEqual([expect.objectContaining({ recipient_id: "grace", channel: "in_app" })]);

    const far = world({ tables: { edges: [edge("pr1", "a", "PART_OF"), edge("a", "frame1", "PART_OF"), edge("grace", "frame1", "OWNS")] } });
    expect(await routeFinding(far.client as never, "f1", { ...rule, hops: 1 })).toMatchObject({ outcome: "unroutable" });
    expect(await routeFinding(far.client as never, "f1", { ...rule, hops: 2 })).toMatchObject({ outcome: "routed" });
  });

  it("ignores dismissed and expired edges", async () => {
    const fake = world({ tables: { edges: [{ ...edge("ada", "pr1", "ASSIGNED_TO"), link_state: "dismissed" }, { ...edge("ada", "pr1", "OWNS"), valid_to: "2026-01-01" }] } });
    expect(await routeFinding(fake.client as never, "f1", rule)).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
  });

  it("surfaces a persistence failure instead of swallowing it", async () => {
    const fake = fakeSupabase({
      tables: { findings: [{ id: "f1", subject_node_id: "pr1" }], edges: [], nodes: [] },
      errors: { routing_outcomes: "permission denied" },
    });
    await expect(routeFinding(fake.client as never, "f1", rule)).rejects.toThrow(/record unroutable outcome: permission denied/);
  });
});
