import type { WorkspaceRole } from "@/lib/types";

/**
 * What each workspace role may do, mirroring the RLS policies on
 * `workspace_members` and `workspace_invitations` (00004, 00024). The screen
 * reads this to decide which controls to show; the database enforces it.
 */
export const ROLE_GRANTS: Record<WorkspaceRole, string[]> = {
  owner: ["member:change-role", "member:remove", "member:invite", "workspace:delete", "integration:connect"],
  admin: ["member:remove", "member:invite", "integration:connect", "pipeline:configure"],
  member: ["finding:review", "link:confirm", "graph:read"],
};

export const ROLES: WorkspaceRole[] = ["owner", "admin", "member"];

export interface MemberView {
  userId: string;
  name: string;
  email: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface PendingInviteView {
  id: string;
  email: string;
  role: WorkspaceRole;
  createdAt: string;
}

/** Only owners change roles (workspace_members_update_owner). */
export function canChangeRole(me: WorkspaceRole): boolean {
  return me === "owner";
}

/**
 * Owners and admins remove members; anyone may leave. An admin may not remove
 * an owner, and the last owner may not go, or the workspace has no one able
 * to manage it.
 */
export function canRemove(me: { userId: string; role: WorkspaceRole }, target: MemberView, members: MemberView[]): boolean {
  const owners = members.filter((m) => m.role === "owner").length;
  if (target.role === "owner" && owners <= 1) return false;
  if (target.userId === me.userId) return true;
  if (me.role === "owner") return true;
  return me.role === "admin" && target.role !== "owner";
}

export function canInvite(me: WorkspaceRole): boolean {
  return me === "owner" || me === "admin";
}
