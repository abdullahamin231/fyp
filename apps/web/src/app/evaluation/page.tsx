import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { EvalActions } from "@/components/evaluation/eval-actions";
import { evalMetrics } from "@/lib/mock/policies";
import type { EvalMetric } from "@/lib/types";

export const metadata: Metadata = {
  title: "Evaluation",
  description:
    "Internal system evaluation and benchmark metrics: verdict quality, retrieval recall, latency quantiles, ablation runs and reproducibility manifest.",
};

/* ------------------------------------------------------------------- data */

const statusMeta: Record<
  EvalMetric["status"],
  { label: string; icon: string; text: string; chip: string }
> = {
  pass: { label: "PASS", icon: "check_circle", text: "text-secondary", chip: "bg-secondary/10" },
  watch: { label: "WATCH", icon: "visibility", text: "text-tertiary", chip: "bg-tertiary-container/30" },
  fail: { label: "FAIL", icon: "error", text: "text-error", chip: "bg-error-container/30" },
};

interface BenchBar {
  name: string;
  value: string;
  width: number;
  tone: string;
  badge?: string;
  badgeClass?: string;
}

interface BenchCard {
  label: string;
  icon: string;
  iconClass: string;
  value: string;
  valueClass?: string;
  metric: string;
  metricClass: string;
  bars: BenchBar[];
}

const benchCards: BenchCard[] = [
  {
    label: "Conflict Detection",
    icon: "verified",
    iconClass: "text-primary",
    value: "98.1%",
    metric: "F1-Score",
    metricClass: "text-secondary",
    bars: [
      {
        name: "Conflict Precision",
        value: "97.4%",
        width: 97.4,
        tone: "bg-secondary",
        badge: ">95% Target",
        badgeClass: "bg-secondary/10 text-secondary",
      },
      {
        name: "Conflict Recall",
        value: "98.8%",
        width: 98.8,
        tone: "bg-primary",
        badge: ">95% Target",
        badgeClass: "bg-secondary/10 text-secondary",
      },
    ],
  },
  {
    label: "Link Heuristics",
    icon: "hub",
    iconClass: "text-secondary",
    value: "95.3%",
    metric: "F1-Score",
    metricClass: "text-primary",
    bars: [
      { name: "Link Precision", value: "94.2%", width: 94.2, tone: "bg-secondary" },
      { name: "Link Recall", value: "96.5%", width: 96.5, tone: "bg-primary" },
    ],
  },
  {
    label: "Recipient Routing",
    icon: "alt_route",
    iconClass: "text-tertiary",
    value: "99.0%",
    metric: "Recall Bound",
    metricClass: "text-tertiary",
    bars: [
      { name: "Routing Precision", value: "96.1%", width: 96.1, tone: "bg-tertiary" },
      {
        name: "Target Saturation",
        value: "Optimized",
        width: 99,
        tone: "bg-secondary",
        badge: "99%",
        badgeClass: "bg-secondary/10 text-secondary",
      },
    ],
  },
  {
    label: "Noise Suppression",
    icon: "filter_vintage",
    iconClass: "text-secondary",
    value: "0",
    valueClass: "text-secondary",
    metric: "Duplicate Alerts",
    metricClass: "text-on-surface-variant",
    bars: [
      {
        name: "Alerts / User / Day",
        value: "1.4",
        width: 46,
        tone: "bg-secondary-container",
        badge: "<3.0",
        badgeClass: "bg-surface-container-highest text-outline",
      },
      {
        name: "Duplicate Ratio",
        value: "0.00%",
        width: 100,
        tone: "bg-secondary",
        badge: "Zero-Leak",
        badgeClass: "bg-surface-container-highest text-outline",
      },
    ],
  },
];

const policyBenchmarks = [
  {
    id: "P1",
    name: "Design Drift after PR Merge",
    support: "512",
    precision: "0.92",
    recall: "0.88",
    f1: "0.90",
    p95: "7.4s",
    status: "pass" as const,
  },
  {
    id: "P2",
    name: "Ghost Ticket (No Code Attached)",
    support: "348",
    precision: "0.88",
    recall: "0.84",
    f1: "0.86",
    p95: "8.6s",
    status: "pass" as const,
  },
  {
    id: "P3",
    name: "Spec Outdated (Tokens Diverged)",
    support: "296",
    precision: "0.83",
    recall: "0.77",
    f1: "0.80",
    p95: "6.9s",
    status: "watch" as const,
  },
  {
    id: "P4",
    name: "Requirement / Implementation Divergence",
    support: "326",
    precision: "0.76",
    recall: "0.68",
    f1: "0.72",
    p95: "9.4s",
    status: "fail" as const,
  },
];

