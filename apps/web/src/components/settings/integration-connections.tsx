"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type Scope = { label: string; check?: boolean };

type Action = { label: string; kind?: "primary" | "danger" };

type SourceCardProps = {
  icon: string;
  iconClass: string;
  name: string;
  meta: string;
  desc: ReactNode;
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
  live = true,
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
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-inner">
            <Icon name={icon} className={`text-[24px] ${iconClass}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {name}
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-caps text-label-caps tracking-wider uppercase">
                Active Syncing
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono-code text-[11px]">
                {meta}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-secondary font-mono-code text-body-sm">
            <span
              className={`w-2 h-2 rounded-full bg-secondary ${live ? "animate-pulse" : ""}`}
            />
            <span>{lastActivity}</span>
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider mt-0.5">
            {uptime}
          </span>
        </div>
      </div>

      {gate}

      <div className="p-stack-compact rounded bg-surface-container-lowest flex flex-col gap-2">
        <div className="flex items-center justify-between text-body-sm gap-3 flex-wrap">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
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
          <Icon name="key" className="text-[16px] text-outline" />
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
                ? "200 OK (38ms)"
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
  <div className="p-stack-compact rounded bg-surface-container-lowest border border-secondary/25 flex flex-col gap-2">
    <div className="flex items-center justify-between text-body-sm gap-3 flex-wrap">
      <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider flex items-center gap-1.5">
        <Icon name="policy" className="text-[14px] text-secondary" />
        Repository Eligibility Gate · scored at connection
      </span>
      <span className="font-mono-code text-body-sm text-secondary font-semibold">92 / 100 · PASS</span>
    </div>
    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
      <div className="bg-secondary h-full rounded-full" style={{ width: "92%" }} />
    </div>
    <div className="flex flex-wrap gap-1.5">
      {[
        "41 of 47 repositories eligible",
        "read-only OAuth verified",
        "branch protection parsed",
        "CODEOWNERS resolved",
        "6 excluded: archived / fork",
      ].map((item) => (
        <span
          key={item}
          className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-code text-[12px] flex items-center gap-1"
        >
          <Icon name="check_circle" className="text-[13px] text-secondary" />
          {item}
        </span>
      ))}
    </div>
  </div>
);

const quotaMetrics = [
  {
    label: "GitHub Enterprise GraphQL/REST",
    value: "4,120 / 5,000 req/hr",
    width: 82.4,
    barClass: "bg-tertiary",
    left: "Utilization: 82.4%",
    right: "Approaching soft limit (85%)",
    rightClass: "text-tertiary",
  },
  {
    label: "Figma Webhook Ingress",
    value: "12 req/min (Normal)",
    width: 24,
    barClass: "bg-secondary",
    left: "Capacity: 50 req/min",
    right: "Low load",
    rightClass: "text-secondary",
  },
  {
    label: "Jira Cloud REST Invocations",
    value: "380 / 1,000 req/min",
    width: 38,
    barClass: "bg-secondary",
    left: "State: Healthy",
    right: "Throttling idle",
    rightClass: "text-secondary",
  },
];

const securityItems: { icon: string; iconClass: string; title: string; meta: string; note?: string }[] =
  [
    {
      icon: "vpn_key",
      iconClass: "text-secondary",
      title: "Envelope Key Encryption",
      meta: "arn:aws:kms:us-east-1:74892:key/unify-sec",
      note: "Automatic 90-day hardware rotation active",
    },
    {
      icon: "fingerprint",
      iconClass: "text-primary",
      title: "Zero Raw Tokens Policy",
      meta: "Third-party secrets reside in a dedicated HSM vault. Only ephemeral, scoped JWTs are issued to runtime workers.",
    },
    {
      icon: "policy",
      iconClass: "text-secondary",
      title: "Signature Verification",
      meta: "Ingress webhook signatures validated via SHA-256 HMAC before parser ingestion.",
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
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-body-sm">
              4 Sources
            </span>
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
          meta="org: unify-eng"
          desc={
            <>
              Webhook stream ingress endpoint:{" "}
              <code className="font-mono-code text-on-surface-variant bg-surface-container-lowest px-1.5 py-0.5 rounded text-[11px]">
                https://in.unify.internal/hook/gh_84f9
              </code>
            </>
          }
          lastActivity="Last webhook 18s ago"
          uptime="99.98% 30d Uptime"
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
              OAuth Refresh token rotation: <strong className="text-on-surface">28 days remaining</strong>
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
          meta="plan: Enterprise"
          desc="Component and design token sync bridge via REST v1"
          lastActivity="Last sync 3m ago"
          live={false}
          uptime="100% 30d Uptime"
          scopeHeader="Granted Scopes (Read-only)"
          scopeMeta="Zero Raw Tokens Exposed"
          scopes={[
            { label: "file_read:components" },
            { label: "library_publish:listener" },
            { label: "comments:read" },
          ]}
          footer={
            <span>
              Personal Access Token Exp: <strong className="text-on-surface">62 days remaining</strong>
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
          meta="unify-eng.atlassian.net"
          desc="Requirement anchors and transition history read via Atlassian Connect"
          lastActivity="Last webhook 42s ago"
          uptime="99.94% 30d Uptime"
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
          meta="workspace: Unify Engineering HQ"
          desc="Delivery only — notification routing for conflict alarms; never an input to reasoning"
          lastActivity="Ready for dispatch"
          live={false}
          uptime="Channels: #eng-alerts, #governance"
          scopeHeader="Granted OAuth Bot Scopes"
          scopeMeta="mTLS Outbound Enforced"
          scopes={[{ label: "chat:write" }, { label: "channels:read" }, { label: "incoming-webhook" }]}
          footer={
            <span>
              Bot Token: <strong className="text-on-surface font-mono-code">xoxb-91...481d</strong> (Encrypted via KMS)
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
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline text-[11px] font-mono-code">
              Auto-reset: 24m
            </span>
          </div>
          {quotaMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`flex flex-col gap-1.5 ${index > 0 ? "pt-1" : ""}`}
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
              <div className="flex justify-between text-[11px] font-mono-code text-outline">
                <span>{metric.left}</span>
                <span className={metric.rightClass}>{metric.right}</span>
              </div>
            </div>
          ))}
          {/* Aggregate load sparkline */}
          <div className="mt-2 pt-2 bg-surface-container-lowest p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Sync Traffic (Last 6 Hours)
              </span>
              <span className="font-mono-code text-[11px] text-secondary">avg 240 req/m</span>
            </div>
            <svg
              className="w-full h-12 text-primary"
              fill="none"
              viewBox="0 0 200 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 32 L20 30 L40 33 L60 22 L80 25 L100 12 L120 18 L140 10 L160 16 L180 8 L200 14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M0 32 L20 30 L40 33 L60 22 L80 25 L100 12 L120 18 L140 10 L160 16 L180 8 L200 14 L200 40 L0 40 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
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
                className="flex items-start gap-3 p-2.5 rounded bg-surface-container-lowest"
              >
                <Icon name={item.icon} className={`text-[20px] mt-0.5 ${item.iconClass}`} />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-on-surface">{item.title}</span>
                  <span className="text-outline font-mono-code text-[12px] break-words">
                    {item.meta}
                  </span>
                  {item.note ? (
                    <span className="text-secondary text-[11px] mt-1">{item.note}</span>
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
          <div className="flex flex-col gap-2 font-mono-code text-body-sm">
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="storage" className="text-[16px] text-outline" />
                <span>Raw Payload Retention</span>
              </div>
              <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">
                30 Days (Purge)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="cloud_upload" className="text-[16px] text-outline" />
                <span>Graph Conflict History</span>
              </div>
              <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">
                365 Days
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="visibility_off" className="text-[16px] text-secondary" />
                <span>PII Masking Engine</span>
              </div>
              <span className="text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded">
                Enabled (Regex)
              </span>
            </div>
          </div>
          <p className="text-outline font-body-sm text-[12px] leading-relaxed">
            Sanitization automatically masks credentials, private keys, emails, and SSNs from Git
            commits, Figma comments, and Jira transition logs before storing them in the internal
            graph cluster.
          </p>
        </div>
      </div>
    </div>
  );
}
