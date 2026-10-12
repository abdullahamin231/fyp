"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/* ------------------------------------------------------------------ static */

type PresetId = "dev" | "design" | "pm" | "custom";
type Frequency = "realtime" | "hourly" | "daily";
type PreviewTab = "slack" | "inapp";

const presets: { id: PresetId; label: string; icon: string; iconClass: string }[] = [
  { id: "dev", label: "Developer Focused", icon: "terminal", iconClass: "text-primary" },
  { id: "design", label: "Design Lead", icon: "palette", iconClass: "text-secondary" },
  { id: "pm", label: "Product Manager", icon: "analytics", iconClass: "text-tertiary" },
  { id: "custom", label: "Custom Rules (Active)", icon: "tune", iconClass: "text-on-surface-variant" },
];

const slackModes = ["Immediate", "Hourly Digest", "Daily Standup", "Muted"];

type MatrixRow = {
  id: string;
  dot: string;
  title: string;
  sub: string;
};

/** DATA HOLE — replace with the notification stream API. */
const matrixRows: MatrixRow[] = [];

type MatrixCell = { inApp: boolean; slack: string; email: boolean; push: boolean };

/** DATA HOLE — replace with the notification stream API. */
const initialMatrix: Record<string, MatrixCell> = {};

const frequencyOptions: {
  id: Frequency;
  icon: string;
  iconClass: string;
  title: string;
  body: string;
  badge?: string;
}[] = [
  {
    id: "realtime",
    icon: "bolt",
    iconClass: "text-primary",
    title: "Real-time Immediate",
    body: "Dispatches notifications the moment the rule engine flags a discrepancy.",
  },
  {
    id: "hourly",
    icon: "hourglass_top",
    iconClass: "text-secondary",
    title: "Hourly Smart Batch",
    body: "Collapses concurrent findings across the same repositories into a single summary.",
    badge: "Recommended",
  },
  {
    id: "daily",
    icon: "calendar_today",
    iconClass: "text-tertiary",
    title: "Daily Standup Digest",
    body: "Single comprehensive debrief delivered at 09:00 AM local time.",
  },
];

const checkboxClass =
  "w-4 h-4 rounded accent-primary bg-surface-container-high cursor-pointer";

/* ----------------------------------------------------------------- data holes */

/**
 * DATA HOLE — replace with the notification settings API.
 * Empty until the endpoint exists; the chips render their empty state.
 */
const slaOverride: string | undefined = undefined;

/** DATA HOLE — replace with the Slack webhook destination API. */
const webhookDestination: string | undefined = undefined;

/** DATA HOLE — replace with the escalation routing API. */
type EscalationTarget = { icon: string; iconClass: string; label: string };
const escalationTargets: EscalationTarget[] = [];

/** DATA HOLE — replace with the digest metrics API. */
type DigestStats = {
  noiseReduction?: string;
  incoming?: string;
  batched?: string;
  incomingShare?: number;
  batchedShare?: number;
  prevented?: string;
};
const digestStats: DigestStats = {};

/** DATA HOLE — replace with the notification preview API. */
type SlackPreviewMessage = {
  appTime?: string;
  headline?: ReactNode;
  fields?: { label: string; value: string; valueClass?: string }[];
};
const slackPreviewMessage: SlackPreviewMessage = {};

/** DATA HOLE — replace with the notification preview API. */
type InAppPreviewMessage = { age?: string; title?: string; body?: string };
const inAppPreviewMessage: InAppPreviewMessage = {};

/** DATA HOLE — replace with the notification delivery log API. */
const lastVerification: string | undefined = undefined;

/* ---------------------------------------------------------------- component */

