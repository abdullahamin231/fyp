import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { AuditHeaderActions } from "@/components/audit/audit-header-actions";
import { AuditConsole } from "@/components/audit/audit-console";
import { auditTotals } from "@/lib/mock/audit";

export const metadata: Metadata = {
  title: "Audit Trail",
  description:
    "Immutable, hash-chained record of every link mutation, conflict verdict and policy change — with a compliance export panel.",
};

export default function AuditPage() {
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
              Immutable Ledger SHA-256
            </span>
          </div>
        </div>
        <AuditHeaderActions />
      </div>

      <AuditConsole />

      {/* Integrity ledger status bar */}
      <div className="p-gutter rounded bg-surface-container-lowest shadow-md flex flex-wrap items-center gap-stack-comfortable">
        <div className="flex items-center gap-2 font-mono-code text-micro-label text-on-surface-variant">
          <span className="text-muted">Total Audit Events:</span>
          <span className="text-on-surface font-semibold">
            {auditTotals.events.toLocaleString("en-US")}
          </span>
        </div>
        <div className="h-4 w-px bg-surface-container-highest hidden md:block" />
        <div className="flex items-center gap-2 font-mono-code text-micro-label text-on-surface-variant">
          <span className="text-muted">Block Height:</span>
          <span className="text-on-surface font-semibold">
            {auditTotals.blockHeight.toLocaleString("en-US")}
          </span>
        </div>
        <div className="h-4 w-px bg-surface-container-highest hidden md:block" />
        <div className="flex items-center gap-2 font-mono-code text-micro-label text-on-surface-variant">
          <span className="text-muted">Merkle Root:</span>
          <span className="text-primary font-medium">{auditTotals.merkleRoot}</span>
        </div>
        <div className="h-4 w-px bg-surface-container-highest hidden md:block" />
        <div className="flex items-center gap-2 font-mono-code text-micro-label text-on-surface-variant">
          <span className="text-muted">Latency:</span>
          <span className="text-on-surface font-semibold">{auditTotals.latencyMs}ms</span>
        </div>
      </div>
    </AppShell>
  );
}
