"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ToolPill } from "@/components/ui/badge";
import { badgeToneClass, kindLabels, type SearchKind, type SearchMatch } from "@/lib/domain/search";
import type { Severity, ToolKind } from "@/lib/types";

const toolIcon: Record<ToolKind, string> = {
  figma: "brush",
  github: "merge",
  jira: "assignment",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

const toolBox: Record<ToolKind, string> = {
  figma: "bg-tertiary-container/30 text-tertiary",
  github: "bg-secondary-container/20 text-secondary",
  jira: "bg-primary-container/30 text-primary",
  slack: "bg-[#4A154B]/40 text-[#36C5F0]",
  git: "bg-error-container/30 text-error",
  test: "bg-tertiary/20 text-tertiary",
};

const severityBar: Record<Severity, string> = {
  critical: "bg-error",
  warning: "bg-tertiary",
  info: "bg-primary",
};

const groupMeta: Record<
  SearchKind,
  { icon?: string; dot?: string; iconClass?: string; linkLabel?: string; href?: string }
> = {
  conflict: { dot: "bg-error animate-pulse", linkLabel: "View all in Inbox", href: "/conflicts" },
  artifact: { icon: "widgets", iconClass: "text-primary" },
  link: { icon: "account_tree", iconClass: "text-secondary" },
  policy: { icon: "rule", iconClass: "text-tertiary" },
};

function ConflictCard({
  match,
  onHover,
  active,
}: {
  match: SearchMatch;
  onHover: (match: SearchMatch) => void;
  active: boolean;
}) {
  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`group p-stack-comfortable rounded-xl cursor-pointer transition-all duration-200 shadow-md relative overflow-hidden border border-outline-variant/40 ${
        active ? "bg-surface-container-high" : "bg-surface-container-low hover:bg-surface-container"
      }`}
    >
      <span
        className={`absolute top-0 left-0 bottom-0 w-1 ${
          match.severity ? severityBar[match.severity] : "bg-error"
        }`}
      />
      <div className="flex flex-col gap-stack-compact pl-2">
        <div className="flex items-start justify-between gap-stack-comfortable">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-bold tracking-tight ${badgeToneClass[match.badgeTone]}`}
            >
              {match.badge}
            </span>
            {match.findingId ? (
              <Link
                href={`/conflicts/${match.findingId}`}
                className="font-mono-code text-body-sm font-semibold text-primary"
              >
                {match.id}
              </Link>
            ) : (
              <span className="font-mono-code text-body-sm font-semibold text-primary">{match.id}</span>
            )}
            <span className="text-outline font-mono-code text-micro-label">•</span>
            <span className="font-mono-code text-body-sm text-muted">{match.meta}</span>
          </div>
          {match.findingId ? (
            <Link
              href={`/conflicts/${match.findingId}`}
              className="flex items-center gap-1 text-primary hover:text-muted font-mono-code text-[12px] font-semibold shrink-0"
            >
              Triage Conflict <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          ) : null}
        </div>

        <h3 className="font-body-lg text-body-lg font-semibold text-on-surface group-hover:text-primary-fixed transition-colors">
          {match.title}
        </h3>

        <div className="flex items-center gap-stack-compact flex-wrap text-body-sm text-on-surface-variant">
          <span className="bg-surface-container-lowest px-2 py-0.5 rounded font-mono-code text-micro-label text-tertiary flex items-center gap-1">
            <Icon name="token" className="text-[12px]" />
            matched ‘{match.matched[0]}’
          </span>
          {match.chain.length > 0 ? (
            <>
              <span className="text-muted font-mono-code text-micro-label">Graph Chain:</span>
              <div className="flex items-center gap-1 font-mono-code text-micro-label text-on-surface bg-surface-container-highest px-2 py-0.5 rounded flex-wrap">
                {match.chain.map((node, index) => (
                  <span key={`${node.tool}-${node.label}`} className="flex items-center gap-1">
                    {index > 0 ? <span className="text-muted">↔</span> : null}
                    <ToolPill tool={node.tool}>{node.label}</ToolPill>
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ArtifactCard({
  match,
  onHover,
  active,
}: {
  match: SearchMatch;
  onHover: (match: SearchMatch) => void;
  active: boolean;
}) {
  const tool = match.tool ?? "git";
  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`group p-stack-comfortable rounded-xl cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between border border-outline-variant/40 ${
        active ? "bg-surface-container-high" : "bg-surface-container-low hover:bg-surface-container"
      }`}
    >
      <div className="flex items-center gap-stack-comfortable min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toolBox[tool]}`}
        >
          <Icon name={toolIcon[tool]} className="text-[20px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-primary">
              {match.title}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label shrink-0">
              {tool}
            </span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-muted truncate font-mono-code text-micro-label">
            <span>{match.meta}</span>
            {match.findingId ? (
              <>
                <span>•</span>
                <span className="text-secondary">linked to {match.findingId}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <Icon
        name="chevron_right"
        className="text-muted group-hover:text-on-surface transition-colors text-[20px]"
      />
    </div>
  );
}

