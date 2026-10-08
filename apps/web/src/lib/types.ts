/**
 * UNIFY frontend domain types.
 *
 * These mirror the frozen contract vocabulary from the proposal / dataset
 * protocol (four verdicts only, separate freshness + review fields) so that
 * swapping the mock layer for the real API is a drop-in change.
 */

/* ------------------------------------------------------------------ verdicts */

export const VERDICTS = [
  "SUPPORTED",
  "CONTRADICTED",
  "PARTIAL",
  "INSUFFICIENT_EVIDENCE",
] as const;
export type Verdict = (typeof VERDICTS)[number];

export type FreshnessState = "CURRENT" | "STALE" | "UNKNOWN";

export type ReasonCode =
  | "SOURCE_STALE"
  | "CITATION_UNRESOLVED"
  | "LINK_NOT_ELIGIBLE"
  | "BELOW_THRESHOLD"
  | "SCHEMA_VIOLATION"
  | "ABSTAINED";

/* -------------------------------------------------------------------- tools */

export type ToolKind = "figma" | "github" | "jira" | "slack" | "git" | "test";

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

export type FindingStatus = "open" | "acknowledged" | "resolved" | "suppressed";

export type PolicyId = "P1" | "P2" | "P3" | "P4";

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
  policy: PolicyId;
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
}

/* --------------------------------------------------------------------- links */

export type LinkEligibility = "confirmed" | "system-confirmed" | "inferred" | "unconfirmed";

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
  findingId?: string;
}

/* ------------------------------------------------------------------ policies */

export interface Policy {
  id: PolicyId;
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
