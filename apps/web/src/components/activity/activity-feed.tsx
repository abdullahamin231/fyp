"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import type { ActivityEvent, ActivityKind, ToolKind } from "@/lib/types";

/**
 * `/activity` — the timeline feed from the Stitch screen. Events come from the
 * typed mock (`src/lib/mock/activity.ts`); everything interactive lives here.
 */

/** Fixed clock so relative times render identically on server and client. */
const NOW = new Date("2026-10-08T15:30:00Z");

const kindMeta: Record<
  ActivityKind,
  { label: string; verb: string; icon: string; chipTone: string }
> = {
  ingested: { label: "Ingested", verb: "ingested an artefact in", icon: "download", chipTone: "text-on-surface-variant" },
  linked: { label: "Linked", verb: "linked artefacts in", icon: "link", chipTone: "text-primary" },
  finding: { label: "Finding", verb: "raised a finding in", icon: "warning", chipTone: "text-error" },
  verdict: { label: "Verdict", verb: "produced a verdict in", icon: "rule", chipTone: "text-secondary" },
  human: { label: "Human", verb: "reviewed an artefact in", icon: "person", chipTone: "text-primary" },
  delivery: { label: "Delivery", verb: "delivered a notification in", icon: "send", chipTone: "text-tertiary" },
};

