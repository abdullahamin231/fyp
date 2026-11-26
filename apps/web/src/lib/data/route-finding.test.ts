import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { rerouteUnroutableAround, routeAndDeliver, routeFinding, type RouteRule } from "./route-finding";

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
    expect(result?.outcome).toBe("routed");
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
    expect(await routeFinding(fake.client as never, "f1", rule)).toBeNull();
    expect(fake.tables.routing_outcomes).toHaveLength(1);
  });

  it("does not queue notifications twice when replayed after a successful route", async () => {
    const fake = world({ tables: { edges: [edge("ada", "pr1", "ASSIGNED_TO")] } });
    await routeFinding(fake.client as never, "f1", rule);
    expect(await routeFinding(fake.client as never, "f1", rule)).toBeNull();
    expect(fake.tables.notifications).toHaveLength(2);
  });

  it("finds an owner one hop away only when the rule allows it", async () => {
    const edges = [edge("pr1", "frame1", "SATISFIES"), edge("grace", "frame1", "OWNS")];
    const near = world({ tables: { edges } });
    expect(await routeFinding(near.client as never, "f1", { ...rule, hops: 1 })).toMatchObject({ outcome: "routed" });
    expect(near.tables.notifications).toEqual([expect.objectContaining({ recipient_id: "grace", channel: "in_app" })]);

    const farEdges = [edge("pr1", "a", "PART_OF"), edge("a", "frame1", "PART_OF"), edge("grace", "frame1", "OWNS")];
    const one = world({ tables: { edges: farEdges } });
    expect(await routeFinding(one.client as never, "f1", { ...rule, hops: 1 })).toMatchObject({ outcome: "unroutable" });
    const two = world({ tables: { edges: farEdges } });
    expect(await routeFinding(two.client as never, "f1", { ...rule, hops: 2 })).toMatchObject({ outcome: "routed" });
  });

  it("ignores dismissed and expired edges", async () => {
    const fake = world({ tables: { edges: [{ ...edge("ada", "pr1", "ASSIGNED_TO"), link_state: "dismissed" }, { ...edge("ada", "pr1", "OWNS"), valid_to: "2026-01-01" }] } });
    expect(await routeFinding(fake.client as never, "f1", rule)).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
  });

  const identity = (person_node_id: string, source_class: string) => ({ person_node_id, source_class });

  it("does not notify an unresolved person: nobody would read it, so the finding is unroutable", async () => {
    const fake = world({ tables: { edges: [edge("ada", "pr1", "ASSIGNED_TO")], person_identities: [identity("ada", "unresolved")] } });
    expect(await routeFinding(fake.client as never, "f1", rule)).toMatchObject({ outcome: "unroutable", reason: "no_matching_user" });
    expect(fake.tables.notifications).toEqual([]);
    expect(fake.tables.edges).toHaveLength(1);
  });

  it("still notifies the bound people when an unresolved one shares the artefact", async () => {
    const fake = world({
      tables: {
        edges: [edge("ada", "pr1", "ASSIGNED_TO"), edge("grace", "pr1", "OWNS")],
        person_identities: [identity("ada", "unresolved"), identity("grace", "observed")],
      },
    });
    await routeFinding(fake.client as never, "f1", rule);
    expect(fake.tables.notifications!.map((n) => n.recipient_id)).toEqual(["grace"]);
  });

  it("notifies a person with at least one resolved identity", async () => {
    const fake = world({
      tables: { edges: [edge("ada", "pr1", "ASSIGNED_TO")], person_identities: [identity("ada", "unresolved"), identity("ada", "observed")] },
    });
    expect(await routeFinding(fake.client as never, "f1", rule)).toMatchObject({ outcome: "routed" });
  });

  it("surfaces a persistence failure instead of swallowing it", async () => {
    const fake = fakeSupabase({
      tables: { findings: [{ id: "f1", subject_node_id: "pr1" }], edges: [], nodes: [] },
      errors: { routing_outcomes: "permission denied" },
    });
    await expect(routeFinding(fake.client as never, "f1", rule)).rejects.toThrow(/permission denied/);
  });
});

describe("re-routing findings that were unroutable (FR-14)", () => {
  const notify: RouteRule = { roles: ["developer"], channels: ["in_app"], hops: 1 };
  const reroute = () =>
    fakeSupabase({
      tables: {
        findings: [{ id: "f1", subject_node_id: "pr1", rule_id: "RULE_2", rule_version: 1, state: "open" }],
        rules: [{ id: "RULE_2", version: 1, notify }],
        nodes: [person("ada", "developer")],
        edges: [],
        notifications: [],
        routing_outcomes: [],
      },
    });

  it("routes, delivers and clears the unroutable record once a role edge appears", async () => {
    const fake = reroute();
    expect(await routeAndDeliver(fake.client as never, "f1", notify)).toMatchObject({ outcome: "unroutable" });
    expect(fake.tables.routing_outcomes).toHaveLength(1);

    fake.tables.edges.push(edge("ada", "pr1", "ASSIGNED_TO"));
    expect(await rerouteUnroutableAround(fake.client as never, "pr1")).toBe(1);
    expect(fake.tables.notifications).toEqual([expect.objectContaining({ recipient_id: "ada", channel: "in_app", delivery_status: "sent" })]);
    expect(fake.tables.routing_outcomes).toEqual([]);
  });

  it("leaves a finding recorded as unroutable when there is still nobody to notify", async () => {
    const fake = reroute();
    await routeAndDeliver(fake.client as never, "f1", notify);
    expect(await rerouteUnroutableAround(fake.client as never, "pr1")).toBe(0);
    expect(fake.tables.routing_outcomes).toHaveLength(1);
  });

  it("does not re-route a finding that is no longer open", async () => {
    const fake = reroute();
    await routeAndDeliver(fake.client as never, "f1", notify);
    fake.tables.findings[0]!.state = "resolved";
    fake.tables.edges.push(edge("ada", "pr1", "ASSIGNED_TO"));
    expect(await rerouteUnroutableAround(fake.client as never, "pr1")).toBe(0);
    expect(fake.tables.notifications).toEqual([]);
  });

  it("does not notify twice when re-run after it routed", async () => {
    const fake = reroute();
    await routeAndDeliver(fake.client as never, "f1", notify);
    fake.tables.edges.push(edge("ada", "pr1", "ASSIGNED_TO"));
    await rerouteUnroutableAround(fake.client as never, "pr1");
    await rerouteUnroutableAround(fake.client as never, "pr1");
    expect(fake.tables.notifications).toHaveLength(1);
  });
});
