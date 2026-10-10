import type { ToolKind } from "@/lib/types";

/**
 * Immutable audit ledger types.
 *
 * Append-only records of everything UNIFY did: link mutations, conflict
 * verdicts, policy bumps and token scope audits. Each event carries the
 * SHA-256 digest of its canonicalised payload so the export panel can prove
 * integrity end-to-end.
 */

export type AuditActionType =
  | "CONFLICT_RESOLVED"
  | "CONFLICT_SUPPRESSED"
  | "LINK_MANUAL_ASSERTION"
  | "LINK_SUGGESTION_REJECTED"
  | "POLICY_VERSION_BUMP"
  | "TOKEN_SCOPE_AUDIT";

export interface AuditActor {
  /** Stable filter key — `system` for every service identity. */
  id: string;
  /** Monospace handle shown on the row. */
  handle: string;
  name: string;
  role: string;
  kind: "system" | "user";
  /** Two-letter avatar for people; empty for system actors (icon instead). */
  initials: string;
  /** Material Symbol rendered for system actors. */
  icon?: string;
}

export interface AuditArtifact {
  tool: ToolKind;
  label: string;
  /** Secondary mono context, e.g. repo or branch. */
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
  /** Compact relative label shown under the timestamp. */
  relative: string;
  /** Hours since the event — drives the date-range filter. */
  hoursAgo: number;
  actorId: string;
  /** Overrides the actor's default role line (subsystem that acted). */
  actorTag?: string;
  action: AuditActionType;
  artifact: AuditArtifact;
  reason: string;
  /** Full SHA-256 hex digest of the canonical payload. */
  hash: string;
  /** Canonical event payload rendered by the JSON inspector. */
  payload: Record<string, unknown>;
  diff: AuditDiff;
}

/** Every action type, for the filter dropdown. */
export const auditActions: AuditActionType[] = [
  "CONFLICT_RESOLVED",
  "CONFLICT_SUPPRESSED",
  "LINK_MANUAL_ASSERTION",
  "LINK_SUGGESTION_REJECTED",
  "POLICY_VERSION_BUMP",
  "TOKEN_SCOPE_AUDIT",
];

/** Preset window options for the date-range filter. */
export const auditDateRanges: { id: string; label: string; hours: number }[] = [
  { id: "24h", label: "Last 24 Hours", hours: 24 },
  { id: "7d", label: "Last 7 Days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 Days", hours: 24 * 30 },
];

/** Saved filter preset — a named actor / action / query combination. */
export interface AuditPreset {
  id: string;
  label: string;
  dot: "secondary" | "primary" | "tertiary";
  actor?: string;
  action?: AuditActionType;
  query?: string;
}

/** Ledger header totals — supplied by the audit API. */
export interface AuditTotals {
  events: number;
  blockHeight: number;
  merkleRoot: string;
  latencyMs: number;
}

/** Empty ledger header until the audit API returns a payload. */
export const emptyAuditTotals: AuditTotals = {
  events: 0,
  blockHeight: 0,
  merkleRoot: "—",
  latencyMs: 0,
};
