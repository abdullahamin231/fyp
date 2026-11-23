import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonRole } from "@unify/contracts";
import type { PayloadActor } from "./actors";
import type { IntegrationProvider } from "./types";

/**
 * Provider accounts -> Person nodes, and the role edges that hang off them.
 *
 * Runs with the service-role client inside ingestion. `ensureActorNode`
 * (lib/actions/audit.ts) is its session-client sibling and owns the
 * `user:<auth uid>` key; this file reuses that key for a member's Person and
 * adds `<tool>:<account id>` for provider accounts nobody has bound yet.
 *
 * Identity is only ever an exact (tool, account id) match. An email or a
 * display name is stored for humans to read and is never compared.
 */

export interface ProviderActor {
  tool: IntegrationProvider;
  accountId: string;
  handle?: string | null;
  displayName?: string | null;
  email?: string | null;
}

export type PersonResolution = "existing" | "bound_to_member" | "unresolved";

/** A role a provider cannot tell us; routing needs one, so it starts here and an admin corrects it. */
export const DEFAULT_PERSON_ROLE: PersonRole = "developer";

const defaultRole = () => ({ role: DEFAULT_PERSON_ROLE, role_source: "default" });

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not ${what}: ${error.message}`);
}

async function findNode(db: SupabaseClient, workspaceId: string, externalId: string): Promise<string | null> {
  const { data, error } = await db.from("nodes").select("id")
    .eq("workspace_id", workspaceId).eq("type", "Person").eq("external_id", externalId).limit(1);
  if (error) fail("look up a person", error);
  return ((data ?? []) as { id: string }[])[0]?.id ?? null;
}

/** Find-or-create a Person node; on a lost insert race, re-read rather than fail. */
async function ensureNode(db: SupabaseClient, workspaceId: string, externalId: string, payload: Record<string, unknown>): Promise<string> {
  const existing = await findNode(db, workspaceId, externalId);
  if (existing) return existing;
  const inserted = await db.from("nodes")
    .insert({ workspace_id: workspaceId, type: "Person", external_id: externalId, payload: { ...payload, ...defaultRole() } })
    .select("id").single();
  if (inserted.error) {
    const raced = await findNode(db, workspaceId, externalId);
    if (raced) return raced;
    fail("create a person", inserted.error);
  }
  return (inserted.data as { id: string }).id;
}

type IdentityRow = { id: string; person_node_id: string };

async function findIdentity(db: SupabaseClient, workspaceId: string, tool: string, accountId: string): Promise<IdentityRow | null> {
  const { data, error } = await db.from("person_identities").select("id, person_node_id")
    .eq("workspace_id", workspaceId).eq("tool", tool).eq("external_account_id", accountId).maybeSingle();
  if (error) fail("look up an identity", error);
  return (data as IdentityRow | null) ?? null;
}

/** Resolves a provider account to a Person node id, creating what is missing. */
export async function ensurePersonForProviderActor(
  db: SupabaseClient,
  workspaceId: string,
  actor: ProviderActor,
): Promise<{ personNodeId: string; resolution: PersonResolution }> {
  const now = new Date().toISOString();

  // 1. Exact identity — the only automatic match.
  const known = await findIdentity(db, workspaceId, actor.tool, actor.accountId);
  if (known) {
    const { error } = await db.from("person_identities").update({ last_seen: now }).eq("id", known.id);
    if (error) fail("touch an identity", error);
    return { personNodeId: known.person_node_id, resolution: "existing" };
  }

  const display = actor.displayName ?? actor.handle ?? actor.accountId;
  const row = (personNodeId: string, sourceClass: "observed" | "unresolved") => ({
    workspace_id: workspaceId,
    person_node_id: personNodeId,
    tool: actor.tool,
    external_account_id: actor.accountId,
    display_name: actor.displayName ?? null,
    handle: actor.handle ?? null,
    email: actor.email ?? null,
    source_class: sourceClass,
    last_seen: now,
  });
  const record = async (personNodeId: string, sourceClass: "observed" | "unresolved", resolution: PersonResolution) => {
    const { error } = await db.from("person_identities").insert(row(personNodeId, sourceClass));
    if (error) {
      // A concurrent delivery bound the same account first: take its answer.
      const raced = await findIdentity(db, workspaceId, actor.tool, actor.accountId);
      if (raced) return { personNodeId: raced.person_node_id, resolution: "existing" as const };
      fail("record an identity", error);
    }
    return { personNodeId, resolution };
  };

  // 2. The account that authorised this workspace's connection is that member.
  const connection = await db.from("integration_connections").select("connected_account_id, external_account_id, created_by")
    .eq("workspace_id", workspaceId).eq("provider", actor.tool).maybeSingle();
  if (connection.error) fail("load the connection", connection.error);
  const connected = connection.data as { connected_account_id: string | null; external_account_id: string | null; created_by: string } | null;
  // GitHub and Figma already stored the user's id as external_account_id before connected_account_id
  // existed; Jira's external_account_id is the site's cloudId, so it is never a user id.
  const connectedId = connected?.connected_account_id ?? (actor.tool === "jira" ? null : connected?.external_account_id ?? null);
  if (connected && connectedId && connectedId === actor.accountId) {
    const member = await ensureNode(db, workspaceId, `user:${connected.created_by}`, {
      name: display,
      email: actor.email ?? null,
      userId: connected.created_by,
    });
    return record(member, "observed", "bound_to_member");
  }

  // 3. Otherwise a provider-scoped Person, flagged unresolved until a human merges it.
  const scoped = await ensureNode(db, workspaceId, `${actor.tool}:${actor.accountId}`, {
    name: display,
    email: actor.email ?? null,
    provider: actor.tool,
    accountId: actor.accountId,
  });
  return record(scoped, "unresolved", "unresolved");
}

/** An admin states a Person's role; it is workspace configuration, never inferred from a provider. */
export async function setPersonRole(db: SupabaseClient, workspaceId: string, personNodeId: string, role: PersonRole): Promise<void> {
  const { data, error } = await db.from("nodes").select("id, payload")
    .eq("workspace_id", workspaceId).eq("type", "Person").eq("id", personNodeId).maybeSingle();
  if (error) fail("load the person", error);
  if (!data) throw new Error("Person not found in this workspace");
  const update = await db.from("nodes")
    .update({ payload: { ...((data as { payload: Record<string, unknown> }).payload ?? {}), role, role_source: "admin" } })
    .eq("id", personNodeId);
  if (update.error) fail("set the role", update.error);
}

/**
 * Repoints an identity at another Person and retires the vacated node.
 *
 * The vacated node is never deleted: `audit_log.actor_id` references it, and a
 * review trail must keep naming whoever it named at the time. Role edges held
 * by the vacated node move to the target so routing follows the identity.
 */
export async function mergePersonIdentity(
  db: SupabaseClient,
  workspaceId: string,
  identityId: string,
  targetPersonNodeId: string,
): Promise<void> {
  const identity = await db.from("person_identities").select("id, person_node_id, tool")
    .eq("workspace_id", workspaceId).eq("id", identityId).maybeSingle();
  if (identity.error) fail("load the identity", identity.error);
  if (!identity.data) throw new Error("Identity not found in this workspace");
  const { person_node_id: vacated, tool } = identity.data as { person_node_id: string; tool: string };
  if (vacated === targetPersonNodeId) return;

  const target = await db.from("nodes").select("id")
    .eq("workspace_id", workspaceId).eq("type", "Person").eq("id", targetPersonNodeId).is("valid_to", null).maybeSingle();
  if (target.error) fail("load the target person", target.error);
  if (!target.data) throw new Error("Target person not found in this workspace");

  const moved = await db.from("person_identities")
    .update({ person_node_id: targetPersonNodeId, source_class: "observed" }).eq("id", identityId);
  if (moved.error) fail("repoint the identity", moved.error);

  const remaining = await db.from("person_identities").select("id").eq("person_node_id", vacated);
  if (remaining.error) fail("check remaining identities", remaining.error);
  const retiring = (remaining.data ?? []).length === 0;

  const held = await db.from("edges").select("id, from_id, to_id, type, resolver, metadata")
    .eq("from_id", vacated).neq("link_state", "revoked");
  if (held.error) fail("load the person's edges", held.error);
  const now = new Date().toISOString();
  for (const edge of (held.data ?? []) as { id: string; type: string; resolver: string; metadata: Record<string, unknown> | null }[]) {
    // While the node still carries other identities, only this identity's edges follow it.
    if (!retiring && !edge.resolver.startsWith(`${tool}:`)) continue;
    const move = await db.from("edges").update({ from_id: targetPersonNodeId }).eq("id", edge.id);
    if (!move.error) continue;
    if (move.error.code !== "23505") fail("move an edge", move.error);
    // The target already holds this exact edge: retire the duplicate instead of colliding.
    const retired = await db.from("edges").update({
      link_state: "revoked",
      valid_to: now,
      metadata: { ...(edge.metadata ?? {}), revokedReason: "merged_duplicate", mergedInto: targetPersonNodeId },
    }).eq("id", edge.id);
    if (retired.error) fail("retire a duplicate edge", retired.error);
  }

  if (retiring) {
    const node = await db.from("nodes").select("payload").eq("id", vacated).maybeSingle();
    if (node.error) fail("load the vacated person", node.error);
    const retire = await db.from("nodes")
      .update({ valid_to: now, payload: { ...(((node.data as { payload?: Record<string, unknown> } | null)?.payload) ?? {}), merged_into: targetPersonNodeId } })
      .eq("id", vacated);
    if (retire.error) fail("retire the vacated person", retire.error);
  }
}

// ---------------------------------------------------------------------------
// Role edges
// ---------------------------------------------------------------------------

type RoleEdgeKind = "OWNS" | "ASSIGNED_TO";

const SIGNALS: Record<string, { type: RoleEdgeKind; resolver: string }> = {
  "jira:assignee": { type: "ASSIGNED_TO", resolver: "jira:assignee" },
  "jira:reporter": { type: "OWNS", resolver: "jira:reporter" },
  "github:assignee": { type: "ASSIGNED_TO", resolver: "github:pr-assignee" },
  "github:author": { type: "OWNS", resolver: "github:pr-author" },
  // Figma exposes no file owner; the person who published a version is who the drift traces back to.
  "figma:author": { type: "OWNS", resolver: "figma:version-author" },
};

function signalFor(actor: PayloadActor) {
  return SIGNALS[`${actor.tool}:${actor.relation}`] ?? null;
}

/**
 * Insert a role edge unless one already holds the slot. A `dismissed` edge
 * holds it too (00023): a reviewer's "no" is not re-asserted by the next webhook.
 */
async function recordRoleEdge(db: SupabaseClient, personNodeId: string, artefactNodeId: string, type: RoleEdgeKind, resolver: string): Promise<boolean> {
  const held = await db.from("edges").select("id")
    .eq("from_id", personNodeId).eq("to_id", artefactNodeId).eq("type", type).neq("link_state", "revoked").limit(1);
  if (held.error) fail("look up a role edge", held.error);
  if ((held.data ?? []).length > 0) return false;
  const { error } = await db.from("edges").insert({
    from_id: personNodeId,
    to_id: artefactNodeId,
    type,
    source_class: "observed",
    confidence: 1.0,
    resolver,
    link_state: "active",
  });
  if (!error) return true;
  if (error.code === "23505") return false;
  fail("save a role edge", error);
}

/** The vendor no longer names this person: end the edge but keep the row (the graph is historical). */
async function retireStaleAssignments(db: SupabaseClient, artefactNodeId: string, resolver: string, keep: Set<string>): Promise<number> {
  const { data, error } = await db.from("edges").select("id, from_id, metadata")
    .eq("to_id", artefactNodeId).eq("type", "ASSIGNED_TO").eq("resolver", resolver).eq("link_state", "active").is("valid_to", null);
  if (error) fail("load assignments", error);
  const now = new Date().toISOString();
  let retired = 0;
  for (const edge of (data ?? []) as { id: string; from_id: string; metadata: Record<string, unknown> | null }[]) {
    if (keep.has(edge.from_id)) continue;
    // `revoked` (not just valid_to) frees the identity slot so a later reassignment back works.
    const update = await db.from("edges").update({
      valid_to: now,
      link_state: "revoked",
      metadata: { ...(edge.metadata ?? {}), revokedReason: "reassigned_at_source" },
    }).eq("id", edge.id);
    if (update.error) fail("end an assignment", update.error);
    retired++;
  }
  return retired;
}

export interface RoleEdgeSync {
  created: number;
  retired: number;
  /** Actors whose Person is unresolved (no workspace member bound to the account). */
  unresolved: number;
}

/**
 * Bring the role edges on one artefact in line with the actors a payload names.
 * `assignmentsKnown` is false when the payload says nothing about assignment
 * (a comment webhook, say), in which case existing assignments are left alone.
 */
export async function syncRoleEdges(
  db: SupabaseClient,
  workspaceId: string,
  artefactNodeId: string,
  actors: PayloadActor[],
  assignmentsKnown: boolean,
  assignmentResolver: string,
): Promise<RoleEdgeSync> {
  const result: RoleEdgeSync = { created: 0, retired: 0, unresolved: 0 };
  const assigned = new Set<string>();
  for (const actor of actors) {
    const signal = signalFor(actor);
    if (!signal) continue;
    const person = await ensurePersonForProviderActor(db, workspaceId, actor);
    if (person.resolution === "unresolved") result.unresolved++;
    if (signal.type === "ASSIGNED_TO") assigned.add(person.personNodeId);
    if (await recordRoleEdge(db, person.personNodeId, artefactNodeId, signal.type, signal.resolver)) result.created++;
  }
  if (assignmentsKnown) result.retired = await retireStaleAssignments(db, artefactNodeId, assignmentResolver, assigned);
  return result;
}
