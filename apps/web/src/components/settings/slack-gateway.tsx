"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SlackDispatchRules } from "@/components/settings/slack-dispatch-rules";
import { SlackTestSandbox } from "@/components/settings/slack-test-sandbox";

const tokenDetails = [
  { label: "Installation ID", value: "inst_live_89104fa2", valueClass: "text-on-surface-variant" },
  { label: "Rate Limit Quota", value: "Tier 3 (50 req/min)", valueClass: "text-secondary" },
];

const protections: { icon: string; iconClass: string; title: string; body: string }[] = [
  {
    icon: "auto_mode",
    iconClass: "text-secondary",
    title: "Suppress resolved alerts immediately",
    body: "Updates the original Slack message in-place via the chat.update API to show a RESOLVED stamp and remove noisy callouts.",
  },
  {
    icon: "forum",
    iconClass: "text-primary",
    title: "Threaded replies for conflict timeline events",
    body: "Consolidates graph reconciliation comments, re-runs, and assignee modifications directly beneath the parent card using message threads.",
  },
  {
    icon: "smart_button",
    iconClass: "text-tertiary",
    title: "Include interactive resolution buttons",
    body: "Embeds clickable [Acknowledge] and [View in Graph] triggers into the block payload.",
  },
];

function Toggle({ initial = true }: { initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
      />
      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container" />
    </label>
  );
}

export function SlackGateway() {
  const [reconnectState, setReconnectState] = useState<"idle" | "working">("idle");

  function reconnect() {
    if (reconnectState !== "idle") return;
    setReconnectState("working");
    window.setTimeout(() => setReconnectState("idle"), 1600);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
      {/* Left column: connection & channel routing */}
      <div className="xl:col-span-7 flex flex-col gap-gutter">
        {/* Section 01 — connected workspace */}
        <section className="rounded-xl bg-surface-container-low p-6 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-label-caps text-label-caps text-outline uppercase">
                Section 01
              </span>
              <span className="text-outline-variant font-mono-code">•</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Connected Workspace
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-mono-code text-[11px] font-semibold flex items-center gap-1.5">
              <Icon name="verified" className="text-[14px]" />
              Authenticated (Bot User OAuth v2)
            </span>
          </div>
          <div className="rounded-xl bg-surface-container p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Workspace identity tile (CSS gradient, no external asset) */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/70 via-primary-container/60 to-tertiary/50 flex items-center justify-center p-2.5 shadow-inner">
                <Icon name="forum" className="w-full h-full text-on-surface text-[28px]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Unify Engineering HQ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-[11px] text-outline font-medium">
                    Primary Org
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="font-mono-code text-[12px] text-outline">
                    Workspace ID: <span className="text-primary font-bold">T0394821</span>
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="flex items-center gap-1">
                    <Icon name="person" className="text-[14px] text-outline" />
                    Connected by <span className="text-on-surface font-medium">Alex R.</span>{" "}
                    (Workspace Admin)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={reconnect}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Icon
                name={reconnectState === "working" ? "refresh" : "sync"}
                className={`text-[18px] ${reconnectState === "working" ? "animate-spin" : ""}`}
              />
              {reconnectState === "working" ? "Reconnecting..." : "Reconnect / Change Workspace"}
            </button>
          </div>
          {/* Token health & details strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tokenDetails.map((detail) => (
              <div
                key={detail.label}
                className="p-3 rounded-lg bg-surface-container-lowest/60 flex flex-col"
              >
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  {detail.label}
                </span>
                <span
                  className={`font-mono-code text-[12px] mt-0.5 truncate ${detail.valueClass}`}
                >
                  {detail.value}
                </span>
              </div>
            ))}
            <div className="p-3 rounded-lg bg-surface-container-lowest/60 flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase">
                SSL Handshake
              </span>
              <span className="font-mono-code text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                TLS 1.3 / Verified
              </span>
            </div>
          </div>
        </section>

        {/* Section 02 — channel dispatch mapping */}
        <SlackDispatchRules />

        {/* Section 03 — severity overrides & noise filters */}
        <section className="rounded-xl bg-surface-container-low p-6 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-label-caps text-label-caps text-outline uppercase">
                Section 03
              </span>
              <span className="text-outline-variant font-mono-code">•</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Severity Overrides &amp; Noise Filters
              </h2>
            </div>
            <span className="font-mono-code text-[11px] text-outline font-medium">
              3 active protections
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {protections.map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl bg-surface-container flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg bg-surface-container-highest mt-0.5 ${item.iconClass}`}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {item.title}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant max-w-lg mt-0.5">
                      {item.body}
                    </span>
                  </div>
                </div>
                <Toggle />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right column: dispatch test sandbox */}
      <div className="xl:col-span-5 flex flex-col gap-gutter">
        <SlackTestSandbox />
      </div>
    </div>
  );
}
