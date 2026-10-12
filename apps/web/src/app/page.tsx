import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { VERDICTS, type Finding, type Severity, type Verdict } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Unified dashboard — decisive findings, verdict distribution and the cross-platform evidence graph.",
};

/* ------------------------------------------------------------------ *
 * DATA HOLE — replace with the findings API.
 *
 * Every widget on this screen derives from the `findings` list declared
 * below, typed to the shapes the API will return. It is empty until that
 * endpoint exists, so the critical-findings list and verdict bars render
 * at zero. No screen-local filler copy or invented widget data.
 * ------------------------------------------------------------------ */

const findings: Finding[] = [];

const verdictMeta: Record<
  Verdict,
  { label: string; short: string; color: string; bar: string; icon: string }
> = {
  SUPPORTED: {
    label: "Supported",
    short: "SUPPORTED",
    color: "text-verdict-supported",
    bar: "bg-verdict-supported",
    icon: "check_circle",
  },
  CONTRADICTED: {
    label: "Contradicted",
    short: "CONTRADICTED",
    color: "text-verdict-contradicted",
    bar: "bg-verdict-contradicted",
    icon: "cancel",
  },
  PARTIAL: {
    label: "Partial",
    short: "PARTIAL",
    color: "text-verdict-partial",
    bar: "bg-verdict-partial",
    icon: "adjust",
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient evidence",
    short: "INSUFFICIENT",
    color: "text-verdict-insufficient",
    bar: "bg-verdict-insufficient",
    icon: "help",
  },
};

const severityTone: Record<Severity, string> = {
  critical: "bg-error-container/25 text-error",
  warning: "bg-tertiary-container/25 text-tertiary",
  info: "bg-primary/15 text-primary",
};

const severityIcon: Record<Severity, string> = {
  critical: "sync_problem",
  warning: "variables",
  info: "info",
};

/**
 * Node card for the dependency graph panel. Positions are percentages of the
 * panel so the cards and the SVG edges stay attached at any content width.
 */
function GraphNode({
  x,
  y,
  tone,
  icon,
  label,
  muted = false,
}: {
  x: number;
  y: number;
  tone: string;
  icon: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className="absolute group cursor-pointer -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={`px-4 py-3 rounded-lg text-center transition-all group-hover:scale-105 ${
          muted
            ? "w-32 bg-surface-container-high border border-outline opacity-75"
            : `w-32 bg-surface-container shadow-lg ${tone}`
        }`}
      >
        <div className="flex justify-center mb-1.5">
          <Icon name={icon} className="text-[20px]" />
        </div>
        <div className="text-micro-label font-semibold truncate">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const criteria = findings.flatMap((finding) => finding.criteria);
  const verdictCounts = VERDICTS.map((verdict) => ({
    verdict,
    count: criteria.filter((criterion) => criterion.verdict === verdict).length,
  }));
  const reviewed = criteria.filter((criterion) => criterion.reviewRequired).length;
  const critical = findings.filter((finding) => finding.severity === "critical").slice(0, 3);

  /**
   * DATA HOLE — replace with the graph API.
   * Empty until the endpoint exists: the canvas draws no nodes or edges.
   */
  const nodes: {
    x: number;
    y: number;
    icon: string;
    label: string;
    tone: string;
    muted?: boolean;
  }[] = [];

  const edges: {
    from: [number, number];
    to: [number, number];
    stroke: string;
  }[] = [];

  return (
    <AppShell contentClassName="w-full space-y-gutter">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-gutter">
        {/* Decisive findings */}
        <section className="lg:col-span-3 rounded-xl bg-surface-container-low shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon name="warning" className="text-error" fill />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Critical findings
              </h3>
            </div>
            <Link
              href="/conflicts"
              className="font-label-caps text-label-caps text-primary hover:text-accent-hover transition-colors"
            >
              Open inbox
            </Link>
          </div>

          <div className="flex-1 divide-y divide-outline-variant">
            {critical.map((finding) => (
              <Link
                key={finding.id}
                href={`/conflicts/${finding.id}`}
                className="flex items-start gap-4 p-4 hover:bg-surface-container transition-colors group"
              >
                <div
                  className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${severityTone[finding.severity]}`}
                >
                  <Icon name={severityIcon[finding.severity]} className="text-[19px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-4 mb-1.5">
                    <span className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {finding.title}
                    </span>
                    <span className="text-micro-label text-muted shrink-0">
                      {finding.ageLabel}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {finding.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono-code text-micro-label text-muted">
                      {finding.id}
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-mono-code text-micro-label text-muted">
                      {finding.policy ?? "verdict"}
                    </span>
                    {finding.verdict ? (
                      <>
                        <span className="text-outline">•</span>
                        <span
                          className={`font-label-caps text-label-caps uppercase tracking-wider ${
                            verdictMeta[finding.verdict].color
                          }`}
                        >
                          {verdictMeta[finding.verdict].short}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Verdict distribution — the product's headline signal */}
        <section className="lg:col-span-2 rounded-xl bg-surface-container-low shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Evidence verdicts
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {criteria.length} criteria evaluated · {reviewed} flagged for review
            </p>
          </div>

          <div className="p-4 flex flex-col gap-4 flex-1">
            {verdictCounts.map(({ verdict, count }) => {
              const meta = verdictMeta[verdict];
              const share = criteria.length ? (count / criteria.length) * 100 : 0;
              return (
                <div key={verdict}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon name={meta.icon} className={`text-[17px] ${meta.color}`} />
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant truncate">
                        {meta.short}
                      </span>
                    </span>
                    <span className={`font-mono-code text-body font-bold ${meta.color}`}>
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bar}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Cross-platform evidence graph */}
      <section className="rounded-xl bg-surface-container-low shadow-sm overflow-hidden h-[440px] relative">
        <div className="relative z-10 h-full flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon name="hub" className="text-primary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Cross-platform evidence graph
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant text-micro-label font-mono-code text-on-surface-variant">
                {nodes.length} nodes
              </span>
              <span className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant text-micro-label font-mono-code text-on-surface-variant">
                {edges.length} edges
              </span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {nodes.length === 0 && edges.length === 0 ? (
              <p className="text-body-sm text-muted text-center px-6">
                No artifacts linked yet
              </p>
            ) : (
              <>
                {/* Edges share the 0–100 coordinate space with the node cards, so
                    lines stay attached to their nodes at any panel size. */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {edges.map((edge) => (
                    <path
                      key={`${edge.from.join()}-${edge.to.join()}`}
                      className="graph-line"
                      d={`M${edge.from[0]},${edge.from[1]} L${edge.to[0]},${edge.to[1]}`}
                      fill="none"
                      stroke={edge.stroke}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>

                {nodes.map((node) => (
                  <GraphNode
                    key={node.label}
                    x={node.x}
                    y={node.y}
                    tone={node.tone}
                    icon={node.icon}
                    label={node.label}
                    muted={node.muted}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
