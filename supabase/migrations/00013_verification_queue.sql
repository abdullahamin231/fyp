-- =============================================================================
-- UNIFY — 00013: verification queue, per-pass log, link provenance
--
-- Slice C (TODO §3.3) needs three things the ERD does not yet carry:
--
--   verification_jobs   the criterion queue (§9.5): one row per request to
--                       (re)verify one atomic criterion at a pinned base/head,
--                       claimed by the worker with `for update skip locked`.
--   verifier_passes     FR-09: the bounded loop must log each pass's inputs,
--                       outputs and stop reason. `verdicts` keeps only the
--                       summary (`pass_count`, `stop_reason`).
--   edge resolution     UC-02 / FR-28: confirm/reject must record resolver
--                       provenance on the edge itself, not only in the audit
--                       trail, so link eligibility stays readable in a join.
--
-- It also completes the treatment of `verdicts` the team confirmed: SELECT and
-- INSERT policies already exist (00004), but unlike the other uVerify tables
-- it had no `forbid_mutation()` trigger and no UPDATE/DELETE revoke — i.e. RLS
-- decided *which* rows, not *what operations*. A verdict is produced once and
-- re-readable forever; a re-verification appends a new verdict instead.
--
-- Owner: Abdullah Amin. Contracts: packages/contracts (gate.ts, packet.ts).
-- =============================================================================

-- ---- 1 · criterion queue ----------------------------------------------------

create type public.verification_job_state as enum (
  'queued', 'running', 'succeeded', 'failed', 'cancelled'
);

create table public.verification_jobs (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references public.workspaces (id),
  criterion_node_id  uuid not null references public.nodes (id),
  -- Pinned revision pair: a packet is meaningless without it (FR-06, §22.2).
  base_commit        text not null check (base_commit ~ '^[0-9a-f]{40}$'),
  head_commit        text not null check (head_commit ~ '^[0-9a-f]{40}$'),
  state              public.verification_job_state not null default 'queued',
  attempts           integer not null default 0 check (attempts >= 0),
  priority           integer not null default 0,
  enqueued_at        timestamptz not null default now(),
  started_at         timestamptz,
  finished_at        timestamptz,
  last_stop_reason   public.stop_reason,
  last_error         text,
  requested_by       uuid references auth.users (id) on delete set null,
  -- criterion + revision pair + reason to run: re-enqueueing the same work is
  -- a no-op, so a duplicated webhook or a double click cannot queue twice.
  idempotency_key    text not null unique,

  constraint verification_jobs_started_after_enqueued
    check (started_at is null or started_at >= enqueued_at),
  constraint verification_jobs_finished_after_started
    check (finished_at is null or started_at is null or finished_at >= started_at)
);

create index verification_jobs_workspace_idx on public.verification_jobs (workspace_id);
create index verification_jobs_criterion_idx on public.verification_jobs (criterion_node_id);
-- The claim index: workers read `state = 'queued'` ordered by priority/time.
create index verification_jobs_claim_idx
  on public.verification_jobs (priority desc, enqueued_at)
  where state = 'queued';

comment on table public.verification_jobs is
  'Criterion queue (§9.5, FR-09). One row per request to verify one atomic criterion at a pinned base/head; the worker claims rows with FOR UPDATE SKIP LOCKED via claim_verification_job().';

-- ---- 2 · per-pass log (FR-09) -----------------------------------------------

create table public.verifier_passes (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references public.verification_jobs (id) on delete cascade,
  pass_no         integer not null check (pass_no between 1 and 3),
  -- Prompt template hash + the slot ids fed in: enough to say *what* went in
  -- without duplicating the immutable packet it came from.
  prompt_hash     text not null check (prompt_hash ~ '^[0-9a-f]{64}$'),
  input_refs      jsonb not null default '{}'::jsonb,
  -- Exactly what the model returned, before any parsing (untrusted, verbatim).
  raw_output      jsonb,
  parsed_ok       boolean not null default false,
  stop_reason     public.stop_reason,
  model_and_run   jsonb,
  started_at      timestamptz not null default now(),
  duration_ms     integer not null default 0 check (duration_ms >= 0),

  constraint verifier_passes_no_repeat unique (job_id, pass_no)
);