export function NotificationPreferences() {
  const [preset, setPreset] = useState<PresetId>("custom");
  const [matrix, setMatrix] = useState(initialMatrix);
  const [frequency, setFrequency] = useState<Frequency>("hourly");
  const [dnd, setDnd] = useState(true);
  const [bypass, setBypass] = useState(true);
  const [threshold, setThreshold] = useState(4);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("slack");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [testState, setTestState] = useState<"idle" | "sending" | "sent">("idle");

  function updateCell(rowId: string, patch: Partial<MatrixCell>) {
    setMatrix((prev) => ({ ...prev, [rowId]: { ...prev[rowId], ...patch } }));
  }

  function resetDefaults() {
    setPreset("custom");
    setMatrix(initialMatrix);
    setFrequency("hourly");
    setDnd(true);
    setBypass(true);
    setThreshold(4);
    setPreviewTab("slack");
    setSaveState("idle");
    setTestState("idle");
  }

  function applyRules() {
    if (saveState !== "idle") return;
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    }, 800);
  }

  function sendTest() {
    if (testState !== "idle") return;
    setTestState("sending");
    window.setTimeout(() => {
      setTestState("sent");
      window.setTimeout(() => setTestState("idle"), 1800);
    }, 700);
  }

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-4 shadow-xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-64 h-64 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary-container/40 text-on-primary-container font-mono-code text-eyebrow font-semibold uppercase tracking-wider">
                ENGINE // ROUTING-SYS
              </span>
              <span className="font-mono-code text-body-sm text-muted">•</span>
              <span className="font-mono-code text-body-sm text-muted">Routing Engine</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Notification Engine &amp; Alert Routing
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Configure role-aware delivery channels, batch digests, and noise reduction
              thresholds across cross-functional pipelines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetDefaults}
              className="px-3.5 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Icon name="restart_alt" className="text-[18px]" />
              Reset Defaults
            </button>
            <button
              onClick={applyRules}
              disabled={saveState !== "idle"}
              className="px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container text-body-sm font-semibold shadow-lg shadow-primary-container/20 transition-all flex items-center gap-2 disabled:opacity-80"
            >
              {saveState === "saving" ? (
                <Icon name="sync" className="text-[18px] animate-spin" />
              ) : saveState === "saved" ? (
                <Icon name="done_all" className="text-[18px]" />
              ) : (
                <Icon name="bolt" className="text-[18px]" />
              )}
              {saveState === "saving" ? "Deploying..." : saveState === "saved" ? "Rules Active" : "Apply Routing Rules"}
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-6 pt-5 flex flex-wrap items-center gap-3">
          <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider mr-1">
            Preset Profiles:
          </span>
          {presets.map((item) => {
            const active = preset === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPreset(item.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-body-sm transition-colors flex items-center gap-1.5",
                  active
                    ? "bg-primary text-on-primary font-semibold shadow-md"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium",
                ].join(" ")}
              >
                <Icon name={item.icon} className={`text-[16px] ${active ? "text-on-primary" : item.iconClass}`} />
                {item.label}
              </button>
            );
          })}
          {slaOverride ? (
            <div className="ml-auto hidden xl:flex items-center gap-2 text-muted text-body-sm font-mono-code bg-surface-container-lowest/60 px-3 py-1 rounded">
              <Icon name="format_image_left" className="text-secondary text-[16px]" />
              SLA Override: {slaOverride}
            </div>
          ) : null}
        </div>
      </section>

      {/* -------------------------------------------------- Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Channel matrix */}
          <section className="rounded-xl bg-surface-container-low p-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center">
                  <Icon name="table_rows" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Delivery Channel Matrix &amp; Routing
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Deterministic routing targets sorted by severity classification
                  </p>
                </div>
              </div>
              <span className="font-mono-code text-[12px] px-2.5 py-1 rounded bg-surface-container text-secondary font-medium">
                {matrixRows.length} Streams Configured
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner">
              <table className="w-full text-left font-body-sm">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <th className="py-4 px-4">Event / Conflict Severity</th>
                    <th className="py-4 px-4 text-center">In-App Inbox</th>
                    <th className="py-4 px-4 text-center">Slack Outbound</th>
                    <th className="py-4 px-4 text-center">Email Digest</th>
                    <th className="py-4 px-4 text-center">Desktop Push</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 text-on-surface">
                  {matrixRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center font-body-sm text-on-surface-variant"
                      >
                        No event or conflict streams configured yet — routing rows appear once the
                        notification API reports them.
                      </td>
                    </tr>
                  ) : matrixRows.map((row) => {
                    const cell = matrix[row.id];
                    return (
                      <tr key={row.id} className="hover:bg-surface-container/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                            <div>
                              <span className="font-semibold text-on-surface block">{row.title}</span>
                              <span className="font-mono-code text-micro-label text-muted">{row.sub}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            aria-label={`${row.title} in-app inbox`}
                            type="checkbox"
                            checked={cell.inApp}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateCell(row.id, { inApp: e.target.checked })
                            }
                            className={checkboxClass}
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-[12px] font-mono-code">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cell.slack === "Immediate"
                                  ? "bg-secondary"
                                  : cell.slack === "Muted"
                                    ? "bg-outline"
                                    : row.dot.replace(" animate-pulse", "")
                              }`}
                            />
                            <select
                              aria-label={`${row.title} slack cadence`}
                              value={cell.slack}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                updateCell(row.id, { slack: e.target.value })
                              }
                              className="bg-transparent font-mono-code text-[12px] text-on-surface focus:outline-none cursor-pointer"
                            >
                              {slackModes.map((mode) => (
                                <option key={mode} value={mode} className="bg-surface-container-highest text-on-surface">
                                  {mode}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            aria-label={`${row.title} email digest`}
                            type="checkbox"
                            checked={cell.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateCell(row.id, { email: e.target.checked })
                            }
                            className={checkboxClass}
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            aria-label={`${row.title} desktop push`}
                            type="checkbox"
                            checked={cell.push}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateCell(row.id, { push: e.target.checked })
                            }
                            className={checkboxClass}
                          />
                        </td>
                      </tr>
                    ) : null)}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-body-sm text-muted">
              <div className="flex items-center gap-2 font-mono-code text-[12px]">
                <Icon name="tune" className="text-[16px] text-secondary" />
                Slack Webhook:{" "}
                <span className="text-on-surface bg-surface-container px-1.5 py-0.5 rounded">
                  {webhookDestination ?? "not yet mapped"}
                </span>
              </div>
              <Link
                href="/settings/slack"
                className="text-primary hover:text-on-surface font-semibold transition-colors flex items-center gap-1 text-[13px]"
              >
                Configure Destination Webhooks
                <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
          </section>

          {/* Frequency & quiet hours */}
          <section className="rounded-xl bg-surface-container-low p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-secondary/15 text-secondary flex items-center justify-center">
                  <Icon name="timelapse" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Frequency &amp; Quiet Hours Configuration
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Throttling algorithms to avoid alert fatigue during deep work
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frequencyOptions.map((option) => {
                const active = frequency === option.id;
                return (
                  <label
                    key={option.id}
                    className={`relative flex flex-col p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${
                      active
                        ? "bg-surface-container-high ring-1 ring-primary/50"
                        : "bg-surface-container hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name={option.icon} className={`text-[22px] ${option.iconClass}`} />
                      <input
                        type="radio"
                        name="digest_freq"
                        checked={active}
                        onChange={() => setFrequency(option.id)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <span className="font-semibold text-on-surface text-body-md">{option.title}</span>
                    <span className="text-on-surface-variant text-body-sm mt-1.5">{option.body}</span>
                    {option.badge ? (
                      <span className="mt-3 font-mono-code text-eyebrow text-secondary font-semibold uppercase">
                        {option.badge}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
            <div className="p-4 rounded-lg bg-surface-container-lowest space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={dnd}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setDnd(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-surface after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                  </label>
                  <div>
                    <span className="font-semibold text-on-surface text-body-md block">
                      Enable Do-Not-Disturb (DND)
                    </span>
                    <span className="text-on-surface-variant text-body-sm">
                      Suppress audio and desktop popups during specified schedule
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded">
                  <Icon name="bedtime" className="text-muted text-[18px]" />
                  <span className="font-mono-code text-body-sm text-on-surface font-semibold">
                    19:00 — 08:00 (UTC-7)
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    id="bypassSev1"
                    type="checkbox"
                    checked={bypass}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBypass(e.target.checked)}
                    className="w-4 h-4 rounded accent-error cursor-pointer"
                  />
                  <label
                    htmlFor="bypassSev1"
                    className="text-body-sm text-on-surface cursor-pointer select-none"
                  >
                    <strong className="text-error font-semibold">
                      Bypass for Critical SEV-1 Merge Blockers
                    </strong>
                    <span className="text-muted block sm:inline">
                      Always wake on active deploy stoppage
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-caps text-label-caps text-muted uppercase">
                    Active Timezone:
                  </span>
                  <span className="font-mono-code text-[12px] bg-surface-container text-on-surface px-2 py-0.5 rounded">
                    America/Los_Angeles
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Escalation engine */}
          <section className="rounded-xl bg-surface-container-low p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-error/15 text-error flex items-center justify-center">
                  <Icon name="crisis_alert" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Escalation Engine &amp; SLA Guardrails
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Deterministic fallback logic when review tickets remain stale
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-error-container/40 text-error font-mono-code text-eyebrow font-bold tracking-wider uppercase">
                Tier 1 Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-8 p-4 rounded-lg bg-surface-container space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-muted">
                    Escalation Rule
                  </span>
                  <span className="font-mono-code text-[12px] text-tertiary">
                    Max Latency: {threshold}h 00m
                  </span>
                </div>
                <p className="text-body-sm text-on-surface">
                  If an unresolved <strong className="text-error">SEV-1 conflict</strong> remains
                  unacknowledged after <strong>{threshold} hours</strong>, automatically trigger
                  high-priority incident escalation.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 font-mono-code text-[12px]">
                  {escalationTargets.length === 0 ? (
                    <span className="text-muted">
                      No escalation targets configured yet — routing appears once the escalation API
                      reports them.
                    </span>
                  ) : (
                    escalationTargets.map((target, index) => (
                      <span key={target.label} className="flex items-center gap-2">
                        {index > 0 ? <span className="text-muted">→</span> : null}
                        <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1">
                          <Icon
                            name={target.icon}
                            className={`text-[14px] ${target.iconClass}`}
                          />
                          {target.label}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="md:col-span-4 p-4 rounded-lg bg-surface-container flex flex-col justify-between">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-muted block mb-1.5">
                    Escalation Threshold
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono-code text-headline-md font-bold text-on-surface">
                      {threshold.toFixed(1)}
                    </span>
                    <span className="font-mono-code text-body-sm text-muted">hours unacked</span>
                  </div>
                </div>
                <input
                  aria-label="Escalation threshold in hours"
                  type="range"
                  min={1}
                  max={12}
                  value={threshold}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setThreshold(Number(e.target.value))}
                  className="w-full mt-3 accent-primary cursor-pointer"
                />
                <span className="text-micro-label text-muted mt-1.5 font-mono-code">
                  Default: 4 hours (Core Repo Policy)
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Outbound verification */}
          <section className="rounded-xl bg-surface-container-low p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center">
                  <Icon name="preview" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Outbound Verification
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Live feed simulation
                  </p>
                </div>
              </div>
              <button
                onClick={sendTest}
                disabled={testState !== "idle"}
                className="px-3 py-1.5 rounded bg-primary text-on-primary hover:brightness-110 text-body-sm font-semibold shadow transition-colors flex items-center gap-1.5"
              >
                {testState === "sending" ? (
                  <Icon name="refresh" className="text-[16px] animate-spin" />
                ) : testState === "sent" ? (
                  <Icon name="check_circle" className="text-[16px] text-secondary" />
                ) : (
                  <Icon name="send" className="text-[16px]" />
                )}
                {testState === "sending" ? "Dispatching..." : testState === "sent" ? "Dispatched!" : "Send Test"}
              </button>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-surface-container">
              <button
                onClick={() => setPreviewTab("slack")}
                className={`flex-1 py-1.5 text-center rounded font-mono-code text-body-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  previewTab === "slack"
                    ? "bg-surface-container-highest text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Slack Payload
              </button>
              <button
                onClick={() => setPreviewTab("inapp")}
                className={`flex-1 py-1.5 text-center rounded font-mono-code text-body-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  previewTab === "inapp"
                    ? "bg-surface-container-highest text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                In-App Card
              </button>
            </div>

            {previewTab === "slack" ? (
              <div className="p-4 rounded-lg bg-[#1a1d21] text-white shadow-inner space-y-3 font-sans">
                {Object.keys(slackPreviewMessage).length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-[#a0a0a0]">
                    No test notification yet — dispatch a test to preview the outbound Slack
                    payload.
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-primary-container flex items-center justify-center shrink-0">
                      <Icon name="token" className="text-white text-[20px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[14px] text-[#f8f8f8]">Unify Bot</span>
                        <span className="px-1 py-0.2 rounded bg-[#2c3136] text-micro-label uppercase font-mono text-[#a0a0a0]">
                          APP
                        </span>
                        {slackPreviewMessage.appTime ? (
                          <span className="text-[12px] text-[#868686]">
                            {slackPreviewMessage.appTime}
                          </span>
                        ) : null}
                      </div>
                      {slackPreviewMessage.headline ? (
                        <p className="text-[13px] text-[#d1d2d3] mt-1 font-medium">
                          {slackPreviewMessage.headline}
                        </p>
                      ) : null}
                      {slackPreviewMessage.fields?.length ? (
                        <div className="mt-2.5 p-3 rounded bg-[#222529] border-l-4 border-l-error space-y-2 text-[12px]">
                          {slackPreviewMessage.fields.map((field) => (
                            <div key={field.label} className="flex justify-between gap-3">
                              <span className="text-[#a0a0a0]">{field.label}:</span>
                              <span className={`font-mono ${field.valueClass ?? "text-white"}`}>
                                {field.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center gap-2">
                        <button className="px-2.5 py-1 rounded bg-[#007a5a] hover:bg-[#148567] text-white text-[12px] font-semibold">
                          Acknowledge SLA
                        </button>
                        <button className="px-2.5 py-1 rounded bg-[#2c3136] hover:bg-[#383f45] text-white text-[12px]">
                          View Graph
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface-container space-y-3">
                {Object.keys(inAppPreviewMessage).length === 0 ? (
                  <div className="py-8 text-center text-body-sm text-on-surface-variant">
                    No in-app notification yet — dispatch a test to preview the inbox card.
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
                        <span className="font-label-caps text-label-caps text-error uppercase font-bold">
                          Unify Guardrail Warning
                        </span>
                      </div>
                      {inAppPreviewMessage.age ? (
                        <span className="font-mono-code text-micro-label text-muted">
                          {inAppPreviewMessage.age}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="font-headline-sm text-body-md font-semibold text-on-surface">
                      {inAppPreviewMessage.title}
                    </h4>
                    <p className="font-body-sm text-on-surface-variant">
                      {inAppPreviewMessage.body}
                    </p>
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button className="px-3 py-1 rounded bg-surface-container-highest text-on-surface text-body-sm font-semibold">
                        Inspect Code
                      </button>
                      <button className="px-3 py-1 rounded bg-primary-container text-on-primary-container text-body-sm font-semibold">
                        Quick Fix
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-3.5 rounded bg-surface-container-lowest/70 text-body-sm text-muted flex items-center gap-2.5 font-mono-code text-[12px]">
              <Icon name="verified_user" className="text-secondary text-[18px]" />
              <span>
                {lastVerification ?? "No verification tests yet — dispatch a test to confirm delivery."}
              </span>
            </div>
          </section>

          {/* Digest metric impact */}
          <section className="rounded-xl bg-surface-container-low p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                Digest Metric Impact
              </span>
              {digestStats.noiseReduction ? (
                <span className="font-mono-code text-[12px] text-secondary font-semibold">
                  {digestStats.noiseReduction} Noise
                </span>
              ) : null}
            </div>
            {digestStats.incoming ? (
              <div className="space-y-4">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Incoming Raw Alerts (Weekly)</span>
                  <span className="font-mono-code font-semibold text-on-surface">
                    {digestStats.incoming}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${digestStats.incomingShare ?? 0}%` }}
                  />
                  <div className="bg-surface-container-highest h-full flex-1" />
                </div>
                <div className="flex justify-between text-body-sm pt-1">
                  <span className="text-on-surface-variant">Batched Messages Delivered</span>
                  <span className="font-mono-code font-semibold text-secondary">
                    {digestStats.batched ?? "—"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                  <div
                    className="bg-secondary h-full"
                    style={{ width: `${digestStats.batchedShare ?? 0}%` }}
                  />
                  <div className="bg-surface-container-highest h-full flex-1" />
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-muted py-2">
                No digest telemetry yet — noise-reduction metrics appear once notifications are
                delivered.
              </p>
            )}
            {digestStats.prevented ? (
              <p className="text-[12px] text-muted pt-2 leading-relaxed">
                Smart aggregation algorithm prevented{" "}
                <strong>{digestStats.prevented}</strong> during your configured focus intervals this
                sprint.
              </p>
            ) : null}
          </section>

          {/* Export */}
          <div className="p-4 rounded-xl bg-surface-container-lowest text-center space-y-3">
            <Icon name="terminal" className="text-muted text-[24px]" />
            <div className="text-body-sm font-semibold text-on-surface">
              Syncing Rules via CLI or Terraform?
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Export this configuration as declarative HCL or JSON schema to commit directly into
              code repos.
            </p>
            <button className="mt-2 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono-code text-[12px] transition-colors inline-flex items-center gap-1.5">
              <Icon name="file_download" className="text-[14px]" />
              Export alerts.hcl
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
