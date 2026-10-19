import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { AuditConsole } from "@/components/audit/audit-console";
import { loadAuditTrail } from "@/lib/data/audit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Trail",
  description:
    "Append-only record of every reviewer decision on findings, links and rules, with CSV and JSON export.",
};

export default async function AuditPage() {
  const trail = await loadAuditTrail();
  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-gutter pt-stack-compact">
        <div className="flex items-center gap-stack-comfortable flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Audit Trail &amp; Compliance Export
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/10 text-secondary">
            <Icon name="verified_user" className="text-[15px]" fill />
            <span className="font-label-caps text-label-caps uppercase tracking-wider">
              Append-only Ledger
            </span>
          </div>
        </div>
      </div>

      <AuditConsole events={trail.events} actors={trail.actors} total={trail.total} />

    </AppShell>
  );
}