function LinkCard({
  match,
  onHover,
  active,
}: {
  match: SearchMatch;
  onHover: (match: SearchMatch) => void;
  active: boolean;
}) {
  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`group p-stack-comfortable rounded-xl cursor-pointer transition-all duration-200 shadow-sm border border-outline-variant/40 ${
        active ? "bg-surface-container-high" : "bg-surface-container-low hover:bg-surface-container"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono-code text-body-sm flex-wrap">
          <span className="text-tertiary font-semibold">{match.chain[0]?.label}</span>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-bold text-eyebrow tracking-wider uppercase">
            [{match.relation ?? "RELATES"}]
          </span>
          <span className="text-primary font-semibold">{match.chain[1]?.label}</span>
        </div>
        <span className="font-mono-code text-body-sm text-secondary font-bold shrink-0">
          {Math.round((match.confidence ?? 0) * 100)}% Match
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-micro-label font-mono-code text-muted">
        <span>Provenance: {match.provenance}</span>
        <span>•</span>
        <span>{match.meta}</span>
      </div>
    </div>
  );
}

function PolicyCard({
  match,
  onHover,
  active,
}: {
  match: SearchMatch;
  onHover: (match: SearchMatch) => void;
  active: boolean;
}) {
  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`group p-stack-comfortable rounded-xl cursor-pointer transition-all duration-200 shadow-sm border border-outline-variant/40 ${
        active ? "bg-surface-container-high" : "bg-surface-container-low hover:bg-surface-container"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono-code text-body-sm font-bold text-tertiary">{match.title}</span>
            <span
              className={`px-1.5 py-0.2 rounded font-mono-code text-micro-label ${
                match.badge === "POLICY ACTIVE"
                  ? "bg-surface-container-highest text-secondary"
                  : "bg-surface-container-highest text-muted"
              }`}
            >
              {match.badge}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{match.meta}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-bold shrink-0 ${
            match.severity === "critical" ? "bg-error-container text-error" : "bg-tertiary-container text-on-tertiary-container"
          }`}
        >
          {match.severity?.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-micro-label font-mono-code text-muted">
        <span>Matched: {match.matched[0]}</span>
        <span>•</span>
        <span className="text-on-surface-variant">{match.id}</span>
      </div>
    </div>
  );
}

export interface ResultGroup {
  kind: SearchKind;
  items: SearchMatch[];
  total: number;
}

export interface TabDef {
  id: SearchKind | "all";
  label: string;
  count: number;
  critical?: boolean;
}

/** Centre pane: category tabs, grouped result cards and pagination. */
export function ResultsColumn({
  groups,
  tabs,
  activeTab,
  onTabChange,
  sort,
  onSortToggle,
  page,
  pageCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
  total,
  rangeStart,
  rangeEnd,
  onHover,
  activeId,
}: {
  groups: ResultGroup[];
  tabs: TabDef[];
  activeTab: SearchKind | "all";
  onTabChange: (id: SearchKind | "all") => void;
  sort: "relevance" | "recency";
  onSortToggle: () => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onHover: (match: SearchMatch) => void;
  activeId: string;
}) {
  return (
    <div className="col-span-12 lg:col-span-6 flex flex-col gap-stack-comfortable">
      {/* Category tabs */}
      <div className="flex items-center justify-between bg-surface-container-low p-1.5 rounded-xl shadow-sm gap-2">
        <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition whitespace-nowrap ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-semibold shadow"
                    : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className={tab.critical ? "text-error font-medium" : undefined}>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono-code text-micro-label ${
                    tab.critical
                      ? "bg-error-container text-error font-bold"
                      : isActive
                        ? "bg-primary text-on-primary font-bold"
                        : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 pr-2 shrink-0">
          <span className="font-mono-code text-label-caps text-muted">SORT:</span>
          <button
            type="button"
            onClick={onSortToggle}
            className="flex items-center gap-1 font-mono-code text-[12px] text-on-surface hover:text-primary"
          >
            {sort === "relevance" ? "Relevance" : "Recency"}
            <Icon name="expand_more" className="text-[14px]" />
          </button>
        </div>
      </div>

      {/* Grouped results */}
      {groups.length === 0 ? (
        <div className="p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant text-center shadow-sm">
          <Icon name="search_off" className="text-muted text-[28px]" />
          <p className="text-body-md text-on-surface-variant mt-2">No matches</p>
        </div>
      ) : (
        groups.map((group) => {
          const meta = groupMeta[group.kind];
          return (
            <div key={group.kind} className="flex flex-col gap-stack-compact">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-stack-compact">
                  {meta.dot ? <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} /> : null}
                  {meta.icon ? (
                    <Icon name={meta.icon} className={`${meta.iconClass} text-[18px]`} />
                  ) : null}
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    {kindLabels[group.kind]}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono-code text-label-caps font-bold ${
                      group.kind === "conflict"
                        ? "bg-error-container text-error"
                        : "bg-surface-container-highest text-on-surface"
                    }`}
                  >
                    {group.total} Match{group.total === 1 ? "" : "es"}
                  </span>
                </div>
                {meta.href ? (
                  <Link
                    href={meta.href}
                    className="font-mono-code text-micro-label text-primary hover:underline flex items-center gap-1"
                  >
                    {meta.linkLabel} <Icon name="open_in_new" className="text-[12px]" />
                  </Link>
                ) : null}
              </div>

              {group.items.map((match) => {
                const active = match.id === activeId;
                if (match.kind === "conflict")
                  return <ConflictCard key={match.id} match={match} onHover={onHover} active={active} />;
                if (match.kind === "artifact")
                  return <ArtifactCard key={match.id} match={match} onHover={onHover} active={active} />;
                if (match.kind === "link")
                  return <LinkCard key={match.id} match={match} onHover={onHover} active={active} />;
                return <PolicyCard key={match.id} match={match} onHover={onHover} active={active} />;
              })}
            </div>
          );
        })
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between p-stack-comfortable bg-surface-container-low rounded-xl shadow-sm gap-2">
        <div className="flex items-center gap-stack-compact text-body-sm text-muted">
          <span>
            Showing <strong className="text-on-surface font-semibold">{rangeStart}-{rangeEnd}</strong>{" "}
            of <strong className="text-on-surface font-semibold">{total}</strong> results
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <Icon name="chevron_left" className="text-[16px]" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index).map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => onPageChange(index)}
              className={`w-8 h-8 rounded font-mono-code text-body-sm ${
                index === page
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => onPageChange(page + 1)}
            className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <Icon name="chevron_right" className="text-[16px]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-label-caps text-muted">PER PAGE:</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="bg-surface-container border border-outline-variant text-on-surface font-mono-code text-[12px] rounded px-2 py-1 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
