import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";
import { listWorkspacePeople } from "@/lib/data/people";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));
vi.mock("@/lib/supabase/admin", () => ({ admin: () => fake.client }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const { mergePersonAction, setPersonRoleAction } = await import("./people");

const WS = "ws-1";
const NOTIFY = { roles: ["designer"], channels: ["in_app"], hops: 1 };

/** An unresolved Jira account assigned on a ticket whose finding therefore reached nobody. */
function setup(myRole: "admin" | "member" = "admin") {
  fake = fakeSupabase({
    user: { id: "u-admin", email: "root@example.com" },
    tables: {
      workspaces: [{ id: WS, slug: "acme" }],
      workspace_members: [
        { workspace_id: WS, user_id: "u-admin", role: myRole },
        { workspace_id: WS, user_id: "u-bo", role: "member" },
      ],
      profiles: [{ id: "u-bo", email: "bo@example.com", full_name: "Bo" }],
      nodes: [
        { id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null, payload: {} },
        { id: "p-jira", workspace_id: WS, type: "Person", external_id: "jira:j1", valid_to: null, payload: { name: "Jo", role: "developer", role_source: "default" } },
      ],
      person_identities: [
        { id: "i1", workspace_id: WS, person_node_id: "p-jira", tool: "jira", external_account_id: "j1", display_name: "Jo", handle: null, source_class: "unresolved" },
      ],
      edges: [{ id: "e1", from_id: "p-jira", to_id: "t1", type: "ASSIGNED_TO", resolver: "jira:assignee", link_state: "active", valid_to: null, metadata: {} }],
      findings: [{ id: "f1", subject_node_id: "t1", rule_id: "RULE_2", rule_version: 1, state: "open" }],
      rules: [{ id: "RULE_2", version: 1, notify: NOTIFY }],
      notifications: [],
      routing_outcomes: [{ id: "o1", finding_id: "f1", node_id: "t1", reason: "no_matching_user" }],
      audit_log: [],
    },
  });
}

const node = (externalId: string) => fake.tables.nodes!.find((n) => n.external_id === externalId)!;

describe("setting a person's routing role", () => {
  it("stores the role with who set it and audits the change", async () => {
    setup();
    expect(await setPersonRoleAction("acme", "p-jira", "designer")).toEqual({ ok: true });
    expect(node("jira:j1").payload).toMatchObject({ role: "designer", role_source: "admin", role_changed_by: "u-admin" });
    expect(fake.tables.audit_log).toEqual([
      expect.objectContaining({
        actor_id: node("user:u-admin").id,
        action: "person_role_changed",
        evidence_snapshot: expect.objectContaining({ personNodeId: "p-jira", fromRole: "developer", fromRoleSource: "default", toRole: "designer" }),
      }),
    ]);
  });

  it("refuses a plain member and changes nothing", async () => {
    setup("member");
    expect(await setPersonRoleAction("acme", "p-jira", "designer")).toEqual({ ok: false, error: "Workspace administrator access required" });
    expect(node("jira:j1").payload).toMatchObject({ role: "developer" });
    expect(fake.tables.audit_log).toEqual([]);
  });

  it("refuses a role that does not exist", async () => {
    setup();
    expect(await setPersonRoleAction("acme", "p-jira", "wizard")).toEqual({ ok: false, error: "Unknown role." });
  });
});

describe("merging an unresolved account into a member", () => {
  it("moves the edge to the member, audits it, and routes what was unroutable", async () => {
    setup();
    await setPersonRoleAction("acme", "p-jira", "designer");
    // Still unresolved: a matching role alone must not make the account reachable.
    expect(fake.tables.notifications).toEqual([]);
    expect(await mergePersonAction("acme", "i1", "u-bo")).toEqual({ ok: true });
    const bo = node("user:u-bo");
    expect(bo.payload).toMatchObject({ name: "Bo", userId: "u-bo" });
    expect(fake.tables.edges![0]).toMatchObject({ from_id: bo.id });
    expect(fake.tables.audit_log!.at(-1)).toMatchObject({
      action: "person_identity_merged",
      evidence_snapshot: expect.objectContaining({ accountId: "j1", fromPersonNodeId: "p-jira", toPersonNodeId: bo.id }),
    });
  });

  it("delivers the unroutable finding when the member's role matches the rule", async () => {
    setup();
    fake.tables.nodes!.push({ id: "p-bo", workspace_id: WS, type: "Person", external_id: "user:u-bo", valid_to: null, payload: { name: "Bo", userId: "u-bo", role: "designer", role_source: "admin" } });
    await mergePersonAction("acme", "i1", "u-bo");
    expect(fake.tables.notifications).toEqual([expect.objectContaining({ recipient_id: "p-bo", delivery_status: "sent" })]);
    expect(fake.tables.routing_outcomes).toEqual([]);
  });

  it("only merges into a workspace member", async () => {
    setup();
    expect(await mergePersonAction("acme", "i1", "u-stranger")).toMatchObject({ ok: false });
    expect(fake.tables.edges![0]).toMatchObject({ from_id: "p-jira" });
  });

  it("refuses a plain member", async () => {
    setup("member");
    expect(await mergePersonAction("acme", "i1", "u-bo")).toMatchObject({ ok: false });
    expect(fake.tables.person_identities![0]).toMatchObject({ person_node_id: "p-jira" });
  });
});

describe("listing the people routing knows about", () => {
  it("shows role source, unresolved accounts and what they hold, with every member as a target", async () => {
    setup();
    const view = await listWorkspacePeople(WS, fake.client as never);
    expect(view.people).toEqual([
      expect.objectContaining({
        id: "p-jira",
        roleSource: "default",
        routable: false,
        identities: [expect.objectContaining({ id: "i1", unresolved: true })],
        edges: { OWNS: 0, ASSIGNED_TO: 1, WATCHES: 0 },
      }),
    ]);
    expect(view.members.map((m) => m.userId).sort()).toEqual(["u-admin", "u-bo"]);
  });
});
