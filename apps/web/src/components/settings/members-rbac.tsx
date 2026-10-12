"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge, type Tone } from "@/components/ui/badge";

type RoleName = "Product Manager" | "Code Owner" | "Designer" | "Reviewer";

type Role = {
  name: RoleName;
  icon: string;
  iconClass: string;
  /** Populated by the roles API — omitted until the endpoint exists. */
  count?: number;
  grants: string[];
};

const roles: Role[] = [
  {
    name: "Product Manager",
    icon: "analytics",
    iconClass: "bg-tertiary-container/30 text-tertiary",
    grants: ["policy:approve", "escalation:override", "verdict:sign-off", "member:invite"],
  },
  {
    name: "Code Owner",
    icon: "terminal",
    iconClass: "bg-primary-container/25 text-primary",
    grants: ["merge:gate", "evidence:review", "link:confirm", "scope:read"],
  },
  {
    name: "Designer",
    icon: "palette",
    iconClass: "bg-secondary/15 text-secondary",
    grants: ["figma:anchor", "drift:triage", "criteria:edit", "scope:read"],
  },
  {
    name: "Reviewer",
    icon: "fact_check",
    iconClass: "bg-primary/15 text-primary",
    grants: ["finding:review", "link:confirm", "verdict:review", "scope:read"],
  },
];

type Member = {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  team: string;
  status: "Active" | "Invited" | "Suspended";
};

const statusTone: Record<Member["status"], Tone> = {
  Active: "success",
  Invited: "info",
  Suspended: "warning",
};

/**
 * DATA HOLE — replace with the workspace members API.
 * Empty until the endpoint exists; the table renders its empty state.
 */
const initialMembers: Member[] = [];

const roleOptions: RoleName[] = ["Product Manager", "Code Owner", "Designer", "Reviewer"];

const selectClass =
  "appearance-none cursor-pointer rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 pr-8 focus:outline-none transition";

export function MembersRbac() {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleName>("Reviewer");
  const [nextId, setNextId] = useState(1);

  const visible = members.filter((member) => {
    const matchesQuery =
      query.trim() === "" ||
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.email.toLowerCase().includes(query.toLowerCase()) ||
      member.team.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "All roles" || member.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  function setRole(id: number, role: RoleName) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  function remove(id: number) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function invite() {
    const email = inviteEmail.trim();
    if (!email) return;
    const handle = email.split("@")[0].replace(/[._-]+/g, " ");
    const name = handle
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((prev) => [
      ...prev,
      {
        id: nextId,
        name: name || email,
        email,
        role: inviteRole,
        team: "Unassigned",
        status: "Invited",
      },
    ]);
    setNextId((value) => value + 1);
    setInviteEmail("");
  }

  return (
    <>
      {/* Role cards */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Roles &amp; Responsibilities
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-body-sm">
              {roles.length} roles
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {roles.map((role) => (
            <div
              key={role.name}
              className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-3 hover:bg-surface-container transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${role.iconClass}`}>
                  <Icon name={role.icon} className="text-[20px]" />
                </div>
                <span className="font-mono-code text-micro-label text-on-surface-variant">
                  {role.count != null ? `${role.count} members` : null}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">
                  {role.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {role.grants.map((grant) => (
                  <span
                    key={grant}
                    className="px-2 py-0.5 rounded bg-surface-container-lowest font-mono-code text-micro-label text-on-surface-variant"
                  >
                    {grant}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member management */}
      <section className="rounded-xl bg-surface-container-low shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Member Management
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-body-sm">
              {members.length} shown
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[16px]"
              />
              <input
                type="text"
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="Search member, email, or team..."
                className="w-56 pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-[12px] focus:outline-none placeholder:text-muted"
              />
            </div>
            <div className="relative">
              <select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
                className={selectClass}
              >
                <option>All roles</option>
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") invite();
                }}
                placeholder="invite@unify.dev"
                className="w-44 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-[12px] focus:outline-none placeholder:text-muted"
              />
              <select
                aria-label="Role for invite"
                value={inviteRole}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setInviteRole(e.target.value as RoleName)
                }
                className="appearance-none cursor-pointer rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 focus:outline-none"
              >
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <button
                onClick={invite}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 transition flex items-center gap-1.5"
              >
                <Icon name="person_add" className="text-[16px]" />
                Invite
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-4 px-4 min-w-[260px]">Member</th>
                <th className="py-4 px-4 w-48">Role</th>
                <th className="py-4 px-4 w-56">Team</th>
                <th className="py-4 px-4 w-32">Status</th>
                <th className="py-4 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-on-surface font-body-md text-body-md">
              {visible.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-surface-container transition-colors align-middle"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container ring-2 ring-surface-container-low grid place-items-center text-micro-label font-bold shrink-0">
                          {initials}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-body-sm font-semibold text-on-surface truncate">
                            {member.name}
                          </span>
                          <span className="font-mono-code text-micro-label text-muted truncate">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <select
                          aria-label={`Role for ${member.name}`}
                          value={member.role}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setRole(member.id, e.target.value as RoleName)
                          }
                          className="appearance-none cursor-pointer rounded-md bg-surface-container-highest text-on-surface font-mono-code text-[12px] px-2.5 py-1 pr-7 focus:outline-none"
                        >
                          {roleOptions.map((role) => (
                            <option key={role}>{role}</option>
                          ))}
                        </select>
                        <Icon
                          name="expand_more"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted text-[14px] pointer-events-none"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-[12px] text-on-surface-variant">
                      {member.team}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge tone={statusTone[member.status]}>{member.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        title={`Remove ${member.name}`}
                        onClick={() => remove(member.id)}
                        className="p-1.5 rounded text-muted hover:text-error hover:bg-surface-container-highest transition-colors"
                      >
                        <Icon name="person_remove" className="text-[18px]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-body-sm text-on-surface-variant">
                    {members.length === 0
                      ? "No members yet"
                      : "No members match this filter."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
