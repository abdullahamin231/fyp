"use client";

import { useMemo, useState } from "react";
import { Badge, ToolPill } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { edgeLabelAnchor, edgePath, type Point } from "./geometry";
import { eligibilityStyle, kindIcon, kindTone, toneClasses, toolName } from "./graph-styles";
import type {
  EdgeRelation,
  ExplorerEdge,
  ExplorerGraph,
  ExplorerNode,
  LinkProposal,
} from "@/lib/mock/graph";
import { graphStats, isDecisive } from "@/lib/mock/graph";
import type { GraphNodeKind, LinkEligibility } from "@/lib/types";

/** Canvas stage (px) — cards centre on their mock coordinates. */
const STAGE_W = 660;
const STAGE_H = 580;

type LayoutMode = "hierarchical" | "force" | "radial";

const LAYOUTS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: "hierarchical", label: "Hierarchical", icon: "account_tree" },
  { id: "force", label: "Force-directed", icon: "hub" },
  { id: "radial", label: "Radial", icon: "radio_button_unchecked" },
];

const ENTITY_FILTERS: { id: string; label: string; kinds: GraphNodeKind[] }[] = [
  { id: "figma", label: "Figma Frames / UI", kinds: ["design"] },
  { id: "github", label: "GitHub PRs & Code", kinds: ["pr", "code"] },
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

const ELIGIBILITIES: LinkEligibility[] = ["confirmed", "system-confirmed", "inferred", "unconfirmed"];

const PRESETS: Record<string, string[]> = {
  drift: ["FIG-A", "PR-142", "REQ-A", "CONF-1048"],
  checkout: ["FIG-A", "PR-142", "REQ-A", "SPEC", "CONF-1048", "GHOST"],
};

function eligibilityCaption(edge: ExplorerEdge): string {
  const pct = Math.round(edge.confidence * 100);
  if (edge.eligibility === "confirmed") {
    return edge.provenance === "manual" ? "Manual link" : "100% Deterministic";
  }
  if (edge.eligibility === "system-confirmed") return `${pct}% System-confirmed`;
  if (edge.eligibility === "inferred") return `${pct}% Inferred`;
  return `${pct}% Unconfirmed`;
}

/** Deterministic alternate layouts so the layout pills actually redraw. */
function computeLayout(
  nodes: ExplorerNode[],
  mode: LayoutMode,
  origin: Point,
): Map<string, Point> {
  const map = new Map<string, Point>();
  if (mode === "hierarchical") {
    for (const node of nodes) map.set(node.id, { x: node.x, y: node.y });
    return map;
  }
  if (mode === "force") {
    const ordered = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
    ordered.forEach((node, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      map.set(node.id, {
        x: 120 + column * 210 + ((index * 37) % 46) - 23,
        y: 105 + row * 175 + ((index * 23) % 40) - 20,
      });
    });
    return map;
  }
  const radiusX = 235;
  const radiusY = 215;
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
    map.set(node.id, {
      x: origin.x + Math.cos(angle) * radiusX,
      y: origin.y + Math.sin(angle) * radiusY,
    });
  });
  return map;
}

