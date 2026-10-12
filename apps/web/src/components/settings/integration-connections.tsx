"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type Scope = { label: string; check?: boolean };

type Action = { label: string; kind?: "primary" | "danger" };

type SourceCardProps = {
  icon: string;
  iconClass: string;
  name: string;
  meta?: string;
  desc?: ReactNode;
  lastActivity: string;
  live?: boolean;
  uptime: string;
  scopeHeader: string;
  scopeMeta: string;
  scopes: Scope[];
  footer: ReactNode;
  actions: Action[];
  gate?: ReactNode;
};

/**
 * DATA HOLE — replace with the integration connections API.
 * Connected-org slugs and plan tiers are not rendered until the endpoint exists.
 */
const sourceCount: number | undefined = undefined;

/**
 * DATA HOLE — replace with the integration connections API.
 * The provisioned ingress endpoint is not rendered until the endpoint exists.
 */
const webhookEndpoint: string | undefined = undefined;

const actionClass: Record<string, string> = {
  "": "bg-surface-container-high hover:bg-surface-container-highest text-on-surface",
  primary: "bg-surface-container-high hover:bg-surface-container-highest text-primary",
  danger: "bg-error-container/30 text-error hover:bg-error-container/60",
};

function SourceCard({
  icon,
  iconClass,
  name,
  meta,
  desc,
  lastActivity,
  live = false,
  uptime,
  scopeHeader,
  scopeMeta,
  scopes,
  footer,
  actions,
  gate,
}: SourceCardProps) {
  const [ping, setPing] = useState<"idle" | "loading" | "ok">("idle");

  function testPing() {
    if (ping !== "idle") return;
    setPing("loading");
    window.setTimeout(() => {
      setPing("ok");
      window.setTimeout(() => setPing("idle"), 2000);
    }, 600);
  }

  return (
    <div className="rounded-lg bg-surface-container p-stack-comfortable shadow-md hover:bg-surface-bright/20 transition-all flex flex-col gap-stack-comfortable group">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-inner">
            <Icon name={icon} className={`text-[24px] ${iconClass}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {name}
              </span>
              {live ? (
                <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-caps text-label-caps tracking-wider uppercase">
                  Active Syncing
                </span>
              ) : null}
              {meta ? (
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono-code text-micro-label">
                  {meta}
                </span>
              ) : null}
            </div>
            {desc ? <p className="font-body-sm text-body-sm text-muted mt-1.5">{desc}</p> : null}
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-secondary font-mono-code text-body-sm">
            <span
              className={`w-2 h-2 rounded-full bg-secondary ${live ? "animate-pulse" : ""}`}
            />
            <span>{lastActivity}</span>
          </div>
          <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider mt-1.5">
            {uptime}
          </span>
        </div>
      </div>

      {gate}

      <div className="p-stack-compact rounded bg-surface-container-lowest flex flex-col gap-3">
        <div className="flex items-center justify-between text-body-sm gap-3 flex-wrap">
          <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
            {scopeHeader}
          </span>
          <span className="font-mono-code text-body-sm text-secondary">{scopeMeta}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scopes.map((scope) => (
            <span
              key={scope.label}
              className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-code text-[12px] flex items-center gap-1"
            >
              <Icon name="check_circle" className="text-[13px] text-secondary" />
              {scope.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono-code text-body-sm">
          <Icon name="key" className="text-[16px] text-muted" />
          {footer}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={testPing}
            className={`px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm font-medium transition-colors ${
              ping === "ok" ? "text-secondary" : ""
            }`}
          >
            {ping === "loading"
              ? "Pinging..."
              : ping === "ok"
                ? "Ping OK"
                : actions[0]?.label ?? "Test Ping"}
          </button>
          {actions.slice(1).map((action) => (
            <button
              key={action.label}
              className={`px-3 py-1.5 rounded font-body-sm font-medium transition-colors ${
                actionClass[action.kind ?? ""]
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const eligibilityGate = (
  <div className="p-stack-compact rounded bg-surface-container-lowest border border-secondary/25 flex flex-col gap-3">
    <div className="flex items-center justify-between text-body-sm gap-3 flex-wrap">
      <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider flex items-center gap-1.5">
        <Icon name="policy" className="text-[14px] text-secondary" />
        Repository Eligibility Gate · scored at connection
      </span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {["read-only OAuth verified", "branch protection parsed", "CODEOWNERS resolved"].map(
        (item) => (
          <span
            key={item}
            className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-code text-[12px] flex items-center gap-1"
          >
            <Icon name="check_circle" className="text-[13px] text-secondary" />
            {item}
          </span>
        ),
      )}
    </div>
  </div>
);

/**
 * DATA HOLE — replace with the integration quota API.
 * Empty until the endpoint exists; the quota card renders its empty state.
 */
interface QuotaMetric {
  label: string;
  value: string;
  width: number;
  barClass: string;
  left: string;
  right: string;
  rightClass: string;
}
const quotaMetrics: QuotaMetric[] = [];

type SecurityItem = {
  icon: string;
  iconClass: string;
  title: string;
  /** Populated by the security posture API — key identifiers are never hardcoded. */
  meta?: string;
  note?: string;
};

const securityItems: SecurityItem[] = [
  {
    icon: "vpn_key",
    iconClass: "text-secondary",
    title: "Envelope Key Encryption",
  },
  {
    icon: "fingerprint",
    iconClass: "text-primary",
    title: "Zero Raw Tokens Policy",
  },
  {
    icon: "policy",
    iconClass: "text-secondary",
    title: "Signature Verification",
  },
];

export function IntegrationConnections() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
      {/* Left column: source cards */}
      <div className="lg:col-span-8 flex flex-col gap-gutter">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Active Integration Nodes
            </span>
            {sourceCount != null ? (
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-body-sm">
                {sourceCount} Sources
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Filter tools"
              className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
            <button
              title="Sync All Sources"
              className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <Icon name="sync" className="text-[18px]" />
            </button>
          </div>
        </div>

        <SourceCard
          icon="terminal"
          iconClass="text-primary"
          name="GitHub Enterprise"
          desc={
            <>
              Webhook stream ingress endpoint:{" "}
              <code className="font-mono-code text-on-surface-variant bg-surface-container-lowest px-1.5 py-0.5 rounded text-micro-label">
                {webhookEndpoint ?? "not yet provisioned"}
              </code>
            </>
          }
          lastActivity="No webhooks received yet"
          uptime="Uptime not yet reported"
          scopeHeader="Granted Scopes (Least-Privilege, Read-only OAuth)"
          scopeMeta="Verified HMAC SHA-256"
          scopes={[
            { label: "repo:status (read)" },
            { label: "pull_requests (read-only)" },
            { label: "commit_comments (read-only)" },
            { label: "metadata (read)" },
          ]}
          gate={eligibilityGate}
          footer={
            <span>
              OAuth refresh token rotation:{" "}
              <strong className="text-on-surface">not yet reported</strong>
            </span>
          }
          actions={[
            { label: "Test Ping" },
            { label: "Configure Scopes" },
            { label: "Re-authenticate", kind: "primary" },
            { label: "Revoke", kind: "danger" },
          ]}
        />

        <SourceCard
          icon="palette"
          iconClass="text-secondary"
          name="Figma Organization"
          lastActivity="No syncs yet"
          live={false}
          uptime="Uptime not yet reported"
          scopeHeader="Granted Scopes (Read-only)"
          scopeMeta="Zero Raw Tokens Exposed"
          scopes={[
            { label: "file_read:components" },
            { label: "library_publish:listener" },
            { label: "comments:read" },
          ]}
          footer={
            <span>
              Personal Access Token expiry:{" "}
              <strong className="text-on-surface">not yet reported</strong>
            </span>
          }
          actions={[
            { label: "Test Ping" },
            { label: "Configure Scopes" },
            { label: "Re-authenticate", kind: "primary" },
            { label: "Revoke", kind: "danger" },
          ]}
        />

        <SourceCard
          icon="task_alt"
          iconClass="text-tertiary"
          name="Jira Cloud Software"
          lastActivity="No webhooks received yet"
          uptime="Uptime not yet reported"
          scopeHeader="Active Atlassian Connect Grants (Read-only)"
          scopeMeta="JWT Signature Valid"
          scopes={[
            { label: "read:jira-work" },
            { label: "read:jira-user" },
            { label: "read:project" },
          ]}
          footer={
            <span>
              Connect App Expiry: <strong className="text-on-surface">Auto-Managed (Cloud)</strong>
            </span>
          }
          actions={[
            { label: "Test Ping" },
            { label: "Configure Scopes" },
            { label: "Re-authenticate", kind: "primary" },
            { label: "Revoke", kind: "danger" },
          ]}
        />

        <SourceCard
          icon="forum"
          iconClass="text-secondary"
          name="Slack Outbound & Bot"
          lastActivity="Ready for dispatch"
          live={false}
          uptime="Channels not yet mapped"
          scopeHeader="Granted OAuth Bot Scopes"
          scopeMeta="mTLS Outbound Enforced"
          scopes={[{ label: "chat:write" }, { label: "channels:read" }, { label: "incoming-webhook" }]}
          footer={
            <span>
              Bot token:{" "}
              <strong className="text-on-surface font-mono-code">stored in KMS</strong>
            </span>
          }
          actions={[
            { label: "Send Test Alert" },
            { label: "Channels Map" },
            { label: "Rotate Secret", kind: "primary" },
            { label: "Disconnect", kind: "danger" },
          ]}
        />
      </div>

      {/* Right column: security & quota inspector */}
      <div className="lg:col-span-4 flex flex-col gap-gutter">
        {/* Quota metering */}
        <div className="p-stack-comfortable rounded-lg bg-surface-container shadow-md flex flex-col gap-stack-comfortable">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Icon name="speed" className="text-primary text-[20px]" />
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Live Quota Metering
              </span>
            </div>
          </div>
          {quotaMetrics.length === 0 ? (
            <p className="text-body-sm text-muted py-2">
              No quota telemetry yet
            </p>
          ) : (
            quotaMetrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`flex flex-col gap-2 ${index > 0 ? "pt-1.5" : ""}`}
              >
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface font-medium">{metric.label}</span>
                  <span className="font-mono-code text-on-surface-variant">{metric.value}</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div
                    className={`${metric.barClass} h-full rounded-full`}
                    style={{ width: `${metric.width}%` }}
                  />
                </div>
                <div className="flex justify-between text-micro-label font-mono-code text-muted">
                  <span>{metric.left}</span>
                  <span className={metric.rightClass}>{metric.right}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security & governance */}
        <div className="p-stack-comfortable rounded-lg bg-surface-container shadow-md flex flex-col gap-stack-comfortable">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Icon name="shield" className="text-secondary text-[20px]" />
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Security &amp; KMS Governance
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </div>
          <div className="flex flex-col gap-3 font-body-sm">
            {securityItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3.5 rounded bg-surface-container-lowest"
              >
                <Icon name={item.icon} className={`text-[20px] mt-0.5 ${item.iconClass}`} />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-on-surface">{item.title}</span>
                  {item.note ? (
                    <span className="text-secondary text-micro-label mt-1.5">{item.note}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention summary */}
        <div className="p-stack-comfortable rounded-lg bg-surface-container shadow-md flex flex-col gap-stack-comfortable">
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
          <div className="flex flex-col gap-3 font-mono-code text-body-sm">
            <div className="flex items-center justify-between p-3 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="storage" className="text-[16px] text-muted" />
                <span>Raw Payload Retention</span>
              </div>
              <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">
                30 Days (Purge)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="cloud_upload" className="text-[16px] text-muted" />
                <span>Graph Conflict History</span>
              </div>
              <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">
                365 Days
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="visibility_off" className="text-[16px] text-secondary" />
                <span>PII Masking Engine</span>
              </div>
              <span className="text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded">
                Enabled (Regex)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
