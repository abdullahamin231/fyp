import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { WorkspaceAdmin } from "@/components/settings/workspace-admin";

export const metadata: Metadata = {
  title: "Workspace Administration",
  description:
    "Integration connections, eligibility gates, canonical workflow state map, roles and member management for the UNIFY workspace.",
};

/* Static security telemetry ribbon — server-rendered, passed into the client tab shell. */
const telemetry = [
  {
    label: "KMS Encryption State",
    icon: "lock",
    iconClass: "text-secondary",
    value: "AES-256-GCM",
    valueClass: "text-on-surface",
    footerLabel: "Key Rotation",
    footerValue: "Schedule: 90d",
    footerValueClass: "text-secondary",
    glow: "bg-primary/5",
  },
  {
    label: "Webhook Ingress Gate",
    icon: "verified_user",
    iconClass: "text-secondary",
    value: "HMAC Enforced",
    valueClass: "text-secondary",
    footerLabel: "Rejection Rate",
    footerValue: "0.00% (0 invalid)",
    footerValueClass: "text-on-surface",
    glow: "bg-secondary/5",
  },
  {
    label: "Ingress Quota Stress",
    icon: "speed",
    iconClass: "text-tertiary",
    value: "82.4%",
    valueClass: "text-tertiary",
    suffix: "GitHub Rate Pool",
    progress: 82.4,
    glow: "bg-tertiary/5",
  },
  {
    label: "PII & Secret Sanitizer",
    icon: "filter_alt",
    iconClass: "text-primary",
    value: "Redaction Live",
    valueClass: "text-on-surface",
    footerLabel: "Masked Commit Payloads",
    footerValue: "1,402 items",
    footerValueClass: "text-primary",
    glow: "bg-primary/5",
  },
];

function TelemetryRibbon() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
      {telemetry.map((card) => (
        <div
          key={card.label}
          className="p-stack-comfortable rounded-lg bg-surface-container flex flex-col justify-between shadow-sm relative overflow-hidden"
        >
          <div
            className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${card.glow} pointer-events-none`}
          />
          <div className="flex items-center justify-between text-outline font-label-caps text-label-caps uppercase tracking-wider">
            <span>{card.label}</span>
            <Icon name={card.icon} className={`text-[16px] ${card.iconClass}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-headline-sm text-headline-sm font-bold ${card.valueClass}`}>
              {card.value}
            </span>
            {card.suffix ? (
              <span className="font-mono-code text-body-sm text-outline">{card.suffix}</span>
            ) : null}
          </div>
          {typeof card.progress === "number" ? (
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-tertiary h-full rounded-full"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between font-mono-code text-body-sm text-on-surface-variant">
              <span>{card.footerLabel}</span>
              <span className={`${card.footerValueClass} font-medium`}>{card.footerValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorkspaceAdministrationPage() {
  return (
    <AppShell>
      {/* Context header */}
      <div className="flex items-center justify-between flex-wrap gap-stack-comfortable">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-body-sm text-outline">workspaces</span>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-mono-code text-body-sm text-secondary">unify-eng</span>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-mono-code text-body-sm text-on-surface-variant">
              governance-settings
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-surface-container-high text-outline text-[11px] font-mono-code">
              id: ws_018fbc92
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
              Workspace Governance &amp; Security
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              Cluster: us-east-1
            </span>
          </div>
        </div>
        <div className="flex items-center gap-stack-compact">
          <button className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm transition-all shadow-sm">
            <Icon name="download" className="text-[16px] text-primary" />
            <span>Compliance Audit (SOC2/ISO)</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary font-body-sm font-medium transition-all shadow-sm">
            <Icon name="add" className="text-[16px]" />
            <span>Connect Provider</span>
          </button>
        </div>
      </div>

      <WorkspaceAdmin telemetry={<TelemetryRibbon />} />
    </AppShell>
  );
}
