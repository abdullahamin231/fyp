/**
 * Conflict-alerts screen mock data: tab predicates, card titles, right-rail
 * charts and integration status. Derived from the shared findings mock — no
 * existing mock file is modified.
 */
import { findings } from "@/lib/mock/findings";
import type { Finding, PolicyId, Severity } from "@/lib/types";

export type AlertTabId = "all" | "critical" | "drift" | "mismatch";

export const alertTabs: { id: AlertTabId; label: string }[] = [
  { id: "all", label: "All Alerts" },
  { id: "critical", label: "Critical" },
  { id: "drift", label: "Design Drift" },
  { id: "mismatch", label: "Status Mismatch" },
];

export function countForTab(id: AlertTabId): number {
  return alertsForTab(id).length;
}

export function alertsForTab(id: AlertTabId): Finding[] {
  switch (id) {
    case "critical":
      return findings.filter((f) => f.severity === "critical");
    case "drift":
      return findings.filter((f) => f.policy === "P1" || f.policy === "P3");
    case "mismatch":
      return findings.filter((f) => f.policy === "P2" || f.policy === "P4");
    case "all":
    default:
      return findings;
  }
}

export type SortMode = "recency" | "severity";

const severityRank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

/** Sorts a page of alerts either by recency (mock age order) or severity. */
export function sortAlerts(list: Finding[], mode: SortMode): Finding[] {
  const copy = [...list];
  if (mode === "severity") {
    return copy.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }
  return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Short human titles for alert cards (finding.title is the policy name). */
export const alertTitles: Record<string, string> = {
  "CONF-1048": "Checkout modal step indicator contradicted after merge",
  "CONF-1047": "Ghost ticket PROJ-91 has no anchored code",
  "CONF-1046": "Approved Button token diverged from implementation",
  "CONF-1045": "Event priority schema signature mismatch",
  "CONF-1044": "Cart empty-state copy diverges from the approved frame",
  "CONF-1043": "PROJ-102 accepted with no implementation anchor",
  "CONF-1042": "Watcher prefs frame re-anchored and reconciled",
  "CONF-1041": "Generated icon library — suppressed artifact",
};

export const policyCategory: Record<PolicyId, string> = {
  P1: "Design Drift",
  P2: "Ghost Ticket",
  P3: "Token Drift",
  P4: "Status Mismatch",
};

/** AI health summary copy for the dismissible banner. */
const blockingCount = findings.filter(
  (f) => f.status === "open" && (f.severity === "critical" || f.severity === "warning"),
).length;

export const healthSummary = {
  headline: "AI Health Summary",
  lead: "You have",
  highlight: `${blockingCount} critical conflict${blockingCount === 1 ? "" : "s"}`,
  tail: "blocking the v2.1 release. Most trace to checkout redesign sync lag between Figma and main.",
};

/* --------------------------------------------------------------- right rail */

export const frequencySeries = [4, 6, 5, 9, 7, 11, 12];
export const frequencyDelta = "+12% vs LW";
export const frequencyAxis = ["Mon", "Wed", "Fri", "Sun"];

export interface Integration {
  name: string;
  status: string;
  connected: boolean;
}

export const integrations: Integration[] = [
  { name: "GitHub", status: "Connected", connected: true },
  { name: "Figma", status: "Connected", connected: true },
  { name: "Jira", status: "Syncing…", connected: false },
  { name: "Slack", status: "Connected", connected: true },
];

export interface ResolutionLeader {
  name: string;
  initials: string;
  resolved: number;
  open: number;
  verified: boolean;
}

export const resolutionLeaders: ResolutionLeader[] = (() => {
  const byName = new Map<string, { resolved: number; open: number }>();
  findings.forEach((finding) => {
    finding.assignedTo.forEach((name) => {
      const entry = byName.get(name) ?? { resolved: 0, open: 0 };
      if (finding.status === "resolved") entry.resolved += 1;
      else if (finding.status === "open") entry.open += 1;
      byName.set(name, entry);
    });
  });
  return [...byName.entries()]
    .map(([name, counts]) => ({
      name,
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      resolved: counts.resolved,
      open: counts.open,
      verified: counts.open === 0,
    }))
    .sort((a, b) => b.resolved - a.resolved || b.open - a.open)
    .slice(0, 3);
})();
