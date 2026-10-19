-- =============================================================================
-- UNIFY — 00019: ingestion pipeline settings and analysis targets
--
-- Two additions that let the webhook path run the whole chain without manual
-- steps:
--
--   integration_apps.criteria_field
--       Per-workspace Jira setting: the custom field key that holds a ticket's
--       acceptance criteria (e.g. 'customfield_10045'). NULL means "no field
--       configured" and the ingestion falls back to a strict
--       "Acceptance Criteria" section in the issue description. The value is a
--       field *key*, never parsed text: which field carries criteria is a
--       per-project decision the workspace records once.
--
--   analysis_targets
--       Which repositories the worker may analyse for a workspace, and the
--       test command to run at head (NULL = analyse diffs and symbols only,
--       never execute repository code). The worker consults this table before
--       touching git, so an unregistered repository produces no code evidence
--       rather than an un-audited analysis run.
--
-- Owner: team. RLS mirrors 00004: members read, nobody writes from a client.
-- =============================================================================

-- ---- 1 · Jira criteria field (per workspace) ----------------------------------

comment on column public.integration_apps.client_id is
  'Jira/GitHub/Figma app client id registered for this workspace.';

alter table public.integration_apps
  add column if not exists criteria_field text;

comment on column public.integration_apps.criteria_field is
  'Jira only: custom field key holding the ticket''s acceptance criteria (e.g. customfield_10045). NULL = use the strict description-section fallback.';

-- ---- 2 · analysis targets -----------------------------------------------------

create table if not exists public.analysis_targets (
  workspace_id    uuid not null references public.workspaces (id) on delete cascade,
  repo_full_name  text not null check (repo_full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  -- The command the analyser runs at head in a throwaway worktree. NULL means
  -- "no test execution": diffs and symbol cards are still analysed.
  test_command    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  primary key (workspace_id, repo_full_name)
);

comment on table public.analysis_targets is
  'Repositories the worker may analyse for a workspace, with the test command to run at head (NULL = no test execution). The worker refuses to analyse an unregistered repository, so an analysis run is never silent.';

alter table public.analysis_targets enable row level security;

drop policy if exists "analysis_targets_select_member" on public.analysis_targets;
create policy "analysis_targets_select_member"
  on public.analysis_targets for select
  to authenticated
  using (is_workspace_member(workspace_id));

-- Writers are the settings surface (service role) and the worker (service
-- role); clients only read. No insert/update/delete policies exist by design.
grant select on public.analysis_targets to authenticated;
