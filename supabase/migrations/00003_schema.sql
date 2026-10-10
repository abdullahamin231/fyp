-- =============================================================================
-- UNIFY — 00003: core schema (ERD PostgreSQL MVP)
--
-- Implements `docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex` — 13 tables in
-- three layers (uIngest / uGraph / uVerify). Column shapes mirror the Zod
-- contracts in `packages/contracts/src/` (the executable vocabulary), and the
-- append-only / immutable tables are enforced by triggers in 00005.
--
-- Design decision (ERD header): Requirement, Criterion, Ticket, ... are rows
-- of `nodes` (type discriminator + jsonb payload). Only CodeAnchor gets its
-- own table, because re-anchoring history needs one row per commit-pinned
-- anchor.
-- =============================================================================

-- =========================== uIngest: event reliability ======================

create table public.events (
  event_id            text primary key,
  vendor_delivery_id  text not null,
  workspace_id        uuid not null references public.workspaces (id),
  source_tool         public.source_tool not null,
  entity_type         text not null,
  entity_id           text not null,
  version             text,
  action              text not null,
  state_before        text,
  state_after         text,
  actor               text not null,
  occurred_at         timestamptz not null,
  received_at         timestamptz not null default now(),
  -- quoted: `references` is a reserved word in SQL.
  "references"        jsonb not null default '[]'::jsonb,
  raw_hash            text not null,
  schema_version      integer not null default 1,

  -- Duplicate delivery is a database-level no-op (FR-02).
  constraint events_delivery_unique unique (source_tool, vendor_delivery_id)
);

create index events_workspace_idx on public.events (workspace_id);
create index events_occurred_at_idx on public.events (occurred_at desc);

-- =========================== uGraph: evidence graph ==========================

create table public.nodes (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces (id),
  type           public.node_type not null,
  external_id    text not null,
  version        text,
  status         text,
  owner          text,
  last_modified  timestamptz not null default now(),
  valid_from     timestamptz not null default now(),
  -- null while this version is the current one.
  valid_to       timestamptz,
  payload        jsonb not null default '{}'::jsonb
);

-- One row per logical entity per workspace (ERD); content history lives in
-- artifact_snapshots.
create unique index nodes_identity_uidx
  on public.nodes (workspace_id, type, external_id);
create index nodes_workspace_type_idx on public.nodes (workspace_id, type);

create table public.edges (
  id            uuid primary key default gen_random_uuid(),
  from_id       uuid not null references public.nodes (id),
  to_id         uuid not null references public.nodes (id),
  type          public.edge_type not null,
  source_class  public.source_class not null,
  confidence    real not null default 1.0
                  check (confidence >= 0 and confidence <= 1),
  resolver      text not null,
  link_state    public.link_state not null default 'active',
  created_at    timestamptz not null default now(),
  valid_from    timestamptz not null default now(),
  valid_to      timestamptz,
  metadata      jsonb not null default '{}'::jsonb,

  constraint edges_no_self_loop check (from_id <> to_id)
);

create index edges_from_type_idx on public.edges (from_id, type);
create index edges_to_type_idx   on public.edges (to_id, type);

create table public.code_anchors (
  id              uuid primary key default gen_random_uuid(),
  edge_id         uuid not null references public.edges (id),
  -- re-anchoring chain; null for the first anchor of an edge.
  prev_anchor_id  uuid references public.code_anchors (id),
  repo            text not null,
  file_path       text not null,
  symbol_fqn      text not null,
  -- null for NFR anchors, which pin an enforcement point, not a line range.
  start_line      integer check (start_line is null or start_line > 0),
  end_line        integer check (end_line is null or end_line > 0),
  blob_hash       text not null,
  commit_sha      text not null,
  method          public.anchor_method not null,
  status          public.anchor_status not null default 'active',
  confidence      real not null default 1.0
                    check (confidence >= 0 and confidence <= 1),
  provenance      jsonb not null default '{}'::jsonb,

  constraint code_anchors_line_order
    check (start_line is null or end_line is null or start_line <= end_line)
);

create index code_anchors_edge_idx on public.code_anchors (edge_id);
create index code_anchors_prev_idx on public.code_anchors (prev_anchor_id);

-- ---- immutable evidence store (FR-03) ---------------------------------------

create table public.artifact_snapshots (
  id                uuid primary key default gen_random_uuid(),
  node_id           uuid not null references public.nodes (id),
  source_event_id   text not null references public.events (event_id),
  version           text not null,
  content_hash      text not null,
  captured_at       timestamptz not null default now(),
  -- Content exactly as the source produced it — untrusted, never executed.
  content           jsonb not null default '{}'::jsonb,

  -- A newer version creates a new snapshot; nothing is ever overwritten.
  constraint artifact_snapshots_version_uidx unique (node_id, version)
);

create index artifact_snapshots_node_idx on public.artifact_snapshots (node_id);

-- ---- ingestion checkpoints (§8.4, SOURCE_STALE) -----------------------------

