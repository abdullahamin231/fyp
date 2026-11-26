import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { figmaEventActors, githubPullRequestActors, jiraIssueActors } from "./actors";
import { ensurePersonForProviderActor, mergePersonIdentity, setPersonRole, syncRoleEdges } from "./people";
import { jiraIssueWebhook } from "./jira-webhook.fixture";

const WS = "ws-1";
const ada = { tool: "jira" as const, accountId: "acc-ada", displayName: "Ada L", email: "ada@example.com" };

function world(tables: Record<string, Record<string, unknown>[]> = {}) {
  return fakeSupabase({ tables: { nodes: [], edges: [], person_identities: [], integration_connections: [], audit_log: [], ...tables } });
}

describe("ensurePersonForProviderActor", () => {
  it("is idempotent: the same account yields one identity and one Person", async () => {
    const fake = world();
    const first = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    const second = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    expect(first.resolution).toBe("unresolved");
    expect(second).toEqual({ personNodeId: first.personNodeId, resolution: "existing" });
    expect(fake.tables.person_identities).toHaveLength(1);
    expect(fake.tables.nodes).toHaveLength(1);
  });

  it("gives a provider-scoped Person the key <tool>:<id>, marked unresolved, with a routable role", async () => {
    const fake = world();
    await ensurePersonForProviderActor(fake.client as never, WS, { tool: "github", accountId: "1234567", handle: "haani" });
    expect(fake.tables.nodes[0]).toMatchObject({ type: "Person", external_id: "github:1234567", payload: { role: "developer", role_source: "default" } });
    expect(fake.tables.person_identities[0]).toMatchObject({ tool: "github", external_account_id: "1234567", source_class: "unresolved" });
  });

  it("keeps provider-scoped and user: Persons distinct in one workspace", async () => {
    const fake = world({ nodes: [{ id: "n-user", workspace_id: WS, type: "Person", external_id: "user:auth-1", payload: { role: "pm" } }] });
    const scoped = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    expect(scoped.personNodeId).not.toBe("n-user");
    expect(fake.tables.nodes.map((n) => n.external_id).sort()).toEqual(["jira:acc-ada", "user:auth-1"]);
  });

  it("binds the connecting account to the member's own user: Person", async () => {
    const fake = world({
      integration_connections: [{ workspace_id: WS, provider: "jira", connected_account_id: "acc-ada", external_account_id: "cloud-1", created_by: "auth-1" }],
    });
    const result = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    expect(result.resolution).toBe("bound_to_member");
    expect(fake.tables.nodes).toEqual([expect.objectContaining({ external_id: "user:auth-1", payload: expect.objectContaining({ userId: "auth-1", role: "developer" }) })]);
    expect(fake.tables.person_identities[0]).toMatchObject({ source_class: "observed" });
  });

  it("never treats Jira's cloudId as a user id", async () => {
    const fake = world({
      integration_connections: [{ workspace_id: WS, provider: "jira", connected_account_id: null, external_account_id: "acc-ada", created_by: "auth-1" }],
    });
    expect((await ensurePersonForProviderActor(fake.client as never, WS, ada)).resolution).toBe("unresolved");
  });

  it("falls back to external_account_id for GitHub and Figma connections that predate connected_account_id", async () => {
    const fake = world({
      integration_connections: [{ workspace_id: WS, provider: "github", connected_account_id: null, external_account_id: "1234567", created_by: "auth-1" }],
    });
    const result = await ensurePersonForProviderActor(fake.client as never, WS, { tool: "github", accountId: "1234567" });
    expect(result.resolution).toBe("bound_to_member");
  });

  it("does not merge accounts that merely share an email or a name", async () => {
    const fake = world();
    const a = await ensurePersonForProviderActor(fake.client as never, WS, { tool: "jira", accountId: "a1", displayName: "Sam", email: "sam@example.com" });
    const b = await ensurePersonForProviderActor(fake.client as never, WS, { tool: "github", accountId: "9", displayName: "Sam", email: "sam@example.com" });
    const c = await ensurePersonForProviderActor(fake.client as never, WS, { tool: "jira", accountId: "a2", displayName: "Sam", email: "sam@example.com" });
    expect(new Set([a.personNodeId, b.personNodeId, c.personNodeId]).size).toBe(3);
  });
});

