import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";
import { routeFinding } from "@/lib/data/route-finding";
import { syncRoleEdges } from "@/lib/integrations/people";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const { watchArtefactAction, unwatchArtefactAction } = await import("./watch");

const WS = "ws-1";
const RULE = { roles: ["developer" as const], channels: ["in_app" as const], hops: 1 };

/** The real table refuses a second non-revoked (from, to, type) with 23505 (00023); the fake does not. */
function enforceEdgeIdentity(f: FakeSupabase) {
  const client = f.client as unknown as { from: (table: string) => Record<string, unknown> };
  const realFrom = client.from.bind(client);
  client.from = (table) => {
    const query = realFrom(table);
    if (table !== "edges") return query;
    const insert = (query.insert as (value: Record<string, unknown>) => unknown).bind(query);
    query.insert = (value: Record<string, unknown>) => {
      const clash = (f.tables.edges ?? []).some(
        (e) => e.from_id === value.from_id && e.to_id === value.to_id && e.type === value.type && e.link_state !== "revoked",
      );
      if (!clash) return insert(value);
      const duplicate = { data: null, error: { code: "23505", message: "duplicate key" } };
      return { select: () => ({ single: () => Promise.resolve(duplicate) }) };
    };
    return query;
  };
}

function setup(extra: Record<string, Record<string, unknown>[]> = {}) {
  fake = fakeSupabase({
    user: { id: "u1", email: "ada@example.com" },
    tables: {
      nodes: [{ id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null, payload: {} }],
      edges: [],
      audit_log: [],
      findings: [{ id: "f1", subject_node_id: "t1" }],
      notifications: [],
      routing_outcomes: [],
      ...extra,
    },
    rpc: { node_workspace: () => WS },
  });
  enforceEdgeIdentity(fake);
}

const me = () => fake.tables.nodes!.find((n) => n.external_id === "user:u1")!;
const watches = () => fake.tables.edges!.filter((e) => e.type === "WATCHES");

describe("watching an artefact (FR-14, opt-in)", () => {
  it("creates a WATCHES edge from the caller's own Person to the artefact, and audits it", async () => {
    setup();
    expect(await watchArtefactAction("t1")).toEqual({ ok: true });
    expect(watches()).toEqual([
      expect.objectContaining({ from_id: me().id, to_id: "t1", source_class: "observed", confidence: 1.0, resolver: "user:u1", link_state: "active" }),
    ]);
    expect(fake.tables.audit_log).toEqual([
      expect.objectContaining({ actor_id: me().id, action: "artefact_watched", evidence_snapshot: expect.objectContaining({ kind: "watch", nodeId: "t1" }) }),
    ]);
  });

  it("gives the watcher a Person with a routable role", async () => {
    setup();
    await watchArtefactAction("t1");
    expect(me().payload).toMatchObject({ role: "developer", role_source: "default" });
  });

  it("is idempotent: watching twice leaves one active edge and no error", async () => {
    setup();
    await watchArtefactAction("t1");
    expect(await watchArtefactAction("t1")).toEqual({ ok: true });
    expect(watches()).toHaveLength(1);
    expect(fake.tables.audit_log).toHaveLength(1);
  });

  it("routes a finding on the artefact to the watcher", async () => {
    setup();
    await watchArtefactAction("t1");
    expect(await routeFinding(fake.client as never, "f1", RULE)).toMatchObject({ outcome: "routed", recipients: [{ userId: me().id, via: "WATCHES" }] });
    expect(fake.tables.notifications).toEqual([expect.objectContaining({ recipient_id: me().id, channel: "in_app" })]);
  });
});

describe("unwatching an artefact", () => {
  it("revokes the edge, keeps the row, and records why", async () => {
    setup();
    await watchArtefactAction("t1");
    expect(await unwatchArtefactAction("t1")).toEqual({ ok: true });
    expect(watches()).toHaveLength(1);
    expect(watches()[0]).toMatchObject({ link_state: "revoked", resolution_reason: "unwatched by member", valid_to: expect.any(String) });
    expect(fake.tables.audit_log!.at(-1)).toMatchObject({ action: "artefact_unwatched", evidence_snapshot: expect.objectContaining({ kind: "unwatch" }) });
  });

  it("stops routing: a fresh finding reaches nobody, as unroutable", async () => {
    setup();
    await watchArtefactAction("t1");
    await unwatchArtefactAction("t1");
    expect(await routeFinding(fake.client as never, "f1", RULE)).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
    expect(fake.tables.notifications).toEqual([]);
  });

  it("can be undone: re-watching works because revoke frees the unique slot (dismiss would not)", async () => {
    setup();
    await watchArtefactAction("t1");
    await unwatchArtefactAction("t1");
    expect(await watchArtefactAction("t1")).toEqual({ ok: true });
    expect(watches().map((e) => e.link_state)).toEqual(["revoked", "active"]);
  });

  it("refuses when the caller is not watching", async () => {
    setup();
    expect(await unwatchArtefactAction("t1")).toEqual({ ok: false, error: "You are not watching this artefact." });
  });

  it("never touches another member's watch", async () => {
    setup({
      nodes: [
        { id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null, payload: {} },
        { id: "p-other", workspace_id: WS, type: "Person", external_id: "user:u2", payload: { role: "developer", userId: "u2" } },
      ],
      edges: [{ id: "e-other", from_id: "p-other", to_id: "t1", type: "WATCHES", link_state: "active", resolver: "user:u2" }],
    });
    expect(await unwatchArtefactAction("t1")).toMatchObject({ ok: false });
    expect(fake.tables.edges!.find((e) => e.id === "e-other")).toMatchObject({ link_state: "active" });
    expect(fake.tables.audit_log).toEqual([]);
  });

  it("refuses an artefact the caller cannot see", async () => {
    setup();
    fake = fakeSupabase({ user: { id: "u1" }, tables: {}, rpc: { node_workspace: () => null } });
    expect(await watchArtefactAction("nope")).toEqual({ ok: false, error: "Unknown artefact." });
  });
});

describe("ingestion never derives WATCHES", () => {
  it("writes only OWNS and ASSIGNED_TO from Jira, GitHub and Figma signals", async () => {
    setup();
    const actor = (tool: "jira" | "github" | "figma", relation: "assignee" | "reporter" | "author", accountId: string) =>
      ({ tool, accountId, handle: null, displayName: null, email: null, relation });
    await syncRoleEdges(fake.client as never, WS, "t1", [actor("jira", "assignee", "j1"), actor("jira", "reporter", "j2")], true, "jira:assignee");
    await syncRoleEdges(fake.client as never, WS, "t1", [actor("github", "author", "9"), actor("github", "assignee", "10")], true, "github:pr-assignee");
    await syncRoleEdges(fake.client as never, WS, "t1", [actor("figma", "author", "f1")], false, "figma:version-author");
    expect(fake.tables.edges!.length).toBeGreaterThan(0);
    expect(new Set(fake.tables.edges!.map((e) => e.type))).toEqual(new Set(["OWNS", "ASSIGNED_TO"]));
  });
});
