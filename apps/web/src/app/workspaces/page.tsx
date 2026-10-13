import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { listMyWorkspaces } from "@/lib/data/workspaces";
import type { WorkspaceRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Workspaces",
  description:
    "Your UNIFY workspaces — one per team. Create a workspace and invite teammates by email.",
};

const roleTone: Record<WorkspaceRole, string> = {
  owner: "bg-primary-container text-on-primary-container",
  admin: "bg-tertiary-container text-on-tertiary-container",
  member: "bg-surface-container-highest text-on-surface-variant",
};

export default async function WorkspacesPage() {
  const workspaces = await listMyWorkspaces();

  return (
    <AppShell>
      {/* Context header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
            Workspaces
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            One workspace per team — you can belong to several at once.
          </p>
        </div>
        <Link
          href="/workspaces/new"
          className="flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-body-sm font-medium transition-all shadow-sm"
        >
          <Icon name="add" className="text-[16px]" />
          <span>New workspace</span>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <section className="rounded-xl bg-surface-container-low shadow-sm p-10 flex flex-col items-center text-center gap-3">
          <Icon name="corporate_fare" className="text-muted text-[40px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            No workspaces yet
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            Create a workspace for your team, then invite teammates by email —
            they will see the invitation in their notifications.
          </p>
          <Link
            href="/workspaces/new"
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors font-label-caps uppercase tracking-wider font-bold shadow-sm"
          >
            <Icon name="add" className="text-[16px]" />
            Create your first workspace
          </Link>
        </section>
      ) : (
        <section className="rounded-xl bg-surface-container-low shadow-sm overflow-hidden">
          <div className="divide-y divide-outline-variant">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center gap-4 p-4 hover:bg-surface-container transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                  <Icon name="corporate_fare" className="text-primary text-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-semibold text-on-surface truncate">
                      {workspace.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono-code text-eyebrow font-bold uppercase ${roleTone[workspace.role]}`}
                    >
                      {workspace.role}
                    </span>
                  </div>
                  <div className="font-mono-code text-micro-label text-muted mt-0.5">
                    unify.dev/org/{workspace.slug}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono-code text-micro-label text-on-surface-variant flex items-center gap-1">
                    <Icon name="group" className="text-[14px] text-muted" />
                    {workspace.memberCount}{" "}
                    {workspace.memberCount === 1 ? "member" : "members"}
                  </span>
                  <span className="font-mono-code text-micro-label text-muted">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/workspaces/${workspace.slug}/integrations`}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-container text-on-surface font-body-sm text-micro-label transition-colors"
                  >
                    <Icon name="link" className="text-[14px]" />
                    Integrations
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
