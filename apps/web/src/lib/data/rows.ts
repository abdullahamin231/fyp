import type { Severity as ContractSeverity, VerdictStatus } from "@unify/contracts";

/**
 * Row shapes for the tables the reviewer surface reads.
 *
 * Hand-written rather than generated, and deliberately *narrow*: each type
 * lists only the columns its query selects, so a rename shows up as a type
 * error at the query site instead of a silent `undefined` in the UI. Parse the
 * values you trust through the contract schemas (`@unify/contracts`) before
 * acting on them — RLS says who may read a row, not that the row is well-formed.
 */

export type DbSeverity = ContractSeverity;
export type DbFindingState =
  | "open"
  | "acknowledged"
  | "resolved"
  | "suppressed"
  | "disputed"
  | "superseded";
export type DbFindingOrigin = "rule" | "verdict";

export interface FindingRow {
  id: string;
  subject_node_id: string;
  origin: DbFindingOrigin;
  rule_id: string | null;
  rule_version: number | null;
  verdict_id: string | null;
  kind: string;
  idempotency_key: string;
  annotation: string;
  severity: DbSeverity;
  state: DbFindingState;
  created_at: string;
  superseded_by_id: string | null;
}

export interface VerdictRow {
  id: string;
  packet_id: string;
  job_id: string | null;
  status: VerdictStatus;
  evidence: unknown;
  reason: string;
  missing_evidence: string | null;
  divergence_tag: string | null;
  freshness_state: "CURRENT" | "STALE" | "UNKNOWN";
  review_required: boolean;
  reason_code: string | null;
  pass_count: number;
  stop_reason: string;
  gate_outcome: "PASSED" | "DOWNGRADED" | "REJECTED";
  model_and_run: { modelId?: string } | null;
}

export interface PacketRow {
  id: string;
  criterion_node_id: string;
  base_commit: string;
  head_commit: string;
  token_budget: number;
  manifest: {
    slots?: {
      slot: string;
      tokensUsed: number;
      tokenBudget: number;
      included: {
        id: string;
        kind: string;
        content?: string;
        contentSha256?: string;
        cite?: {
          file?: string;
          symbol?: string;
          startLine?: number;
          endLine?: number;
        };
      }[];
      omitted: { id: string; kind: string; reason: string }[];
    }[];
    truncated?: boolean;
    tokenEstimator?: string;
  } | null;
  prompt_hash: string;
  packet_hash: string;
}

export interface PassRow {
  id: string;
  job_id: string | null;
  pass_no: number;
  prompt_hash: string;
  parsed_ok: boolean;
  stop_reason: string | null;
  duration_ms: number;
  model_and_run: { modelId?: string; startedAt?: string } | null;
}

export interface NodeRow {
  id: string;
  workspace_id: string;
  type: string;
  external_id: string;
  payload: {
    text?: string;
    requirementRef?: string | null;
    title?: string;
    author?: string;
  } | null;
  last_modified: string;
}

export interface EdgeRow {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  source_class: "observed" | "derived" | "model_candidate" | "unresolved";
  confidence: number;
  resolver: string;
  link_state: "active" | "dismissed" | "revoked";
  created_at: string;
  resolved_at: string | null;
  resolution_reason: string | null;
}

export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
}
