import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { ConnectedTools } from "@/components/profile/connected-tools";
import { loadProfile } from "@/lib/data/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "UNIFY user profile: identity, workspace roles and connected developer tool accounts.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const identity = await loadProfile();

  return (
    <AppShell>
      {/* Identity & role banner (asymmetric bento header) */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container shadow-xl">
        <div className="absolute left-1/3 bottom-0 w-80 h-32 bg-secondary/5 blur-2xl pointer-events-none" />
        <div className="relative p-4 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md bg-primary-container ring-2 ring-outline-variant grid place-items-center">
                <span className="font-headline-lg text-headline-lg text-on-primary-container font-bold tracking-tight">
                  {identity?.initials ?? ""}
                </span>
              </div>
            </div>
            {identity ? (
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    {identity.name}
                  </h1>
                  {identity.topRole ? (
                    <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-wide font-semibold">
                      {identity.topRole}
                    </span>
                  ) : null}
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant font-medium leading-relaxed">
                  Member of {identity.workspaceCount} workspace{identity.workspaceCount === 1 ? "" : "s"}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-on-surface-variant">
                  <div className="flex items-center gap-1.5 font-mono-code text-mono-code">
                    <Icon name="mail" className="text-muted text-[16px]" />
                    <span className="text-on-surface">{identity.email}</span>
                  </div>
                  <span className="text-muted">•</span>
                  <div className="flex items-center gap-1.5 font-body-sm text-body-sm">
                    <Icon name="schedule" className="text-tertiary text-[16px]" />
                    <span>Joined {new Date(identity.memberSince).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                  Your profile
                </h1>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Connected tool accounts (identity federation & OAuth mappings) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest">
              Federated Identity
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight mt-1">
              Connected Developer Tool Accounts
            </h2>
          </div>
        </div>
        <ConnectedTools connections={identity?.connections ?? []} />
      </section>
    </AppShell>
  );
}
