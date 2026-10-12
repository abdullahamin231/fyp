import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { Badge, ToolPill, type Tone } from "@/components/ui/badge";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { listFindings } from "@/lib/data/queries";
import type { Finding, FindingStatus, Severity } from "@/lib/types";

/**
 * Conflict inbox — a server component over the RLS client.
 *
 * The query runs as the signed-in reviewer, so what lands in this table is
 * exactly what Postgres says they may see; there is no second, wider query
 * anywhere behind it. Workspaces they don't belong to simply aren't here.
 */

/**
 * DATA HOLE — replace with the teams API's active-squad list.
 * Empty until the endpoint exists, so the team filter shows only its header.
 */
const teams: string[] = [];

/** Per-status counts derived from the findings list. */
function countsFor(findings: Finding[]) {
  return {
    all: findings.length,
    open: findings.filter((f) => f.status === "open").length,
    acknowledged: findings.filter((f) => f.status === "acknowledged").length,
    resolved: findings.filter((f) => f.status === "resolved").length,
    suppressed: findings.filter((f) => f.status === "suppressed").length,
  };
}

const severityTone: Record<Severity, Tone> = {
  critical: "critical",
  warning: "warning",
  info: "info",
};

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

const statusPresentation: Record<
  FindingStatus,
  { label: string; tone: Tone; icon: string }
> = {
  open: { label: "Open - Action", tone: "critical", icon: "error" },
  acknowledged: { label: "Acknowledged", tone: "neutral", icon: "check" },
  resolved: { label: "Resolved", tone: "success", icon: "check_circle" },
  suppressed: { label: "Suppressed", tone: "neutral", icon: "do_not_disturb_on" },
  disputed: { label: "Disputed", tone: "warning", icon: "forum" },
  superseded: { label: "Superseded", tone: "neutral", icon: "history" },
};

function statCardsFor(findingsByStatus: ReturnType<typeof countsFor>) {
  return [
    {
      label: "Open",
      value: String(findingsByStatus.open),
      meta: "Needs a decision",
      metaTone: "text-error",
      icon: "error",
      iconClass: "bg-error-container/20 text-error",
    },
    {
      label: "Acknowledged",
      value: String(findingsByStatus.acknowledged),
      meta: "Owned by a human",
      metaTone: "text-tertiary",
      icon: "sync",
      iconClass: "bg-tertiary-container/30 text-tertiary",
    },
    {
      label: "Resolved",
      value: String(findingsByStatus.resolved),
      meta: "Closed by rule",
      metaTone: "text-secondary",
      icon: "check_circle",
      iconClass: "bg-secondary/20 text-secondary",
    },
    {
      label: "Suppressed",
      value: String(findingsByStatus.suppressed),
      meta: "Policy bypass",
      metaTone: "text-on-surface-variant",
      icon: "do_not_disturb_on",
      iconClass: "bg-surface-container-highest text-on-surface-variant",
    },
  ];
}

function PersonCell({ name, role, initials }: { name: string; role: string; initials: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5 overflow-hidden">
        <div
          className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-micro-label flex items-center justify-center ring-2 ring-surface-container-low"
          title={`${name} (${role})`}
        >
          {initials}
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-body-sm text-[12px] text-on-surface font-medium truncate">
          {name}
        </span>
        <span className="font-mono-code text-micro-label text-muted truncate">{role}</span>
      </div>
    </div>
  );
}