describe("mergePersonIdentity", () => {
  async function merged() {
    const fake = world({
      nodes: [{ id: "keep", workspace_id: WS, type: "Person", external_id: "user:auth-1", valid_to: null, payload: { role: "developer" } }],
    });
    const { personNodeId } = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    fake.tables.edges.push({ id: "e1", from_id: personNodeId, to_id: "tk", type: "ASSIGNED_TO", resolver: "jira:assignee", link_state: "active", valid_to: null, metadata: {} });
    fake.tables.audit_log.push({ id: "a1", actor_id: personNodeId, action: "link_confirmed" });
    const auditBefore = structuredClone(fake.tables.audit_log);
    const identityId = fake.tables.person_identities[0]!.id as string;
    await mergePersonIdentity(fake.client as never, WS, identityId, "keep");
    return { fake, vacated: personNodeId, auditBefore };
  }

  it("repoints the identity and moves its role edges to the target", async () => {
    const { fake } = await merged();
    expect(fake.tables.person_identities[0]).toMatchObject({ person_node_id: "keep", source_class: "observed" });
    expect(fake.tables.edges[0]).toMatchObject({ from_id: "keep", type: "ASSIGNED_TO" });
  });

  it("retires the vacated node instead of deleting it, and leaves audit_log untouched", async () => {
    const { fake, vacated, auditBefore } = await merged();
    const node = fake.tables.nodes.find((n) => n.id === vacated)!;
    expect(node.valid_to).toEqual(expect.any(String));
    expect(node.payload).toMatchObject({ merged_into: "keep" });
    expect(fake.tables.audit_log).toEqual(auditBefore);
    expect(fake.requests.filter((r) => r.table === "audit_log")).toEqual([]);
  });

  it("keeps a vacated node alive while it still holds another identity", async () => {
    const fake = world({
      nodes: [{ id: "keep", workspace_id: WS, type: "Person", external_id: "user:auth-1", valid_to: null, payload: {} }],
    });
    const { personNodeId } = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    fake.tables.person_identities.push({ id: "other", workspace_id: WS, person_node_id: personNodeId, tool: "github", external_account_id: "9" });
    await mergePersonIdentity(fake.client as never, WS, fake.tables.person_identities[0]!.id as string, "keep");
    expect(fake.tables.nodes.find((n) => n.id === personNodeId)!.valid_to).toBeUndefined();
  });

  it("revokes a moved edge that would duplicate one the target already holds", async () => {
    const fake = world({
      nodes: [{ id: "keep", workspace_id: WS, type: "Person", external_id: "user:auth-1", valid_to: null, payload: {} }],
    });
    const { personNodeId } = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    fake.tables.edges.push({ id: "e1", from_id: personNodeId, to_id: "tk", type: "OWNS", resolver: "jira:reporter", link_state: "active", valid_to: null, metadata: {} });
    // The fake does not enforce the unique index, so make the move collide the way Postgres would.
    const client = fake.client as unknown as { from: (table: string) => Record<string, unknown> };
    const realFrom = client.from.bind(client);
    client.from = (table) => {
      const query = realFrom(table);
      if (table !== "edges") return query;
      const update = (query.update as (v: Record<string, unknown>) => unknown).bind(query);
      query.update = (value: Record<string, unknown>) =>
        value.from_id === "keep" ? { eq: () => Promise.resolve({ data: null, error: { code: "23505", message: "duplicate" } }) } : update(value);
      return query;
    };
    await mergePersonIdentity(fake.client as never, WS, fake.tables.person_identities[0]!.id as string, "keep");
    expect(fake.tables.edges[0]).toMatchObject({ link_state: "revoked", metadata: { revokedReason: "merged_duplicate" } });
  });

  it("refuses a target outside the workspace", async () => {
    const fake = world();
    await ensurePersonForProviderActor(fake.client as never, WS, ada);
    await expect(mergePersonIdentity(fake.client as never, WS, fake.tables.person_identities[0]!.id as string, "nowhere")).rejects.toThrow(/Target person not found/);
  });
});

describe("setPersonRole", () => {
  it("records an admin-stated role and its source", async () => {
    const fake = world();
    const { personNodeId } = await ensurePersonForProviderActor(fake.client as never, WS, ada);
    const previous = await setPersonRole(fake.client as never, WS, personNodeId, "designer", "auth-admin");
    expect(previous).toEqual({ role: "developer", roleSource: "default" });
    expect(fake.tables.nodes[0]!.payload).toMatchObject({ role: "designer", role_source: "admin", role_changed_by: "auth-admin" });
  });
});

