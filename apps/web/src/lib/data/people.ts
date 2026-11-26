import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonRole } from "@unify/contracts";
import { unboundPersonIds, type RoleEdgeType } from "@/lib/domain/notify-set";
import { createClient } from "@/lib/supabase/server";
import { selectInChunks } from "./chunk";

/**
 * Who the graph knows about, for the workspace admin: each Person's role and
 * where it came from, the provider accounts behind them, and what they hold
 * role edges on. Read on the caller's session, so RLS scopes it.
 */

export interface PersonIdentityView {
  id: string;
  tool: string;
  accountId: string;
  label: string;
  unresolved: boolean;
}

export interface PersonView {
  id: string;
  name: string;
  role: PersonRole | null;
  /** `default` was assigned by the system, `admin` was stated by a person; null when never recorded. */
  roleSource: "default" | "admin" | null;
  /** False when every provider identity is unresolved: routing will not notify them. */
  routable: boolean;
  identities: PersonIdentityView[];
  edges: Record<RoleEdgeType, number>;
}

export interface MemberOption {
  userId: string;
  name: string;
}

export interface WorkspacePeople {
  people: PersonView[];
  /** Merge targets: every workspace member, whether or not they have a Person node yet. */
  members: MemberOption[];
}

type PersonRow = { id: string; external_id: string; payload: { name?: string | null; role?: PersonRole; role_source?: string } | null };
type IdentityRow = {
  id: string;
  person_node_id: string;
  tool: string;
  external_account_id: string;
  display_name: string | null;
  handle: string | null;
  source_class: string;
};

export async function listWorkspacePeople(workspaceId: string, client?: SupabaseClient): Promise<WorkspacePeople> {
  const db = client ?? ((await createClient()) as unknown as SupabaseClient);

  const [nodes, identities, memberships] = await Promise.all([
    db.from("nodes").select("id, external_id, payload").eq("workspace_id", workspaceId).eq("type", "Person").is("valid_to", null),
    db.from("person_identities")
      .select("id, person_node_id, tool, external_account_id, display_name, handle, source_class")
      .eq("workspace_id", workspaceId),
    db.from("workspace_members").select("user_id").eq("workspace_id", workspaceId),
  ]);
  if (nodes.error) throw new Error(`nodes: ${nodes.error.message}`);
  if (identities.error) throw new Error(`person_identities: ${identities.error.message}`);
  if (memberships.error) throw new Error(`workspace_members: ${memberships.error.message}`);
  const personRows = (nodes.data ?? []) as PersonRow[];
  const identityRows = (identities.data ?? []) as IdentityRow[];

  const edges = await selectInChunks<{ from_id: string; type: RoleEdgeType }>(
    "edges (people)",
    personRows.map((p) => p.id),
    (chunk) =>
      db.from("edges").select("from_id, type").in("from_id", chunk)
        .in("type", ["OWNS", "ASSIGNED_TO", "WATCHES"]).eq("link_state", "active").is("valid_to", null),
  );
  const userIds = ((memberships.data ?? []) as { user_id: string }[]).map((m) => m.user_id);
  const profiles = await selectInChunks<{ id: string; email: string | null; full_name: string | null }>(
    "profiles (people)",
    userIds,
    (chunk) => db.from("profiles").select("id, email, full_name").in("id", chunk),
  );
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const unbound = unboundPersonIds(identityRows);
  const people = personRows.map((row): PersonView => {
    const counts: Record<RoleEdgeType, number> = { OWNS: 0, ASSIGNED_TO: 0, WATCHES: 0 };
    for (const edge of edges) if (edge.from_id === row.id) counts[edge.type]++;
    const source = row.payload?.role_source;
    return {
      id: row.id,
      name: row.payload?.name ?? row.external_id,
      role: row.payload?.role ?? null,
      roleSource: source === "admin" || source === "default" ? source : null,
      routable: Boolean(row.payload?.role) && !unbound.has(row.id),
      identities: identityRows
        .filter((i) => i.person_node_id === row.id)
        .map((i) => ({
          id: i.id,
          tool: i.tool,
          accountId: i.external_account_id,
          label: i.display_name ?? i.handle ?? i.external_account_id,
          unresolved: i.source_class === "unresolved",
        })),
      edges: counts,
    };
  });

  return {
    people: people.sort((a, b) => Number(b.routable) - Number(a.routable) || a.name.localeCompare(b.name)),
    members: userIds
      .map((userId) => {
        const profile = profileById.get(userId);
        return { userId, name: profile?.full_name ?? profile?.email ?? userId.slice(0, 8) };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
