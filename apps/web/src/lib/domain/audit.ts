import type { ToolKind } from "@/lib/types";

/**
 * The audit trail as the reviewer reads it: one row per `audit_log` record,
 * which is append-only (UPDATE/DELETE revoked and trigger-locked, migrations
 * 00004/00005). `digest` is the SHA-256 of the record's canonical JSON, so an
 * exported row can be checked against the database later; it is a per-record
 * fingerprint, not a chain.
 */

/** The `audit_action` enum, exactly as 00001_enums.sql defines it. */
export const auditActions = [
  "finding_acknowledged",
  "finding_resolved",
  "finding_disputed",
  "finding_suppressed",
  "finding_reopened",
  "link_confirmed",
  "link_dismissed",
  "rule_activated",
  "rule_deactivated",
] as const;

export type AuditActionType = (typeof auditActions)[number];

export interface AuditActor {
  /** The actor's `Person` node id. */
  id: string;
  handle: string;
  name: string;
  initials: string;
}

export interface AuditArtifact {
  tool: ToolKind;
  label: string;
  context?: string;
}

export interface AuditDiff {
  removed: string;
  added: string;
}

export interface AuditEvent {
  id: string;
  /** `YYYY-MM-DD HH:MM:SS` in UTC. */
  timestamp: string;
  relative: string;
  hoursAgo: number;
  actorId: string;
  action: AuditActionType;
  artifact: AuditArtifact;
  reason: string;
  digest: string;
  /** The stored record, shown by the JSON inspector and exported as-is. */
  payload: Record<string, unknown>;
  /** Present when the record carries a state change (`from` → `to`). */
  diff: AuditDiff | null;
}

export const auditDateRanges: { id: string; label: string; hours: number }[] = [
  { id: "24h", label: "Last 24 Hours", hours: 24 },
  { id: "7d", label: "Last 7 Days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 Days", hours: 24 * 30 },
  { id: "all", label: "All Time", hours: Number.POSITIVE_INFINITY },
];

/** One `audit_log` row as the loader selects it. */
export interface AuditRow {
  id: string;
  finding_id: string | null;
  actor_id: string;
  action: AuditActionType;
  reason: string | null;
  evidence_snapshot: Record<string, unknown> | null;
  at: string;
}

export interface AuditActorRow {
  id: string;
  external_id: string;
  payload: { name?: string | null; email?: string | null } | null;
}

export interface AuditFindingRow {
  id: string;
  annotation: string | null;
  subject: { type: string; external_id: string } | null;
}

function initialsOf(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function toAuditActor(row: AuditActorRow): AuditActor {
  const name = row.payload?.name ?? row.payload?.email ?? row.external_id;
  const handle = row.payload?.email?.replace(/@.*/, "") ?? name;
  return { id: row.id, handle, name, initials: initialsOf(name) };
}

function relativeLabel(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`;
  if (hours < 48) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const TOOL_BY_SUBJECT: Record<string, ToolKind> = {
  Ticket: "jira",
  Criterion: "jira",
  Requirement: "jira",
  DesignArtifact: "figma",
  DesignConstraint: "figma",
  PullRequest: "github",
  Commit: "git",
  CodeSymbol: "github",
  TestCase: "test",
};

function artifactOf(row: AuditRow, finding: AuditFindingRow | undefined): AuditArtifact {
  if (finding) {
    return {
      tool: TOOL_BY_SUBJECT[finding.subject?.type ?? ""] ?? "git",
      label: finding.subject?.external_id ?? `finding ${finding.id.slice(0, 8)}`,
      context: finding.annotation ?? undefined,
    };
  }
  const edgeId = row.evidence_snapshot?.edgeId;
  if (typeof edgeId === "string") return { tool: "git", label: `link ${edgeId.slice(0, 8)}` };
  return { tool: "git", label: row.action.replace(/_.*/, "") };
}

function diffOf(snapshot: Record<string, unknown> | null): AuditDiff | null {
  const from = snapshot?.from;
  const to = snapshot?.to;
  if (typeof from !== "string" || typeof to !== "string") return null;
  return { removed: `state: ${from}`, added: `state: ${to}` };
}

export function toAuditEvent(
  row: AuditRow,
  finding: AuditFindingRow | undefined,
  digest: string,
  now: Date,
): AuditEvent {
  const at = new Date(row.at);
  const hoursAgo = Math.max(0, (now.getTime() - at.getTime()) / 3_600_000);
  return {
    id: row.id,
    timestamp: at.toISOString().slice(0, 19).replace("T", " "),
    relative: relativeLabel(hoursAgo),
    hoursAgo,
    actorId: row.actor_id,
    action: row.action,
    artifact: artifactOf(row, finding),
    reason: row.reason ?? "",
    digest,
    payload: { ...row },
    diff: diffOf(row.evidence_snapshot),
  };
}

/** Canonical JSON (keys sorted at every level) so a digest is reproducible. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

/** CSV of the events as shown, one row each. */
export function auditCsv(events: AuditEvent[], actors: Map<string, AuditActor>): string {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const header = ["timestamp_utc", "actor", "action", "artifact", "reason", "sha256"];
  const lines = events.map((e) =>
    [e.timestamp, actors.get(e.actorId)?.name ?? e.actorId, e.action, e.artifact.label, e.reason, e.digest]
      .map(cell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
