import { z } from "zod";

/**
 * Enumerations shared across the whole system.
 *
 * Every value here is traceable to a frozen artefact — the ERD legend
 * (`docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex`), the domain model
 * (`diagrams/domain-model.tex`), the frozen label taxonomy
 * (`docs/dataset/02_case_schema.json`, Action Plan §2) or an FR in chapter 4.
 * Adding a value is a cross-cutting change: DB enum, contracts, UI and the
 * report must move together.
 */

// ---------------------------------------------------------------------------
// Sources and graph vocabulary
// ---------------------------------------------------------------------------

/**
 * Bound integrations. All are read-only OAuth; Slack is deliberately absent
 * because it is delivery-only and never an input to reasoning (ch5).
 *
 * `system` is not a vendor: it marks events synthesised by reconciliation when
 * a source failed to deliver a state change (FR-02 / §8.4).
 */
export const SOURCE_TOOLS = ["github", "jira", "figma", "system"] as const;
export const sourceToolSchema = z.enum(SOURCE_TOOLS);
export type SourceTool = z.infer<typeof sourceToolSchema>;

/** Type discriminator for rows of `nodes` (ERD legend). */
export const NODE_TYPES = [
  "DesignArtifact",
  "DesignConstraint",
  "Ticket",
  "Criterion",
  "Requirement",
  "PullRequest",
  "Commit",
  "CodeSymbol",
  "TestCase",
  "Person",
  "Message",
] as const;
export const nodeTypeSchema = z.enum(NODE_TYPES);
export type NodeType = z.infer<typeof nodeTypeSchema>;

/**
 * Association vocabulary (domain model §9.1). Every association below is
 * persisted as a row of `edges`.
 *
 * `SATISFIES_CANDIDATE` is the retrieval-only form of `SATISFIES`: it exists so
 * a model-proposed link can be stored and reviewed without ever being mistaken
 * for a confirmed one (FR-05).
 */
export const EDGE_TYPES = [
  "OWNS",
  "ASSIGNED_TO",
  "WATCHES",
  "PART_OF",
  "CONSTRAINS",
  "COVERS",
  "TOUCHES_COMPONENT",
  "IMPLEMENTS",
  "TRACKS",
  "SATISFIES",
  "SATISFIES_CANDIDATE",
  "DISCUSSED_IN",
  "BLOCKS",
  "DUPLICATES",
  "REFERENCES",
] as const;
export const edgeTypeSchema = z.enum(EDGE_TYPES);
export type EdgeType = z.infer<typeof edgeTypeSchema>;

/**
 * How an edge's endpoints were established (domain model note).
 * `model_candidate` and `unresolved` are never decisive on their own (FR-05).
 */
export const SOURCE_CLASSES = [
  "observed",
  "derived",
  "model_candidate",
  "unresolved",
] as const;
export const sourceClassSchema = z.enum(SOURCE_CLASSES);
export type SourceClass = z.infer<typeof sourceClassSchema>;

/** Lifecycle of a link (ERD legend). Only `active` links participate. */
export const LINK_STATES = ["active", "dismissed", "revoked"] as const;
export const linkStateSchema = z.enum(LINK_STATES);
export type LinkState = z.infer<typeof linkStateSchema>;

// ---------------------------------------------------------------------------
// Code anchors (traceability, §22.1–§22.4)
// ---------------------------------------------------------------------------

/** Re-anchoring strategy that produced the current anchor (ERD legend). */
export const ANCHOR_METHODS = ["created", "symbol", "hash", "hunk"] as const;
export const anchorMethodSchema = z.enum(ANCHOR_METHODS);
export type AnchorMethod = z.infer<typeof anchorMethodSchema>;

/**
 * `active` until re-anchoring fails at every step, then `broken` — the anchor
 * is marked, never silently moved (FR-23).
 */
export const ANCHOR_STATUSES = ["active", "broken"] as const;
export const anchorStatusSchema = z.enum(ANCHOR_STATUSES);
export type AnchorStatus = z.infer<typeof anchorStatusSchema>;

// ---------------------------------------------------------------------------
// Verdict taxonomy (frozen — Action Plan §2, README)
// ---------------------------------------------------------------------------

/** The only four verdicts the system may emit. */
export const VERDICT_STATUSES = [
  "SUPPORTED",
  "CONTRADICTED",
  "PARTIAL",
  "INSUFFICIENT_EVIDENCE",
] as const;
export const verdictStatusSchema = z.enum(VERDICT_STATUSES);
export type VerdictStatus = z.infer<typeof verdictStatusSchema>;

/** Whether the cited evidence is still current (frozen taxonomy). */
export const FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN"] as const;
export const freshnessStateSchema = z.enum(FRESHNESS_STATES);
export type FreshnessState = z.infer<typeof freshnessStateSchema>;

/**
 * Frozen reason codes (dataset schema `$defs.label.reason_code`). An empty
 * reason is expressed as `null` in contracts, not as `""`.
 */
export const REASON_CODES = [
  "SOURCE_STALE",
  "MISSING_TEST",
  "AMBIGUOUS_LINK",
  "AMBIGUOUS_CRITERION",
  "INVALID_CITATION",
  "DYNAMIC_BEHAVIOUR",
  "TRUNCATED_EVIDENCE",
  "OTHER",
] as const;
export const reasonCodeSchema = z.enum(REASON_CODES);
export type ReasonCode = z.infer<typeof reasonCodeSchema>;

