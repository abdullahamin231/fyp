"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  auditActions,
  auditDateRanges,
  emptyAuditTotals,
  type AuditActionType,
  type AuditActor,
  type AuditEvent,
  type AuditPreset,
  type AuditTotals,
} from "@/lib/domain/audit";
import { DiffModal, InspectModal } from "./audit-modals";

/**
 * DATA HOLE — replace with the audit API.
 *
 * Events, actors and saved filter presets are empty until their endpoints
 * exist: the table renders its empty state and the actor dropdown lists only
 * the built-in system identity.
 */
const auditEvents: AuditEvent[] = [];
const auditActors: AuditActor[] = [];
const auditPresets: AuditPreset[] = [];
const auditTotals: AuditTotals = emptyAuditTotals;

const actionTone: Record<AuditActionType, string> = {
  CONFLICT_RESOLVED: "bg-secondary/15 text-secondary",
  CONFLICT_SUPPRESSED: "bg-outline-variant/30 text-muted",
  LINK_MANUAL_ASSERTION: "bg-primary/20 text-primary",
  LINK_SUGGESTION_REJECTED: "bg-tertiary-container text-on-tertiary-container",
  POLICY_VERSION_BUMP: "bg-tertiary/20 text-tertiary",
  TOKEN_SCOPE_AUDIT: "bg-surface-variant text-on-surface",
};

const actionIcon: Record<AuditActionType, string> = {
  CONFLICT_RESOLVED: "merge",
  CONFLICT_SUPPRESSED: "task_alt",
  LINK_MANUAL_ASSERTION: "link",
  LINK_SUGGESTION_REJECTED: "link_off",
  POLICY_VERSION_BUMP: "gavel",
  TOKEN_SCOPE_AUDIT: "vpn_key",
};

/**
 * DATA HOLE — replace with the actor API's avatar tone/class per actor id.
 * Empty until the endpoint exists; every actor falls back to the default tone.
 */
const avatarTone: Record<string, string> = {};

const artifactIconTone: Record<string, string> = {
  github: "text-primary",
  figma: "text-tertiary",
  jira: "text-secondary",
  slack: "text-tertiary",
  git: "text-secondary",
  test: "text-tertiary",
};

const presetDot: Record<string, string> = {
  secondary: "bg-secondary",
  primary: "bg-primary",
  tertiary: "bg-tertiary",
};

