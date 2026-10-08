"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import type { ScenarioEvidence, SvgTone } from "@/components/study/scenarios";

const fillTone: Record<SvgTone, string> = {
  tertiary: "fill-tertiary",
  primary: "fill-primary",
  secondary: "fill-secondary",
  outline: "fill-outline",
  error: "fill-error",
  errorContainer: "fill-error-container",
  tertiaryContainer: "fill-tertiary-container",
  primaryContainer: "fill-primary-container",
  secondaryContainer: "fill-secondary-container",
  onSurfaceVariant: "fill-on-surface-variant",
};

const strokeTone: Record<SvgTone, string> = {
  tertiary: "stroke-tertiary",
  primary: "stroke-primary",
  secondary: "stroke-secondary",
  outline: "stroke-outline-variant",
  error: "stroke-error",
  errorContainer: "stroke-error-container",
  tertiaryContainer: "stroke-tertiary-container",
  primaryContainer: "stroke-primary-container",
  secondaryContainer: "stroke-secondary-container",
  onSurfaceVariant: "stroke-on-surface-variant",
};

type TabId = "unify" | "github" | "figma" | "jira";

/**
 * Right-panel investigation workspace: provenance graph, semantic comparison
 * (or anchor gap) inspector, and the tabbed raw evidence browser.
 *
 * Rendered with a `key` equal to the task id so state resets per task.
 */
