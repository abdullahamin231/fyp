import type { ToolKind } from "@/lib/types";

/**
 * Immutable audit ledger mock.
 *
 * Append-only records of everything UNIFY did: link mutations, conflict
 * verdicts, policy bumps and token scope audits. Each event carries the
 * SHA-256 digest of its canonicalised payload so the export panel can prove
 * integrity end-to-end.
 *
 * Types live here (rather than in `src/lib/types.ts`) so this screen can ship
 * without touching shared files.
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

export const auditActors: AuditActor[] = [
  {
    id: "system",
    handle: "System Engine",
    name: "Invariant Systems Engine",
    role: "DAEMON-CORE",
    kind: "system",
    initials: "",
    icon: "smart_toy",
  },
  {
    id: "@alex_mgr",
    handle: "@alex_mgr",
    name: "Alex Rivera",
    role: "Lead PM",
    kind: "user",
    initials: "AR",
  },
  {
    id: "@sarah_ux",
    handle: "@sarah_ux",
    name: "Sarah Chen",
    role: "Staff Product",
    kind: "user",
    initials: "SC",
  },
  {
    id: "@marcus_dev",
    handle: "@marcus_dev",
    name: "Marcus Taylor",
    role: "Senior Eng",
    kind: "user",
    initials: "MT",
  },
];

export const auditActions: AuditActionType[] = [
  "CONFLICT_RESOLVED",
  "CONFLICT_SUPPRESSED",
  "LINK_MANUAL_ASSERTION",
  "LINK_SUGGESTION_REJECTED",
  "POLICY_VERSION_BUMP",
  "TOKEN_SCOPE_AUDIT",
];

export const auditDateRanges: { id: string; label: string; hours: number }[] = [
  { id: "24h", label: "Last 24 Hours", hours: 24 },
  { id: "7d", label: "Last 7 Days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 Days", hours: 24 * 30 },
];

export interface AuditPreset {
  id: string;
  label: string;
  dot: "secondary" | "primary" | "tertiary";
  actor?: string;
  action?: AuditActionType;
  query?: string;
}

export const auditPresets: AuditPreset[] = [
  { id: "soc2", label: "SOC2 Compliance Snapshot", dot: "secondary", action: "TOKEN_SCOPE_AUDIT" },
  { id: "sprint", label: "Sprint 44 Replay Dump", dot: "primary", actor: "@marcus_dev" },
  {
    id: "benchmark",
    label: "Benchmark Metrics JSON",
    dot: "tertiary",
    actor: "system",
    action: "CONFLICT_RESOLVED",
  },
];

export const auditTotals = {
  events: 142891,
  blockHeight: 84219,
  merkleRoot: "0x9b4f7e22c8a1…31ad",
  latencyMs: 18,
};

export const auditEvents: AuditEvent[] = [
  {
    id: "evt_8f2a41d9",
    timestamp: "2026-10-08 14:32:08",
    relative: "12m ago",
    hoursAgo: 0.2,
    actorId: "system",
    action: "CONFLICT_RESOLVED",
    artifact: { tool: "github", label: "PR #142", context: "unify/web-client" },
    reason: "Deterministic AST match verified by Invariant Engine",
    hash: "8f2a41d99e0134bca8103ff2d5b7e0c9a41d2ef77c9b31d5e6a0f4b8c9c419c41",
    payload: {
      event_id: "evt_8f2a41d9",
      action: "CONFLICT_RESOLVED",
      finding: "CONF-1048",
      assertions: [
        { key: "ast.match.strict", status: "VALID", divergence_score: 0 },
        { key: "citations.resolved", status: "VALID", resolved: "5/5" },
      ],
      sanitization_tier: "ENTERPRISE_REDACTED",
    },
    diff: {
      removed: '"status": "open", "verdict": "CONTRADICTED", "divergence_score": 0.42',
      added: '"status": "resolved", "verdict": "SUPPORTED", "divergence_score": 0.00',
    },
  },
  {
    id: "evt_d49c301a",
    timestamp: "2026-10-08 13:14:02",
    relative: "1h 30m ago",
    hoursAgo: 1.5,
    actorId: "@sarah_ux",
    action: "LINK_MANUAL_ASSERTION",
    artifact: { tool: "figma", label: "CheckoutModal_v3", context: "node 239:104" },
    reason: "Linked Figma node 239:104 to React component <CheckoutModal />",
    hash: "d49c301aef871b9012a4bb7c3e5f9d2108a6e4b7f2c9d0a1b3c5d7e9f0a1b2c3",
    payload: {
      event_id: "evt_d49c301a",
      action: "LINK_MANUAL_ASSERTION",
      link_id: "LNK-302",
      relation: "IMPLEMENTS",
      provenance: "manual",
      eligibility: "confirmed",
      actor: "@sarah_ux",
    },
    diff: {
      removed: '"link": null, "eligibility": "unconfirmed"',
      added: '"link": "LNK-302", "eligibility": "confirmed", "provenance": "manual"',
    },
  },
  {
    id: "evt_3c91b72a",
    timestamp: "2026-10-08 11:45:20",
    relative: "3h ago",
    hoursAgo: 3,
    actorId: "@alex_mgr",
    action: "POLICY_VERSION_BUMP",
    artifact: { tool: "jira", label: "Policy P1-v2.2", context: "design drift" },
    reason: "Adjusted design discrepancy drift tolerance from 4px to 2px for mobile screens",
    hash: "3c91b72a44bb01fec9917d6a5b2e8f4c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a110",
    payload: {
      event_id: "evt_3c91b72a",
      action: "POLICY_VERSION_BUMP",
      policy: "P1",
      from: "P1-v2.1",
      to: "P1-v2.2",
      changed_by: "@alex_mgr",
      grace_minutes: 30,
    },
    diff: {
      removed: '"layout_tolerance_px": 4, "mode": "legacy_soft_assert", "auto_heal": false',
      added: '"layout_tolerance_px": 2, "mode": "strict_invariant_sha256", "auto_heal": true',
    },
  },
  {
    id: "evt_e801aa48",
    timestamp: "2026-10-08 10:12:33",
    relative: "4h ago",
    hoursAgo: 4.5,
    actorId: "@marcus_dev",
    action: "CONFLICT_SUPPRESSED",
    artifact: { tool: "jira", label: "Jira PROJ-88", context: "waiver" },
    reason: "Acknowledged: temporary layout margin waiver granted for iOS beta release",
    hash: "e801aa48c89b027734fa1d2c3b4a59687712b3c4d5e6f708192a3b4c5d6e7f8901e",
    payload: {
      event_id: "evt_e801aa48",
      action: "CONFLICT_SUPPRESSED",
      finding: "CONF-1047",
      policy: "P2",
      expires: "2026-10-20T00:00:00Z",
      actor: "@marcus_dev",
    },
    diff: {
      removed: '"status": "open", "suppress_until": null',
      added: '"status": "suppressed", "suppress_until": "2026-10-20T00:00:00Z"',
    },
  },
  {
    id: "evt_71be892a",
    timestamp: "2026-10-08 09:00:01",
    relative: "5h ago",
    hoursAgo: 5.5,
    actorId: "system",
    actorTag: "OAUTH-RECON",
    action: "TOKEN_SCOPE_AUDIT",
    artifact: { tool: "github", label: "OAuth: github-app", context: "40 endpoints" },
    reason: "Zero permission escalation detected across 40 webhook endpoints",
    hash: "71be892a00bf8a9144cc93f7e6d5c4b3a29182736455463728190ab9c8d7e6f26622",
    payload: {
      event_id: "evt_71be892a",
      action: "TOKEN_SCOPE_AUDIT",
      scopes_audited: 40,
      escalations: 0,
      dropped_fields: ["oauth_secret", "client_key"],
      sanitization_tier: "ENTERPRISE_REDACTED",
    },
    diff: {
      removed: '"scopes": ["repo", "admin:org", "workflow"], "legacy_token": true',
      added: '"scopes": ["repo", "read:project"], "legacy_token": false',
    },
  },
  {
    id: "evt_12ff903b",
    timestamp: "2026-10-08 07:15:19",
    relative: "7h ago",
    hoursAgo: 7.5,
    actorId: "@alex_mgr",
    action: "CONFLICT_RESOLVED",
    artifact: { tool: "github", label: "PR #139", context: "tokens-sync" },
    reason: "Approved dark mode semantic scale refactor across mobile and desktop palettes",
    hash: "12ff903bcde448821034a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f977ab",
    payload: {
      event_id: "evt_12ff903b",
      action: "CONFLICT_RESOLVED",
      finding: "CONF-1041",
      criteria: ["AC-1", "AC-2"],
      verdict: "SUPPORTED",
      actor: "@alex_mgr",
    },
    diff: {
      removed: '"semantic.scale": "legacy", "mode": "dark", "drift_px": 6',
      added: '"semantic.scale": "v2", "mode": "dark", "drift_px": 0',
    },
  },
  {
    id: "evt_994a2e88",
    timestamp: "2026-10-07 21:50:44",
    relative: "17h ago",
    hoursAgo: 17,
    actorId: "@marcus_dev",
    action: "LINK_MANUAL_ASSERTION",
    artifact: { tool: "github", label: "PaymentButton.tsx", context: "storybook #401" },
    reason: "Linked Storybook isolate #401 to prod PaymentButton module",
    hash: "994a2e88102bdc6130aab4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8bb41",
    payload: {
      event_id: "evt_994a2e88",
      action: "LINK_MANUAL_ASSERTION",
      link_id: "LNK-309",
      relation: "VERIFIES",
      provenance: "manual",
      eligibility: "confirmed",
      actor: "@marcus_dev",
    },
    diff: {
      removed: '"storybook_ref": null, "eligibility": "unconfirmed"',
      added: '"storybook_ref": "#401", "eligibility": "confirmed", "provenance": "manual"',
    },
  },
  {
    id: "evt_5b0c7d12",
    timestamp: "2026-10-06 16:40:12",
    relative: "2d ago",
    hoursAgo: 46,
    actorId: "@sarah_ux",
    action: "LINK_SUGGESTION_REJECTED",
    artifact: { tool: "github", label: "SGT-413", context: "tokens/globals.css" },
    reason:
      "Rejected inferred token parity suggestion — advisory edge, no decisive finding raised",
    hash: "5b0c7d12ef34a56b7890c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1",
    payload: {
      event_id: "evt_5b0c7d12",
      action: "LINK_SUGGESTION_REJECTED",
      suggestion: "SGT-413",
      confidence: 0.78,
      provenance: "inferred",
      eligibility: "unconfirmed",
      decisive_effect: false,
      actor: "@sarah_ux",
    },
    diff: {
      removed: '"queue": ["SGT-413"], "status": "awaiting_verification"',
      added: '"queue": [], "status": "rejected", "decisive_effect": false',
    },
  },
];
