"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { IntegrationConnections } from "@/components/settings/integration-connections";
import { MembersRbac } from "@/components/settings/members-rbac";
import { WorkflowStateMap } from "@/components/settings/workflow-state-map";

type TabId = "sources" | "members" | "workflow" | "retention" | "danger";

const tabs: {
  id: TabId;
  label: string;
  icon: string;
  count?: string;
  dot?: boolean;
  danger?: boolean;
}[] = [
  { id: "sources", label: "Connected Sources", icon: "hub", count: "4 Active" },
  { id: "members", label: "Members & RBAC", icon: "badge", count: "48" },
  { id: "workflow", label: "Workflow State Map", icon: "account_tree" },
  { id: "retention", label: "Data Retention & Audit", icon: "policy", dot: true },
  { id: "danger", label: "Danger Zone", icon: "warning", danger: true },
];

const retentionRows = [
  { icon: "storage", label: "Raw Payload Retention", value: "30 Days (Purge)", valueClass: "" },
  { icon: "cloud_upload", label: "Graph Conflict History", value: "365 Days", valueClass: "" },
  {
    icon: "visibility_off",
    label: "PII Masking Engine",
    value: "Enabled (Regex)",
    valueClass: "text-secondary bg-secondary/10",
  },
];

const auditExports = [
  { icon: "fact_check", label: "Immutable audit trail", meta: "append-only · SHA-256 chained" },
  { icon: "download", label: "Conflict evidence packet (CSV)", meta: "per-finding citations" },
  { icon: "verified", label: "Compliance Audit (SOC2/ISO)", meta: "last export 2026-09-30" },
];

function RetentionAudit() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
      <section className="p-stack-comfortable rounded-lg bg-surface-container shadow-md flex flex-col gap-stack-comfortable">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Icon name="auto_delete" className="text-tertiary text-[20px]" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Retention &amp; Sanitation
            </span>
          </div>
          <button className="px-2 py-0.5 rounded hover:bg-surface-container-high text-primary font-mono-code text-body-sm">
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-2 font-mono-code text-body-sm">
          {retentionRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between p-2 rounded bg-surface-container-lowest"
            >
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name={row.icon} className="text-[16px] text-outline" />
                <span>{row.label}</span>
              </div>
              <span
                className={`text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded ${row.valueClass}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="text-outline font-body-sm text-[12px] leading-relaxed">
          Sanitization automatically masks credentials, private keys, emails, and SSNs from Git
          commits, Figma comments, and Jira transition logs before storing them in the internal
          graph cluster.
        </p>
      </section>

      <section className="p-stack-comfortable rounded-lg bg-surface-container shadow-md flex flex-col gap-stack-comfortable">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Icon name="download" className="text-primary text-[20px]" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Audit Exports
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline text-[11px] font-mono-code">
            Retention: 365d
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {auditExports.map((item) => (
            <button
              key={item.label}
              className="flex items-center justify-between p-3 rounded bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 text-body-sm text-on-surface font-medium">
                <Icon name={item.icon} className="text-[18px] text-primary" />
                {item.label}
              </span>
              <span className="font-mono-code text-[11px] text-outline flex items-center gap-1">
                {item.meta}
                <Icon name="arrow_forward" className="text-[14px]" />
              </span>
            </button>
          ))}
        </div>
        <p className="text-outline font-body-sm text-[12px] leading-relaxed">
          Every export is signed with the workspace KMS key and records the requesting member,
          timestamp, and query scope in the append-only audit trail.
        </p>
      </section>
    </div>
  );
}

const dangerActions = [
  {
    id: "revoke",
    icon: "link_off",
    title: "Revoke all integration connections",
    body: "Disconnects GitHub, Jira, Figma and Slack OAuth grants. Findings stop resolving until providers are re-connected.",
    confirm: "revoke",
    button: "Revoke Connections",
  },
  {
    id: "purge",
    icon: "delete_sweep",
    title: "Purge evidence packets",
    body: "Deletes stored citation excerpts and snapshots. Conflicts degrade to INSUFFICIENT_EVIDENCE until re-ingested.",
    confirm: "purge",
    button: "Purge Evidence",
  },
  {
    id: "delete",
    icon: "domain_disabled",
    title: "Delete workspace `unify-eng`",
    body: "Removes the workspace, its members, policy configuration (P1–P4) and the full graph history. This cannot be undone.",
    confirm: "unify-eng",
    button: "Delete Workspace",
  },
];

function DangerZone() {
  const [typed, setTyped] = useState<Record<string, string>>({});

  return (
    <section className="rounded-xl bg-error-container/10 border border-error/30 p-6 shadow-md flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Icon name="warning" className="text-error text-[22px]" fill />
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Danger Zone
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Destructive workspace operations. Type the confirmation token to enable each action.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {dangerActions.map((action) => {
          const enabled = (typed[action.id] ?? "") === action.confirm;
          return (
            <div
              key={action.id}
              className="p-4 rounded-xl bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-error-container/30 text-error shrink-0 mt-0.5">
                  <Icon name={action.icon} className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    {action.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
                    {action.body}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  aria-label={`Type ${action.confirm} to confirm`}
                  placeholder={action.confirm}
                  value={typed[action.id] ?? ""}
                  onChange={(e) =>
                    setTyped((prev) => ({ ...prev, [action.id]: e.target.value }))
                  }
                  className="w-28 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-mono-code text-[12px] focus:outline-none focus:border-error placeholder:text-outline"
                />
                <button
                  disabled={!enabled}
                  className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                >
                  {action.button}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Tab shell for `/settings/workspace`. The telemetry ribbon is rendered on the
 * server and passed in as `telemetry` so the header stays a server component.
 */
export function WorkspaceAdmin({ telemetry }: { telemetry: ReactNode }) {
  const [active, setActive] = useState<TabId>("sources");

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg overflow-x-auto shadow-inner">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded font-body-sm text-body-sm font-semibold transition-all whitespace-nowrap",
                tab.danger
                  ? `ml-auto transition-all ${
                      isActive
                        ? "bg-error-container/30 text-error"
                        : "text-error/80 hover:text-error hover:bg-error-container/20"
                    }`
                  : isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              ].join(" ")}
            >
              <Icon name={tab.icon} className="text-[18px]" />
              <span>{tab.label}</span>
              {tab.count ? (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono-code ${
                    isActive
                      ? "bg-surface-container-lowest text-on-surface"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
              {tab.dot ? <span className="w-2 h-2 rounded-full bg-secondary" /> : null}
            </button>
          );
        })}
      </div>

      {active === "sources" ? (
        <div className="flex flex-col gap-gutter">
          {telemetry}
          <IntegrationConnections />
        </div>
      ) : null}
      {active === "members" ? <MembersRbac /> : null}
      {active === "workflow" ? <WorkflowStateMap /> : null}
      {active === "retention" ? <RetentionAudit /> : null}
      {active === "danger" ? <DangerZone /> : null}
    </>
  );
}