create index verifier_passes_job_idx on public.verifier_passes (job_id, pass_no);

comment on table public.verifier_passes is
  'FR-09 per-pass record: inputs, outputs and stop reason for each of the at most 3 passes of one bounded verifier run.';

-- A verdict names the run that produced it, so the reviewer can walk
-- verdict → job → passes without guessing.
alter table public.verdicts
  add column job_id uuid references public.verification_jobs (id);

create index verdicts_job_idx on public.verdicts (job_id);

-- ---- 3 · queue RPCs ---------------------------------------------------------

-- SECURITY DEFINER so the caller's RLS on the underlying tables cannot make the
-- queue behave differently for two members of the same workspace. Authz is done
-- explicitly inside: a signed-in caller must be a member of the criterion's
-- workspace; the worker (service role, no `auth.uid()`) is admitted as-is.
--
-- Re-queueing a terminal job for the same (criterion, base, head) resets it
-- rather than appending a duplicate row — the history of a run lives in
-- `verifier_passes` and `verdicts`, not in the job row.
create or replace function public.enqueue_verification(
  p_criterion_node_id uuid,
  p_base_commit text,
  p_head_commit text,
  p_requested_by uuid default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_workspace uuid;
  v_key text;
  v_id uuid;
  v_state public.verification_job_state;
begin
  select workspace_id into v_workspace from public.nodes
   where id = p_criterion_node_id and type = 'Criterion';
  if v_workspace is null then
    raise exception 'node % is not a Criterion', p_criterion_node_id
      using errcode = 'no_data_found';
  end if;

  -- Explicit authorisation (the function bypasses RLS).
  if auth.uid() is not null and not public.is_workspace_member(v_workspace) then
    raise exception 'not a member of workspace %', v_workspace
      using errcode = 'insufficient_privilege';
  end if;

  v_key := p_criterion_node_id::text || ':' || p_base_commit || ':' || p_head_commit;

  insert into public.verification_jobs
    (workspace_id, criterion_node_id, base_commit, head_commit, idempotency_key, requested_by)
  values
    (v_workspace, p_criterion_node_id, p_base_commit, p_head_commit, v_key, p_requested_by)
  on conflict (idempotency_key) do nothing;

  select id, state into v_id, v_state from public.verification_jobs
   where idempotency_key = v_key;

  if v_state in ('succeeded', 'failed', 'cancelled') then
    update public.verification_jobs
       set state = 'queued',
           attempts = 0,
           started_at = null,
           finished_at = null,
           last_stop_reason = null,
           last_error = null,
           enqueued_at = now()
     where id = v_id;
  end if;

  return v_id;
end;
$$;

-- Claim exactly one queued job. `FOR UPDATE SKIP LOCKED` is the whole point:
-- several workers (or one worker restarted mid-run) never take the same job.
create or replace function public.claim_verification_job()
returns setof public.verification_jobs
language sql
volatile
security definer
set search_path = public
as $$
  with claimed as (
    select j.id
      from public.verification_jobs j
     where j.state = 'queued'
     order by j.priority desc, j.enqueued_at
     for update of j skip locked
     limit 1
  )
  update public.verification_jobs j
     set state = 'running',
         started_at = now(),
         attempts = j.attempts + 1
    from claimed
   where j.id = claimed.id
  returning j.*;
$$;

create or replace function public.finish_verification_job(
  p_job_id uuid,
  p_state public.verification_job_state,
  p_stop_reason public.stop_reason default null,
  p_error text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_state not in ('succeeded', 'failed', 'cancelled') then
    raise exception 'finish_verification_job takes a terminal state, got %', p_state;
  end if;
  update public.verification_jobs
     set state = p_state,
         finished_at = now(),
         last_stop_reason = p_stop_reason,
         last_error = p_error
   where id = p_job_id;
end;
$$;

-- Queue control is worker-only; everything else on the table is read-only for
-- the API roles (there is deliberately no UPDATE policy for `authenticated`).
revoke all on function public.enqueue_verification(uuid, text, text, uuid) from public, anon;
revoke all on function public.claim_verification_job() from public, anon, authenticated;
revoke all on function public.finish_verification_job(uuid, public.verification_job_state, public.stop_reason, text) from public, anon, authenticated;

grant execute on function public.enqueue_verification(uuid, text, text, uuid) to authenticated, service_role;
grant execute on function public.claim_verification_job() to service_role;
grant execute on function public.finish_verification_job(uuid, public.verification_job_state, public.stop_reason, text) to service_role;

-- ---- 4 · link resolution provenance (UC-02, FR-04/FR-05/FR-28) --------------

-- `edges.resolver` already names *who/what* established the link; these record
-- *when* and *why a human agreed or disagreed*. Confirm writes resolver =
-- 'user:<id>' + resolution_reason; reject writes link_state = 'dismissed' with
-- the reason, which 00010 makes sticky (a human "no" is not re-raised by the
-- next webhook).
alter table public.edges
  add column resolved_at timestamptz,
  add column resolution_reason text;

comment on column public.edges.resolved_at is
  'When a human (or the threshold policy) resolved this link — UC-02 confirm/reject provenance.';
comment on column public.edges.resolution_reason is
  'Recorded reason for the confirm/reject decision; shown in the provenance modal and written to audit_log.';

-- ---- 5 · link confirmation policy (FR-28 two-threshold band) ---------------

-- Upper bound auto-confirms with `system-confirmed` provenance (reversible),
-- the band routes to the code owner/assignee, below the band stays a silent
-- suggestion. Values are checked in code against the contracts' `confidence`
-- scalar (0..1); the PM edits them through the settings surface (FR-29).
alter table public.workspaces
  add column link_policy jsonb not null default '{"upper": 0.85, "lower": 0.55}'::jsonb;

comment on column public.workspaces.link_policy is
  'FR-28 two-threshold link policy: {"upper": auto-confirm floor, "lower": suggestion floor}.';

-- ---- 6 · verdicts: complete the immutability treatment ----------------------

-- 00004 gave `verdicts` SELECT/INSERT policies; unlike its siblings it had no
-- trigger and no privilege revoke, so a member holding table-level UPDATE could
-- still have rewritten history had a policy ever allowed it. A verdict is
-- append-only: a re-verification inserts a new row and findings supersede the
-- old one (00012).
create trigger verdicts_append_only
  before update or delete on public.verdicts
  for each row execute function public.forbid_mutation();

revoke update, delete on public.verdicts from anon, authenticated;

-- ---- 7 · RLS for the new tables --------------------------------------------

-- Workspace of a queue row, via its criterion node.
create or replace function public.verification_job_workspace(p uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.workspace_id
    from public.verification_jobs j
    join public.nodes n on n.id = j.criterion_node_id
   where j.id = p;
$$;

-- Workspace of a pass log row, via its job.
create or replace function public.verifier_pass_workspace(p uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.verification_job_workspace(j.id)
    from public.verifier_passes vp
    join public.verification_jobs j on j.id = vp.job_id
   where vp.id = p;
$$;

revoke all on function public.verification_job_workspace(uuid) from public, anon;
revoke all on function public.verifier_pass_workspace(uuid) from public, anon;
grant execute on function public.verification_job_workspace(uuid) to authenticated, service_role;
grant execute on function public.verifier_pass_workspace(uuid) to authenticated, service_role;

alter table public.verification_jobs enable row level security;
alter table public.verifier_passes enable row level security;

-- Queue: members read their workspace's jobs. Writes happen through the
-- SECURITY DEFINER RPCs (or the service role), never from the client, so there
-- are no INSERT/UPDATE policies — posting directly to the table is impossible.
create policy "verification_jobs_select_member"
  on public.verification_jobs for select
  to authenticated
  using (is_workspace_member(verification_job_workspace(id)));

-- Passes: same read scope as their job.
create policy "verifier_passes_select_member"
  on public.verifier_passes for select
  to authenticated
  using (is_workspace_member(verifier_pass_workspace(id)));

-- Client-side verification history is read-only for API roles.
revoke insert, update, delete on public.verification_jobs from anon, authenticated;
revoke insert, update, delete on public.verifier_passes from anon, authenticated;
