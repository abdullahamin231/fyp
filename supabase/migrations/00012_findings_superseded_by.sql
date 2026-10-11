-- =============================================================================
-- UNIFY — 00012: findings.superseded_by_id
--
-- The self-reference the ERD draws between findings, plus the biconditional
-- CHECK the ERD states: a finding is in state 'superseded' exactly when it
-- names its replacement. Superseding appends — the original row is never
-- overwritten — so a superseded finding remains readable against the artifact
-- versions it actually cited (FR-03 / FR-18).
-- =============================================================================

alter table public.findings
  add column if not exists superseded_by_id uuid
    references public.findings (id);

-- Backfill safety: nothing predates this column, so there are no rows to fix.
-- The CHECK is added NOT VALID first, then validated, so a table with rows is
-- never locked for the duration of a full scan on a live project.
alter table public.findings
  add constraint findings_superseded_pairing
  check ((state = 'superseded') = (superseded_by_id is not null))
  not valid;

alter table public.findings
  validate constraint findings_superseded_pairing;

-- FK lookups walk superseded_by_id -> findings(id); Postgres does not index the
-- referencing side of a nullable FK on its own.
create index if not exists findings_superseded_by_idx
  on public.findings (superseded_by_id)
  where superseded_by_id is not null;
