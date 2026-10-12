-- =============================================================================
-- UNIFY — 00017: re-verification creates a new job
--
-- 00013 keyed a verification job on (criterion, base, head) and, when that job
-- had already finished, requeued the same row. The verifier's per-pass log is
-- append-only with UNIQUE (job_id, pass_no), so a requeued job that tries to
-- write pass 1 again fails: a criterion could only ever be verified once per
-- commit pair. That contradicts the design, where a re-verification appends a
-- new packet/verdict pair.
--
-- The rule now:
--   · a queued or running job for the same work is returned, not duplicated
--     (a double click or a repeated webhook still queues once);
--   · once that job has finished, enqueueing the same work creates a new job.
--     The finished job keeps its passes and verdicts as history.
--
-- Signature and grants are unchanged (CREATE OR REPLACE keeps the ACL).
-- Owner: Abdullah Amin.
-- =============================================================================

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

  -- Serialise concurrent enqueues for the same work item.
  perform pg_advisory_xact_lock(hashtext(v_key));

  select id into v_id from public.verification_jobs
   where criterion_node_id = p_criterion_node_id
     and base_commit = p_base_commit
     and head_commit = p_head_commit
     and state in ('queued', 'running')
   order by enqueued_at desc
   limit 1;

  if v_id is null then
    insert into public.verification_jobs
      (workspace_id, criterion_node_id, base_commit, head_commit, idempotency_key, requested_by)
    values
      (v_workspace, p_criterion_node_id, p_base_commit, p_head_commit,
       v_key || ':' || gen_random_uuid()::text, p_requested_by)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;
