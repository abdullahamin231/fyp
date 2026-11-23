"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { inboxFor, markDelivered, type InboxItem } from "@/lib/data/notification-delivery";
import type { WorkspaceInvitation } from "@/lib/types";

type InvitationRow = {
  id: string;
  invited_email: string;
  invited_by: string | null;
  role: WorkspaceInvitation["role"];
  status: WorkspaceInvitation["status"];
  created_at: string;
  workspace_id: string;
  workspaces: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function embedOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Top-bar notifications bell: a dropdown listing findings routed to the signed-in
 * user (FR-14; opening it records them as delivered) and their pending
 * workspace invitations with inline Accept / Decline. The badge counts only
 * invitations addressed to the user's own email — invites they *sent* for
 * workspaces they admin are also readable under RLS, but are not notifications
 * for them, so they are filtered out client-side.
 */
export function NotificationsBell() {
  const toast = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [inviterNames, setInviterNames] = useState<Map<string, string>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  /** Inbox rows this session has already shown (and recorded as delivered). */
  const [shown, setShown] = useState<Set<string>>(new Set());
  const unseen = inbox.filter((item) => item.status === "sent" && !shown.has(item.id));
  const badge = invitations.length + unseen.length;

  const fetchInbox = useCallback(async (): Promise<InboxItem[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    try {
      return await inboxFor(supabase as unknown as SupabaseClient, user.id);
    } catch {
      return [];
    }
  }, [supabase]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /** Pure fetch — no setState, so callers decide when to apply the result. */
  const fetchInvitations = useCallback(async (): Promise<{
    invitations: WorkspaceInvitation[];
    inviters: Map<string, string>;
  }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { invitations: [], inviters: new Map() };
    const myEmail = user.email.toLowerCase();

    const res = await supabase
      .from("workspace_invitations")
      .select(
        "id, invited_email, invited_by, role, status, created_at, workspace_id, workspaces(name, slug)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (res.error) return { invitations: [], inviters: new Map() };

    const invitations = ((res.data ?? []) as InvitationRow[]).flatMap((row) => {
      if (row.invited_email !== myEmail) return [];
      const workspace = embedOne(row.workspaces);
      return [
        {
          id: row.id,
          workspaceId: row.workspace_id,
          workspaceName: workspace?.name ?? "Unknown workspace",
          workspaceSlug: workspace?.slug ?? "",
          invitedEmail: row.invited_email,
          invitedBy: row.invited_by,
          role: row.role,
          status: row.status,
          createdAt: row.created_at,
        },
      ];
    });

    const inviterIds = [
      ...new Set(invitations.flatMap((invite) => (invite.invitedBy ? [invite.invitedBy] : []))),
    ];
    const inviters = new Map<string, string>();
    if (inviterIds.length > 0) {
      const profilesRes = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", inviterIds);
      for (const profile of (profilesRes.data ?? []) as {
        id: string;
        full_name: string | null;
        email: string | null;
      }[]) {
        inviters.set(profile.id, profile.full_name ?? profile.email ?? "Someone");
      }
    }
    return { invitations, inviters };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [result, items] = await Promise.all([fetchInvitations(), fetchInbox()]);
      if (!cancelled) {
        setInvitations(result.invitations);
        setInviterNames(result.inviters);
        setInbox(items);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchInvitations, fetchInbox]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function respond(invite: WorkspaceInvitation, action: "accept" | "decline") {
    if (busyId) return;
    setBusyId(invite.id);
    const { error } = await supabase.rpc(
      action === "accept" ? "accept_workspace_invitation" : "decline_workspace_invitation",
      { p_invitation_id: invite.id },
    );
    setBusyId(null);
    if (error) {
      toast(error.message, { icon: "error", tone: "error" });
      return;
    }
    setInvitations((prev) => prev.filter((row) => row.id !== invite.id));
    if (action === "accept") {
      toast(`You joined ${invite.workspaceName}`, { icon: "group_add" });
      router.refresh();
    } else {
      toast(`Invitation to ${invite.workspaceName} declined`, {
        icon: "block",
        tone: "neutral",
      });
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${badge > 0 ? ` (${badge} new)` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            void fetchInvitations().then((result) => {
              setInvitations(result.invitations);
              setInviterNames(result.inviters);
            });
            void fetchInbox().then(async (items) => {
              setInbox(items);
              const fresh = items.filter((item) => item.status === "sent").map((item) => item.id);
              if (fresh.length === 0) return;
              // Showing them is what delivery means: record it, keep the "new" marker for this view.
              try {
                await markDelivered(supabase as unknown as SupabaseClient, fresh);
                setShown((prev) => new Set([...prev, ...fresh]));
              } catch {
                // Leave them as sent; the next open tries again.
              }
            });
          }
        }}
        className="relative p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[19px] leading-none">
          notifications
        </span>
        {badge > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-error text-on-primary font-mono-code text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-10 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-surface-container-highest border border-outline-variant shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Notifications
            </span>
            <span className="font-mono-code text-micro-label text-muted">
              {inbox.length + invitations.length} total
            </span>
          </div>

          {inbox.length > 0 ? (
            <div className="divide-y divide-outline-variant max-h-60 overflow-y-auto border-b border-outline-variant">
              {inbox.map((item) => (
                <Link
                  key={item.id}
                  href={`/conflicts/${item.findingId}`}
                  onClick={() => setOpen(false)}
                  className="p-4 flex items-start gap-3 hover:bg-surface-container-high transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <Icon name="warning" className="text-primary text-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body-sm text-body-sm text-on-surface">{item.annotation}</p>
                    <p className="font-mono-code text-micro-label text-muted mt-0.5">
                      {item.severity} · {new Date(item.createdAt).toLocaleDateString()}
                      {item.status === "sent" ? " · new" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {invitations.length === 0 && inbox.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center gap-2">
              <Icon name="notifications_off" className="text-muted text-[26px]" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No notifications
              </p>
            </div>
          ) : invitations.length === 0 ? null : (
            <div className="divide-y divide-outline-variant max-h-80 overflow-y-auto">
              {invitations.map((invite) => (
                <div key={invite.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <Icon name="corporate_fare" className="text-primary text-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface">
                        <span className="font-semibold">
                          {invite.invitedBy
                            ? (inviterNames.get(invite.invitedBy) ?? "Someone")
                            : "Someone"}
                        </span>{" "}
                        invited you to join{" "}
                        <span className="font-semibold">{invite.workspaceName}</span>
                      </p>
                      <p className="font-mono-code text-micro-label text-muted mt-0.5">
                        as {invite.role} ·{" "}
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-11">
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => respond(invite, "accept")}
                      className="px-3 py-1.5 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors font-label-caps text-eyebrow uppercase tracking-wider font-bold disabled:opacity-40"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => respond(invite, "decline")}
                      className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-eyebrow uppercase tracking-wider font-bold disabled:opacity-40"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