const ablationRows = [
  {
    variant: "Full pipeline (L0 gate → retrieval → L3 citations)",
    f1: "0.83",
    citation: "100%",
    abstain: "11%",
    p95: "8.2s",
    delta: "—",
    note: "Reference configuration",
    baseline: true,
  },
  {
    variant: "− freshness guard (SOURCE_STALE off)",
    f1: "0.81",
    citation: "100%",
    abstain: "9%",
    p95: "7.9s",
    delta: "−0.02",
    note: "STALE sources accepted into evidence",
    baseline: false,
  },
  {
    variant: "− symbol retrieval (L2 suggest only)",
    f1: "0.74",
    citation: "97.2%",
    abstain: "8%",
    p95: "5.1s",
    delta: "−0.09",
    note: "Recall@k collapse dominates the drop",
    baseline: false,
  },
  {
    variant: "− citations (free-text explanations)",
    f1: "0.79",
    citation: "—",
    abstain: "10%",
    p95: "6.8s",
    delta: "−0.04",
    note: "Audit trail lost — not shippable",
    baseline: false,
  },
  {
    variant: "temperature 0.2 (non-deterministic)",
    f1: "0.82",
    citation: "100%",
    abstain: "12%",
    p95: "8.4s",
    delta: "−0.01",
    note: "Run-to-run agreement falls to 88.1%",
    baseline: false,
  },
  {
    variant: "L0 rules only (no model call)",
    f1: "0.61",
    citation: "—",
    abstain: "15%",
    p95: "0.4s",
    delta: "−0.22",
    note: "Deterministic fallback shipped alongside",
    baseline: false,
  },
];

const runMeta: { key: string; value: string; tone?: string }[] = [
  { key: "Run ID", value: "eval-2026-10-08-0417" },
  { key: "Model version", value: "verifier/local-qwen · qwen2.5-7b-instruct (build 2026.09.28)" },
  { key: "Model digest", value: "sha256:9f2c4a71…d41a" },
  { key: "Decoding", value: "temperature 0 (greedy) · seed 0x7F9A · top-p 1.0", tone: "text-secondary" },
  { key: "Prompt version", value: "critic/v3.2 · sha256:4b29…91e3" },
  { key: "Packet manifest", value: "pkt-30d-1482.v3 · 1,482 pairs · sha256:7c81…05be" },
  { key: "Thresholds", value: "cosine ≥ 0.82 · abstain < 0.65 · ≥ 1 resolved citation" },
  {
    key: "Autonomy",
    value: "L0 rule gate → L2 suggest → L3 explain with citations · L4 autonomous write prohibited",
    tone: "text-tertiary",
  },
  {
    key: "Inputs",
    value: "Jira · Figma · GitHub · tests — Slack excluded (delivery-only)",
    tone: "text-primary",
  },
  { key: "Determinism", value: "96.4% run-to-run agreement at temperature 0" },
];

const adapters = [
  {
    subsystem: "github-ingress-v2",
    icon: "terminal",
    iconClass: "text-secondary",
    sync: "6s ago",
    queue: "0 items",
    queueTone: "text-secondary",
    checkpoint: "14s",
    reliability: "99.99%",
  },
  {
    subsystem: "figma-webhook-sync",
    icon: "palette",
    iconClass: "text-tertiary",
    sync: "22s ago",
    queue: "2 items",
    queueTone: "text-tertiary",
    checkpoint: "28s",
    reliability: "99.94%",
  },
  {
    subsystem: "jira-cloud-worker",
    icon: "receipt_long",
    iconClass: "text-primary",
    sync: "14s ago",
    queue: "0 items",
    queueTone: "text-secondary",
    checkpoint: "19s",
    reliability: "99.97%",
  },
  {
    subsystem: "slack-notify-outbound",
    icon: "chat_bubble_outline",
    iconClass: "text-outline",
    sync: "3s ago",
    queue: "0 items",
    queueTone: "text-secondary",
    checkpoint: "8s",
    reliability: "99.98%",
  },
];

