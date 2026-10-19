"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceRole } from "@/lib/types";

const COOKIE = "unify-workspace";

type Membership = {
  workspaceId: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

function embedOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function readActiveCookie(): string | null {
  const prefix = `${COOKIE}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function writeActiveCookie(workspaceId: string) {
  document.cookie = `${COOKIE}=${encodeURIComponent(workspaceId)}; path=/; max-age=31536000; samesite=lax`;
}

export type Workspaces = {
  memberships: Membership[];
  active: Membership | null;
  loaded: boolean;
  switchTo: (workspaceId: string) => void;
};

/**
 * The caller's workspaces and the "active" one. The choice is persisted in the
 * `unify-workspace` cookie; the shell uses the active slug for the
 * workspace-scoped settings links, and data pages read via RLS across all
 * memberships.
 */
export function useWorkspaces(): Workspaces {
  const router = useRouter();
  const supabase = createClient();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const res = await supabase
        .from("workspace_members")
        .select("user_id, role, created_at, workspaces(id, name, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (res.error) return;

      const rows = (res.data ?? []) as {
        user_id: string;
        role: WorkspaceRole;
        workspaces:
          | { id: string; name: string; slug: string }
          | { id: string; name: string; slug: string }[]
          | null;
      }[];
      const mine = rows.flatMap((row) => {
        const workspace = embedOne(row.workspaces);
        return workspace
          ? [
              {
                workspaceId: workspace.id,
                name: workspace.name,
                slug: workspace.slug,
                role: row.role,
              },
            ]
          : [];
      });

      if (cancelled) return;
      setMemberships(mine);
      const stored = readActiveCookie();
      setActiveId(
        stored && mine.some((m) => m.workspaceId === stored)
          ? stored
          : (mine[0]?.workspaceId ?? null),
      );
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return {
    memberships,
    active: memberships.find((m) => m.workspaceId === activeId) ?? null,
    loaded,
    switchTo(workspaceId: string) {
      setActiveId(workspaceId);
      writeActiveCookie(workspaceId);
      router.refresh();
    },
  };
}

/** Top-bar workspace switcher over `useWorkspaces()`. */
export function WorkspaceSwitcher({ workspaces }: { workspaces: Workspaces }) {
  const { memberships, active, loaded } = workspaces;
  const activeId = active?.workspaceId ?? null;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  function switchTo(workspaceId: string) {
    setOpen(false);
    workspaces.switchTo(workspaceId);
  }

  if (loaded && memberships.length === 0) {
    return (
      <Link
        href="/workspaces/new"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <Icon name="add" className="text-[16px]" />
        <span className="font-body-sm text-body-sm">Create workspace</span>
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        aria-label="Switch workspace"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors max-w-56"
      >
        <Icon name="corporate_fare" className="text-primary text-[16px] shrink-0" />
        <span className="font-body-sm text-body-sm text-on-surface truncate">
          {active ? active.name : "Select workspace"}
        </span>
        <Icon name="unfold_more" className="text-muted text-[16px] shrink-0" />
      </button>

      {open ? (
        <div className="absolute left-0 top-10 w-72 rounded-xl bg-surface-container-highest border border-outline-variant shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Your workspaces
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {memberships.map((membership) => {
              const isActive = membership.workspaceId === activeId;
              return (
                <button
                  key={membership.workspaceId}
                  type="button"
                  onClick={() => switchTo(membership.workspaceId)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-surface-container-high"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  <Icon
                    name={isActive ? "check_circle" : "radio_button_unchecked"}
                    className={`text-[16px] shrink-0 ${isActive ? "text-secondary" : "text-muted"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-body-sm text-body-sm text-on-surface truncate">
                      {membership.name}
                    </span>
                    <span className="block font-mono-code text-micro-label text-muted">
                      {membership.slug} · {membership.role}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-outline-variant py-1">
            <Link
              href="/workspaces/new"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-high transition-colors"
            >
              <Icon name="add" className="text-[16px] text-primary shrink-0" />
              <span className="font-body-sm text-body-sm text-on-surface">
                New workspace
              </span>
            </Link>
            <Link
              href="/workspaces"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-high transition-colors"
            >
              <Icon name="settings" className="text-[16px] text-muted shrink-0" />
              <span className="font-body-sm text-body-sm text-on-surface">
                Manage workspaces
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