function ActorCell({ event }: { event: AuditEvent }) {
  const actor = auditActors.find((entry) => entry.id === event.actorId);
  if (!actor) return null;

  if (actor.kind === "system") {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
          <Icon name={actor.icon ?? "smart_toy"} className="text-[14px]" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono-code font-semibold text-on-surface text-[12px]">
            {actor.handle}
          </span>
          <span className="font-label-caps text-label-caps text-secondary text-eyebrow">
            {event.actorTag ?? actor.role}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono-code text-micro-label font-bold ${
          avatarTone[actor.id] ?? "bg-primary-container text-on-primary"
        }`}
      >
        {actor.initials}
      </div>
      <div className="flex flex-col">
        <span className="font-mono-code font-semibold text-on-surface text-[12px]">
          {actor.handle}
        </span>
        <span className="font-body-sm text-muted text-micro-label">
          {actor.name} ({actor.role})
        </span>
      </div>
    </div>
  );
}

export function AuditConsole() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState<"all" | AuditActionType>("all");
  const [rangeId, setRangeId] = useState("30d");
  const [inspect, setInspect] = useState<AuditEvent | null>(null);
  const [diff, setDiff] = useState<AuditEvent | null>(null);

  const hours = auditDateRanges.find((entry) => entry.id === rangeId)?.hours ?? 24 * 30;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return auditEvents.filter((event) => {
      if (actor !== "all" && event.actorId !== actor) return false;
      if (action !== "all" && event.action !== action) return false;
      if (event.hoursAgo > hours) return false;
      if (!needle) return true;
      const haystack = [
        event.reason,
        event.action,
        event.actorId,
        event.artifact.label,
        event.artifact.context ?? "",
        event.hash,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, actor, action, hours]);

  function resetFilters() {
    setQuery("");
    setActor("all");
    setAction("all");
    setRangeId("30d");
  }

  function applyPreset(presetId: string) {
    const preset = auditPresets.find((entry) => entry.id === presetId);
    if (!preset) return;
    setQuery(preset.query ?? "");
    setActor(preset.actor ?? "all");
    setAction(preset.action ?? "all");
    setRangeId("30d");
  }

  return (
    <>
      {/* Filter & query control bar */}
      <section
        aria-label="Audit filters"
        className="p-gutter rounded bg-surface-container shadow-sm space-y-stack-comfortable"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-stack-comfortable">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by Actor, Artifact (GitHub, Figma), or TxHash..."
              className="w-full pl-9 pr-4 py-2 rounded bg-surface-container-lowest text-on-surface placeholder:text-muted font-mono-code text-body-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap gap-stack-compact">
            <div className="relative">
              <select
                aria-label="Filter by actor"
                value={actor}
                onChange={(event) => setActor(event.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Actors</option>
                <option value="system">Invariant Systems Engine</option>
                {auditActors
                  .filter((entry) => entry.kind === "user")
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.handle} ({entry.name})
                    </option>
                  ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by action type"
                value={action}
                onChange={(event) => setAction(event.target.value as typeof action)}
                className="w-full appearance-none px-3 py-2 pr-8 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Action Types</option>
                {auditActions.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by date range"
                value={rangeId}
                onChange={(event) => setRangeId(event.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {auditDateRanges.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <Icon
                name="calendar_month"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
              <Icon
                name="expand_more"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px] pointer-events-none"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              title="Reset Filters"
              aria-label="Reset filters"
              className="p-2 rounded bg-surface-container-lowest hover:bg-surface-container-high text-muted hover:text-on-surface transition-colors"
            >
              <Icon name="restart_alt" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Quick compliance presets */}
        <div className="flex items-center justify-between flex-wrap gap-stack-compact">
          <div className="flex items-center gap-stack-compact flex-wrap">
            <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
              Quick Presets:
            </span>
            {auditPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="px-2.5 py-1 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono-code text-micro-label font-medium transition-colors flex items-center gap-1.5"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${presetDot[preset.dot]}`} />
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-mono-code text-[12px]">
            <Icon name="lock" className="text-[15px] text-secondary animate-pulse" />
            <span>SHA-256 Proof Valid</span>
          </div>
        </div>
      </section>

      {/* Chronological audit log */}
      <section
        aria-label="Chronological audit log"
        className="rounded bg-surface-container shadow-sm overflow-hidden flex flex-col"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm text-on-surface border-collapse min-w-[1000px]">
            <thead className="bg-surface-container-low font-label-caps text-label-caps text-muted uppercase tracking-wider select-none">
              <tr>
                <th className="py-4 px-4">Timestamp (UTC)</th>
                <th className="py-4 px-4">Actor</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4">Affected Artifact</th>
                <th className="py-4 px-4">Reason / Integrity Proof</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="auditTableBody">
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-surface-container-high transition-colors align-top"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono-code text-[12px] text-on-surface-variant">
                    <span className="text-on-surface font-medium">{event.timestamp}</span>
                    <span className="text-muted text-micro-label block">{event.relative}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ActorCell event={event} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      title={event.action}
                      className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-semibold ${actionTone[event.action]}`}
                    >
                      {event.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-mono-code text-micro-label">
                      <Icon
                        name={actionIcon[event.action]}
                        className={`text-[13px] ${artifactIconTone[event.artifact.tool] ?? "text-primary"}`}
                      />
                      <span className="font-semibold">{event.artifact.label}</span>
                      {event.artifact.context ? (
                        <span className="text-muted text-micro-label">• {event.artifact.context}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col max-w-md">
                      <span className="text-on-surface text-body-sm line-clamp-1">
                        {event.reason}
                      </span>
                      <span className="font-mono-code text-micro-label text-muted truncate">
                        SHA-256: {event.hash.slice(0, 24)}…{event.hash.slice(-4)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setInspect(event)}
                        className="px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono-code text-micro-label transition-colors"
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiff(event)}
                        className="px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-bright text-secondary font-mono-code text-micro-label transition-colors"
                      >
                        Diff
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <Icon name="find_in_page" className="text-[36px] text-muted mb-2" />
            <p className="font-body-md text-body-md text-on-surface font-medium">
              No matching audit records found
            </p>
            <p className="font-body-sm text-body-sm text-muted mt-1.5">
              Try relaxing actor or query constraints.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-3 py-1.5 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : null}

        <div className="px-4 py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-stack-comfortable select-none">
          <span className="font-mono-code text-[12px] text-on-surface-variant">
            Showing{" "}
            <span className="font-semibold text-on-surface">
              {filtered.length === 0 ? 0 : 1}-{filtered.length}
            </span>{" "}
            of <span className="font-semibold text-on-surface">
              {auditTotals.events.toLocaleString("en-US")}
            </span>{" "}
            events
          </span>
          <div className="flex items-center gap-1 font-mono-code text-[12px]">
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <InspectModal
        key={inspect ? `inspect-${inspect.id}` : "inspect-closed"}
        event={inspect}
        onClose={() => setInspect(null)}
      />
      <DiffModal key={diff ? `diff-${diff.id}` : "diff-closed"} event={diff} onClose={() => setDiff(null)} />
    </>
  );
}
