"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@xyflow/react";
import { GraphCanvas } from "./graph-canvas";
import { eligibilityStyle, kindIcon, kindTone, toneClasses } from "./graph-styles";
import { layeredLayout } from "./layout";
import type { EdgeRelation, ExplorerEdge, ExplorerGraph, ExplorerNode } from "@/lib/domain/graph";
import type { GraphNodeKind, LinkEligibility } from "@/lib/types";

const RELATIONS: EdgeRelation[] = ["SATISFIES", "REFERENCES", "IMPLEMENTS", "VERIFIES", "TRIGGERS"];

const SOURCE_FILTERS: { id: string; label: string; kinds: GraphNodeKind[] }[] = [
  { id: "github", label: "GitHub PRs & Code", kinds: ["pr", "code", "test"] },
  { id: "figma", label: "Figma Frames", kinds: ["design"] },
  { id: "jira", label: "Jira Tickets", kinds: ["requirement"] },
  { id: "finding", label: "Findings", kinds: ["finding"] },
];

const ALL_KINDS: GraphNodeKind[] = ["requirement", "code", "test", "design", "pr", "finding"];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function countFor(graph: ExplorerGraph, kinds: GraphNodeKind[]): number {
  return graph.nodes.filter((node) => kinds.includes(node.kind)).length;
}

/**
 * `/graph` — the relationship explorer: a pan-and-zoom canvas laid out as the
 * evidence chain (ticket → criteria → change → code → tests), a collapsible
 * filter column and a slide-in detail panel.
 */