function ArtifactNodeCard({
  node,
  selected,
  onSelect,
}: {
  node: ExplorerNode;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const tone = toneClasses[kindTone[node.kind]];
  const rich = node.kind === "design" || node.kind === "pr" || node.kind === "requirement";

  if (node.kind === "finding") {
    return (
      <button
        onClick={() => onSelect(node.id)}
        className="absolute w-40 p-2.5 rounded-lg bg-surface-container-high border-2 border-error shadow-2xl text-left cursor-pointer hover:scale-105 transition-transform duration-150"
        style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-mono-code text-[10px] font-bold">
            <Icon name="crisis_alert" className="text-[11px]" />
            Finding
          </span>
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
        </div>
        <div className="font-body-sm font-semibold text-on-surface truncate">{node.label}</div>
        <div className="mt-1 text-[10px] font-mono-code text-error">P1 · review required</div>
      </button>
    );
  }

  if (rich) {
    return (
      <button
        onClick={() => onSelect(node.id)}
        className={`absolute w-44 p-2.5 rounded-lg bg-surface-container border-2 text-left cursor-pointer transition-all duration-150 hover:scale-105 ${
          node.conflict
            ? "border-error ring-4 ring-error/30 shadow-2xl animate-pulse"
            : `${tone.border} shadow-xl`
        } ${selected ? "ring-4 ring-primary/30 border-primary" : ""}`}
        style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <ToolPill tool={node.tool ?? "github"}>{node.kindLabel}</ToolPill>
          <span
            className={`w-2 h-2 rounded-full ${
              node.conflict ? "bg-error" : "bg-secondary"
            }`}
          />
        </div>
        <div className="font-body-sm font-semibold text-on-surface truncate">{node.label}</div>
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono-code text-outline gap-2">
          <span className="truncate">{node.subtitle.split(" · ")[1] ?? node.subtitle}</span>
          <span
            className={`shrink-0 font-medium ${
              node.metaTone ? toneClasses[node.metaTone].text : "text-outline"
            }`}
          >
            {node.meta}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`absolute w-40 p-2 rounded-lg bg-surface-container border shadow-md text-left cursor-pointer transition-all hover:border-primary/60 ${
        selected ? "ring-4 ring-primary/30 border-primary" : "border-outline-variant/40"
      }`}
      style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
    >
      <div className="flex items-center gap-1 font-mono-code text-[10px] text-on-surface-variant">
        <Icon name={kindIcon[node.kind]} className={`${tone.text} text-[12px]`} />
        <span className="truncate">{node.label}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] mt-0.5 gap-2">
        <span
          className={`truncate font-mono-code text-[10px] ${
            node.metaTone ? toneClasses[node.metaTone].text : "text-outline"
          }`}
        >
          {node.meta}
        </span>
        <span className="shrink-0 text-outline text-[10px]">{toolName(node.tool)}</span>
      </div>
    </button>
  );
}

/**
 * `/graph/artifacts` — the three-pane artefact explorer from the Stitch
 * screen: filter & provenance drawer, topology canvas, node inspector.
 */
