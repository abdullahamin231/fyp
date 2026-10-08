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

const metrics = [
  {
    label: "Total Audit Events",
    value: auditTotals.events.toLocaleString("en-US"),
    meta: "+1,240 today",
    metaClass: "text-secondary",
    icon: "receipt_long",
    iconClass: "text-primary",
    bar: "bg-secondary",
    width: "w-[84%]",
  },
  {
    label: "Conflict Transitions",
    value: "3,410",
    meta: "99.4% resolved",
    metaClass: "text-on-surface-variant",
    icon: "troubleshoot",
    iconClass: "text-tertiary",
    bar: "bg-tertiary",
    width: "w-[92%]",
  },
  {
    label: "Provenance Link Mutations",
    value: "8,924",
    meta: "+310 ops",
    metaClass: "text-secondary",
    icon: "link",
    iconClass: "text-secondary",
    bar: "bg-secondary",
    width: "w-[67%]",
  },
  {
    label: "Policy & Governance",
    value: "412",
    meta: "v2.4 Active",
    metaClass: "text-on-surface-variant",
    icon: "policy",
    iconClass: "text-primary",
    bar: "bg-primary",
    width: "w-[45%]",
  },
];

const breadcrumb = ["Governance", "Audit & Compliance"];

export default function AuditPage() {
  return (
    <AppShell>
      {/* Breadcrumbs + header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-gutter pt-stack-compact">
        <div className="flex flex-col space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-on-surface-variant font-mono-code text-[11px] tracking-wider uppercase flex-wrap">
            {breadcrumb.map((crumb) => (
              <span key={crumb} className="flex items-center gap-2">
                <span>{crumb}</span>
                <Icon name="chevron_right" className="text-[12px]" />
              </span>
            ))}
            <span className="text-secondary font-semibold">Workspace Ledger</span>
          </div>
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
        </div>
        <AuditHeaderActions />
      </div>

      {/* Summary metric cards */}
      <section aria-label="Ledger summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {metrics.map((card) => (
          <div
            key={card.label}
            className="p-gutter rounded bg-surface-container shadow-sm flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider truncate">
                {card.label}
              </span>
              <span className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center shrink-0">
                <Icon name={card.icon} className={`text-[18px] ${card.iconClass}`} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono-code text-headline-md text-on-surface font-semibold tracking-tight truncate">
                {card.value}
              </span>
              <span className={`font-mono-code text-body-sm font-medium shrink-0 ${card.metaClass}`}>
                {card.meta}
              </span>
            </div>
            <div className="mt-3 w-full bg-surface-container-highest rounded-full h-1 overflow-hidden">
              <div className={`${card.bar} h-full rounded-full ${card.width} transition-all duration-700`} />
            </div>
          </div>
        ))}
      </section>

      <AuditConsole />

      {/* Live integrity ledger status bar */}
      <div className="p-gutter rounded bg-surface-container-lowest shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-stack-comfortable">
        <div className="flex items-center gap-stack-comfortable flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest font-bold">
              Immutable Ledger Live
            </span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest hidden md:block" />
          <div className="flex items-center gap-2 font-mono-code text-[12px] text-on-surface-variant">
            <span className="text-outline">Block Height:</span>
            <span className="text-on-surface font-semibold">
              {auditTotals.blockHeight.toLocaleString("en-US")}
            </span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest hidden md:block" />
          <div className="flex items-center gap-2 font-mono-code text-[12px] text-on-surface-variant">
            <span className="text-outline">Merkle Root:</span>
            <span className="text-primary font-medium">{auditTotals.merkleRoot}</span>
          </div>
        </div>
        <div className="flex items-center gap-stack-comfortable">
          <div className="flex items-center gap-1.5 font-mono-code text-[12px] text-secondary">
            <Icon name="verified" className="text-[16px]" />
            <span>Zero Payload Leaks Detected</span>
          </div>
          <span className="font-mono-code text-[11px] text-outline">
            Latency: {auditTotals.latencyMs}ms
          </span>
        </div>
      </div>
    </AppShell>
  );
}
