import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { SlackGateway } from "@/components/settings/slack-gateway";

export const metadata: Metadata = {
  title: "Slack Delivery",
  description:
    "Unidirectional Slack dispatch: workspace connection, channel routing rules and BlockKit test sandbox.",
};

const metrics = [
  { label: "Dispatches (24h)", value: "1,842", valueClass: "text-on-surface" },
  { label: "Latency avg", value: "42", suffix: "ms", valueClass: "text-secondary" },
  { label: "Ack Ratio", value: "94.8%", valueClass: "text-primary" },
];

export default function SlackConfigurationPage() {
  return (
    <AppShell>
      {/* Breadcrumb & status superheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter pt-stack-comfortable">
        <div className="flex flex-col gap-unit">
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-[11px] text-outline uppercase tracking-wider">
              Integrations
            </span>
            <span className="text-outline-variant font-mono-code text-[10px]">/</span>
            <span className="font-mono-code text-[11px] text-secondary font-medium uppercase tracking-wider">
              Alert Channels
            </span>
            <span className="text-outline-variant font-mono-code text-[10px]">/</span>
            <span className="font-mono-code text-[11px] text-on-surface uppercase tracking-wider">
              Slack Engine
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Slack Outbound Gateway
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono-code text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              ACTIVE EMITTER
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Configure unidirectional webhook dispatches, severity routing tables, and real-time
            interactive Slack BlockKit notifications for the unify-eng topology.
          </p>
        </div>
        {/* Quick metrics ribbon */}
        <div className="flex items-center gap-stack-compact bg-surface-container-low p-1.5 rounded-xl shadow-md">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="px-3 py-2 rounded-lg bg-surface-container flex flex-col"
            >
              <span className="font-label-caps text-label-caps text-outline uppercase">
                {metric.label}
              </span>
              <span className={`font-mono-code text-headline-sm font-bold ${metric.valueClass}`}>
                {metric.value}
                {metric.suffix ? (
                  <span className="font-body-sm text-body-sm font-normal text-outline">
                    {metric.suffix}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security & isolation callout banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-5 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-gutter">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 mt-0.5">
              <Icon name="shield_lock" className="text-[22px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Strict Outbound Notification Channel Only
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-[10px] text-secondary uppercase font-semibold">
                  Zero Ingestion
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
                Unify posts automated conflict alerts, weekly digests, and resolution triggers to
                your designated Slack channels. Slack is delivery only — never an input to
                reasoning: inbound message indexing and workspace reading are disabled by policy
                and cryptographically restricted at token scope, so no Slack content can influence
                a verdict.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
            <span className="font-mono-code text-[11px] text-outline">OAuth Scopes:</span>
            <span className="px-2 py-1 rounded bg-surface-container font-mono-code text-[11px] text-on-surface-variant font-medium">
              chat:write
            </span>
            <span className="px-2 py-1 rounded bg-surface-container font-mono-code text-[11px] text-on-surface-variant font-medium">
              chat:write.public
            </span>
          </div>
        </div>
      </div>

      <SlackGateway />
    </AppShell>
  );
}