export function StudyEvidence({
  evidence,
  condition,
  onInspectNode,
  onOpenTab,
}: {
  evidence: ScenarioEvidence;
  condition: "MANUAL" | "UNIFY";
  onInspectNode: () => void;
  onOpenTab: (tab: TabId) => void;
}) {
  const toast = useToast();
  const [selected, setSelected] = useState(evidence.graph.defaultSelection);
  const [tab, setTab] = useState<TabId>("unify");

  const jiraRef = (evidence.tabs.jira.heading.match(/PROJ-\d+/) ?? ["Jira"])[0];
  const githubLabel = evidence.tabs.github.heading.startsWith("PR ")
    ? `GitHub ${evidence.tabs.github.heading.split(":")[0]}`
    : "GitHub Search";

  const tabDefs: { id: TabId; label: string }[] = [
    { id: "unify", label: "Unify Explainable Record" },
    { id: "github", label: githubLabel },
    { id: "figma", label: "Figma Inspect" },
    { id: "jira", label: `Jira ${jiraRef}` },
  ];

  function selectTab(id: TabId) {
    if (id === "unify" && condition === "MANUAL") {
      toast("Explainable record withheld — manual condition inspects native tools only", {
        icon: "lock",
        tone: "neutral",
      });
      return;
    }
    if (id !== tab) onOpenTab(id);
    setTab(id);
  }

  function selectNode(title: string) {
    setSelected(title);
    onInspectNode();
  }

  const unifyLocked = condition === "MANUAL";

  return (
    <>
      {/* Provenance dependency graph */}
      <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="account_tree" className="text-primary text-[20px]" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Provenance Dependency Graph
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-surface-container-lowest font-mono-code text-[11px] text-outline">
              Filter: Direct Predecessors
            </span>
            <button
              type="button"
              onClick={() => toast("Graph recentered on the selected node", {
                icon: "center_focus_strong",
                tone: "neutral",
              })}
              className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface text-[12px] flex items-center gap-1"
            >
              <Icon name="center_focus_strong" className="text-[14px]" />
              <span>Recenter</span>
            </button>
          </div>
        </div>

        <div className="relative bg-surface-container-lowest rounded-lg p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <svg
            className="w-full h-44"
            fill="none"
            viewBox="0 0 760 170"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={`Provenance graph for ${evidence.id}`}
          >
            <pattern id="unify-dot-grid" height="20" width="20" x="0" y="0" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="fill-surface-container-highest opacity-60" />
            </pattern>
            <rect height="170" width="760" fill="url(#unify-dot-grid)" />

            {evidence.graph.edges.map((edge) => (
              <path
                key={edge.d}
                d={edge.d}
                className={strokeTone[edge.tone]}
                strokeWidth="2"
                strokeDasharray={edge.dashed ? "4 4" : undefined}
              />
            ))}

            {evidence.graph.pulse ? (
              <circle
                cy="85"
                r="4"
                className={fillTone[evidence.graph.pulse.tone]}
              >
                <animate
                  attributeName="cx"
                  dur="2.2s"
                  repeatCount="indefinite"
                  values={`${evidence.graph.pulse.from};${evidence.graph.pulse.to}`}
                />
                <animate
                  attributeName="opacity"
                  dur="2.2s"
                  repeatCount="indefinite"
                  values="1;0.2"
                />
              </circle>
            ) : null}

            {evidence.graph.nodes.map((node) => (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => selectNode(node.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") selectNode(node.title);
                }}
              >
                <rect
                  x={node.x}
                  y="50"
                  width={node.w}
                  height="70"
                  rx="8"
                  strokeWidth="1.5"
                  className={`fill-surface-container ${strokeTone[node.strokeTone]}`}
                />
                <circle
                  cx={node.x + 20}
                  cy="72"
                  r="7"
                  className={`${fillTone[node.badgeFillTone]} opacity-30`}
                />
                <text
                  x={node.x + 20}
                  y="76"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  className={fillTone[node.badgeTone]}
                >
                  {node.badge}
                </text>
                <text
                  x={node.x + 36}
                  y="75"
                  fontSize="11"
                  fontWeight="600"
                  className="fill-on-surface"
                >
                  {node.title}
                </text>
                <text
                  x={node.x + 20}
                  y="102"
                  fontSize="9.5"
                  className={`${fillTone[node.metaTone]} font-mono-code`}
                >
                  {node.meta}
                </text>
              </g>
            ))}

            {evidence.graph.anomaly ? (
              <g transform={`translate(${evidence.graph.anomaly.x}, ${evidence.graph.anomaly.y})`}>
                <rect
                  height="20"
                  rx="4"
                  width="70"
                  className={
                    evidence.graph.anomaly.tone === "errorContainer"
                      ? "fill-error-container"
                      : "fill-error"
                  }
                />
                <text
                  x="35"
                  y="14"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  className="fill-on-error-container font-mono-code"
                >
                  {evidence.graph.anomaly.label}
                </text>
              </g>
            ) : null}
          </svg>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container text-on-surface-variant font-mono-code text-[11px] gap-3 flex-wrap">
            <span>
              Selected Node:{" "}
              <strong className="text-primary font-semibold">{selected}</strong>
            </span>
            <span className={`${evidence.graph.anomalyTone} flex items-center gap-1`}>
              <Icon name="warning" className="text-[13px]" />
              {evidence.graph.anomalyNote}
            </span>
          </div>
        </div>
      </div>

      {/* Semantic comparison / anchor-gap inspector */}
      <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Automated Semantic Comparison
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
              {evidence.inspector.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold ${evidence.inspector.severityTone}`}
            >
              {evidence.inspector.severity}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-[11px]">
              {evidence.inspector.keyChip}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[evidence.inspector.left, evidence.inspector.right].map((column, index) => (
            <div
              key={column.header}
              className="bg-surface-container-lowest rounded-lg p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {column.header}
                  </span>
                </div>
                <span className={`font-mono-code text-[11px] ${column.metaTone}`}>
                  {column.meta}
                </span>
              </div>
              <div className="p-3 rounded bg-surface-container-low font-mono-code text-mono-code text-[12px] space-y-1">
                {column.lines.map((line) => (
                  <div key={line.text} className={line.tone ?? "text-on-surface"}>
                    {line.text}
                    {line.suffix ? (
                      <span className="text-outline-variant font-normal text-[10px]">
                        {" "}
                        {line.suffix}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-surface-container-high rounded flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                      index === 0
                        ? "bg-tertiary/20 text-tertiary"
                        : "bg-primary-container/30 text-primary"
                    }`}
                  >
                    <Icon name={column.footer.icon} className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate">
                      {column.footer.title}
                    </div>
                    <div className="font-body-sm text-body-sm text-[11px] text-on-surface-variant truncate">
                      {column.footer.subtitle}
                    </div>
                  </div>
                </div>
                <Icon
                  name={column.footer.rightIcon}
                  className={`${column.footer.rightTone} text-[18px] shrink-0`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
          <Icon name="troubleshoot" className="text-secondary text-[22px] shrink-0" />
          <div className="flex-1">
            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
              Unify Inference Engine
            </span>
            <p className="font-body-sm text-body-sm text-on-surface">
              {evidence.inspector.inference}
            </p>
          </div>
        </div>
      </div>

      {/* Tabbed multi-tool raw evidence inspector */}
      <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-highest pb-3">
          <div>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              Raw Artifact Simulation
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
              Evidence Timeline &amp; Tool Inspection
            </h3>
          </div>
          <div className="flex flex-wrap gap-1 bg-surface-container-lowest p-1 rounded-lg" role="tablist">
            {tabDefs.map((definition) => {
              const active = definition.id === tab;
              const locked = definition.id === "unify" && unifyLocked;
              return (
                <button
                  key={definition.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(definition.id)}
                  className={`px-3 py-1 rounded font-mono-code text-[11px] transition-all flex items-center gap-1 ${
                    active
                      ? "text-primary-fixed bg-surface-container-high font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {locked ? <Icon name="lock" className="text-[12px]" /> : null}
                  {definition.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "unify" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {evidence.tabs.unify.timeline.map((entry) => (
                <div
                  key={entry.time + entry.label}
                  className={`p-3 rounded bg-surface-container-lowest flex flex-col justify-between ${
                    entry.flag ? "border-l-2 border-tertiary" : ""
                  }`}
                >
                  <span
                    className={`font-label-caps text-label-caps ${
                      entry.flag ? "text-tertiary font-bold" : "text-outline"
                    }`}
                  >
                    {entry.time}
                  </span>
                  <span
                    className={`font-body-sm text-body-sm font-medium mt-1 ${entry.tone ?? "text-on-surface"}`}
                  >
                    {entry.label}
                  </span>
                  <span
                    className={`font-mono-code text-[10px] ${entry.flag ? "text-tertiary" : "text-on-surface-variant"}`}
                  >
                    {entry.detail}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg font-mono-code text-mono-code text-[12px] space-y-2">
              {evidence.tabs.unify.query.map((line) => (
                <div key={line.text} className={line.tone ?? "text-on-surface-variant"}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "github" ? (
          <div className="bg-surface-container-lowest p-4 rounded-lg space-y-3 font-mono-code text-[12px]">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container gap-2">
              <span className="text-secondary font-semibold">{evidence.tabs.github.heading}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] ${evidence.tabs.github.badgeTone}`}
              >
                {evidence.tabs.github.badge}
              </span>
            </div>
            <p className="text-on-surface font-body-sm text-body-sm">
              {evidence.tabs.github.body}
            </p>
            <div className="bg-surface-container p-2.5 rounded text-on-surface-variant">
              {evidence.tabs.github.stats}
            </div>
          </div>
        ) : null}

        {tab === "figma" ? (
          <div className="bg-surface-container-lowest p-4 rounded-lg space-y-2 font-mono-code text-[12px]">
            <div className="text-tertiary font-bold">{evidence.tabs.figma.heading}</div>
            {evidence.tabs.figma.lines.map((line) => (
              <div key={line} className="text-on-surface-variant">
                {line}
              </div>
            ))}
          </div>
        ) : null}

        {tab === "jira" ? (
          <div className="bg-surface-container-lowest p-4 rounded-lg space-y-2 font-mono-code text-[12px]">
            <div className="text-secondary font-bold">{evidence.tabs.jira.heading}</div>
            {evidence.tabs.jira.lines.map((line) => (
              <div key={line} className="text-on-surface-variant">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
