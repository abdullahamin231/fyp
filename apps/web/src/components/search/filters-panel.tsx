"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { kindLabels, toolFilters, type SearchKind } from "@/lib/domain/search";

/**
 * DATA HOLE — replace with the workspace/squad API.
 * Empty until the endpoint exists; the squad scope section renders its
 * empty copy.
 */
const squads: string[] = [];
import type { FindingStatus, Severity } from "@/lib/types";

export interface SearchFilters {
  kinds: Record<SearchKind, boolean>;
  tools: Record<string, boolean>;
  severities: Record<Severity, boolean>;
  states: FindingStatus[];
  horizon: "24h" | "7d" | "30d";
  confidence: number;
  squads: string[];
}

export interface FacetCounts {
  kinds: Record<string, number>;
  severities: Record<string, number>;
  tools: Record<string, number>;
  states: Record<string, number>;
}

const severityRows: { id: Severity; label: string; dot: string; countClass: string }[] = [
  { id: "critical", label: "Critical (SEV-1)", dot: "bg-error", countClass: "text-error font-bold" },
  { id: "warning", label: "Warning (SEV-2)", dot: "bg-tertiary", countClass: "text-muted" },
  { id: "info", label: "Info (SEV-3)", dot: "bg-secondary", countClass: "text-muted" },
];

const stateLabels: Record<FindingStatus, string> = {
  open: "Unresolved",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
  suppressed: "Suppressed",
  disputed: "Disputed",
  superseded: "Superseded",
};

const horizons: { id: "24h" | "7d" | "30d"; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
];

function FacetHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between text-muted font-label-caps text-label-caps uppercase tracking-wider hover:text-on-surface transition-colors"
    >
      <span>{label}</span>
      <Icon name={open ? "expand_less" : "expand_more"} className="text-[16px]" />
    </button>
  );
}