const toolIcon: Record<ToolKind, string> = {
  figma: "draw",
  github: "commit",
  jira: "confirmation_number",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

const toolLabel: Record<ToolKind, string> = {
  figma: "Figma",
  github: "GitHub",
  jira: "Jira",
  slack: "Slack",
  git: "Git",
  test: "Tests",
};

/** Presentation-only detail per event: the chip the sentence ends on. */
const eventPresentation: Record<string, { target: string; verb?: string }> = {
  "EVT-9021": { target: "unify-core" },
  "EVT-9020": { target: "unify-core" },
  "EVT-9019": { target: "PROJ-88" },
  "EVT-9018": { target: "Unify-DS" },
  "EVT-9017": { target: "PROJ-91" },
  "EVT-9016": { target: "PROJ-91" },
  "EVT-9015": { target: "CONF-1045", verb: "acknowledged a finding in" },
  "EVT-9014": { target: "#core-checkout" },
  "EVT-9013": { target: "Unify-DS" },
  "EVT-9012": { target: "LNK-305", verb: "confirmed a link in" },
};

const TEAM = [
  { name: "Alex Rivera", role: "Staff Eng", online: true },
  { name: "Mishal Fatima", role: "Rules & anchors", online: true },
  { name: "Haaniah Ismail", role: "Ingestion", online: false },
  { name: "Sam Okafor", role: "Core Checkout", online: true },
];

function initialsOf(name: string): string {
  return name
    .replace(/^@/, "")
    .split(/[\s/_-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(iso: string): string {
  const minutes = Math.round((NOW.getTime() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function dayHeading(iso: string): string {
  const key = iso.slice(0, 10);
  const today = NOW.toISOString().slice(0, 10);
  const yesterday = new Date(NOW.getTime() - 86_400_000).toISOString().slice(0, 10);
  const label = new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  if (key === today) return `Today, ${label}`;
  if (key === yesterday) return `Yesterday, ${label}`;
  return label;
}

function FeedItem({
  event,
  isLast,
  onFinding,
}: {
  event: ActivityEvent;
  isLast: boolean;
  onFinding: (id: string) => void;
}) {
  const meta = kindMeta[event.kind];
  const presentation = eventPresentation[event.id];
  const target = presentation?.target ?? toolLabel[event.tool];
  const verb = presentation?.verb ?? meta.verb;
  const findingId = event.findingId;

  return (
    <div className="group flex gap-gutter py-stack-comfortable relative hover:bg-surface-container-lowest/50 rounded-lg transition-colors px-2 -mx-2">
      {!isLast ? (
        <span className="absolute left-[23px] top-16 bottom-0 w-px bg-outline-variant" aria-hidden />
      ) : null}

      <div className="relative z-10 flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-highest grid place-items-center text-body-sm font-bold text-on-surface">
          {initialsOf(event.actor)}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-surface-container-highest border border-outline-variant p-1 rounded-md">
          <Icon name={toolIcon[event.tool]} className="text-[14px] text-on-surface" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 pt-1 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-body-md text-body-md font-bold text-on-surface">
              {event.actor}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">{verb}</span>
            <span className="font-mono-code text-body-sm px-1.5 py-0.5 bg-surface-container-lowest border border-outline-variant rounded text-primary">
              {target}
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-muted shrink-0">
            {relativeTime(event.timestamp)}
          </span>
        </div>

        <div className="font-headline-sm text-headline-sm text-on-surface mt-1.5">
          {event.title}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`flex items-center gap-1.5 px-2 py-1 bg-surface-container rounded border border-outline-variant ${meta.chipTone}`}
          >
            <Icon name={meta.icon} className="text-[12px]" />
            <span className="font-label-caps text-label-caps">{meta.label}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-surface-container rounded border border-outline-variant">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {event.id}
            </span>
          </span>
          {findingId ? (
            <button
              onClick={() => onFinding(findingId)}
              className="flex items-center gap-1.5 px-2 py-1 bg-error-container/20 rounded border border-error/40 text-error hover:brightness-110 transition-all"
            >
              <Icon name="warning" className="text-[12px]" />
              <span className="font-label-caps text-label-caps">{findingId}</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-start gap-2 mt-2 text-on-surface-variant">
          <Icon name="notes" className="text-[14px] mt-0.5 shrink-0 text-muted" />
          <p className="font-body-sm text-body-sm italic leading-relaxed">{event.detail}</p>
        </div>

      </div>
    </div>
  );
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<ActivityKind | "all">("all");
  const [tools, setTools] = useState<Set<ToolKind>>(
    () => new Set(events.map((event) => event.tool)),
  );
  const [onlyHuman, setOnlyHuman] = useState(false);
  const [onlyFindings, setOnlyFindings] = useState(false);

  const sorted = useMemo(
    () => [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [events],
  );

  const presentTools = useMemo(() => {
    const seen: ToolKind[] = [];
    for (const event of events) if (!seen.includes(event.tool)) seen.push(event.tool);
    return seen;
  }, [events]);

  const counts = useMemo(() => {
    const map = new Map<ActivityKind, number>();
    for (const event of events) map.set(event.kind, (map.get(event.kind) ?? 0) + 1);
    return map;
  }, [events]);

  const filtered = useMemo(
    () =>
      sorted.filter(
        (event) =>
          (kind === "all" || event.kind === kind) &&
          tools.has(event.tool) &&
          (!onlyHuman || event.kind === "human") &&
          (!onlyFindings || event.kind === "finding"),
      ),
    [sorted, kind, tools, onlyHuman, onlyFindings],
  );

  const groups = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const event of filtered) {
      const key = event.timestamp.slice(0, 10);
      const bucket = map.get(key);
      if (bucket) bucket.push(event);
      else map.set(key, [event]);
    }
    return [...map.entries()];
  }, [filtered]);

  const resetFilters = () => {
    setKind("all");
    setTools(new Set(presentTools));
    setOnlyHuman(false);
    setOnlyFindings(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-gutter items-start">
      {/* Feed */}
      <section className="flex flex-col min-w-0">
        {/* Daily pulse */}
        <div className="mb-gutter p-4 bg-surface-container-high rounded-xl border border-outline-variant relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Icon name="auto_awesome" className="text-4xl text-primary" fill />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-container/20 rounded-lg text-primary shrink-0">
              <Icon name="smart_toy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Daily Pulse</h3>
                <span className="font-label-caps text-label-caps text-muted uppercase">
                  AI Generated • 10:00 AM
                </span>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Yesterday the team merged <span className="text-primary font-bold">12 PRs</span> and
                re-published the <span className="text-secondary font-bold">Unify Design System</span>{" "}
                library. The verifier produced 9 verdicts across{" "}
                <span className="text-secondary font-bold">Core Checkout</span> — one CONTRADICTED
                finding (<span className="text-error font-bold">CONF-1048</span>) still needs a
                human decision, and no inferred or unconfirmed link contributed to a decisive
                verdict.
              </p>
            </div>
          </div>
        </div>

        {/* Kind tabs */}
        <div className="mb-gutter flex items-center justify-between gap-3 flex-wrap">
          <SegmentedTabs
            initialId="all"
            onChange={(id) => setKind(id as ActivityKind | "all")}
            tabs={[
              { id: "all", label: "All", count: events.length },
              { id: "ingested", label: "Ingested", count: counts.get("ingested") ?? 0 },
              { id: "linked", label: "Linked", count: counts.get("linked") ?? 0 },
              { id: "finding", label: "Findings", count: counts.get("finding") ?? 0 },
              { id: "verdict", label: "Verdicts", count: counts.get("verdict") ?? 0 },
              { id: "human", label: "Human", count: counts.get("human") ?? 0 },
              { id: "delivery", label: "Delivery", count: counts.get("delivery") ?? 0 },
            ]}
          />
          <span className="font-mono-code text-micro-label text-on-surface-variant">
            {filtered.length} of {events.length} events
          </span>
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-center">
            <Icon name="filter_alt_off" className="text-3xl text-muted" />
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              No activity matches the current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-body-sm hover:brightness-110 transition-all"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {groups.map(([key, items]) => (
              <div key={key}>
                <h2 className="font-label-caps text-label-caps text-muted uppercase mt-gutter mb-stack-comfortable tracking-widest border-b border-outline-variant pb-2">
                  {dayHeading(items[0].timestamp)}
                </h2>
                <div className="space-y-0">
                  {items.map((event, index) => (
                    <FeedItem
                      key={event.id}
                      event={event}
                      isLast={index === items.length - 1}
                      onFinding={(id) => router.push(`/conflicts/${id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-gutter py-stack-comfortable mt-gutter">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                <Icon name="more_horiz" className="text-muted" />
              </div>
              <div className="flex-1 pt-3">
                <Link
                  href="/audit"
                  className="font-body-md text-body-md text-muted hover:text-primary transition-colors"
                >
                  Older events live in the Audit Trail →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Filters sidebar */}
      <aside className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-4 flex flex-col gap-gutter shadow-sm">
        <div className="space-y-gutter">
          <div>
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase mb-stack-comfortable">
              Filters
            </h4>
            <div className="space-y-stack-compact">
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/30">
                <span className="flex items-center gap-3">
                  <Icon name="verified_user" className="text-primary" />
                  <span className="font-body-md text-body-md text-on-surface">Human decisions</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyHuman}
                  onChange={() => setOnlyHuman((value) => !value)}
                  className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary h-4 w-4 accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/30">
                <span className="flex items-center gap-3">
                  <Icon name="error_outline" className="text-error" />
                  <span className="font-body-md text-body-md text-on-surface">
                    Findings only
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyFindings}
                  onChange={() => setOnlyFindings((value) => !value)}
                  className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary h-4 w-4 accent-primary"
                />
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase mb-stack-comfortable">
              Tool Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {presentTools.map((tool) => {
                const active = tools.has(tool);
                return (
                  <button
                    key={tool}
                    onClick={() =>
                      setTools((previous) => {
                        const next = new Set(previous);
                        if (next.has(tool)) next.delete(tool);
                        else next.add(tool);
                        return next;
                      })
                    }
                    className={`px-3 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${
                      active
                        ? "bg-surface-container-highest text-on-surface border-primary/50"
                        : "bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface"
                    }`}
                  >
                    {toolLabel[tool]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-label-caps text-label-caps text-on-surface uppercase mb-stack-comfortable">
              Team Members
            </h4>
            <div className="space-y-stack-comfortable">
              {TEAM.map((member) => (
                <div key={member.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container-highest grid place-items-center text-micro-label font-bold text-on-surface">
                      {initialsOf(member.name)}
                    </div>
                    <span className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface">
                        {member.name}
                      </span>
                      <span className="font-mono-code text-micro-label text-muted">{member.role}</span>
                    </span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      member.online ? "bg-secondary" : "bg-outline-variant"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-outline-variant">
          <button className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Icon name="download" className="text-[18px]" />
            <span>Export Report</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
