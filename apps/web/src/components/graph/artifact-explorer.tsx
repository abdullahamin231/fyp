"use client";

import { useMemo, useState } from "react";
import { Panel } from "@xyflow/react";
import { Badge, ToolPill } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { GraphCanvas } from "./graph-canvas";
import { eligibilityStyle, toneClasses } from "./graph-styles";
import { computeLayout, type LayoutMode } from "./layout";
import type {
  EdgeRelation,
  ExplorerEdge,
  ExplorerGraph,
  ExplorerNode,
} from "@/lib/domain/graph";
import { driftBlastRadius, graphStats, isDecisive } from "@/lib/domain/graph";
import type { GraphNodeKind, LinkEligibility } from "@/lib/types";

const LAYOUTS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: "layered", label: "Hierarchical", icon: "account_tree" },
  { id: "force", label: "Force-directed", icon: "hub" },
  { id: "radial", label: "Radial", icon: "radio_button_unchecked" },
];

const ENTITY_FILTERS: { id: string; label: string; kinds: GraphNodeKind[] }[] = [
  { id: "figma", label: "Figma Frames / UI", kinds: ["design"] },
  { id: "github", label: "GitHub PRs, Code & Tests", kinds: ["pr", "code", "test"] },
  { id: "jira", label: "Jira Tickets", kinds: ["requirement"] },
  { id: "finding", label: "Findings", kinds: ["finding"] },
];

const RELATIONS: EdgeRelation[] = [
  "SATISFIES",
  "REFERENCES",
  "IMPLEMENTS",
  "VERIFIES",
  "BLOCKS",
  "TRIGGERS",
];

const ELIGIBILITIES: LinkEligibility[] = [
  "confirmed",
  "system-confirmed",
  "inferred",
  "unconfirmed",
];

type Preset = "divergences" | "neighbourhood";

function eligibilityCaption(edge: ExplorerEdge): string {
  const pct = Math.round(edge.confidence * 100);
  if (edge.eligibility === "confirmed") {
    return edge.provenance === "manual" ? "Manual link" : "100% Deterministic";
  }
  if (edge.eligibility === "system-confirmed") return `${pct}% System-confirmed`;
  if (edge.eligibility === "inferred") return `${pct}% Inferred`;
  return `${pct}% Unconfirmed`;
}

/**
 * `/graph/artifacts` — the three-pane artefact explorer: filter & provenance
 * drawer, pan-and-zoom topology canvas with three layouts, node inspector.
 */
