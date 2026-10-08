import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { ToastProvider } from "@/components/ui/toast";
import { ConnectedTools } from "@/components/profile/connected-tools";
import { WatcherTable } from "@/components/profile/watcher-table";
import { NotificationChannels } from "@/components/profile/notification-channels";
import { TokenCard } from "@/components/profile/token-card";

export const metadata: Metadata = {
  title: "Profile & Watch Preferences",
  description:
    "UNIFY user profile: connected developer tool accounts, watcher subscriptions and personal notification delivery preferences.",
};

const metrics = [
  {
    label: "Active Watchers",
    value: "18",
    delta: "↑ 3 new",
    deltaClass: "text-secondary font-medium",
    valueClass: "text-on-surface",
  },
  {
    label: "Sync Health",
    value: "99.8%",
    delta: "0 ERRORS",
    deltaClass: "text-outline font-label-caps text-[10px]",
    valueClass: "text-secondary",
  },
  {
    label: "Resolved Conflicts",
    value: "142",
    delta: "MTTR 22m",
    deltaClass: "text-outline",
    valueClass: "text-primary",
  },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <ToastProvider>
        {/* Identity & role banner (asymmetric bento header) */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container shadow-xl">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-80 h-32 bg-secondary/5 blur-2xl pointer-events-none" />
          <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-primary-container via-primary/40 to-secondary/30 ring-2 ring-primary/20 grid place-items-center">
                  <span className="font-headline-lg text-headline-lg text-on-primary-container font-bold tracking-tight">
                    AR
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-secondary text-on-secondary flex items-center gap-1 shadow-sm">
                  <Icon name="verified" className="text-[14px]" />
                  <span className="font-label-caps text-label-caps font-bold">VERIFIED</span>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    Alex Rivera
                  </h1>
                  <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-wide font-semibold">
                    CODE OWNER / ASSIGNEE
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-mono-code text-[11px]">
                    ID: usr_core_9921
                  </span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                  Staff Software Engineer · Architecture &amp; Core Platform
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-on-surface-variant">
                  <div className="flex items-center gap-1.5 font-mono-code text-mono-code">
                    <Icon name="mail" className="text-outline text-[16px]" />
                    <span className="text-on-surface">alex.rivera@acme.io</span>
                  </div>
                  <span className="text-outline-variant">•</span>
                  <div className="flex items-center gap-1.5 font-body-sm text-body-sm">
                    <Icon name="corporate_fare" className="text-secondary text-[16px]" />
                    <span>Acme Engineering Global</span>
                  </div>
                  <span className="text-outline-variant">•</span>
                  <div className="flex items-center gap-1.5 font-body-sm text-body-sm">
                    <Icon name="schedule" className="text-tertiary text-[16px]" />
                    <span>UTC-07 (San Francisco)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick metrics strip */}
            <div className="flex items-center gap-3 w-full lg:w-auto self-stretch lg:self-auto justify-between lg:justify-end">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="px-4 py-3 rounded-lg bg-surface-container-high flex flex-col"
                >
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className={`font-headline-md text-headline-md font-bold ${metric.valueClass}`}
                    >
                      {metric.value}
                    </span>
                    <span className={`font-mono-code text-[11px] ${metric.deltaClass}`}>
                      {metric.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connected tool accounts (identity federation & OAuth mappings) */}
        <section className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest">
                  Federated Identity
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-mono-code text-[12px] text-outline">4 / 4 Synced</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                Connected Developer Tool Accounts
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              OAuth tokens map code authorship, Figma layers, Jira tasks, and incident handoffs
              directly to Unify&apos;s conflict detection pipeline.
            </p>
          </div>
          <ConnectedTools />
        </section>

        {/* Two-pane: watcher subscriptions & escalation preferences */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col min-w-0">
            <WatcherTable />
          </div>
          <div className="lg:col-span-4 flex flex-col min-w-0">
            <NotificationChannels />
          </div>
        </section>

        {/* Personal access tokens & CLI authentication */}
        <TokenCard />
      </ToastProvider>
    </AppShell>
  );
}
