import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/types";
import { listMyWorkspaces } from "./workspaces";

/**
 * The signed-in user's profile page: who they are (`profiles` + auth), which
 * workspaces they hold which role in, and which provider accounts those
 * workspaces have connected. Connection reads name only non-secret columns;
 * the token ciphertext never leaves the database.
 */

export interface ConnectedAccount {
  provider: "github" | "jira" | "figma";
  workspaceName: string;
  workspaceSlug: string;
  accountName: string | null;
  scopes: string[];
  connectedAt: string;
}

export interface ProfileView {
  name: string;
  email: string;
  initials: string;
  /** The strongest role the user holds anywhere, for the banner chip. */
  topRole: WorkspaceRole | null;
  workspaceCount: number;
  memberSince: string;
  connections: ConnectedAccount[];
}

const ROLE_RANK: Record<WorkspaceRole, number> = { owner: 3, admin: 2, member: 1 };

export function initialsOf(name: string): string {
  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2)).toUpperCase();
}

export async function loadProfile(): Promise<ProfileView | null> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const [profileRes, workspaces] = await Promise.all([
    client.from("profiles").select("full_name, email, created_at").eq("id", user.id).maybeSingle(),
    listMyWorkspaces(),
  ]);
  if (profileRes.error) throw new Error(`profiles: ${profileRes.error.message}`);
  const profile = profileRes.data as { full_name: string | null; email: string | null; created_at: string } | null;

  const byId = new Map(workspaces.map((ws) => [ws.id, ws]));
  let connections: ConnectedAccount[] = [];
  if (workspaces.length > 0) {
    const conn = await client
      .from("integration_connections")
      .select("workspace_id, provider, external_account_name, scopes, updated_at")
      .in(
        "workspace_id",
        workspaces.map((ws) => ws.id),
      )
      .order("updated_at", { ascending: false });
    if (conn.error) throw new Error(`integration_connections: ${conn.error.message}`);
    connections = (
      (conn.data ?? []) as {
        workspace_id: string;
        provider: ConnectedAccount["provider"];
        external_account_name: string | null;
        scopes: string[] | null;
        updated_at: string;
      }[]
    ).flatMap((row) => {
      const ws = byId.get(row.workspace_id);
      return ws
        ? [
            {
              provider: row.provider,
              workspaceName: ws.name,
              workspaceSlug: ws.slug,
              accountName: row.external_account_name,
              scopes: row.scopes ?? [],
              connectedAt: row.updated_at,
            },
          ]
        : [];
    });
  }

  const email = profile?.email ?? user.email ?? "";
  const name = profile?.full_name?.trim() || email || "Unnamed user";
  const topRole = workspaces.reduce<WorkspaceRole | null>(
    (best, ws) => (!best || ROLE_RANK[ws.role] > ROLE_RANK[best] ? ws.role : best),
    null,
  );

  return {
    name,
    email,
    initials: initialsOf(name),
    topRole,
    workspaceCount: workspaces.length,
    memberSince: profile?.created_at ?? user.created_at,
    connections,
  };
}
