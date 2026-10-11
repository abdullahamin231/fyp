import type { Finding, Severity } from "@/lib/types";

/**
 * Conflict-alerts screen types and predicates.
 *
 * The tab predicates and sort take the findings list as an argument, so the
 * screen can pass whatever the alerts API returns.
 */

export type AlertTabId = "all" | "critical" | "drift" | "mismatch";

export const alertTabs: { id: AlertTabId; label: string }[] = [
  { id: "all", label: "All Alerts" },
  { id: "critical", label: "Critical" },
  { id: "drift", label: "Design Drift" },
  { id: "mismatch", label: "Status Mismatch" },
];

/** Filters the supplied findings down to the ones a tab shows. */
export function alertsForTab(findings: Finding[], id: AlertTabId): Finding[] {
  switch (id) {
    case "critical":
      return findings.filter((f) => f.severity === "critical");
    case "drift":
      return findings.filter((f) => f.policy === "RULE_1" || f.policy === "RULE_3");
    case "mismatch":
      return findings.filter((f) => f.policy === "RULE_2" || f.policy === null);
    case "all":
    default:
      return findings;
  }
}

export function countForTab(findings: Finding[], id: AlertTabId): number {
  return alertsForTab(findings, id).length;
}

export type SortMode = "recency" | "severity";

const severityRank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

/** Sorts a page of alerts either by recency (newest first) or severity. */
export function sortAlerts(list: Finding[], mode: SortMode): Finding[] {
  const copy = [...list];
  if (mode === "severity") {
    return copy.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }
  return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Human category label per rule id — drives the "Design Drift" style filters. */
export const policyCategory: Record<string, string> = {
  RULE_1: "Design Drift",
  RULE_2: "Workflow State",
  RULE_3: "Overlapping Scope",
  criterion_verification: "Criterion Verification",
};

/** Right-rail: integration connection row. */
export interface Integration {
  name: string;
  status: string;
  connected: boolean;
}

/** Right-rail: per-person resolution leaderboard row. */
export interface ResolutionLeader {
  name: string;
  initials: string;
  resolved: number;
  open: number;
  verified: boolean;
}

/** Dismissible AI-health banner copy. */
export interface HealthSummary {
  headline: string;
  lead: string;
  highlight: string;
  tail: string;
}

/** Right-rail: 7-day alert frequency sparkline, in chronological order. */
export interface FrequencySeries {
  points: number[];
  delta: string;
  axis: string[];
}
