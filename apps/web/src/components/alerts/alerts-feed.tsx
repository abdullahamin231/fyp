"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  alertTabs,
  alertsForTab,
  countForTab,
  policyCategory,
  sortAlerts,
  type AlertTabId,
  type HealthSummary,
  type SortMode,
} from "@/lib/domain/alerts";
import type { Finding, ToolKind } from "@/lib/types";

/** Dismissible AI-health banner, derived from the findings list. */
function deriveHealthSummary(list: Finding[]): HealthSummary {
  const blocking = list.filter(
    (f) => f.status === "open" && (f.severity === "critical" || f.severity === "warning"),
  ).length;
  return {
    headline: "AI Health Summary",
    lead: "You have",
    highlight: `${blocking} critical conflict${blocking === 1 ? "" : "s"}`,
    tail: "blocking the release.",
  };
}

const toolIcon: Record<ToolKind, string> = {
  figma: "draw",
  github: "merge_type",
  jira: "confirmation_number",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

const verdictChip: Record<string, string> = {
  SUPPORTED: "bg-secondary/15 text-secondary",
  CONTRADICTED: "bg-error-container text-error",
  PARTIAL: "bg-tertiary-container text-on-tertiary-container",
  INSUFFICIENT_EVIDENCE: "bg-surface-container-highest text-on-surface-variant",
};

function AlertCard({ finding }: { finding: Finding }) {
  const [queued, setQueued] = useState(false);
  const title = finding.title;
  const isCritical = finding.severity === "critical";
  const category = policyCategory[finding.policy ?? "criterion_verification"];

  return (
    <article className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden hover:border-tertiary hover:bg-surface-container-high transition-all group">
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-high/50">
        <div className="flex items-center gap-2">
          <span
            className={`text-eyebrow font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isCritical
                ? "bg-tertiary text-on-tertiary-fixed"
                : "bg-surface-variant text-on-surface-variant"
            }`}
          >
            {isCritical ? "Critical" : category}
          </span>
          <span className="font-mono-code text-micro-label text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-lowest">
            {finding.policy ?? "verdict"}
          </span>
          <span className="text-on-surface-variant text-body-sm">Detected {finding.ageLabel} ago</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon
            name="push_pin"
            className="text-on-surface-variant text-[16px] cursor-pointer hover:text-on-surface"
          />
          <Icon
            name="more_vert"
            className="text-on-surface-variant text-[16px] cursor-pointer hover:text-on-surface"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/conflicts/${finding.id}`}
              className="text-on-surface font-bold text-headline-sm hover:text-primary transition-colors"
            >
              {title}
            </Link>
            <span className="font-mono-code text-micro-label text-primary shrink-0">#{finding.id}</span>
          </div>
          <p className="text-on-surface-variant mb-4">{finding.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finding.artifacts.slice(0, 2).map((artifact) => (
              <div
                key={`${artifact.tool}-${artifact.ref}`}
                className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
                  <Icon name={toolIcon[artifact.tool]} className="text-sm" />
                  <span className="font-label-caps uppercase text-eyebrow">{artifact.label}</span>
                </div>
                <p className="font-bold text-body-md truncate">{artifact.ref}</p>
                <p className="text-on-surface-variant text-body-sm mt-1 truncate">
                  {finding.team} · {finding.ageLabel} ago
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-body-sm mt-3">
            <span
              className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-bold ${
                verdictChip[finding.verdict ?? "INSUFFICIENT_EVIDENCE"]
              }`}
            >
              {finding.verdict ?? "INSUFFICIENT_EVIDENCE"}
            </span>
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Icon name="policy" className="text-sm" />
              {finding.policyTitle}
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span
              className={`flex items-center gap-1.5 ${
                finding.freshness === "CURRENT" ? "text-secondary" : "text-tertiary"
              }`}
            >
              <Icon name={finding.freshness === "CURRENT" ? "verified" : "history"} className="text-sm" />
              {finding.freshness === "CURRENT" ? "Sources fresh" : `Sources ${finding.freshness.toLowerCase()}`}
            </span>
          </div>
        </div>

        <div className="w-full md:w-48 flex flex-col gap-2 justify-center shrink-0">
          <Link
            href={`/conflicts/${finding.id}`}
            className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-transform text-center"
          >
            Review Change
          </Link>
          <button
            type="button"
            onClick={() => setQueued(true)}
            className={`w-full py-2 border border-outline-variant font-bold rounded-lg active:scale-95 transition-transform ${
              queued
                ? "bg-secondary/10 border-secondary/40 text-secondary"
                : "bg-transparent text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {queued ? "Queued ✓" : "Resolve"}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Left pane of the alerts screen: AI banner + filter tabs + conflict feed. */
export function AlertsFeed({ findings }: { findings: Finding[] }) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<AlertTabId>("all");
  const [sort, setSort] = useState<SortMode>("recency");
  const healthSummary = deriveHealthSummary(findings);

  const visible = sortAlerts(alertsForTab(findings, activeTab), sort);

  return (
    <div className="flex-1 flex flex-col min-w-0 gap-stack-comfortable">
      {bannerVisible ? (
        <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-tertiary/20 rounded-lg shrink-0">
            <Icon name="auto_awesome" className="text-tertiary" fill />
          </div>
          <div className="flex-1">
            <h3 className="text-tertiary font-bold text-body-md mb-1.5">{healthSummary.headline}</h3>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              {healthSummary.lead}{" "}
              <span className="text-tertiary font-bold underline">{healthSummary.highlight}</span>{" "}
              {healthSummary.tail}
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss summary"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={() => setBannerVisible(false)}
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}

      {/* Filter tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant mt-2">
        <div className="flex gap-4 overflow-x-auto">
          {alertTabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-primary text-primary font-bold text-body-sm"
                    : "border-transparent text-on-surface-variant hover:text-on-surface font-medium text-body-sm"
                }`}
              >
                {tab.label} ({countForTab(findings, tab.id)})
              </button>
            );
          })}
        </div>
        <div className="pb-3">
          <button
            type="button"
            onClick={() => setSort(sort === "recency" ? "severity" : "recency")}
            className="flex items-center gap-2 text-on-surface-variant text-body-sm hover:text-on-surface transition-colors"
          >
            <Icon name="filter_list" className="text-sm" />
            Sort by {sort === "recency" ? "Recency" : "Severity"}
          </button>
        </div>
      </div>

      {/* Conflict feed */}
      <div className="space-y-gutter pb-10">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center">
            <Icon name="notifications_off" className="text-muted text-[28px]" />
            <p className="text-body-md text-on-surface-variant mt-2">
              No alerts in this view
            </p>
          </div>
        ) : (
          visible.map((finding) => <AlertCard key={finding.id} finding={finding} />)
        )}
      </div>
    </div>
  );
}
