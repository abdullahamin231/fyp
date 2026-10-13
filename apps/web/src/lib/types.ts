/**
 * UNIFY frontend domain types.
 *
 * Verdict vocabulary is imported straight from `@unify/contracts` so the UI
 * cannot drift from what the worker stores — a new reason code shows up in the
 * evidence case without anyone editing this file. Severity and finding state
 * below stay presentation-level: the database speaks `critical|high|medium|low`
 * and six finding states, and `lib/data/map.ts` is where that becomes three
 * severity chips and the statuses this inbox shows.
 */
import { VERDICT_STATUSES } from "@unify/contracts";
import type {
  FreshnessState as ContractFreshness,
  LinkEligibility as ContractLinkEligibility,
  ReasonCode as ContractReasonCode,
  ToolKind as ContractToolKind,
  VerdictStatus,
} from "@unify/contracts";

/* ------------------------------------------------------------------ verdicts */

export type Verdict = VerdictStatus;
/** The four verdicts, as values — filters, tallies and sort orders use it. */
export const VERDICTS = VERDICT_STATUSES;

export type FreshnessState = ContractFreshness;

export type ReasonCode = ContractReasonCode;

/* -------------------------------------------------------------------- tools */

export type ToolKind = ContractToolKind;

export interface Citation {
  /** e.g. `src/checkout/CheckoutModal.tsx:118-141` */
  locator: string;
  excerpt: string;
  tool: ToolKind;
  resolved: boolean;
}

export interface CriterionResult {
  criterionId: string;
  /** Jira key or requirement id, e.g. `PROJ-88` */
  requirementRef: string;
  text: string;
  verdict: Verdict;
  freshness: FreshnessState;
  reviewRequired: boolean;
  reasonCode?: ReasonCode;
  evidence: Citation[];
  missingEvidence?: string[];
  divergenceTag?: string;
}

/* ------------------------------------------------------- findings / conflicts */

export type Severity = "critical" | "warning" | "info";

/** The six states the DB stores (FR-18); the worker only ever writes `open`. */
export type FindingStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "suppressed"
  | "disputed"
  | "superseded";

/**
 * A policy reference. Committed rules use rule ids (`RULE_1`…); the mock
 * policy-config screens still use the proposal's `P1`–`P4` display ids. Both
 * are strings, so this is a plain alias rather than a second id space.
 */
export type PolicyId = string;

export interface ArtifactRef {
  tool: ToolKind;
  label: string;
  /** Short monospace locator shown inside the pill. */
  ref: string;
  title?: string;
  href?: string;
}

export interface Finding {
  id: string;
  /** Rule id (`RULE_1`…) for rule-origin findings, `null` for verdict-origin. */
  policy: string | null;
  policyTitle: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  artifacts: ArtifactRef[];
  ageLabel: string;
  createdAt: string;
  assignedTo: string[];
  team: string;
  summary: string;
  verdict?: Verdict;
  freshness: FreshnessState;
  reviewRequired: boolean;
  reasonCode?: ReasonCode;
  criteria: CriterionResult[];

  /* ---- provenance, straight from `verdicts` + `context_packets` (§11.8) ---- */
  /** Did the deterministic gate accept the model's answer? */
  gateOutcome?: "PASSED" | "DOWNGRADED" | "REJECTED";
  /** Why the verifier loop stopped (§11.4): VERIFIED, CRITIC_REVIEWED, … */
  stopReason?: string;
  /** How many of the bounded passes actually ran (max 3). */
  passCount?: number;
  /** SHA-256 of the packet manifest the verdict was computed from. */
  packetHash?: string;
  /** The model that produced the verdict, as recorded in `model_and_run`. */
  modelId?: string;
  /** Commits the packet spans, so the reviewer can check out the same code. */
  baseCommit?: string;
  headCommit?: string;
  /** The criterion this verdict is about, verbatim. */
  criterionText?: string;
  /** Set when a newer verdict replaced this finding (00012). */
  supersededById?: string;
}

/* --------------------------------------------------------------------- links */

export type LinkEligibility = ContractLinkEligibility;

export interface RelationLink {
  id: string;
  source: ArtifactRef;
  target: ArtifactRef;
  relation: "SATISFIES" | "REFERENCES" | "IMPLEMENTS" | "VERIFIES" | "BLOCKS";
  eligibility: LinkEligibility;
  confidence: number;
  provenance: "explicit" | "inferred" | "manual" | "reconciled";
  confirmedBy?: string;
  changedAt: string;
}

/* ------------------------------------------------------------------ activity */

export type ActivityKind =
  | "ingested"
  | "linked"
  | "finding"
  | "verdict"
  | "human"
  | "delivery";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  tool: ToolKind;
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
  /** Artifact the sentence ends on, e.g. a PR, ticket or channel key. */
  target?: string;
  findingId?: string;
}

/* ------------------------------------------------------------------ policies */

export interface Policy {
  /** Rule id (`RULE_1`…) or `criterion_verification` for a verdict-origin finding. */
  id: string;
  name: string;
  description: string;
  trigger: string;
  guards: string[];
  graceMinutes: number;
  severity: Severity;
  notifyTemplate: string;
  enabled: boolean;
  firedLast7d: number;
}

/* ------------------------------------------------------------------- tenancy */

/** Membership role in a workspace — mirrors the DB's `workspace_role` enum. */
export type WorkspaceRole = "owner" | "admin" | "member";

/** One workspace the signed-in user belongs to, with their role in it. */
export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
  createdAt: string;
  memberCount: number;
}

/** Mirrors the DB's `invitation_status` enum. */
export type InvitationStatus = "pending" | "accepted" | "declined";

/** A pending workspace invitation as shown in the notifications bell. */
export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  invitedEmail: string;
  /** User id of the inviter; resolved to a display name client-side. */
  invitedBy: string | null;
  role: WorkspaceRole;
  status: InvitationStatus;
  createdAt: string;
}

/* ---------------------------------------------------------------- evaluation */

export interface EvalMetric {
  id: string;
  label: string;
  value: string;
  target?: string;
  status: "pass" | "watch" | "fail";
}

/* ---------------------------------------------------------------- graph model */

export type GraphNodeKind = "requirement" | "code" | "test" | "design" | "pr" | "finding";

export interface GraphNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  tool?: ToolKind;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  eligible: boolean;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