function ConflictRow({ finding, index }: { finding: Finding; index: number }) {
  const status = statusPresentation[finding.status];
  const primary = finding.assignedTo[0] ?? "Unassigned";
  const initials = primary
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr
      className={`hover:bg-surface-container transition-colors group ${
        index % 2 === 1 ? "bg-surface-container-low/40" : ""
      }`}
    >
      <td className="py-3.5 px-4">
        <input
          aria-label={`Select ${finding.id}`}
          className="rounded bg-surface-container-highest cursor-pointer focus:ring-0"
          type="checkbox"
        />
      </td>
      <td className="py-3.5 px-3 whitespace-nowrap">
        <Badge tone={severityTone[finding.severity]} pulse={finding.severity === "critical"}>
          {severityLabel[finding.severity]}
        </Badge>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col">
          <Link
            href={`/conflicts/${finding.id}`}
            className="font-body-md text-body-md font-semibold text-on-surface hover:text-primary transition cursor-pointer"
          >
            {finding.title}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono-code text-micro-label text-primary">#{finding.id}</span>
            <span className="font-mono-code text-micro-label text-on-surface-variant truncate">
              {finding.team}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {finding.artifacts.map((artifact) => (
            <ToolPill key={`${artifact.tool}-${artifact.ref}`} tool={artifact.tool}>
              {artifact.ref}
            </ToolPill>
          ))}
        </div>
      </td>
      <td className="py-3.5 px-3 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-micro-label font-semibold text-on-surface">
          <Icon name={status.icon} className="text-[12px]" />
          {status.label}
        </span>
      </td>
      <td className="py-3.5 px-3 whitespace-nowrap font-mono-code text-[12px] text-on-surface-variant">
        {finding.ageLabel} ago
      </td>
      <td className="py-3.5 px-4">
        <PersonCell name={primary} role={finding.team} initials={initials} />
      </td>
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/conflicts/${finding.id}`}
            className="px-2.5 py-1 rounded-md bg-primary-container hover:brightness-110 text-on-primary-container font-body-sm text-body-sm font-semibold transition inline-flex items-center gap-1 shadow-sm"
          >
            <span>Investigate</span>
            <Icon name="arrow_forward" className="text-[14px]" />
          </Link>
          <button
            aria-label="Row actions"
            className="p-1 rounded-md text-muted hover:text-on-surface hover:bg-surface-container-highest transition"
          >
            <Icon name="more_vert" className="text-[18px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default async function ConflictInboxPage() {
  const findings = await listFindings();
  const findingsByStatus = countsFor(findings);
  const statCards = statCardsFor(findingsByStatus);

  return (
    <AppShell
      action={
        <button className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all">
          Bulk Triage
        </button>
      }
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Conflict Inbox</h2>
        </div>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                {card.label}
              </span>
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center ${card.iconClass}`}
              >
                <Icon name={card.icon} className="text-[15px]" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                {card.value}
              </span>
              <span className={`font-mono-code text-micro-label font-medium ${card.metaTone}`}>
                {card.meta}
              </span>
            </div>
            <div className="mt-2 text-on-surface-variant font-mono-code text-micro-label truncate">
              <span className="sr-only">Counted over </span>7d
            </div>
          </div>
        ))}
      </section>

      {/* Filter toolbar */}
      <section
        aria-label="Table filters and toolbar"
        className="rounded-xl bg-surface-container-low p-3.5 shadow-sm flex flex-col gap-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedTabs
            tabs={[
              { id: "all", label: "All", count: findingsByStatus.all },
              { id: "open", label: "Open", count: findingsByStatus.open },
              { id: "acknowledged", label: "Acknowledged", count: findingsByStatus.acknowledged },
              { id: "resolved", label: "Resolved", count: findingsByStatus.resolved },
              { id: "suppressed", label: "Suppressed", count: findingsByStatus.suppressed },
            ]}
          />
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-mono-code text-mono-code flex items-center gap-2 transition shadow-sm">
              <Icon name="calendar_today" className="text-muted text-[16px]" />
              <span>Last 7 Days</span>
              <Icon name="expand_more" className="text-muted text-[16px]" />
            </button>
            <button
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition"
              title="Export CSV"
            >
              <Icon name="download" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
          <div className="md:col-span-4 relative">
            <Icon
              name="filter_alt"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]"
            />
            <input
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-mono-code focus:outline-none focus:bg-surface-container transition placeholder:text-muted"
              placeholder="Filter by commit, PR, ticket, or artifact..."
              type="text"
            />
          </div>
          <div className="md:col-span-2 relative">
            <select className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container cursor-pointer transition">
              <option>Severity: All</option>
              <option>Critical</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none"
            />
          </div>
          <div className="md:col-span-3 relative">
            <select className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container cursor-pointer transition">
              <option>Team: All Active Squads</option>
              {teams.map((team) => (
                <option key={team}>{team}</option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none"
            />
          </div>
          <div className="md:col-span-3 relative">
            <select className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container cursor-pointer transition">
              <option>Policy: All Rules</option>
              <option>P1: Design Drift after PR Merge</option>
              <option>P2: Ghost Ticket (No Code Attached)</option>
              <option>P3: Spec Outdated (Tokens Diverged)</option>
              <option>P4: Requirement / Implementation Divergence</option>
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* Data table */}
      <section
        aria-label="Conflict data table"
        className="rounded-xl bg-surface-container-low overflow-hidden shadow-sm flex flex-col"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-10">
                  <input
                    aria-label="Select all conflicts"
                    className="rounded bg-surface-container-highest cursor-pointer focus:ring-0"
                    type="checkbox"
                  />
                </th>
                <th className="py-3.5 px-3 w-28 cursor-pointer hover:text-on-surface transition">
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    <Icon name="arrow_downward" className="text-[14px]" />
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[240px] cursor-pointer hover:text-on-surface transition">
                  <div className="flex items-center gap-1">
                    <span>Conflict / Policy</span>
                    <Icon name="unfold_more" className="text-[14px]" />
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[260px]">Affected Artifacts (Cross-Tool)</th>
                <th className="py-3.5 px-3 w-36 cursor-pointer hover:text-on-surface transition">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <Icon name="unfold_more" className="text-[14px]" />
                  </div>
                </th>
                <th className="py-3.5 px-3 w-24 cursor-pointer hover:text-on-surface transition">
                  <div className="flex items-center gap-1">
                    <span>Age</span>
                    <Icon name="unfold_more" className="text-[14px]" />
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[180px]">Assigned Recipients</th>
                <th className="py-3.5 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-on-surface font-body-md text-body-md">
              {findings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <Icon name="inbox" className="text-[28px] text-muted mb-2" />
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      No findings yet
                    </p>
                  </td>
                </tr>
              ) : null}
              {findings.map((finding, index) => (
                <ConflictRow key={finding.id} finding={finding} index={index} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/60 font-mono-code text-micro-label text-on-surface-variant">
          <span>
            showing {findings.length} of {findingsByStatus.all} findings · resolved against the
            immutable evidence packet
          </span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition">
              prev
            </button>
            <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition">
              1
            </button>
            <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition">
              next
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