export function ArtifactGraphExplorer({
  graph,
  proposal,
  driftAffected,
}: {
  graph: ExplorerGraph;
  proposal: LinkProposal;
  driftAffected: string[];
}) {
  const [layout, setLayout] = useState<LayoutMode>("hierarchical");
  const [showFilters, setShowFilters] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [cutoff, setCutoff] = useState(70);
  const [enabledKinds, setEnabledKinds] = useState<Set<GraphNodeKind>>(
    new Set(["design", "pr", "code", "requirement", "finding", "test"]),
  );
  const [enabledEligibility, setEnabledEligibility] = useState<Set<LinkEligibility>>(
    new Set(ELIGIBILITIES),
  );
  const [preset, setPreset] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("FIG-A");
  const [proposalState, setProposalState] = useState<"pending" | "confirmed" | "dismissed">(
    "pending",
  );

  const stats = useMemo(() => graphStats(graph), [graph]);
  const positions = useMemo(
    () => computeLayout(graph.nodes, layout, { x: STAGE_W / 2, y: STAGE_H / 2 }),
    [graph, layout],
  );

  const proposalPoint = useMemo(() => {
    const origin = positions.get(proposal.from) ?? { x: STAGE_W / 2, y: STAGE_H / 2 };
    const half = { w: 116, h: 56 };
    return {
      x: Math.min(
        Math.max(origin.x + proposal.offsetX, half.w),
        STAGE_W - half.w,
      ),
      y: Math.min(
        Math.max(origin.y + proposal.offsetY, half.h),
        STAGE_H - half.h,
      ),
    };
  }, [positions, proposal]);

  /** Base edge list = graph edges + the (stateful) Slack link proposal. */
  const allEdges = useMemo<ExplorerEdge[]>(() => {
    if (proposalState === "dismissed") return graph.edges;
    const confirmed = proposalState === "confirmed";
    const proposalEdge: ExplorerEdge = {
      from: proposal.from,
      to: proposal.id,
      label: proposal.relation,
      eligible: confirmed,
      eligibility: confirmed ? "confirmed" : "inferred",
      confidence: confirmed ? 1 : proposal.confidence,
      provenance: confirmed ? "manual" : "inferred",
      confirmedBy: confirmed ? "Alex Rivera" : undefined,
    };
    return [...graph.edges, proposalEdge];
  }, [graph, proposal, proposalState]);

  const visibleNodes = useMemo(
    () =>
      graph.nodes.filter(
        (node) =>
          enabledKinds.has(node.kind) && (!preset || PRESETS[preset].includes(node.id)),
      ),
    [graph, enabledKinds, preset],
  );

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () =>
      allEdges.filter((edge) => {
        const proposalEndpoint = edge.to === proposal.id || edge.from === proposal.id;
        const endpointsVisible = proposalEndpoint
          ? proposalState !== "dismissed" && visibleNodeIds.has(proposal.from)
          : visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
        return (
          endpointsVisible &&
          enabledEligibility.has(edge.eligibility) &&
          edge.confidence * 100 >= cutoff
        );
      }),
    [allEdges, visibleNodeIds, enabledEligibility, cutoff, proposal.id, proposal.from, proposalState],
  );

  const selected = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0];

  const selectedEdges = useMemo(() => {
    const entries: { edge: ExplorerEdge; other: ExplorerNode | null }[] = [];
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

  const inDrift = driftAffected.includes(selected.id);
  const relationCounts = RELATIONS.map((relation) => ({
    relation,
    count: allEdges.filter((edge) => edge.label === relation).length,
  })).filter((entry) => entry.count > 0);

  return (
    <>
      {/* Top context & utility action bar */}
      <div className="flex flex-wrap items-center justify-between gap-gutter py-stack-comfortable border-b border-outline-variant/30">
        <div className="flex items-center gap-stack-comfortable flex-wrap">
          <div className="flex items-center gap-stack-compact text-outline font-mono-code text-body-sm">
            <span>Workspace</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface-variant font-medium">Core Checkout</span>
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
            <div className="p-3 border-b border-outline-variant/25 bg-surface-container-lowest/60">
              <div className="relative w-full">
                <Icon
                  name="filter_center_focus"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]"
                />
                <input
                  className="w-full pl-8 pr-12 py-1.5 bg-surface-container rounded border border-outline-variant/30 text-on-surface placeholder:text-outline font-mono-code text-[12px] focus:outline-none focus:border-primary transition-colors"
                  placeholder="Focus on node / artifact ID..."
                  type="text"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono-code text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container-highest">
                  ↵
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-body-sm">
              {/* Live graph telemetry */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest/70 p-2.5 rounded-lg border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="font-mono-code text-[10px] text-outline uppercase tracking-wider">
                    Nodes
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {stats.nodes}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono-code text-[10px] text-outline uppercase tracking-wider">
                    Edges
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    {stats.edges + (proposalState === "dismissed" ? 0 : 1)}
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-outline-variant/20">
                  <span className="font-mono-code text-[10px] text-tertiary uppercase tracking-wider">
                    Orphans
                  </span>
                  <span className="font-mono-code text-body-sm text-tertiary font-bold">
                    {stats.orphans} ticket{stats.orphans === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-outline-variant/20">
                  <span className="font-mono-code text-[10px] text-error uppercase tracking-wider">
                    Divergence
                  </span>
                  <span className="font-mono-code text-body-sm text-error font-bold animate-pulse">
                    1 conflict
                  </span>
                </div>
              </div>

              {/* Entity type filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Entity Types
                  </span>
                  <button
                    className="font-mono-code text-[10px] text-primary hover:underline"
                    onClick={() =>
                      setEnabledKinds(new Set(["design", "pr", "code", "requirement", "finding", "test"]))
                    }
                  >
                    Select All
                  </button>
                </div>
                <div className="space-y-1">
                  {ENTITY_FILTERS.map((filter) => {
                    const active = filter.kinds.every((kind) => enabledKinds.has(kind));
                    const count = graph.nodes.filter((node) => filter.kinds.includes(node.kind)).length;
                    return (
                      <label
                        key={filter.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container transition-colors cursor-pointer group"
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
                        <span className="font-mono-code text-[11px] px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Edge semantics */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Edge Semantics
                </span>
                <div className="space-y-1.5 font-mono-code text-[11px]">
                  {relationCounts.map(({ relation, count }) => (
                    <div
                      key={relation}
                      className="flex items-center justify-between px-2 py-1 bg-surface-container-lowest/50 rounded"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-on-surface">{relation}</span>
                      </span>
                      <span className="text-outline">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link eligibility + confidence cutoff */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Link Eligibility
                </span>
                <div className="space-y-2">
                  {ELIGIBILITIES.map((eligibility) => {
                    const style = eligibilityStyle[eligibility];
                    const count = allEdges.filter((edge) => edge.eligibility === eligibility).length;
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
                <p className="text-[10px] leading-relaxed text-on-surface-variant">
                  Inferred and unconfirmed links may be displayed and confirmed — they never produce
                  a decisive finding.
                </p>

                <div className="pt-2 bg-surface-container-lowest/50 p-2.5 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono-code text-[11px] text-outline">Confidence Cutoff</span>
                    <span className="font-mono-code text-[11px] text-tertiary font-bold">
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
                  <div className="flex justify-between font-mono-code text-[9px] text-outline mt-1">
                    <span>Loose (50%)</span>
                    <span>Strict (95%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick presets */}
            <div className="p-2.5 border-t border-outline-variant/25 bg-surface-container-lowest/80 flex items-center justify-between">
              <span className="font-mono-code text-[10px] text-outline">Quick Focus:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreset((value) => (value === "drift" ? null : "drift"))}
                  className={`px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono-code text-[10px] border ${
                    preset === "drift"
                      ? "text-error border-error"
                      : "text-error border-error/30"
                  }`}
                >
                  Divergences
                </button>
                <button
                  onClick={() => setPreset((value) => (value === "checkout" ? null : "checkout"))}
                  className={`px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono-code text-[10px] border ${
                    preset === "checkout"
                      ? "text-secondary border-secondary"
                      : "text-secondary border-secondary/30"
                  }`}
                >
                  Checkout
                </button>
              </div>
            </div>
          </aside>
        ) : null}

        {/* CENTER: topology canvas */}
        <main
          className={`col-span-12 ${
            showFilters ? "lg:col-span-6" : "lg:col-span-9"
          } flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/30 relative overflow-hidden group shadow-2xl h-[720px] lg:h-[calc(100vh-248px)] lg:min-h-[640px]`}
        >
          {/* Status pill */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none flex-wrap">
            <div className="px-2 py-1 rounded bg-surface-container/85 border border-outline-variant/30 backdrop-blur font-mono-code text-[10px] text-outline">
              Nodes: <span className="text-on-surface">{visibleNodes.length}</span> · Edges:{" "}
              <span className="text-on-surface">{visibleEdges.length}</span> | Zoom:{" "}
              <span className="text-secondary">{zoom}%</span>
            </div>
            <button
              onClick={() => setSelectedId("CONF-1048")}
              className="px-2 py-1 rounded bg-error/10 border border-error/30 font-mono-code text-[10px] text-error flex items-center gap-1 pointer-events-auto"
            >
              <Icon name="warning" className="text-[12px] animate-pulse" />
              CONF-1048 Divergence Alert
            </button>
          </div>

          {/* Canvas grid */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Topology viewport */}
          <div className="relative z-10 w-full h-full overflow-hidden">
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{ width: STAGE_W, height: STAGE_H }}
            >
              <div
                className="absolute inset-0 origin-center transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {visibleEdges.map((edge) => {
                    const a =
                      edge.from === proposal.id ? proposalPoint : (positions.get(edge.from) ?? null);
                    const b =
                      edge.to === proposal.id ? proposalPoint : (positions.get(edge.to) ?? null);
                    if (!a || !b) return null;
                    const style = eligibilityStyle[edge.eligibility];
                    const anchor = edgeLabelAnchor(a, b);
                    return (
                      <g key={`${edge.from}-${edge.to}-${edge.label}`}>
                        <path
                          d={edgePath(a, b)}
                          fill="none"
                          strokeWidth={isDecisive(edge.eligibility) ? 2 : 1.5}
                          strokeLinecap="round"
                          strokeDasharray={style.dash}
                          className={style.strokeClass}
                        />
                        <text
                          x={anchor.x}
                          y={anchor.y}
                          textAnchor="middle"
                          className="font-mono-code text-[9px] font-bold fill-on-surface-variant"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {visibleNodes.map((node) => (
                  <ArtifactNodeCard
                    key={node.id}
                    node={node}
                    selected={node.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}

                {/* Inferred Slack link proposal */}
                {proposalState !== "dismissed" && visibleNodeIds.has(proposal.from) ? (
                  <div
                    className="absolute w-56 p-2.5 rounded-lg border shadow-xl backdrop-blur-md"
                    style={{
                      left: proposalPoint.x,
                      top: proposalPoint.y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {proposalState === "confirmed" ? (
                      <div className="bg-surface-container-highest/90 border border-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1 text-secondary font-mono-code text-[10px] font-bold">
                            <Icon name="check_circle" className="text-[13px]" />
                            Confirmed Link
                          </span>
                          <span className="text-outline font-mono-code text-[9px]">Alex R.</span>
                        </div>
                        <div className="font-body-sm text-[12px] text-on-surface truncate">
                          {proposal.channel}: {proposal.quote}
                        </div>
                        <div className="mt-1.5 font-mono-code text-[9px] text-on-surface-variant">
                          manual · reversible · provenance recorded
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-container-highest/90 border border-tertiary">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1 text-tertiary font-mono-code text-[10px] font-bold">
                            <Icon name="cyclone" className="text-[13px] animate-spin" />
                            Inferred Link: {Math.round(proposal.confidence * 100)}%
                          </span>
                          <span className="text-outline font-mono-code text-[9px]">NLP Heuristic</span>
                        </div>
                        <div className="font-body-sm text-[12px] text-on-surface truncate">
                          {proposal.channel}: {proposal.quote}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => setProposalState("confirmed")}
                            className="flex-1 py-1 rounded bg-secondary-container text-on-secondary font-mono-code text-[10px] font-bold hover:brightness-110 transition-all flex items-center justify-center gap-0.5"
                          >
                            <Icon name="check" className="text-[12px]" /> Confirm
                          </button>
                          <button
                            onClick={() => setProposalState("dismissed")}
                            className="flex-1 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-outline hover:text-on-surface font-mono-code text-[10px] flex items-center justify-center gap-0.5 transition-all"
                          >
                            <Icon name="close" className="text-[12px]" /> Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Canvas utilities */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2">
            <div className="w-32 h-20 bg-surface-container-lowest/90 border border-outline-variant/40 rounded-lg p-1.5 shadow-xl backdrop-blur hidden md:block">
              <div className="relative w-full h-full bg-surface-container-low rounded overflow-hidden">
                {graph.nodes.map((node) => (
                  <span
                    key={node.id}
                    className={`absolute w-3 h-1.5 rounded-xs ${
                      kindTone[node.kind] === "primary"
                        ? "bg-primary"
                        : kindTone[node.kind] === "secondary"
                          ? "bg-secondary"
                          : kindTone[node.kind] === "tertiary"
                            ? "bg-tertiary"
                            : "bg-error"
                    }`}
                    style={{
                      left: `${(node.x / STAGE_W) * 120}px`,
                      top: `${(node.y / STAGE_H) * 72}px`,
                    }}
                  />
                ))}
                <span className="absolute top-0.5 left-1 w-20 h-10 border border-secondary/70 bg-secondary/10 rounded-xs pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center bg-surface-container/90 border border-outline-variant/40 rounded-lg p-0.5 backdrop-blur shadow-lg">
              <button
                className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                title="Zoom In"
                onClick={() => setZoom((value) => Math.min(200, value + 25))}
              >
                <Icon name="add" className="text-[16px]" />
              </button>
              <div className="h-3 w-px bg-outline-variant/40" />
              <button
                className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                title="Zoom Out"
                onClick={() => setZoom((value) => Math.max(50, value - 25))}
              >
                <Icon name="remove" className="text-[16px]" />
              </button>
              <div className="h-3 w-px bg-outline-variant/40" />
              <button
                className="px-2 py-1 rounded hover:bg-surface-container-high font-mono-code text-[11px] text-on-surface transition-colors"
                title="Reset View"
                onClick={() => setZoom(100)}
              >
                {zoom}%
              </button>
              <div className="h-3 w-px bg-outline-variant/40" />
              <button
                className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                title="Fit to Screen"
                onClick={() => setZoom(100)}
              >
                <Icon name="fit_screen" className="text-[16px]" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT: node inspector */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col bg-surface-container-low/95 rounded-xl border border-outline-variant/30 overflow-hidden shadow-lg backdrop-blur-md h-[720px] lg:h-[calc(100vh-248px)] lg:min-h-[640px]">
          <div className="p-3 border-b border-outline-variant/25 bg-surface-container-lowest/60">
            <div className="flex items-center justify-between mb-1">
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
            <div className="font-mono-code text-[11px] text-outline mt-0.5 truncate">
              {selected.locator}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-body-sm">
            {/* Provenance metadata */}
            <div className="bg-surface-container-lowest/70 rounded-lg p-2.5 border border-outline-variant/20 space-y-1.5 text-[12px]">
              {selected.fields.map((field) => (
                <div key={field.label} className="flex justify-between gap-3">
                  <span className="text-outline">{field.label}</span>
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
            {inDrift ? (
              <div className="space-y-1.5">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider flex items-center justify-between">
                  Blast Radius Impact
                  <span className="text-error font-mono-code text-[10px]">DRIFT ACTIVE</span>
                </span>
                <div className="bg-error-container/20 border border-error/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-error font-semibold text-[12px]">
                    <Icon name="crisis_alert" className="text-[16px]" />
                    1 PR &amp; 2 Tickets Affected by Drift
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                    Field{" "}
                    <code className="font-mono-code bg-surface-container-lowest px-1 py-0.5 rounded text-error">
                      securityBadges
                    </code>{" "}
                    removed in Figma v3.2 but actively rendered in PR #142 commit{" "}
                    <code className="font-mono-code text-primary">8ef2a1</code>.
                  </p>
                  <div className="mt-2 pt-2 border-t border-error/20 flex items-center justify-between">
                    <span className="font-mono-code text-[10px] text-outline">
                      Conflict Reference:
                    </span>
                    <button
                      onClick={() => setSelectedId("CONF-1048")}
                      className="font-mono-code text-[10px] text-error hover:underline font-bold flex items-center gap-0.5"
                    >
                      #CONF-1048 <Icon name="north_east" className="text-[11px]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Link Eligibility
                </span>
                <div className="bg-surface-container-lowest/70 border border-outline-variant/20 rounded-lg p-2.5">
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    <span className="text-secondary font-bold">
                      {selectedEdges.filter((entry) => isDecisive(entry.edge.eligibility)).length}
                    </span>{" "}
                    of{" "}
                    <span className="text-on-surface font-bold">{selectedEdges.length}</span> links
                    decisive — inferred or unconfirmed links are displayed but never decide a
                    finding.
                  </p>
                </div>
              </div>
            )}

            {/* Connected edges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Connected Edges ({selectedEdges.length})
                </span>
                <span className="font-mono-code text-[10px] text-outline">
                  {selectedEdges.filter((entry) => entry.edge.from === selected.id).length} Out /{" "}
                  {selectedEdges.filter((entry) => entry.edge.to === selected.id).length} In
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedEdges.length === 0 ? (
                  <p className="font-mono-code text-[11px] text-tertiary p-2 rounded bg-surface-container rounded-lg border border-outline-variant/20">
                    Orphan node — no eligible anchor yet (policy P2 watches this state).
                  </p>
                ) : (
                  selectedEdges.map(({ edge, other }) => (
                    <div
                      key={`${edge.from}-${edge.to}-${edge.label}`}
                      className="p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono-code text-[10px] px-1 py-0.2 rounded font-bold ${
                            edge.eligibility === "inferred" || edge.eligibility === "unconfirmed"
                              ? "bg-tertiary/20 text-tertiary"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {edge.label}
                        </span>
                        <span
                          className={`font-mono-code text-[10px] ${
                            isDecisive(edge.eligibility) ? "text-secondary" : "text-tertiary"
                          }`}
                        >
                          {eligibilityCaption(edge)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <button
                          onClick={() => other && setSelectedId(other.id)}
                          className="text-on-surface truncate font-medium hover:text-primary transition-colors text-left"
                        >
                          {other ? `${other.kindLabel} ${other.label}` : "Slack #core-checkout"}
                        </button>
                        <Icon
                          name={
                            edge.eligibility === "inferred" || edge.eligibility === "unconfirmed"
                              ? "psychology"
                              : "link"
                          }
                          className={`text-[14px] shrink-0 ${
                            edge.eligibility === "inferred" || edge.eligibility === "unconfirmed"
                              ? "text-tertiary"
                              : "text-outline"
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
          <div className="p-3 border-t border-outline-variant/25 bg-surface-container-lowest/80 space-y-2">
            <button className="w-full py-2 px-3 rounded bg-primary-container text-on-primary-container font-body-sm text-[12px] font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-sm">
              <span>{selected.action}</span>
              <Icon name="open_in_new" className="text-[14px]" />
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <button className="py-1.5 px-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-body-sm text-[11px] font-medium flex items-center justify-center gap-1 transition-colors">
                <Icon name="add_link" className="text-[13px] text-secondary" />
                Link Edge +
              </button>
              <button className="py-1.5 px-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-error font-body-sm text-[11px] font-medium flex items-center justify-center gap-1 transition-colors">
                <Icon name="published_with_changes" className="text-[13px]" />
                Re-verify
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