export function RelationshipExplorer({ graph }: { graph: ExplorerGraph }) {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enabledKinds, setEnabledKinds] = useState<Set<GraphNodeKind>>(new Set(ALL_KINDS));
  const [enabledRelations, setEnabledRelations] = useState<Set<EdgeRelation>>(new Set(RELATIONS));
  const [conflictsOnly, setConflictsOnly] = useState(false);
  const [edges, setEdges] = useState<ExplorerEdge[]>(graph.edges);
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /** Nodes carrying (or touching) a finding — what "Show Only Conflicts" keeps. */
  const conflictNeighbours = useMemo(() => {
    const ids = new Set(graph.nodes.filter((node) => node.findingId).map((node) => node.id));
    for (const edge of graph.edges) {
      if (ids.has(edge.from)) ids.add(edge.to);
      if (ids.has(edge.to)) ids.add(edge.from);
    }
    return ids;
  }, [graph]);

  const visibleNodes = useMemo(
    () =>
      graph.nodes.filter(
        (node) =>
          enabledKinds.has(node.kind) && (!conflictsOnly || conflictNeighbours.has(node.id)),
      ),
    [graph, enabledKinds, conflictsOnly, conflictNeighbours],
  );

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) =>
          enabledRelations.has(edge.label) &&
          visibleNodeIds.has(edge.from) &&
          visibleNodeIds.has(edge.to),
      ),
    [edges, enabledRelations, visibleNodeIds],
  );

  const positions = useMemo(
    () => layeredLayout(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges],
  );

  const selected = visibleNodes.find((node) => node.id === selectedId) ?? null;

  const selectedRelations: { edge: ExplorerEdge; other: ExplorerNode }[] = [];
  if (selected) {
    for (const edge of visibleEdges) {
      if (edge.from !== selected.id && edge.to !== selected.id) continue;
      const otherId = edge.from === selected.id ? edge.to : edge.from;
      const other = graph.nodes.find((node) => node.id === otherId);
      if (other) selectedRelations.push({ edge, other });
    }
  }

  function handleNodeClick(node: ExplorerNode) {
    if (!linkMode) {
      setSelectedId(node.id);
      return;
    }
    if (!linkSource) {
      setLinkSource(node.id);
      setNotice(`Source ${node.label} selected — now pick the target node.`);
      return;
    }
    if (linkSource === node.id) {
      setNotice("Pick a different node as the target.");
      return;
    }
    const duplicate = edges.some(
      (edge) =>
        (edge.from === linkSource && edge.to === node.id) ||
        (edge.from === node.id && edge.to === linkSource),
    );
    if (duplicate) {
      setNotice("Those two nodes are already linked.");
      setLinkSource(null);
      return;
    }
    const source = graph.nodes.find((entry) => entry.id === linkSource);
    setEdges((previous) => [
      ...previous,
      {
        from: linkSource,
        to: node.id,
        label: "REFERENCES",
        eligible: true,
        eligibility: "confirmed",
        confidence: 1,
        provenance: "manual",
        // DATA HOLE — set to the signed-in user's display name once the session API exists.
        confirmedBy: undefined,
      },
    ]);
    setNotice(
      `Manual link recorded: ${source?.label ?? linkSource} → ${node.label} · reversible, provenance attached.`,
    );
    setLinkSource(null);
    setLinkMode(false);
  }

  return (
    <section
      aria-label="Relationship graph canvas"
      className="relative flex rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest h-[calc(100vh-200px)] min-h-[600px] shadow-2xl"
    >
      {/* Left filter column */}
      {showFilters ? (
        <aside className="w-64 shrink-0 bg-surface-container-low border-r border-outline-variant/60 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Graph Filters</h3>
            <span className="flex items-center gap-2">
              <span className="font-mono-code text-micro-label text-on-surface-variant">
                {visibleNodes.length}/{graph.nodes.length}
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded hover:bg-surface-variant text-muted hover:text-on-surface transition-colors"
                title="Hide filters"
              >
                <Icon name="left_panel_close" className="text-[16px]" />
              </button>
            </span>
          </div>

          <div>
            <span className="text-label-caps text-on-surface-variant mb-2 block">Source Tools</span>
            <div className="space-y-4">
              {SOURCE_FILTERS.map((filter) => {
                const active = filter.kinds.every((kind) => enabledKinds.has(kind));
                return (
                  <label
                    key={filter.id}
                    className="flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const next = new Set(enabledKinds);
                          for (const kind of filter.kinds) {
                            if (active) next.delete(kind);
                            else next.add(kind);
                          }
                          setEnabledKinds(next);
                        }}
                        className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-body-sm group-hover:text-primary transition-colors">
                        {filter.label}
                      </span>
                    </span>
                    <span className="font-mono-code text-micro-label text-muted">
                      {countFor(graph, filter.kinds)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-label-caps text-on-surface-variant mb-2 block">
              Relationship Type
            </span>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((relation) => {
                const active = enabledRelations.has(relation);
                return (
                  <button
                    key={relation}
                    onClick={() => setEnabledRelations((prev) => toggle(prev, relation))}
                    className={`px-2 py-1 text-micro-label rounded border font-bold transition-colors ${
                      active
                        ? "bg-primary-container text-on-primary-container border-primary"
                        : "bg-surface-variant text-on-surface-variant border-outline-variant hover:text-on-surface"
                    }`}
                  >
                    {relation}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-label-caps text-on-surface-variant mb-2 block">
              Link Eligibility
            </span>
            <div className="space-y-3">
              {(Object.keys(eligibilityStyle) as LinkEligibility[]).map((eligibility) => {
                const style = eligibilityStyle[eligibility];
                const count = edges.filter((edge) => edge.eligibility === eligibility).length;
                return (
                  <div
                    key={eligibility}
                    className="flex items-center justify-between px-3 py-1.5 bg-surface-container-lowest/60 rounded font-mono-code text-micro-label"
                    title={style.hint}
                  >
                    <span className="flex items-center gap-2">
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
                      <span className="text-on-surface">{style.label}</span>
                    </span>
                    <span className="text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setConflictsOnly((value) => !value)}
            className={`w-full py-2 text-body-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              conflictsOnly
                ? "bg-error-container text-on-error-container"
                : "bg-error-container/60 text-on-error-container hover:opacity-90"
            }`}
          >
            <Icon name="warning" className="text-sm" />
            {conflictsOnly ? "Conflicts Only — Reset" : "Show Only Conflicts"}
          </button>
        </aside>
      ) : null}

      <div className="relative flex-1 min-w-0">
        {graph.nodes.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <Icon name="account_tree" className="text-[32px] text-muted mb-2" />
              <p className="text-body-sm text-muted">
                No evidence yet. Deliver a Jira ticket and a pull request and the graph fills in.
              </p>
            </div>
          </div>
        ) : null}
        <GraphCanvas
          nodes={visibleNodes}
          edges={visibleEdges}
          positions={positions}
          selectedId={selected?.id ?? null}
          markedId={linkSource}
          onSelect={(id) => {
            if (id === null) {
              if (!linkMode) setSelectedId(null);
              return;
            }
            const node = graph.nodes.find((entry) => entry.id === id);
            if (node) handleNodeClick(node);
          }}
        >
          <Panel position="top-left">
            <div className="flex items-center gap-2">
              {!showFilters ? (
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container/90 border border-outline-variant/60 backdrop-blur text-body-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Icon name="tune" className="text-[16px]" />
                  Filters
                </button>
              ) : null}
              <span className="hidden md:inline px-2 py-1 rounded bg-surface-container/80 border border-outline-variant/40 backdrop-blur font-mono-code text-micro-label text-muted">
                Scroll to pan · Ctrl/⌘ + scroll to zoom · drag nodes · hover to trace links
              </span>
            </div>
          </Panel>
          <Panel position="top-right">
            <button
              title="Manually link two nodes"
              onClick={() => {
                setLinkMode((value) => !value);
                setLinkSource(null);
                if (!linkMode)
                  setNotice("Manual link mode: pick the source node, then the target.");
                else setNotice(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-xl font-bold text-body-sm hover:brightness-110 active:scale-95 transition-all ${
                linkMode
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-secondary text-on-secondary"
              }`}
            >
              <Icon name="add_link" fill className="text-[18px]" />
              {linkMode ? "Cancel link" : "Link nodes"}
            </button>
          </Panel>
        </GraphCanvas>

        {/* Link-mode / result notice */}
        {notice ? (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 max-w-md flex items-start gap-2 px-3 py-2 rounded-lg bg-surface-container/95 border border-secondary/40 backdrop-blur shadow-xl">
            <Icon name="info" className="text-secondary text-[16px] mt-0.5 shrink-0" />
            <p className="font-mono-code text-micro-label text-on-surface leading-relaxed">
              {notice}
            </p>
            <button
              onClick={() => setNotice(null)}
              className="ml-1 text-muted hover:text-on-surface transition"
              title="Dismiss"
            >
              <Icon name="close" className="text-[14px]" />
            </button>
          </div>
        ) : null}

        {/* Right detail panel */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-[400px] bg-surface-container/95 border-l border-outline-variant shadow-2xl backdrop-blur-md z-20 transition-transform duration-300 ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!selected}
        >
          {selected ? (
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <Badge tone={selected.findingId ? "critical" : "accent"}>
                  {selected.findingId ? "Active Conflict" : selected.kindLabel}
                </Badge>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors"
                  title="Close inspector"
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center border ${
                    toneClasses[kindTone[selected.kind]].border
                  }`}
                >
                  <Icon
                    name={kindIcon[selected.kind]}
                    className={toneClasses[kindTone[selected.kind]].text}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                    {selected.label}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant truncate">
                    {selected.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                <section>
                  <h4 className="text-label-caps text-on-surface-variant mb-2">Description</h4>
                  <p className="text-body-md leading-relaxed text-on-surface/80">
                    {selected.description}
                  </p>
                </section>

                <section>
                  <h4 className="text-label-caps text-on-surface-variant mb-3">
                    Relationships ({selectedRelations.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedRelations.map(({ edge, other }) => {
                      const style = eligibilityStyle[edge.eligibility];
                      return (
                        <button
                          key={`${edge.from}-${edge.to}-${edge.label}`}
                          onClick={() => setSelectedId(other.id)}
                          className="w-full p-4 bg-surface-container-low rounded-lg border border-outline-variant flex items-center justify-between group hover:border-primary transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              name={kindIcon[other.kind]}
                              className={`${toneClasses[kindTone[other.kind]].text} text-sm shrink-0`}
                            />
                            <div className="min-w-0">
                              <p className="text-body-sm font-bold truncate">{other.label}</p>
                              <p className="text-micro-label text-on-surface-variant">
                                {edge.label} · {style.label}
                                {edge.eligibility === "inferred" ||
                                edge.eligibility === "unconfirmed"
                                  ? " · not decisive"
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Icon
                            name="arrow_forward_ios"
                            className="text-on-surface-variant group-hover:text-primary text-[16px]"
                          />
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h4 className="text-label-caps text-on-surface-variant mb-2">Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.fields.map((field) => (
                      <div
                        key={field.label}
                        className="p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant"
                      >
                        <p className="text-micro-label text-on-surface-variant uppercase">
                          {field.label}
                        </p>
                        <p
                          className={`text-body-sm font-mono-code ${
                            field.tone ? toneClasses[field.tone].text : "text-on-surface"
                          }`}
                        >
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 font-mono-code text-micro-label text-muted truncate">
                    {selected.locator}
                  </p>
                </section>
              </div>

              <div className="pt-5 mt-5 border-t border-outline-variant flex gap-3">
                <button className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                  {selected.action}
                </button>
                <button
                  className="w-12 h-10 border border-outline-variant flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                  title="More actions"
                >
                  <Icon name="more_horiz" />
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