create table public.checkpoints (
  workspace_id      uuid not null references public.workspaces (id),
  source_tool       public.source_tool not null,
  resource_id       text not null default '',
  last_event_id     text references public.events (event_id),
  last_state_at     timestamptz,
  last_success_at   timestamptz,
  source_stale      boolean not null default false,

  primary key (workspace_id, source_tool, resource_id)
);

-- =========================== uVerify: packets, verdicts ======================

create table public.context_packets (
  id                  uuid primary key default gen_random_uuid(),
  criterion_node_id   uuid not null references public.nodes (id),
  base_commit         text not null check (base_commit ~ '^[0-9a-f]{40}$'),
  head_commit         text not null check (head_commit ~ '^[0-9a-f]{40}$'),
  token_budget        integer not null check (token_budget > 0),
  slot_budgets        jsonb not null,
  manifest            jsonb not null,
  prompt_hash         text not null check (prompt_hash ~ '^[0-9a-f]{64}$'),
  packet_hash         text not null check (packet_hash ~ '^[0-9a-f]{64}$')
);

create index context_packets_criterion_idx on public.context_packets (criterion_node_id);

create table public.verdicts (
  id                 uuid primary key default gen_random_uuid(),
  packet_id          uuid not null references public.context_packets (id),
  status             public.verdict_status not null,
  evidence           jsonb not null default '[]'::jsonb,
  reason             text not null,
  missing_evidence   text,
  divergence_tag     public.divergence_tag,
  freshness_state    public.freshness_state not null default 'UNKNOWN',
  review_required    boolean not null default false,
  reason_code        public.reason_code,
  pass_count         integer not null check (pass_count between 1 and 3),
  stop_reason        public.stop_reason not null,
  gate_outcome       public.gate_outcome not null,
  model_and_run      jsonb not null
);

create index verdicts_packet_idx on public.verdicts (packet_id);

-- ---- versioned rules (§9.3, FR-19) ------------------------------------------

create table public.rules (
  id                    text not null,
  version               integer not null check (version > 0),
  edge_type             public.edge_type,
  trigger               jsonb not null,
  guards                jsonb not null default '[]'::jsonb,
  condition             text not null,
  grace_period_hours    integer not null default 0 check (grace_period_hours >= 0),
  produces              public.finding_kind not null,
  severity              public.severity not null,
  notify                jsonb not null,
  resolution_options    text[] not null default '{}',
  active                boolean not null default true,

  primary key (id, version)
);

-- ---- findings (FR-12, FR-15 idempotency, FR-18 lifecycle) -------------------

create table public.findings (
  id                 uuid primary key default gen_random_uuid(),
  subject_node_id    uuid not null references public.nodes (id),
  -- ERD `findings.kind`: the rule|verdict origin discriminator.
  origin             public.finding_origin not null,
  rule_id            text,
  rule_version       integer,
  verdict_id         uuid references public.verdicts (id),
  -- `rules.produces` — which committed finding this is.
  kind               public.finding_kind not null,
  idempotency_key    text not null unique,
  annotation         text not null,
  severity           public.severity not null,
  state              public.finding_state not null default 'open',
  created_at         timestamptz not null default now(),

  constraint findings_rule_fk
    foreign key (rule_id, rule_version) references public.rules (id, version),
  -- Exactly one origin: rule+version or verdict (ERD CHECK, contract refine).
  constraint findings_one_origin check (
    (origin = 'rule'
      and rule_id is not null and rule_version is not null and verdict_id is null)
    or
    (origin = 'verdict'
      and verdict_id is not null and rule_id is null and rule_version is null)
  )
);

create index findings_subject_idx on public.findings (subject_node_id);
create index findings_state_idx   on public.findings (state);

create table public.finding_evidence (
  finding_id    uuid not null references public.findings (id),
  snapshot_id   uuid not null references public.artifact_snapshots (id),
  role          text,

  primary key (finding_id, snapshot_id)
);

create index finding_evidence_snapshot_idx on public.finding_evidence (snapshot_id);

-- ---- audit & notifications (FR-18, FR-14) -----------------------------------

create table public.audit_log (
  id                 uuid primary key default gen_random_uuid(),
  -- nullable: link/rule reviewer actions are audited without a finding.
  finding_id         uuid references public.findings (id),
  actor_id           uuid not null references public.nodes (id),
  action             public.audit_action not null,
  reason             text,
  evidence_snapshot  jsonb,
  at                 timestamptz not null default now()
);

create index audit_log_finding_idx on public.audit_log (finding_id);
create index audit_log_at_idx      on public.audit_log (at desc);

create table public.notifications (
  id               uuid primary key default gen_random_uuid(),
  finding_id       uuid not null references public.findings (id),
  recipient_id     uuid not null references public.nodes (id),
  channel          public.notification_channel not null,
  delivery_status  public.delivery_status not null default 'pending',
  delivered_at     timestamptz
);

create index notifications_finding_idx   on public.notifications (finding_id);
create index notifications_recipient_idx on public.notifications (recipient_id);