/* ----------------------------------------------------------------- pieces */

function BenchmarkCard({ card }: { card: BenchCard }) {
  return (
    <div className="rounded-xl bg-surface-container p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
          {card.label}
        </span>
        <Icon name={card.icon} className={`${card.iconClass} text-[20px]`} />
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className={`font-headline-lg text-headline-lg font-bold ${
            card.valueClass ?? "text-on-surface"
          }`}
        >
          {card.value}
        </span>
        <span className={`font-mono-code text-[12px] font-semibold ${card.metricClass}`}>
          {card.metric}
        </span>
      </div>
      <div className="space-y-2.5 bg-surface-container-lowest/60 rounded-lg p-3">
        {card.bars.map((bar) => (
          <div key={bar.name} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-mono-code text-[12px]">{bar.name}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono-code font-bold text-on-surface">{bar.value}</span>
                {bar.badge ? (
                  <span
                    className={`text-[10px] font-mono-code px-1 rounded ${bar.badgeClass ?? "bg-surface-container-highest text-outline"}`}
                  >
                    {bar.badge}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className={`${bar.tone} h-full rounded-full`} style={{ width: `${bar.width}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  note,
  action,
}: {
  kicker: string;
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
          {kicker}
        </span>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">
          {title}
        </h2>
        {note ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{note}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export default function EvaluationPage() {
  return (
    <AppShell>
      {/* Restricted banner + actions */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6 shadow-md">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-mono-code text-label-caps uppercase tracking-wider font-bold">
                System Benchmark &amp; Evaluation // Internal Dev Only
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-outline font-mono-code text-[11px]">
                RESTRICTED: NON-TENANT VISIBLE
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              System Evaluation &amp; Benchmark Metrics
            </h1>
            <p className="font-mono-code text-body-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Evaluation Engine v3.2</span>
              </span>
              <span className="text-outline">/</span>
              <span>Model Horizon: 30d Replay</span>
              <span className="text-outline">/</span>
              <span className="text-primary font-semibold">
                Ground Truth Set: 1,482 Confirmed Pairs
              </span>
            </p>
          </div>
          <EvalActions />
        </div>
      </div>

      {/* Headline metric tiles from evalMetrics */}
      <section aria-label="Evaluation metrics">
        <SectionHeading
          kicker="Verdict-level metrics"
          title="Evaluation Suite Results"
          note="Criterion-level numbers for the four-way verdict task — edge-level detection and link benchmarks follow below."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {evalMetrics.map((metric) => {
            const meta = statusMeta[metric.status];
            return (
              <div
                key={metric.id}
                className="p-4 rounded-xl bg-surface-container shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                    {metric.label}
                  </span>
                  <Icon name={meta.icon} className={`${meta.text} text-[18px]`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono-code">
                    {metric.value}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-mono-code text-[10px] font-bold ${meta.chip} ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono-code bg-surface-container-lowest/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-on-surface-variant">target {metric.target ?? "—"}</span>
                  <span className="text-outline">last run 04:17 UTC</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Run metadata */}
      <section
        aria-label="Evaluation run metadata"
        className="rounded-xl bg-surface-container p-6 shadow-md"
      >
        <SectionHeading
          kicker="Run manifest"
          title="Model, Prompt & Threshold Metadata"
          note="Frozen inputs for run eval-2026-10-08-0417 — re-running with this manifest reproduces every number on this page."
          action={
            <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono-code text-[11px] font-bold">
              TEMPERATURE 0
            </span>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {runMeta.map((row) => (
            <div
              key={row.key}
              className="flex items-baseline justify-between gap-4 py-2 border-b border-outline-variant/30"
            >
              <span className="font-label-caps text-label-caps uppercase text-outline shrink-0">
                {row.key}
              </span>
              <span
                className={`font-mono-code text-[12px] text-right ${row.tone ?? "text-on-surface"}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="font-body-sm text-[12px] text-on-surface-variant mt-4">
          Slack is configured as a delivery channel only: outbound notifications are never read
          back into the reasoning path, and no autonomy level above L3 is enabled — the engine
          explains with citations, a human applies the change.
        </p>
      </section>

      {/* Edge-level benchmark cards */}
      <section aria-label="Edge level benchmarks">
        <SectionHeading
          kicker="Edge-level benchmarks"
          title="Detection, Linking, Routing & Noise"
          note="Binary edge tasks over the 1,482-pair ground truth — distinct from the four-way verdict metrics above."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {benchCards.map((card) => (
            <BenchmarkCard key={card.label} card={card} />
          ))}
        </div>
      </section>

      {/* Per-policy benchmark table */}
      <section
        aria-label="Per-policy benchmark table"
        className="rounded-xl bg-surface-container p-6 shadow-md"
      >
        <SectionHeading
          kicker="Benchmark table · per policy"
          title="Verdict Quality by Policy"
          note="Weighted mean of the F1 column reproduces the Verdict F1 tile (0.83) across all 1,482 confirmed pairs."
          action={
            <span className="font-mono-code text-[11px] text-outline">split: dev · seed 0x7F9A</span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-outline font-label-caps text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l">Policy</th>
                <th className="py-3 px-4">Support</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1</th>
                <th className="py-3 px-4">p95 Verdict</th>
                <th className="py-3 px-4 rounded-r text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {policyBenchmarks.map((row) => {
                const meta = statusMeta[row.status];
                return (
                  <tr key={row.id} className="hover:bg-surface-container-highest/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <span className="font-mono-code text-[11px] font-bold text-primary">
                          {row.id}
                        </span>
                        <span className="font-semibold text-on-surface">{row.name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-code text-on-surface-variant">{row.support}</td>
                    <td className="py-3 px-4 font-mono-code text-on-surface">{row.precision}</td>
                    <td className="py-3 px-4 font-mono-code text-on-surface">{row.recall}</td>
                    <td className="py-3 px-4 font-mono-code font-bold text-on-surface">{row.f1}</td>
                    <td className="py-3 px-4 font-mono-code text-on-surface-variant">{row.p95}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold ${meta.chip} ${meta.text}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-surface-container-lowest/60">
                <td className="py-3 px-4 font-label-caps text-label-caps uppercase text-outline rounded-l">
                  Weighted total
                </td>
                <td className="py-3 px-4 font-mono-code font-bold text-on-surface">1,482</td>
                <td className="py-3 px-4 font-mono-code text-on-surface-variant">—</td>
                <td className="py-3 px-4 font-mono-code text-on-surface-variant">—</td>
                <td className="py-3 px-4 font-mono-code font-bold text-secondary">0.83</td>
                <td className="py-3 px-4 font-mono-code text-on-surface-variant">8.2s</td>
                <td className="py-3 px-4 text-right rounded-r">
                  <span className="px-2 py-0.5 rounded font-mono-code text-[11px] font-bold bg-secondary/10 text-secondary">
                    PASS
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ablation comparison */}
      <section
        aria-label="Ablation comparison"
        className="rounded-xl bg-surface-container p-6 shadow-md"
      >
        <SectionHeading
          kicker="Benchmark table · ablation"
          title="Ablation Comparison Rows"
          note="One variable changed per row, temperature 0 and the same packet manifest throughout."
          action={
            <span className="font-mono-code text-[11px] text-outline">Δ measured vs reference run</span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-outline font-label-caps text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l">Variant</th>
                <th className="py-3 px-4">Verdict F1</th>
                <th className="py-3 px-4">Citation Res.</th>
                <th className="py-3 px-4">Abstention</th>
                <th className="py-3 px-4">p95</th>
                <th className="py-3 px-4">Δ F1</th>
                <th className="py-3 px-4 rounded-r">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {ablationRows.map((row) => (
                <tr
                  key={row.variant}
                  className={`transition-colors ${
                    row.baseline
                      ? "bg-primary-container/10 hover:bg-primary-container/20"
                      : "hover:bg-surface-container-highest/40"
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.baseline ? "bg-primary" : "bg-outline-variant"
                        }`}
                      />
                      <span className={row.baseline ? "font-bold text-on-surface" : "text-on-surface"}>
                        {row.variant}
                      </span>
                      {row.baseline ? (
                        <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary-container font-mono-code text-[10px] font-bold">
                          BASELINE
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code font-bold text-on-surface">{row.f1}</td>
                  <td className="py-3 px-4 font-mono-code text-on-surface-variant">{row.citation}</td>
                  <td className="py-3 px-4 font-mono-code text-on-surface-variant">{row.abstain}</td>
                  <td className="py-3 px-4 font-mono-code text-on-surface-variant">{row.p95}</td>
                  <td
                    className={`py-3 px-4 font-mono-code font-bold ${
                      row.delta === "—"
                        ? "text-outline"
                        : row.delta === "−0.09" || row.delta === "−0.22"
                          ? "text-error"
                          : "text-tertiary"
                    }`}
                  >
                    {row.delta}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-[11px] text-on-surface-variant">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono-code text-[11px] text-outline mt-4">
          Autonomous write (L4) has no row on purpose: it is prohibited by design and therefore
          never evaluated.
        </p>
      </section>

      {/* Latency + vendor observation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-7 rounded-xl bg-surface-container p-6 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                Internal Processing Latency
              </span>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                Pipeline Quantiles
              </span>
            </div>
            <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded font-mono-code text-[11px] text-secondary">
              Kernel Replay v2
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 bg-surface-container-lowest p-3 rounded-lg">
            <div className="flex flex-col">
              <span className="font-mono-code text-[11px] text-outline">Median (p50)</span>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">38ms</span>
              <span className="font-mono-code text-[10px] text-on-surface-variant">
                Baseline: 62ms
              </span>
            </div>
            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-mono-code text-[11px] text-outline">95th %ile (p95)</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">142ms</span>
              <span className="font-mono-code text-[10px] text-on-surface-variant">SLA: 250ms</span>
            </div>
            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-mono-code text-[11px] text-outline">Tail (p99)</span>
              <span className="font-headline-sm text-headline-sm font-bold text-tertiary">310ms</span>
              <span className="font-mono-code text-[10px] text-on-surface-variant">
                Max Cap: 500ms
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
              <span className="font-mono-code text-[11px] uppercase">
                Replay Cycle Distribution (1,482 iterations)
              </span>
              <span className="font-mono-code text-[11px] text-secondary">
                Deterministic stage — excludes LLM inference
              </span>
            </div>
            <div className="w-full h-32 bg-surface-container-lowest/80 rounded-lg p-2 relative overflow-hidden flex items-end">
              <svg className="w-full h-24 text-secondary" fill="none" preserveAspectRatio="none" viewBox="0 0 500 100">
                <path
                  d="M0,95 Q40,90 70,75 T140,20 T190,55 T260,82 T340,90 T420,95 T500,98 L500,100 L0,100 Z"
                  fill="currentColor"
                  fillOpacity="0.12"
                />
                <path
                  d="M0,95 Q40,90 70,75 T140,20 T190,55 T260,82 T340,90 T420,95 T500,98"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <line stroke="#c3c0ff" strokeDasharray="3 3" strokeWidth="1.5" x1="140" x2="140" y1="0" y2="100" />
                <line stroke="#ffb95f" strokeDasharray="3 3" strokeWidth="1.5" x1="260" x2="260" y1="0" y2="100" />
              </svg>
              <div className="absolute top-2 left-28 bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-mono-code text-primary">
                p50: 38ms
              </div>
              <div className="absolute top-8 left-56 bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-mono-code text-tertiary">
                p95: 142ms
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-3.5 rounded-lg flex flex-col justify-between">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  Incremental Eval (Stream B)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    42ms
                  </span>
                  <span className="font-mono-code text-[11px] text-secondary">
                    per ingested event
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[12px] font-body-sm text-on-surface-variant">
                Delta recalculation of the conflict graph over active workspace nodes.
              </div>
            </div>
            <div className="bg-surface-container-lowest p-3.5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Full Graph Rescan
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-mono-code font-bold">
                    114x Acceleration
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    4.8s
                  </span>
                  <span className="font-mono-code text-[11px] text-on-surface-variant">
                    for 100k nodes
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[12px] font-body-sm text-on-surface-variant">
                Baseline unindexed evaluation required 547.2s.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl bg-surface-container p-6 shadow-md flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                  Upstream Ingestion Latency
                </span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Vendor Observation Delay
                </h2>
              </div>
              <Icon name="cloud_sync" className="text-outline text-[20px]" />
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "GitHub Webhook",
                  detail: "PRs, Commits, Branches",
                  icon: "code",
                  iconClass: "text-on-surface",
                  avg: "1.2s avg",
                  avgClass: "text-secondary",
                  jitter: "jitter: ±0.3s",
                },
                {
                  name: "Figma Poller / Webhook",
                  detail: "Component variants, tokens",
                  icon: "draw",
                  iconClass: "text-tertiary",
                  avg: "4.1s avg",
                  avgClass: "text-tertiary",
                  jitter: "jitter: ±1.4s",
                },
                {
                  name: "Jira Cloud Webhook",
                  detail: "Issue updates, fields",
                  icon: "task_alt",
                  iconClass: "text-primary",
                  avg: "2.8s avg",
                  avgClass: "text-on-surface",
                  jitter: "jitter: ±0.8s",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-surface-container-lowest p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                      <Icon name={item.icon} className={`${item.iconClass} text-[18px]`} />
                    </div>
                    <div>
                      <p className="font-body-sm font-semibold text-on-surface">{item.name}</p>
                      <p className="font-mono-code text-[11px] text-outline">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono-code font-bold ${item.avgClass}`}>{item.avg}</p>
                    <p className="font-mono-code text-[10px] text-on-surface-variant">
                      {item.jitter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-high p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="sync_saved_locally" className="text-secondary text-[20px]" />
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                  Simulated Outage Recovery
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono-code text-[11px] font-bold">
                100.0% RECONCILED
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Injected partition test (4h synthetic drop, 12.4k queued updates). Zero orphaned
              edges detected during the ground-truth reconciliation checkpoint.
            </p>
          </div>
        </div>
      </div>

      {/* Adapter health */}
      <section
        aria-label="Adapter health and ingestion pipeline"
        className="rounded-xl bg-surface-container p-6 shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
              Live Pipeline Telemetry
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Adapter Health &amp; Ingestion Pipeline
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <span className="font-mono-code text-body-sm text-on-surface font-semibold">
              4 / 4 Adapters Nominal
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-outline font-label-caps text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l">Adapter Subsystem</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Last Ingestion Sync</th>
                <th className="py-3 px-4">Backpressure Queue</th>
                <th className="py-3 px-4">Checkpoint Age</th>
                <th className="py-3 px-4 rounded-r text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {adapters.map((adapter) => (
                <tr key={adapter.subsystem} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="py-3 px-4 font-mono-code font-bold text-on-surface">
                    <span className="flex items-center gap-2">
                      <Icon name={adapter.icon} className={`${adapter.iconClass} text-[18px]`} />
                      <span>{adapter.subsystem}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono-code text-[11px] font-bold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> OK
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-on-surface-variant">{adapter.sync}</td>
                  <td className={`py-3 px-4 font-mono-code font-semibold ${adapter.queueTone}`}>
                    {adapter.queue}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-on-surface-variant">
                    {adapter.checkpoint}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-right text-secondary font-bold">
                    {adapter.reliability}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono-code text-[11px] text-outline mt-4">
          slack-notify-outbound is a delivery-only adapter: its telemetry never enters the
          reasoning path.
        </p>
      </section>

      {/* Methodology */}
      <section aria-label="Methodology and artifacts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-container-low p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="description" className="text-primary text-[18px]" />
                <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                  Reproducibility Package
                </h3>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-4">
                Pre-computed confusion matrices, ROC curves, and ground-truth seed 0x7F9A ready for
                submission appendices.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono-code text-[11px]">
              <span className="text-outline">Sha256: 4b29...91e3</span>
              <button
                type="button"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <span>Download (ZIP)</span>
                <Icon name="download" className="text-[14px]" />
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="database" className="text-secondary text-[18px]" />
                <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                  Replay Corpus Volume
                </h3>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-4">
                30 days of historical activity across 12 high-velocity repos, 48 UI libraries, and
                1,840 cross-referenced PRs.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono-code text-[11px]">
              <span className="text-secondary font-bold">142,900 Total Events</span>
              <span className="text-outline">Clean Horizon</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="tune" className="text-tertiary text-[18px]" />
                <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                  Heuristic Calibration
                </h3>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-4">
                Cosine similarity threshold: 0.82 · Levenshtein distance cap: 3 · Token overlapping
                weight: 0.65.
              </p>
            </div>
            <div className="flex items-center justify-between font-mono-code text-[11px]">
              <span className="text-tertiary font-bold">Auto-tuned via Optuna</span>
              <span className="text-outline">Epoch 18</span>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
