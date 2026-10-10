"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";

const targetChannels = ["#eng-alerts-critical", "#design-system-sync", "#dev-core-updates"];
const severityLevels = ["Critical SEV-1", "High SEV-2", "Moderate SEV-3", "Info / Drift Digest"];

const blockKitJson = `{
  "channel": "#eng-alerts-critical",
  "attachments": [{
    "color": "#FFB4AB",
    "blocks": [
      {
        "type": "header",
        "text": { "type": "plain_text", "text": "SEV-1: Design Drift after PR Merge" }
      },
      {
        "type": "actions",
        "elements": [
          { "type": "button", "text": { "text": "View Conflict CONF-1048" }, "style": "primary" },
          { "type": "button", "text": { "text": "Acknowledge" } }
        ]
      }
    ]
  }]
}`;

export function SlackTestSandbox() {
  const [channel, setChannel] = useState(targetChannels[0]);
  const [severity, setSeverity] = useState(severityLevels[0]);
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");
  const [copied, setCopied] = useState(false);

  function sendTest() {
    if (sendState !== "idle") return;
    setSendState("sending");
    window.setTimeout(() => {
      setSendState("sent");
      window.setTimeout(() => setSendState("idle"), 4000);
    }, 650);
  }

  async function copyJson() {
    try {
      await navigator.clipboard?.writeText(blockKitJson);
    } catch {
      /* clipboard unavailable — still surface the confirmation in the mock */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-xl bg-surface-container-low p-4 shadow-md flex flex-col gap-4 sticky top-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-label-caps text-label-caps text-muted uppercase">Section 04</span>
          <span className="text-outline font-mono-code">•</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Dispatch Test Sandbox
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-mono-code text-eyebrow font-bold uppercase tracking-wide">
          Live Webhook
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Trigger a synthetic conflict payload into your destination channel to confirm block
        formatters and permissions.
      </p>

      {/* Test configuration controls */}
      <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-muted uppercase">
              Target Channel
            </label>
            <div className="relative">
              <select
                aria-label="Target channel"
                value={channel}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setChannel(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-[12px] focus:outline-none appearance-none cursor-pointer"
              >
                {targetChannels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-muted uppercase">
              Severity Level
            </label>
            <div className="relative">
              <select
                aria-label="Severity level"
                value={severity}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSeverity(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg bg-surface-container-lowest text-error font-mono-code text-[12px] font-semibold focus:outline-none appearance-none cursor-pointer"
              >
                {severityLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>
          </div>
        </div>
        <button
          onClick={sendTest}
          disabled={sendState === "sending"}
          className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
        >
          <Icon
            name={sendState === "sending" ? "refresh" : "send"}
            className={`text-[18px] ${sendState === "sending" ? "animate-spin" : ""}`}
          />
          <span>
            {sendState === "sending" ? "Dispatching..." : "Send Live Test Payload"}
          </span>
        </button>
        <div
          className={`text-center font-mono-code text-[12px] text-secondary py-1 ${
            sendState === "sent" ? "animate-pulse" : "hidden"
          }`}
        >
          ✓ Dispatch acknowledged by Slack API in 34ms (HTTP 200 OK)
        </div>
      </div>

      {/* Rendered mock Slack message preview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-muted uppercase">
            Channel Appearance Preview
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-mono-code text-micro-label text-on-surface-variant">
              Slack BlockKit v1.2
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-4 shadow-inner flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-[13px] text-on-surface font-bold">
                {channel}
              </span>
              <span className="font-mono-code text-micro-label text-muted">
                | Topic: Production Graph Breakers
              </span>
            </div>
            <span className="font-mono-code text-micro-label text-muted">Today at 14:32</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Icon name="token" className="text-on-primary text-[20px]" />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-body-sm text-body-sm font-bold text-on-surface">
                  Unify Sentinel
                </span>
                <span className="px-1 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-eyebrow uppercase font-bold">
                  APP
                </span>
                <span className="font-mono-code text-micro-label text-muted">14:32:08</span>
              </div>
              <div className="rounded-lg bg-surface-container p-3.5 flex flex-col gap-2.5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-[15px] font-bold text-error flex items-center gap-1.5">
                    <Icon name="dangerous" className="text-[16px]" />
                    {severity}: Design Drift after PR Merge
                  </span>
                  <span className="font-mono-code text-micro-label text-muted bg-surface-container-highest px-1.5 py-0.5 rounded">
                    CONF-1048
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="text-tertiary font-semibold">@here</span> New commit pushed to{" "}
                  <code className="font-mono-code text-micro-label text-primary px-1 rounded bg-surface-container-lowest">
                    main
                  </code>{" "}
                  introduced conflicting state between{" "}
                  <span className="text-on-surface font-medium">CheckoutModal.tsx</span> and the
                  approved frame <span className="text-on-surface font-medium">
                    CheckoutModal_v3
                  </span>
                  .
                </p>
                <div className="grid grid-cols-2 gap-2 p-2 rounded bg-surface-container-lowest/80 text-on-surface font-mono-code text-micro-label">
                  <div>
                    <span className="text-muted">Policy:</span> P1 · Design Drift after PR Merge
                  </div>
                  <div>
                    <span className="text-muted">Verdict:</span> CONTRADICTED
                  </div>
                  <div>
                    <span className="text-muted">Freshness:</span> CURRENT
                  </div>
                  <div>
                    <span className="text-muted">Root Author:</span> d.vasquez@unify.dev
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button className="px-3 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all">
                    <Icon name="open_in_new" className="text-[15px]" />
                    View Conflict CONF-1048
                  </button>
                  <button className="px-3 py-1.5 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-semibold flex items-center gap-1.5 transition-colors">
                    <Icon name="done_all" className="text-[15px]" />
                    Acknowledge
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted text-[12px] pl-1">
                <span className="flex items-center gap-1 text-on-surface-variant font-mono-code text-micro-label">
                  <Icon name="reply" className="text-[14px]" /> 0 replies
                </span>
                <span className="text-outline">•</span>
                <span className="font-mono-code text-micro-label">via chat.postMessage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated BlockKit schema */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-muted uppercase">
            Generated BlockKit Schema
          </span>
          <button
            onClick={copyJson}
            className="font-mono-code text-micro-label text-primary hover:underline flex items-center gap-1"
          >
            <Icon name={copied ? "check" : "content_copy"} className="text-[13px]" />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
        <pre className="rounded-xl bg-surface-container-lowest p-3.5 font-mono-code text-micro-label text-on-surface-variant overflow-x-auto max-h-48 leading-relaxed select-all m-0 whitespace-pre">
          {blockKitJson}
        </pre>
      </div>
    </section>
  );
}
