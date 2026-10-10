import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { EvalActions } from "@/components/evaluation/eval-actions";
import type { EvalMetric } from "@/lib/types";

/**
 * DATA HOLE — replace with the evaluation API.
 * Empty until the endpoint exists; the metric grid renders nothing meanwhile.
 */
const evalMetrics: EvalMetric[] = [];

export const metadata: Metadata = {
  title: "Evaluation",
  description:
    "Internal system evaluation and benchmark metrics: verdict quality, targets and per-metric status for the four-way verdict task.",
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

/* ----------------------------------------------------------------- pieces */

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
        <span className="font-label-caps text-label-caps uppercase text-muted tracking-wider">
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
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-4 shadow-md">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-mono-code text-label-caps uppercase tracking-wider font-bold">
                System Benchmark &amp; Evaluation // Internal Dev Only
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-muted font-mono-code text-micro-label">
                RESTRICTED: NON-TENANT VISIBLE
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              System Evaluation &amp; Benchmark Metrics
            </h1>
          </div>
          <EvalActions />
        </div>
      </div>

      {/* Headline metric tiles from evalMetrics */}
      <section aria-label="Evaluation metrics">
        <SectionHeading
          kicker="Verdict-level metrics"
          title="Evaluation Suite Results"
          note="Criterion-level numbers for the four-way verdict task."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {evalMetrics.length === 0 ? (
            <div className="col-span-full p-8 rounded-xl bg-surface-container shadow-sm text-center">
              <Icon name="analytics" className="text-[28px] text-muted mb-2" />
              <p className="font-body-md text-body-md font-semibold text-on-surface">
                No evaluation results yet
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Run the suite to populate verdict-level metrics.
              </p>
            </div>
          ) : null}
          {evalMetrics.map((metric) => {
            const meta = statusMeta[metric.status];
            return (
              <div
                key={metric.id}
                className="p-4 rounded-xl bg-surface-container shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden group hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-caps text-label-caps uppercase text-muted tracking-wider">
                    {metric.label}
                  </span>
                  <Icon name={meta.icon} className={`${meta.text} text-[18px]`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono-code">
                    {metric.value}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-mono-code text-micro-label font-bold ${meta.chip} ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center text-micro-label font-mono-code bg-surface-container-lowest/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-on-surface-variant">target {metric.target ?? "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