/**
 * The two directions of policy P4 (requirement / implementation divergence,
 * FR-24): each side of the anchor changed while the other did not, past the
 * grace period.
 */
export const DIVERGENCE_TAGS = [
  "REQUIREMENT_CHANGED_ANCHOR_UNCHANGED",
  "ANCHOR_CHANGED_REQUIREMENT_UNCHANGED",
] as const;
export const divergenceTagSchema = z.enum(DIVERGENCE_TAGS);
export type DivergenceTag = z.infer<typeof divergenceTagSchema>;

// ---------------------------------------------------------------------------
// Findings, rules and audit
// ---------------------------------------------------------------------------

/** Finding lifecycle (ERD legend) — the five FR-18 transitions. */
export const FINDING_STATES = [
  "open",
  "acknowledged",
  "resolved",
  "disputed",
  "suppressed",
  "superseded",
] as const;
export const findingStateSchema = z.enum(FINDING_STATES);
export type FindingState = z.infer<typeof findingStateSchema>;

/** Which side of the system produced a finding (ERD `findings.kind`). */
export const FINDING_ORIGINS = ["rule", "verdict"] as const;
export const findingOriginSchema = z.enum(FINDING_ORIGINS);
export type FindingOrigin = z.infer<typeof findingOriginSchema>;

/**
 * The finding kinds the committed rule set can produce: Rules 1–3 (FR-12) and
 * policy P4 (FR-24). This is `rules.produces`.
 */
export const FINDING_KINDS = [
  "design_version_drift",
  "workflow_state_inconsistency",
  "overlapping_change_scope",
  "requirement_implementation_divergence",
] as const;
export const findingKindSchema = z.enum(FINDING_KINDS);
export type FindingKind = z.infer<typeof findingKindSchema>;

/** Severity vocabulary used by rules and inherited by their findings. */
export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export const severitySchema = z.enum(SEVERITIES);
export type Severity = z.infer<typeof severitySchema>;

/** Roles used for notification routing (FR owner columns, ch4). */
export const PERSON_ROLES = [
  "pm",
  "designer",
  "developer",
  "reviewer",
  "admin",
] as const;
export const personRoleSchema = z.enum(PERSON_ROLES);
export type PersonRole = z.infer<typeof personRoleSchema>;

/** Delivery channels (FR-14). Slack is delivery only — never an input. */
export const NOTIFICATION_CHANNELS = ["slack", "in_app"] as const;
export const notificationChannelSchema = z.enum(NOTIFICATION_CHANNELS);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

// ---------------------------------------------------------------------------
// Context packets and the bounded verifier loop
// ---------------------------------------------------------------------------

/**
 * Fixed packet slots, each with its own token budget (§1.7 per-slot budgets).
 *
 * The first five are named verbatim in §1.7; `TEST_EVIDENCE` (FR-06) and
 * `DESIGN_CONSTRAINTS` (FR-07) are required to satisfy FR-06/FR-07 and are
 * recorded here so the slot list stays a single, reviewable definition.
 */
export const PACKET_SLOTS = [
  "REQUIREMENT_TEXT",
  "DESIGN_CONSTRAINTS",
  "TEST_EVIDENCE",
  "SYMBOL_CARDS",
  "DIFF_HUNKS",
  "GRAPH_NEIGHBOURHOOD",
  "POLICY_DEFINITION",
] as const;
export const packetSlotSchema = z.enum(PACKET_SLOTS);
export type PacketSlot = z.infer<typeof packetSlotSchema>;

/** Why an item did not make it into a packet (§1.7: truncation is recorded). */
export const OMISSION_REASONS = [
  "BUDGET_EXCEEDED",
  "EVICTED",
  "NOT_RETRIEVED",
  "SOURCE_UNAVAILABLE",
] as const;
export const omissionReasonSchema = z.enum(OMISSION_REASONS);
export type OmissionReason = z.infer<typeof omissionReasonSchema>;

/**
 * Stop reason for a verifier pass (FR-09: every pass logs one). The pass cap
 * (3) is enforced by `PASS_CAP_REACHED`; a model-server timeout is
 * `MODEL_UNAVAILABLE` and is reported as an unavailable verdict, never as a
 * clean result (ch5).
 */
export const STOP_REASONS = [
  "NO_APPLICABLE_EVIDENCE",
  "VERIFIED",
  "CRITIC_REVIEWED",
  "PASS_CAP_REACHED",
  "MODEL_UNAVAILABLE",
] as const;
export const stopReasonSchema = z.enum(STOP_REASONS);
export type StopReason = z.infer<typeof STOP_REASONS>;

/**
 * What the deterministic gate did with the model output (FR-10, §11.8):
 *
 * - `PASSED`     — decisive status with every citation resolved.
 * - `DOWNGRADED` — a check failed, the status was lowered and `reason_code`
 *                  records why.
 * - `REJECTED`   — hard gate 1: no evidence span, or malformed output. Counted
 *                  as an abstention, never shown as a decisive finding.
 */
export const GATE_OUTCOMES = ["PASSED", "DOWNGRADED", "REJECTED"] as const;
export const gateOutcomeSchema = z.enum(GATE_OUTCOMES);
export type GateOutcome = z.infer<typeof gateOutcomeSchema>;

/** Bounded verifier loop — the pass cap is 3 (FR-09, §11.4). */
export const MAX_VERIFIER_PASSES = 3;
