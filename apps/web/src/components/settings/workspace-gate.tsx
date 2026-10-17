import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { WorkspaceSummary } from "@/lib/types";

/**
 * The two states a workspace-scoped settings page shows instead of its body:
 * no workspace chosen yet, or a workspace the caller cannot administer.
 */

export function ChooseWorkspace({
  title,
  path,
  workspaces,
}: {
  title: string;
  path: string;
  workspaces: WorkspaceSummary[];
}) {
  return (
    <section className="mt-6 rounded-xl bg-surface-container-low p-5 shadow-sm flex flex-col gap-3">
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h2>
      {workspaces.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          You are not a member of any workspace yet.{" "}
          <Link href="/workspaces/new" className="text-primary hover:underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="text-body-sm text-on-surface-variant">Choose a workspace.</p>
          <ul className="flex flex-col gap-2">
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <Link
                  href={`${path}?workspace=${encodeURIComponent(ws.slug)}`}
                  className="flex items-center justify-between p-3 rounded bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  <span className="text-body-sm text-on-surface font-medium">{ws.name}</span>
                  <span className="font-mono-code text-micro-label text-muted">
                    {ws.slug} · {ws.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function AdminRequired({ slug }: { slug: string }) {
  return (
    <section
      role="alert"
      className="mt-6 rounded-xl bg-surface-container-low p-5 shadow-sm flex items-start gap-3"
    >
      <Icon name="lock" className="text-error text-[22px] shrink-0" />
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
          You need admin access
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Only owners and admins of <span className="font-mono-code">{slug}</span> can change these
          settings. Ask an owner to raise your role, or{" "}
          <Link href="/workspaces" className="text-primary hover:underline">
            pick another workspace
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
