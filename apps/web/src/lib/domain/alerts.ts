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

/** Each provider's state across the caller's workspaces. */
export function integrationStatus(
  connections: { provider: string }[],
  deliveries: { provider: string; received_at: string }[],
  now: Date,
): Integration[] {
  const names: Record<string, string> = { github: "GitHub", jira: "Jira", figma: "Figma" };
  return Object.entries(names).map(([provider, name]) => {
    const connected = connections.some((c) => c.provider === provider);
    const latest = deliveries.filter((d) => d.provider === provider).map((d) => d.received_at).sort().at(-1);
    if (!connected) return { name, status: "Not connected", connected };
    if (!latest) return { name, status: "No deliveries yet", connected };
    const hours = (now.getTime() - new Date(latest).getTime()) / 3_600_000;
    const ago = hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m` : hours < 48 ? `${Math.round(hours)}h` : `${Math.round(hours / 24)}d`;
    return { name, status: `Last event ${ago} ago`, connected };
  });
}

/** Who resolved findings this week, most first. */
export function resolutionLeaders(
  resolutions: { actor_id: string }[],
  actors: Map<string, string>,
): ResolutionLeader[] {
  const counts = new Map<string, number>();
  for (const r of resolutions) counts.set(r.actor_id, (counts.get(r.actor_id) ?? 0) + 1);
  return [...counts]
    .map(([id, resolved]) => {
      const name = actors.get(id) ?? "Unknown reviewer";
      const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
      return { name, initials: ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase(), resolved };
    })
    .sort((a, b) => b.resolved - a.resolved || a.name.localeCompare(b.name))
    .slice(0, 5);
}

/** Right-rail: per-person resolution leaderboard row. */
export interface ResolutionLeader {
  name: string;
  initials: string;
  resolved: number;
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