/** Left-hand advanced filter facets for the search workspace. */
export function FiltersPanel({
  filters,
  onChange,
  counts,
  activeCount,
  onReset,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  counts: FacetCounts;
  activeCount: number;
  onReset: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setCollapsed((value) => ({ ...value, [id]: !value[id] }));

  const toggleKind = (kind: SearchKind) =>
    onChange({ kinds: { ...filters.kinds, [kind]: !filters.kinds[kind] } });
  const toggleTool = (tool: string) =>
    onChange({ tools: { ...filters.tools, [tool]: !filters.tools[tool] } });
  const toggleSeverity = (severity: Severity) =>
    onChange({ severities: { ...filters.severities, [severity]: !filters.severities[severity] } });
  const toggleState = (state: FindingStatus) =>
    onChange({
      states: filters.states.includes(state)
        ? filters.states.filter((value) => value !== state)
        : [...filters.states, state],
    });
  const toggleSquad = (squad: string) =>
    onChange({
      squads: filters.squads.includes(squad)
        ? filters.squads.filter((value) => value !== squad)
        : [...filters.squads, squad],
    });

  return (
    <div className="col-span-12 lg:col-span-3 bg-surface-container-low rounded-xl p-stack-comfortable flex flex-col gap-stack-comfortable shadow-md lg:sticky lg:top-16">
      <div className="flex items-center justify-between pb-stack-compact bg-surface-container-lowest/40 -mx-stack-comfortable px-stack-comfortable pt-2 rounded-t-xl">
        <div className="flex items-center gap-stack-compact">
          <Icon name="tune" className="text-primary text-[18px]" />
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Filters
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="font-mono-code text-micro-label text-primary hover:underline"
        >
          Reset All ({activeCount})
        </button>
      </div>

      {/* Entity type */}
      <div className="flex flex-col gap-stack-compact">
        <FacetHeader label="Entity type" open={!collapsed.kinds} onToggle={() => toggle("kinds")} />
        {!collapsed.kinds ? (
          <div className="space-y-1.5">
            {(Object.keys(kindLabels) as SearchKind[]).map((kind) => (
              <label
                key={kind}
                className="flex items-center justify-between px-2.5 py-2 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.kinds[kind]}
                    onChange={() => toggleKind(kind)}
                    className="w-3.5 h-3.5 rounded bg-surface-container-lowest accent-primary cursor-pointer"
                  />
                  <span
                    className={`font-body-sm text-body-sm ${
                      kind === "conflict" ? "text-error font-medium" : "text-on-surface"
                    }`}
                  >
                    {kindLabels[kind]}
                  </span>
                </span>
                <span
                  className={
                    kind === "conflict"
                      ? "px-1.5 py-0.2 rounded bg-error-container text-error font-mono-code text-micro-label font-bold"
                      : "font-mono-code text-body-sm text-muted"
                  }
                >
                  {counts.kinds[kind] ?? 0}
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {/* Source tool */}
      <div className="flex flex-col gap-stack-compact">
        <FacetHeader label="Source tool" open={!collapsed.tools} onToggle={() => toggle("tools")} />
        {!collapsed.tools ? (
          <div className="grid grid-cols-2 gap-1.5">
            {toolFilters.map((entry) => {
              const active = Boolean(filters.tools[entry.tool]);
              return (
                <button
                  key={entry.tool}
                  type="button"
                  onClick={() => toggleTool(entry.tool)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                    active
                      ? "bg-surface-container-high"
                      : "bg-surface-container hover:bg-surface-container-high"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${entry.dot}`} />
                    <span
                      className={`font-body-sm text-body-sm ${
                        active ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {entry.label}
                    </span>
                  </span>
                  <span
                    className={`font-mono-code text-micro-label ${active ? "text-on-surface-variant" : "text-muted"}`}
                  >
                    {counts.tools[entry.tool] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Severity */}
      <div className="flex flex-col gap-stack-compact">
        <FacetHeader label="Severity level" open={!collapsed.severity} onToggle={() => toggle("severity")} />
        {!collapsed.severity ? (
          <div className="flex flex-col gap-1.5">
            {severityRows.map((row) => {
              const active = Boolean(filters.severities[row.id]);
              return (
                <label
                  key={row.id}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded cursor-pointer transition-colors ${
                    row.id === "critical" && active
                      ? "bg-error-container/30 hover:bg-error-container/50"
                      : "bg-surface-container hover:bg-surface-container-high"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSeverity(row.id)}
                    className="rounded accent-primary cursor-pointer"
                  />
                  <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                  <span
                    className={`font-body-sm text-body-sm ${
                      row.id === "critical" && active
                        ? "text-error font-medium"
                        : active
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {row.label}
                  </span>
                  <span className={`ml-auto font-mono-code text-body-sm ${row.countClass}`}>
                    {counts.severities[row.id] ?? 0}
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Resolution state */}
      <div className="flex flex-col gap-stack-compact">
        <FacetHeader label="Resolution state" open={!collapsed.states} onToggle={() => toggle("states")} />
        {!collapsed.states ? (
          <div className="flex flex-wrap gap-1">
            {(Object.keys(stateLabels) as FindingStatus[]).map((state) => {
              const active = filters.states.includes(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => toggleState(state)}
                  className={`px-2.5 py-1 rounded-full font-mono-code text-label-caps cursor-pointer transition-colors ${
                    active
                      ? "bg-error-container text-on-error-container"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-bright"
                  }`}
                >
                  {stateLabels[state]} ({counts.states[state] ?? 0})
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Time horizon */}
      <div className="flex flex-col gap-stack-compact">
        <FacetHeader label="Time horizon" open={!collapsed.horizon} onToggle={() => toggle("horizon")} />
        {!collapsed.horizon ? (
          <>
            <div className="grid grid-cols-3 gap-1 font-mono-code text-label-caps">
              {horizons.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onChange({ horizon: entry.id })}
                  className={`py-1 rounded transition-colors text-center ${
                    filters.horizon === entry.id
                      ? "bg-primary-container text-on-primary-container font-bold shadow"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-micro-label font-mono-code text-muted mt-0.5">
              <Icon name="calendar_month" className="text-[13px]" />
              {/* Rolling window caption derived from the selected horizon — no absolute dates. */}
              <span>Last {filters.horizon} (rolling)</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Confidence */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted font-label-caps text-label-caps uppercase tracking-wider">
            Link confidence
          </span>
          <span className="font-mono-code text-label-caps text-secondary font-bold">
            ≥ {filters.confidence}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.confidence}
          onChange={(event) => onChange({ confidence: Number(event.target.value) })}
          className="w-full h-1.5 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-secondary"
        />
        <div className="flex justify-between font-mono-code text-micro-label text-muted">
          <span>Fuzzy (0%)</span>
          <span>Deterministic (100%)</span>
        </div>
      </div>

      {/* Squad scope */}
      <div className="flex flex-col gap-stack-comfortable pt-stack-comfortable bg-surface-container-lowest/30 p-3.5 rounded-lg">
        <span className="text-muted font-label-caps text-label-caps uppercase tracking-wider">
          Squad scope
        </span>
        <div className="space-y-1.5">
          {squads.length === 0 ? (
            <p className="font-body-sm text-body-sm text-muted">
              No squads indexed yet
            </p>
          ) : (
            squads.map((squad) => (
            <label key={squad} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.squads.includes(squad)}
                onChange={() => toggleSquad(squad)}
                className="rounded accent-primary cursor-pointer"
              />
              <span
                className={`font-body-sm text-body-sm ${
                  filters.squads.includes(squad) ? "text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {squad}
              </span>
            </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
