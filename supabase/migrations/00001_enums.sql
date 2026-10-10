-- =============================================================================
-- UNIFY — 00001: enum types
--
-- Every value is traceable to the frozen vocabulary in
-- `packages/contracts/src/enums.ts`, which is itself derived from the ERD
-- legend (`docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex`), the domain model
-- and the frozen label taxonomy. Adding a value is a cross-cutting change:
-- DB enum, contracts, UI and report must move together.
-- =============================================================================

-- ---- sources & graph vocabulary (ERD legend, §9.1) --------------------------

create type public.source_tool as enum ('github', 'jira', 'figma', 'system');

create type public.node_type as enum (
  'DesignArtifact', 'DesignConstraint', 'Ticket', 'Criterion', 'Requirement',
  'PullRequest', 'Commit', 'CodeSymbol', 'TestCase', 'Person', 'Message'
);

create type public.edge_type as enum (
  'OWNS', 'ASSIGNED_TO', 'WATCHES', 'PART_OF', 'CONSTRAINS', 'COVERS',
  'TOUCHES_COMPONENT', 'IMPLEMENTS', 'TRACKS', 'SATISFIES',
  'SATISFIES_CANDIDATE', 'DISCUSSED_IN', 'BLOCKS', 'DUPLICATES', 'REFERENCES'
);

create type public.source_class as enum ('observed', 'derived', 'model_candidate', 'unresolved');

create type public.link_state as enum ('active', 'dismissed', 'revoked');

-- ---- code anchors (§22.1–§22.4) --------------------------------------------

create type public.anchor_method as enum ('created', 'symbol', 'hash', 'hunk');

create type public.anchor_status as enum ('active', 'broken');

-- ---- verdict taxonomy (frozen — Action Plan §2) -----------------------------

create type public.verdict_status as enum (
  'SUPPORTED', 'CONTRADICTED', 'PARTIAL', 'INSUFFICIENT_EVIDENCE'
);

create type public.freshness_state as enum ('CURRENT', 'STALE', 'UNKNOWN');

create type public.reason_code as enum (
  'SOURCE_STALE', 'MISSING_TEST', 'AMBIGUOUS_LINK', 'AMBIGUOUS_CRITERION',
  'INVALID_CITATION', 'DYNAMIC_BEHAVIOUR', 'TRUNCATED_EVIDENCE', 'OTHER'
);

create type public.divergence_tag as enum (
  'REQUIREMENT_CHANGED_ANCHOR_UNCHANGED',
  'ANCHOR_CHANGED_REQUIREMENT_UNCHANGED'
);

-- ---- findings, rules and audit (ERD legend, FR-12/FR-18) --------------------

create type public.finding_state as enum (
  'open', 'acknowledged', 'resolved', 'disputed', 'suppressed'
);

-- `rules.produces` — which committed rule finding this is (FR-12, FR-24).
create type public.finding_kind as enum (
  'design_version_drift',
  'workflow_state_inconsistency',
  'overlapping_change_scope',
  'requirement_implementation_divergence'
);

-- ERD `findings.kind` — the rule|verdict origin discriminator.
create type public.finding_origin as enum ('rule', 'verdict');

create type public.severity as enum ('critical', 'high', 'medium', 'low');

create type public.person_role as enum ('pm', 'designer', 'developer', 'reviewer', 'admin');

create type public.notification_channel as enum ('slack', 'in_app');

-- ---- verifier loop (§11.4–§11.8) -------------------------------------------

create type public.stop_reason as enum (
  'NO_APPLICABLE_EVIDENCE', 'VERIFIED', 'CRITIC_REVIEWED',
  'PASS_CAP_REACHED', 'MODEL_UNAVAILABLE'
);

create type public.gate_outcome as enum ('PASSED', 'DOWNGRADED', 'REJECTED');

-- ---- database-internal (auth/tenancy + audit vocabulary) --------------------

-- Role in a workspace's membership (multi-tenant scoping, not `person_role`).
create type public.workspace_role as enum ('owner', 'admin', 'member');

-- `audit_log.action` (ERD marks the column as an enum without listing values;
-- these cover the FR-18 finding transitions plus link/rule reviewer actions).
create type public.audit_action as enum (
  'finding_acknowledged', 'finding_resolved', 'finding_disputed',
  'finding_suppressed', 'finding_reopened',
  'link_confirmed', 'link_dismissed',
  'rule_activated', 'rule_deactivated'
);

create type public.delivery_status as enum ('pending', 'sent', 'delivered', 'failed');