export function ArtifactGraphExplorer({ graph }: { graph: ExplorerGraph }) {
  const [layout, setLayout] = useState<LayoutMode>("layered");
  const [showFilters, setShowFilters] = useState(true);
  const [focusQuery, setFocusQuery] = useState("");
  const [focusMiss, setFocusMiss] = useState(false);
  const [cutoff, setCutoff] = useState(70);
  const [enabledKinds, setEnabledKinds] = useState<Set<GraphNodeKind>>(
    new Set(["design", "pr", "code", "requirement", "finding", "test"]),
  );
  const [enabledEligibility, setEnabledEligibility] = useState<Set<LinkEligibility>>(
    new Set(ELIGIBILITIES),
  );
  const [preset, setPreset] = useState<Preset | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  const stats = useMemo(() => graphStats(graph), [graph]);
  const allEdges = graph.edges;
  const drift = useMemo(() => driftBlastRadius(graph), [graph]);

  /** Node ids a quick-focus preset keeps: a node and everything one hop from it. */
  const presetIds = useMemo(() => {
    if (!preset) return null;
    const seeds =
      preset === "divergences"
        ? graph.nodes.filter((node) => node.conflict).map((node) => node.id)
        : selectedId
          ? [selectedId]
          : [];
    const ids = new Set(seeds);
    for (const edge of graph.edges) {
      if (seeds.includes(edge.from)) ids.add(edge.to);
      if (seeds.includes(edge.to)) ids.add(edge.from);
    }
    return ids;
  }, [preset, graph, selectedId]);

  const visibleNodes = useMemo(
    () =>
      graph.nodes.filter(
        (node) => enabledKinds.has(node.kind) && (!presetIds || presetIds.has(node.id)),
      ),
    [graph, enabledKinds, presetIds],
  );

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () =>
      allEdges.filter((edge) => {
        const endpointsVisible = visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
        return (
          endpointsVisible &&
          enabledEligibility.has(edge.eligibility) &&
          edge.confidence * 100 >= cutoff
        );
      }),
    [allEdges, visibleNodeIds, enabledEligibility, cutoff],
  );

  /** Edges between two canvas nodes. */
  const canvasEdges = useMemo(
    () =>
      visibleEdges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)),
    [visibleEdges, visibleNodeIds],
  );

  const positions = useMemo(
    () => computeLayout(layout, visibleNodes, canvasEdges),
    [layout, visibleNodes, canvasEdges],
  );

  function focusNode() {
    const query = focusQuery.trim().toLowerCase();
    if (!query) return;
    const match = visibleNodes.find(
      (node) =>
        node.label.toLowerCase().includes(query) || node.locator.toLowerCase().includes(query),
    );
    setFocusMiss(!match);
    if (match) setSelectedId(match.id);
  }

  const selected = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0] ?? null;

  /** First diverging node in view, if the graph carries one — drives the alert pill. */
  const divergenceNode = visibleNodes.find((node) => node.conflict) ?? null;
  const conflictCount = graph.nodes.filter((node) => node.conflict).length;

  const selectedEdges = useMemo(() => {
    const entries: { edge: ExplorerEdge; other: ExplorerNode | null }[] = [];
    if (!selected) return entries;
    for (const edge of visibleEdges) {
      if (edge.to === selected.id) {
        entries.push({
          edge,
          other: graph.nodes.find((node) => node.id === edge.from) ?? null,
        });
      } else if (edge.from === selected.id) {
        entries.push({ edge, other: graph.nodes.find((node) => node.id === edge.to) ?? null });
      }
    }
    return entries;
  }, [visibleEdges, selected, graph]);

  const driftCause = selected ? drift.get(selected.id) : undefined;
  const relationCounts = RELATIONS.map((relation) => ({
    relation,
    count: allEdges.filter((edge) => edge.label === relation).length,
  })).filter((entry) => entry.count > 0);

  return (
    <>
      {/* Top context & utility action bar */}
      <div className="flex flex-wrap items-center justify-between gap-gutter py-stack-comfortable border-b border-outline-variant/30">
        <div className="flex items-center gap-stack-comfortable flex-wrap">
          <div className="flex items-center gap-stack-compact text-muted font-mono-code text-body-sm">
            <span>Workspace</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface-variant font-medium">
              {[...new Set(graph.nodes.map((node) => node.subtitle))].join(" · ") || "—"}
            </span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-secondary font-semibold">Artifact Graph</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/40" />
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps tracking-wider uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            Graph Ingest Live
          </span>
        </div>

        <div className="flex items-center gap-stack-compact flex-wrap">
          <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-lg border border-outline-variant/30">
            {LAYOUTS.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setLayout(mode.id)}
                className={`px-2.5 py-1 rounded font-body-sm text-[12px] transition-colors flex items-center gap-1 ${
                  layout === mode.id
                    ? "bg-surface-container text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name={mode.icon} className="text-[15px]" />
                {mode.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-outline-variant/40" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-body-sm text-[12px] font-medium text-on-surface transition-colors shadow-sm">
            <Icon name="download" className="text-[16px] text-primary" />
            Export Subgraph
          </button>
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container text-on-primary-container font-body-sm text-[12px] font-semibold hover:brightness-110 transition-all shadow-sm"
          >
            <Icon name="tune" className="text-[16px]" />
            {showFilters ? "Hide Filters" : "Filter Nodes"}
          </button>
        </div>
      </div>

      {/* Primary workspace grid: filters · canvas · inspector */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* LEFT: filter & provenance drawer */}
        {showFilters ? (
          <aside className="col-span-12 lg:col-span-3 flex flex-col bg-surface-container-low/95 rounded-xl border border-outline-variant/30 overflow-hidden shadow-lg backdrop-blur-md h-[720px] lg:h-[calc(100vh-248px)] lg:min-h-[640px]">
            <div className="p-4 border-b border-outline-variant/25 bg-surface-container-lowest/60">
              <div className="relative w-full">
                <Icon
                  name="filter_center_focus"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px]"
                />
                <input
                  className={`w-full pl-8 pr-12 py-1.5 bg-surface-container rounded border text-on-surface placeholder:text-muted font-mono-code text-[12px] focus:outline-none focus:border-primary transition-colors ${
                    focusMiss ? "border-error" : "border-outline-variant/30"
                  }`}
                  placeholder="Focus on node / artifact ID..."
                  type="text"
                  value={focusQuery}
                  onChange={(event) => {
                    setFocusQuery(event.target.value);
                    setFocusMiss(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") focusNode();
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono-code text-micro-label text-muted px-1.5 py-0.5 rounded bg-surface-container-highest">
                  ↵
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-body-sm">
              {/* Live graph telemetry */}
              <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest/70 p-3.5 rounded-lg border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="font-mono-code text-eyebrow text-muted uppercase tracking-wider">
                    Nodes
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {stats.nodes}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono-code text-eyebrow text-muted uppercase tracking-wider">
                    Edges
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    {stats.edges}
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-outline-variant/20">
                  <span className="font-mono-code text-eyebrow text-tertiary uppercase tracking-wider">
                    Orphans
                  </span>
                  <span className="font-mono-code text-body-sm text-tertiary font-bold">
                    {stats.orphans} ticket{stats.orphans === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-outline-variant/20">
                  <span className="font-mono-code text-eyebrow text-error uppercase tracking-wider">
                    Divergence
                  </span>
                  <span className="font-mono-code text-body-sm text-error font-bold animate-pulse">
                    {conflictCount} conflict{conflictCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* Entity type filters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                    Entity Types
                  </span>
                  <button
                    className="font-mono-code text-micro-label text-primary hover:underline"
                    onClick={() =>
                      setEnabledKinds(
                        new Set(["design", "pr", "code", "requirement", "finding", "test"]),
                      )
                    }
                  >
                    Select All
                  </button>
                </div>
                <div className="space-y-1.5">
                  {ENTITY_FILTERS.map((filter) => {
                    const active = filter.kinds.every((kind) => enabledKinds.has(kind));
                    const count = graph.nodes.filter((node) =>
                      filter.kinds.includes(node.kind),
                    ).length;
                    return (
                      <label
                        key={filter.id}
                        className="flex items-center justify-between px-3 py-2 rounded hover:bg-surface-container transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              setEnabledKinds((previous) => {
                                const next = new Set(previous);
                                for (const kind of filter.kinds) {
                                  if (active) next.delete(kind);
                                  else next.add(kind);
                                }
                                return next;
                              });
                            }}
                            className="rounded accent-primary cursor-pointer"
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              filter.id === "figma"
                                ? "bg-tertiary"
                                : filter.id === "github"
                                  ? "bg-secondary"
                                  : filter.id === "jira"
                                    ? "bg-primary"
                                    : "bg-error"
                            }`}
                          />
                          <span className="text-on-surface text-[12px] group-hover:text-primary transition-colors">
                            {filter.label}
                          </span>
                        </span>
                        <span className="font-mono-code text-micro-label px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Edge semantics */}
              <div className="space-y-4 pt-3 border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                  Edge Semantics
                </span>
                <div className="space-y-3 font-mono-code text-micro-label">
                  {relationCounts.map(({ relation, count }) => (
                    <div
                      key={relation}
                      className="flex items-center justify-between px-3 py-1.5 bg-surface-container-lowest/50 rounded"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-on-surface">{relation}</span>
                      </span>
                      <span className="text-muted">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link eligibility + confidence cutoff */}
              <div className="space-y-4 pt-3 border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                  Link Eligibility
                </span>
                <div className="space-y-4">
                  {ELIGIBILITIES.map((eligibility) => {
                    const style = eligibilityStyle[eligibility];
                    const count = allEdges.filter(
                      (edge) => edge.eligibility === eligibility,
                    ).length;
                    const active = enabledEligibility.has(eligibility);
                    return (
                      <label
                        key={eligibility}
                        className="flex items-center justify-between text-[12px] cursor-pointer"
                      >
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <svg width="22" height="8" aria-hidden>
                            <line
                              x1="1"
                              y1="4"
                              x2="21"
                              y2="4"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeDasharray={style.dash}
                              className={style.strokeClass}
                            />
                          </svg>
                          {style.label} ({count})
                        </span>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() =>
                            setEnabledEligibility((previous) => {
                              const next = new Set(previous);
                              if (next.has(eligibility)) next.delete(eligibility);
                              else next.add(eligibility);
                              return next;
                            })
                          }
                          className={`rounded cursor-pointer ${style.accentClass}`}
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 bg-surface-container-lowest/50 p-3.5 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono-code text-micro-label text-muted">
                      Confidence Cutoff
                    </span>
                    <span className="font-mono-code text-micro-label text-tertiary font-bold">
                      {cutoff}%
                    </span>
                  </div>
                  <input
                    className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-tertiary"
                    min={50}
                    max={95}
                    step={5}
                    value={cutoff}
                    onChange={(event) => setCutoff(Number(event.target.value))}
                    type="range"
                  />
                  <div className="flex justify-between font-mono-code text-micro-label text-muted mt-1.5">
                    <span>Loose (50%)</span>
                    <span>Strict (95%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick presets */}
            <div className="p-3.5 border-t border-outline-variant/25 bg-surface-container-lowest/80 flex items-center justify-between">
              <span className="font-mono-code text-micro-label text-muted">Quick Focus:</span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setPreset((value) => (value === "divergences" ? null : "divergences"))
                  }
                  className={`px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono-code text-micro-label border ${
                    preset === "divergences"
                      ? "text-error border-error"
                      : "text-error border-error/30"
                  }`}
                >
                  Divergences
                </button>
                <button
                  onClick={() =>
                    setPreset((value) => (value === "neighbourhood" ? null : "neighbourhood"))
                  }
                  disabled={!selectedId}
                  title={selectedId ? "Selected node and its direct links" : "Select a node first"}
                  className={`px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono-code text-micro-label border disabled:opacity-40 ${
                    preset === "neighbourhood"
                      ? "text-secondary border-secondary"
                      : "text-secondary border-secondary/30"
                  }`}
                >
                  Selected ±1
                </button>
              </div>
            </div>
          </aside>
        ) : null}

        {/* CENTER: topology canvas */}
        <main
          className={`col-span-12 ${
            showFilters ? "lg:col-span-6" : "lg:col-span-9"
          } flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/30 relative overflow-hidden shadow-2xl h-[720px] lg:h-[calc(100vh-248px)] lg:min-h-[640px]`}
        >
          {graph.nodes.length === 0 ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <Icon name="hub" className="text-[32px] text-muted mb-2" />
                <p className="text-body-sm text-muted">No artifacts ingested yet.</p>
              </div>
            </div>
          ) : null}
          <GraphCanvas
            nodes={visibleNodes}
            edges={canvasEdges}
            positions={positions}
            selectedId={selectedId || null}
            onSelect={(id) => setSelectedId(id ?? "")}
            alwaysLabelEdges={visibleNodes.length <= 12}
            controlsPosition="bottom-left"
            minimapPosition="bottom-right"
          >
            <Panel position="top-left">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2 py-1 rounded bg-surface-container/85 border border-outline-variant/30 backdrop-blur font-mono-code text-micro-label text-muted">
                  Nodes: <span className="text-on-surface">{visibleNodes.length}</span> · Edges:{" "}
                  <span className="text-on-surface">{canvasEdges.length}</span>
                </div>
                {divergenceNode ? (
                  <button
                    onClick={() => setSelectedId(divergenceNode.id)}
                    className="px-2 py-1 rounded bg-error/10 border border-error/30 font-mono-code text-micro-label text-error flex items-center gap-1"
                  >
                    <Icon name="warning" className="text-[12px] animate-pulse" />
                    {divergenceNode.label} Divergence Alert
                  </button>
                ) : null}
              </div>
            </Panel>

          </GraphCanvas>
        </main>

        {/* RIGHT: node inspector */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col bg-surface-container-low/95 rounded-xl border border-outline-variant/30 overflow-hidden shadow-lg backdrop-blur-md h-[720px] lg:h-[calc(100vh-248px)] lg:min-h-[640px]">
          {selected === null ? (
            <div className="flex-1 grid place-items-center p-6 text-center">
              <div>
                <Icon name="interesting" className="text-[32px] text-muted mb-2" />
                <p className="font-body-sm text-body-sm text-muted">No artifact selected.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-outline-variant/25 bg-surface-container-lowest/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                    Node Inspector
                  </span>
                  {selected.kind === "finding" ? (
                    <Badge tone="critical">Finding</Badge>
                  ) : (
                    <ToolPill tool={selected.tool ?? "github"}>{selected.kindLabel}</ToolPill>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                    {selected.label}
                  </h2>
                </div>
                <div className="font-mono-code text-micro-label text-muted mt-0.5 truncate">
                  {selected.locator}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-body-sm">
                {/* Provenance metadata */}
                <div className="bg-surface-container-lowest/70 rounded-lg p-3.5 border border-outline-variant/20 space-y-3 text-[12px]">
                  {selected.fields.map((field) => (
                    <div key={field.label} className="flex justify-between gap-3">
                      <span className="text-muted">{field.label}</span>
                      <span
                        className={`font-mono-code truncate ${
                          field.tone ? toneClasses[field.tone].text : "text-on-surface"
                        }`}
                      >
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Blast radius / eligibility summary */}
                {driftCause ? (
                  <div className="space-y-3">
                    <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider flex items-center justify-between">
                      Blast Radius Impact
                      <span className="text-error font-mono-code text-micro-label">DRIFT ACTIVE</span>
                    </span>
                    <div className="bg-error-container/20 border border-error/30 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 text-error font-semibold text-[12px]">
                        <Icon name="crisis_alert" className="text-[16px]" />
                        {driftCause.sourceId === selected.id ? "This artifact carries an open finding." : `Linked to ${driftCause.sourceLabel}, which carries an open finding.`}
                      </div>
                      <p className="font-body-sm text-micro-label text-on-surface-variant mt-1.5">
                        {drift.size} artifacts sit within one link of an open finding.
                      </p>
                      <div className="mt-3 pt-3 border-t border-error/20 flex items-center justify-between">
                        <span className="font-mono-code text-micro-label text-muted">Conflict Reference:</span>
                        <a href={`/conflicts/${driftCause.findingId}`} className="font-mono-code text-micro-label text-primary hover:underline">
                          {driftCause.findingId.slice(0, 8)}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                      Link Eligibility
                    </span>
                    <div className="bg-surface-container-lowest/70 border border-outline-variant/20 rounded-lg p-3.5">
                      <p className="font-body-sm text-micro-label text-on-surface-variant">
                        <span className="text-secondary font-bold">
                          {
                            selectedEdges.filter((entry) => isDecisive(entry.edge.eligibility))
                              .length
                          }
                        </span>{" "}
                        of <span className="text-on-surface font-bold">{selectedEdges.length}</span>{" "}
                        links decisive.
                      </p>
                    </div>
                  </div>
                )}

                {/* Connected edges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                      Connected Edges ({selectedEdges.length})
                    </span>
                    <span className="font-mono-code text-micro-label text-muted">
                      {selectedEdges.filter((entry) => entry.edge.from === selected.id).length} Out
                      / {selectedEdges.filter((entry) => entry.edge.to === selected.id).length} In
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedEdges.length === 0 ? (
                      <p className="font-mono-code text-micro-label text-tertiary p-3 rounded bg-surface-container rounded-lg border border-outline-variant/20">
                        Orphan node
                      </p>
                    ) : (
                      selectedEdges.map(({ edge, other }) => (
                        <div
                          key={`${edge.from}-${edge.to}-${edge.label}`}
                          className="p-3 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-mono-code text-micro-label px-1 py-0.2 rounded font-bold ${
                                edge.eligibility === "inferred" ||
                                edge.eligibility === "unconfirmed"
                                  ? "bg-tertiary/20 text-tertiary"
                                  : "bg-primary/15 text-primary"
                              }`}
                            >
                              {edge.label}
                            </span>
                            <span
                              className={`font-mono-code text-micro-label ${
                                isDecisive(edge.eligibility) ? "text-secondary" : "text-tertiary"
                              }`}
                            >
                              {eligibilityCaption(edge)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-micro-label gap-2">
                            <button
                              onClick={() => other && setSelectedId(other.id)}
                              className="text-on-surface truncate font-medium hover:text-primary transition-colors text-left"
                            >
                              {other ? `${other.kindLabel} ${other.label}` : "—"}
                            </button>
                            <Icon
                              name={
                                edge.eligibility === "inferred" ||
                                edge.eligibility === "unconfirmed"
                                  ? "psychology"
                                  : "link"
                              }
                              className={`text-[14px] shrink-0 ${
                                edge.eligibility === "inferred" ||
                                edge.eligibility === "unconfirmed"
                                  ? "text-tertiary"
                                  : "text-muted"
                              }`}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Inspector actions */}
              <div className="p-4 border-t border-outline-variant/25 bg-surface-container-lowest/80 space-y-3">
                <button className="w-full py-2 px-3 rounded bg-primary-container text-on-primary-container font-body-sm text-[12px] font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                  <span>{selected.action}</span>
                  <Icon name="open_in_new" className="text-[14px]" />
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button className="py-1.5 px-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-body-sm text-micro-label font-medium flex items-center justify-center gap-1 transition-colors">
                    <Icon name="add_link" className="text-[13px] text-secondary" />
                    Link Edge +
                  </button>
                  <button className="py-1.5 px-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-error font-body-sm text-micro-label font-medium flex items-center justify-center gap-1 transition-colors">
                    <Icon name="published_with_changes" className="text-[13px]" />
                    Re-verify
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
