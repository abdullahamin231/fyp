"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { createWorkspace, slugify, type CreatedWorkspace } from "@/lib/data/create-workspace";
import type { WorkspaceRole } from "@/lib/types";

type PendingInvite = {
  id: string;
  invited_email: string;
  role: WorkspaceRole;
  created_at: string;
};

/**
 * Workspace creation flow: name + slug (persisted via the `create_workspace`
 * RPC), then an invite step where the creator — the workspace's owner — adds
 * teammates by email. Invites are in-app: invitees see them in the top-bar
 * notifications bell and join on accept.
 */
export function CreateWorkspace() {
  const toast = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedWorkspace | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<WorkspaceRole, "owner">>("member");
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [inviting, setInviting] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const canCreate = name.trim().length > 0 && effectiveSlug.length > 0 && !creating;

  useEffect(() => {
    if (!created) return;
    let cancelled = false;
    (async () => {
      const res = await supabase
        .from("workspace_invitations")
        .select("id, invited_email, role, created_at")
        .eq("workspace_id", created.id)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (!cancelled && !res.error) setInvites((res.data ?? []) as PendingInvite[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [created, supabase]);

  async function create() {
    if (!canCreate) return;
    setCreating(true);
    const result = await createWorkspace(supabase, name, effectiveSlug);
    setCreating(false);
    if (!result.ok) {
      toast(result.error, { icon: "error", tone: "error" });
      return;
    }
    setCreated(result.workspace);
    toast(`Workspace ${result.workspace.name} created`, { icon: "cloud_done" });
  }

  async function invite() {
    if (!created || inviting) return;
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      toast("Enter a valid email address", { icon: "error", tone: "neutral" });
      return;
    }
    setInviting(true);
    const { data, error } = await supabase.rpc("invite_to_workspace", {
      p_workspace_id: created.id,
      p_email: trimmed,
      p_role: role,
    });
    setInviting(false);
    if (error) {
      toast(error.message, { icon: "error", tone: "error" });
      return;
    }
    const row = data as PendingInvite;
    setInvites((prev) => [...prev, row]);
    setEmail("");
    toast(`Invitation sent to ${row.invited_email}`, { icon: "mail" });
  }

  async function revoke(invite: PendingInvite) {
    const { error } = await supabase
      .from("workspace_invitations")
      .delete()
      .eq("id", invite.id);
    if (error) {
      toast(`Could not revoke invitation: ${error.message}`, {
        icon: "error",
        tone: "error",
      });
      return;
    }
    setInvites((prev) => prev.filter((row) => row.id !== invite.id));
    toast(`Invitation to ${invite.invited_email} revoked`, {
      icon: "delete",
      tone: "neutral",
    });
  }

  function finish() {
    router.push("/workspaces");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-eyebrow text-primary tracking-wider uppercase">
            Workspace Creation
          </span>
          <span className="text-muted text-body-sm font-mono-code">/</span>
          <span className="font-mono-code text-micro-label text-on-surface-variant">
            Step {created ? 2 : 1} of 2
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          {created ? `Invite your team to ${created.name}` : "Create a workspace"}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {created
            ? "Teammates see the invitation in their notifications and join on accept."
            : "One workspace per team. You become its owner and can invite others."}
        </p>
      </div>

      {!created ? (
        <div className="bg-surface-container rounded-xl shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-4 rounded-t-xl">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
              <Icon name="corporate_fare" className="text-primary text-[24px]" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Name your workspace
            </h2>
          </div>

          <div className="flex flex-col gap-4 px-4 pb-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="workspace-name"
                className="font-label-caps text-label-caps uppercase text-muted"
              >
                Workspace display name
              </label>
              <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2">
                <Icon name="domain" className="text-muted text-[18px] mr-2" />
                <input
                  id="workspace-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Acme Engineering"
                  className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="workspace-slug"
                className="font-label-caps text-label-caps uppercase text-muted"
              >
                Workspace slug
              </label>
              <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2">
                <span className="text-muted font-mono-code text-mono-code select-none mr-1">
                  unify.dev/org/
                </span>
                <input
                  id="workspace-slug"
                  value={effectiveSlug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  placeholder="workspace-slug"
                  className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
                />
              </div>
              <span className="font-mono-code text-micro-label text-muted">
                Lowercase letters, numbers and hyphens.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/workspaces")}
                className="px-4 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canCreate}
                onClick={create}
                className="px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-sm font-semibold transition-colors flex items-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Icon name="refresh" className="text-[16px] animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create workspace
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container rounded-xl shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-4 rounded-t-xl">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
              <Icon name="group_add" className="text-primary text-[24px]" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Invite teammates
            </h2>
          </div>

          <div className="flex flex-col gap-4 px-4 pb-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="invite-email"
                className="font-label-caps text-label-caps uppercase text-muted"
              >
                Invite by email
              </label>
              <div className="flex items-stretch gap-2">
                <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2 flex-1">
                  <Icon name="mail" className="text-muted text-[18px] mr-2" />
                  <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") invite();
                    }}
                    placeholder="teammate@example.com"
                    className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
                  />
                </div>
                <select
                  aria-label="Role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as Exclude<WorkspaceRole, "owner">)
                  }
                  className="bg-surface-container-lowest rounded px-2 py-2 text-on-surface font-mono-code text-mono-code focus:outline-none"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  disabled={inviting || email.trim().length === 0}
                  onClick={invite}
                  className="px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors flex items-center gap-2 font-label-caps uppercase tracking-wider font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="send" className="text-[16px]" />
                  Invite
                </button>
              </div>
              <span className="font-mono-code text-micro-label text-muted">
                No email is sent — the invite appears in their in-app
                notifications, even if they sign up later.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-label-caps uppercase text-muted">
                Pending invitations
              </span>
              {invites.length === 0 ? (
                <div className="bg-surface-container-low rounded p-4 font-mono-code text-micro-label text-muted">
                  No invitations yet
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-surface-container-low p-3.5 rounded flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon name="mail" className="text-secondary text-[18px] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono-code text-[13px] text-on-surface font-medium truncate">
                            {invite.invited_email}
                          </div>
                          <div className="font-mono-code text-micro-label text-muted">
                            role: {invite.role} · pending
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => revoke(invite)}
                        aria-label={`Revoke invitation to ${invite.invited_email}`}
                        className="p-1.5 rounded-md text-muted hover:text-error hover:bg-surface-container-high transition-colors shrink-0"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={finish}
                className="px-3.5 py-2 rounded text-muted hover:text-on-surface font-body-sm transition-colors"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={finish}
                className="px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-sm font-semibold transition-colors flex items-center gap-2 shadow-md"
              >
                Done
                <Icon name="check" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