describe("syncRoleEdges", () => {
  const sync = (fake: ReturnType<typeof world>, actors: Parameters<typeof syncRoleEdges>[3], known = true) =>
    syncRoleEdges(fake.client as never, WS, "tk", actors, known, "jira:assignee");
  const assignee = (accountId: string) => ({ tool: "jira" as const, accountId, handle: null, displayName: accountId, email: null, relation: "assignee" as const });

  it("creates one ASSIGNED_TO edge, observed, from the Person to the artefact — and only one on replay", async () => {
    const fake = world();
    expect(await sync(fake, [assignee("a1")])).toMatchObject({ created: 1 });
    expect(await sync(fake, [assignee("a1")])).toMatchObject({ created: 0 });
    expect(fake.tables.edges).toEqual([
      expect.objectContaining({ to_id: "tk", type: "ASSIGNED_TO", source_class: "observed", confidence: 1.0, resolver: "jira:assignee", from_id: fake.tables.nodes[0]!.id }),
    ]);
  });

  it("maps the reporter to OWNS", async () => {
    const fake = world();
    await sync(fake, [{ ...assignee("r1"), relation: "reporter" }]);
    expect(fake.tables.edges[0]).toMatchObject({ type: "OWNS", resolver: "jira:reporter" });
  });

  it("does not resurrect a dismissed edge", async () => {
    const fake = world();
    await sync(fake, [assignee("a1")]);
    fake.tables.edges[0]!.link_state = "dismissed";
    await sync(fake, [assignee("a1")]);
    expect(fake.tables.edges).toHaveLength(1);
    expect(fake.tables.edges[0]!.link_state).toBe("dismissed");
  });

  it("ends the old assignment on reassignment but keeps the row", async () => {
    const fake = world();
    await sync(fake, [assignee("a1")]);
    const old = fake.tables.edges[0]!;
    const result = await sync(fake, [assignee("a2")]);
    expect(result).toMatchObject({ created: 1, retired: 1 });
    expect(fake.tables.edges).toHaveLength(2);
    expect(old.valid_to).toEqual(expect.any(String));
    expect(old.link_state).toBe("revoked");
    expect(fake.tables.edges[1]).toMatchObject({ link_state: "active", type: "ASSIGNED_TO" });
    expect(fake.tables.edges[1]!.valid_to).toBeUndefined();
  });

  it("can reassign back to a previous assignee", async () => {
    const fake = world();
    await sync(fake, [assignee("a1")]);
    await sync(fake, [assignee("a2")]);
    await sync(fake, [assignee("a1")]);
    const current = fake.tables.edges.filter((e) => e.link_state !== "revoked");
    expect(current).toHaveLength(1);
    expect(current[0]!.from_id).toBe(fake.tables.nodes.find((n) => n.external_id === "jira:a1")!.id);
  });

  it("unassigning retires the edge when the payload says assignment is known", async () => {
    const fake = world();
    await sync(fake, [assignee("a1")]);
    await sync(fake, [], true);
    expect(fake.tables.edges[0]!.link_state).toBe("revoked");
  });

  it("leaves assignments alone when the payload says nothing about them", async () => {
    const fake = world();
    await sync(fake, [assignee("a1")]);
    await sync(fake, [], false);
    expect(fake.tables.edges[0]!.link_state).toBe("active");
  });

  it("only retires edges from its own provider signal", async () => {
    const fake = world();
    fake.tables.edges.push({ id: "manual", from_id: "p", to_id: "tk", type: "ASSIGNED_TO", resolver: "manual", link_state: "active", valid_to: null, metadata: {} });
    await sync(fake, [], true);
    expect(fake.tables.edges[0]!.link_state).toBe("active");
  });

  it("derives no edge from a Figma version author — that is not the file's owner", () => {
    expect(figmaEventActors({ user: { id: "f1", handle: "ada" } })).toEqual([expect.objectContaining({ relation: "author", accountId: "f1" })]);
  });
});

describe("payload actors", () => {
  it("reads Jira assignee and reporter by accountId and ignores actors without one", () => {
    const body = jiraIssueWebhook({ extraFields: { reporter: { accountId: "rep-1", displayName: "Rae" }, assignee: { displayName: "No Id" } } });
    const { actors, assigneeKnown } = jiraIssueActors(body);
    expect(actors).toEqual([expect.objectContaining({ accountId: "rep-1", relation: "reporter" })]);
    expect(assigneeKnown).toBe(true);
  });

  it("treats an absent Jira assignee as unknown and a null one as unassigned", () => {
    const absent = jiraIssueWebhook();
    delete (absent.issue as { fields: Record<string, unknown> }).fields.assignee;
    expect(jiraIssueActors(absent).assigneeKnown).toBe(false);
    expect(jiraIssueActors(jiraIssueWebhook({ extraFields: { assignee: null } }))).toMatchObject({ actors: [], assigneeKnown: true });
  });

  it("reads GitHub's numeric ids for the PR author and assignees", () => {
    const { actors, assigneesKnown } = githubPullRequestActors({
      pull_request: { user: { id: 1234567, login: "haani" }, assignees: [{ id: 7654321, login: "other" }] },
    });
    expect(actors).toEqual([
      expect.objectContaining({ accountId: "1234567", handle: "haani", relation: "author" }),
      expect.objectContaining({ accountId: "7654321", handle: "other", relation: "assignee" }),
    ]);
    expect(assigneesKnown).toBe(true);
  });
});
