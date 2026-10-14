import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole, WorkspaceSummary } from "@/lib/types";

/**
 * Workspace / tenancy queries. Every read goes through the RLS client, so the
 * caller only ever sees workspaces they belong to (see `lib/data/queries.ts`
 * for the security model in one line).
 */

type WorkspaceRow = { id: string; name: string; slug: string };

type MembershipRow = {
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  /** PostgREST many-to-one embed; the untyped client types embeds as arrays. */
  workspaces: WorkspaceRow | WorkspaceRow[] | null;
};

function embedOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Every workspace the signed-in user belongs to, oldest membership first. */
export async function listMyWorkspaces(): Promise<WorkspaceSummary[]> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return [];

  const membershipRes = await client
    .from("workspace_members")
    .select("user_id, role, created_at, workspaces(id, name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (membershipRes.error) {
    throw new Error(`workspace_members: ${membershipRes.error.message}`);
  }
  const memberships = (membershipRes.data ?? []) as MembershipRow[];

  const workspaceIds = memberships.flatMap((row) => {
    const workspace = embedOne(row.workspaces);
    return workspace ? [workspace.id] : [];
  });

  // Co-members are visible under RLS, so counting heads is one extra query.
  const counts = new Map<string, number>();
  if (workspaceIds.length > 0) {
    const countRes = await client
      .from("workspace_members")
      .select("workspace_id")
      .in("workspace_id", workspaceIds);
    if (countRes.error) {
      throw new Error(`workspace_members count: ${countRes.error.message}`);
    }
    for (const row of (countRes.data ?? []) as { workspace_id: string }[]) {
      counts.set(row.workspace_id, (counts.get(row.workspace_id) ?? 0) + 1);
    }
  }

  return memberships.flatMap((row) => {
    const workspace = embedOne(row.workspaces);
    if (!workspace) return [];
    return [
      {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: row.role,
        createdAt: row.created_at,
        memberCount: counts.get(workspace.id) ?? 0,
      },
    ];
  });
}
