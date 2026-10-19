"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge, type Tone } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
  canChangeRole,
  canInvite,
  canRemove,
  ROLE_GRANTS,
  ROLES,
  type MemberView,
  type PendingInviteView,
} from "@/lib/domain/members";
import type { WorkspaceRole } from "@/lib/types";

const roleMeta: Record<WorkspaceRole, { icon: string; iconClass: string; tone: Tone }> = {
  owner: { icon: "shield_person", iconClass: "bg-tertiary-container/30 text-tertiary", tone: "warning" },
  admin: { icon: "admin_panel_settings", iconClass: "bg-primary-container/25 text-primary", tone: "info" },
  member: { icon: "person", iconClass: "bg-secondary/15 text-secondary", tone: "success" },
};

const selectClass =
  "appearance-none cursor-pointer rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 pr-8 focus:outline-none transition";

export function MembersRbac({
  workspaceId,
  me,
}: {
  workspaceId: string;
  me: { userId: string; role: WorkspaceRole };
}) {
  const toast = useToast();
  const [supabase] = useState(createClient);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [invites, setInvites] = useState<PendingInviteView[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | WorkspaceRole>("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");

  const fail = useCallback((message: string) => toast(message, { icon: "error", tone: "error" }), [toast]);

  const fetchRoster = useCallback(async (): Promise<{ members: MemberView[]; invites: PendingInviteView[] } | string> => {
    const [memberRes, inviteRes] = await Promise.all([
      supabase.from("workspace_members").select("user_id, role, created_at").eq("workspace_id", workspaceId),
      supabase
        .from("workspace_invitations")
        .select("id, invited_email, role, created_at")
        .eq("workspace_id", workspaceId)
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);
    if (memberRes.error) return `Could not load members: ${memberRes.error.message}`;
    const rows = (memberRes.data ?? []) as { user_id: string; role: WorkspaceRole; created_at: string }[];
    const profiles = rows.length
      ? await supabase.from("profiles").select("id, email, full_name").in("id", rows.map((r) => r.user_id))
      : { data: [], error: null };
    if (profiles.error) return `Could not load profiles: ${profiles.error.message}`;
    const byId = new Map(((profiles.data ?? []) as { id: string; email: string | null; full_name: string | null }[]).map((p) => [p.id, p]));
    return {
      members: rows
        .map((row) => {
          const profile = byId.get(row.user_id);
          return {
            userId: row.user_id,
            name: profile?.full_name ?? profile?.email ?? row.user_id.slice(0, 8),
            email: profile?.email ?? null,
            role: row.role,
            joinedAt: row.created_at,
          };
        })
        .sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name)),
      invites: inviteRes.error
        ? []
        : ((inviteRes.data ?? []) as { id: string; invited_email: string; role: WorkspaceRole; created_at: string }[]).map((r) => ({
            id: r.id,
            email: r.invited_email,
            role: r.role,
            createdAt: r.created_at,
          })),
    };
  }, [supabase, workspaceId]);

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchRoster>>) => {
      if (typeof result === "string") fail(result);
      else {
        setMembers(result.members);
        setInvites(result.invites);
      }
      setLoading(false);
    },
    [fail],
  );

  const load = useCallback(async () => apply(await fetchRoster()), [apply, fetchRoster]);

  useEffect(() => {
    let cancelled = false;
    void fetchRoster().then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchRoster, apply]);

  const needle = query.trim().toLowerCase();
  const visible = members.filter(
    (m) =>
      (roleFilter === "all" || m.role === roleFilter) &&
      (!needle || m.name.toLowerCase().includes(needle) || (m.email ?? "").toLowerCase().includes(needle)),
  );

  async function setRole(member: MemberView, role: WorkspaceRole) {
    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("workspace_id", workspaceId)
      .eq("user_id", member.userId);
    if (error) return fail(`Could not change role: ${error.message}`);
    toast(`${member.name} is now ${role}.`, { icon: "check" });
    await load();
  }

  async function remove(member: MemberView) {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", member.userId);
    if (error) return fail(`Could not remove member: ${error.message}`);
    toast(member.userId === me.userId ? "You left the workspace." : `${member.name} removed.`, { icon: "check" });
    await load();
  }

  async function invite() {
    const email = inviteEmail.trim();
    if (!email) return;
    const { error } = await supabase.rpc("invite_to_workspace", {
      p_workspace_id: workspaceId,
      p_email: email,
      p_role: inviteRole,
    });
    if (error) return fail(error.message);
    setInviteEmail("");
    toast(`Invitation sent to ${email}.`, { icon: "mail" });
    await load();
  }

  async function revoke(row: PendingInviteView) {
    const { error } = await supabase.from("workspace_invitations").delete().eq("id", row.id);
    if (error) return fail(`Could not revoke invitation: ${error.message}`);
    await load();
  }

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Roles &amp; Permissions</span>
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-body-sm">
            {ROLES.length} roles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {ROLES.map((role) => (
            <div key={role} className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${roleMeta[role].iconClass}`}>
                    <Icon name={roleMeta[role].icon} className="text-[18px]" />
                  </span>
                  <span className="font-body-md text-body-md font-semibold text-on-surface capitalize">{role}</span>
                </div>
                <span className="font-mono-code text-micro-label text-muted">
                  {members.filter((m) => m.role === role).length} members
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_GRANTS[role].map((grant) => (
                  <span key={grant} className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
                    {grant}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-surface-container-low shadow-sm p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search members by name or email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-muted font-body-sm text-body-sm focus:outline-none"
              />
            </div>
            <div className="relative">
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)} className={selectClass}>
                <option value="all">All roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none" />
            </div>
          </div>
          {canInvite(me.role) ? (
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void invite();
                }}
                placeholder="teammate@company.com"
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-muted font-body-sm text-body-sm focus:outline-none"
              />
              <div className="relative">
                <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)} className={selectClass}>
                  {ROLES.filter((role) => role !== "owner" || me.role === "owner").map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => void invite()}
                disabled={!inviteEmail.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-body-sm text-body-sm font-semibold disabled:opacity-50"
              >
                <Icon name="person_add" className="text-[16px]" />
                Invite
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">Member</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Since</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((member) => (
                <tr key={member.userId} className="hover:bg-surface-container transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">
                        {member.name}
                        {member.userId === me.userId ? <span className="text-muted"> (you)</span> : null}
                      </span>
                      <span className="text-muted font-mono-code text-micro-label">{member.email}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {canChangeRole(me.role) && member.userId !== me.userId ? (
                      <div className="relative inline-block">
                        <select value={member.role} onChange={(event) => void setRole(member, event.target.value as WorkspaceRole)} className={selectClass}>
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none" />
                      </div>
                    ) : (
                      <Badge tone={roleMeta[member.role].tone}>{member.role}</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge tone="success">Active</Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono-code text-micro-label text-muted">{member.joinedAt.slice(0, 10)}</td>
                  <td className="py-2.5 px-3 text-right">
                    {canRemove(me, member, members) ? (
                      <button
                        type="button"
                        onClick={() => void remove(member)}
                        className="px-2 py-1 rounded text-error hover:bg-error-container/30 font-body-sm text-body-sm"
                      >
                        {member.userId === me.userId ? "Leave" : "Remove"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {invites.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-2.5 px-3 text-on-surface-variant">{row.email}</td>
                  <td className="py-2.5 px-3">
                    <Badge tone={roleMeta[row.role].tone}>{row.role}</Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge tone="info">Invited</Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono-code text-micro-label text-muted">{row.createdAt.slice(0, 10)}</td>
                  <td className="py-2.5 px-3 text-right">
                    {canInvite(me.role) ? (
                      <button type="button" onClick={() => void revoke(row)} className="px-2 py-1 rounded text-muted hover:text-on-surface font-body-sm text-body-sm">
                        Revoke
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visible.length === 0 && invites.length === 0 ? (
            <p className="p-4 text-center text-muted font-body-sm text-body-sm">No members match.</p>
          ) : null}
          {loading ? <p className="p-4 text-center text-muted font-body-sm text-body-sm">Loading members…</p> : null}
        </div>
      </section>
    </>
  );
}
