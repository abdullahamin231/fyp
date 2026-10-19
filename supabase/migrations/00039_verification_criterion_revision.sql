-- UNIFY — 00039: pin queue work to a criterion revision and publish atomically.
-- Deploy with the worker stopped, apply this migration, then start the updated
-- worker. Historical jobs/packets/verdicts remain intact. Unstarted work can
-- adopt the current criterion; running work must be cancelled and replaced.

alter table public.verification_jobs
  add column criterion_version text,
  add column criterion_text text;

update public.verification_jobs j
   set criterion_version = n.version, criterion_text = n.payload ->> 'text'
  from public.nodes n
 where n.id = j.criterion_node_id and j.state = 'queued';

create or replace function public.enqueue_verification(
  p_criterion_node_id uuid,
  p_base_commit text,
  p_head_commit text,
  p_requested_by uuid default null
)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_node public.nodes%rowtype;
  v_key text;
  v_id uuid;
  v_text text;
begin
  -- Take the node lock first, as ingestion and result publication do. An edit
  -- cannot race the revision read or deduplication below.
  select * into v_node from public.nodes
   where id = p_criterion_node_id and type = 'Criterion' and valid_to is null
   for update;
  if not found then
    raise exception 'node % is not a live Criterion', p_criterion_node_id using errcode = 'no_data_found';
  end if;
  if auth.uid() is not null and not public.is_workspace_member(v_node.workspace_id) then
    raise exception 'not a member of workspace %', v_node.workspace_id using errcode = 'insufficient_privilege';
  end if;
  v_text := v_node.payload ->> 'text';
  if coalesce(btrim(v_text), '') = '' then
    raise exception 'criterion % has no text', p_criterion_node_id;
  end if;
  v_key := p_criterion_node_id::text || ':' || p_base_commit || ':' || p_head_commit;
  perform pg_advisory_xact_lock(hashtext(v_key));

  select id into v_id from public.verification_jobs
   where criterion_node_id = p_criterion_node_id
     and base_commit = p_base_commit and head_commit = p_head_commit
     and criterion_version is not distinct from v_node.version
     and criterion_text = v_text
     and state in ('queued', 'running')
   order by enqueued_at desc limit 1;
  if v_id is null then
    insert into public.verification_jobs
      (workspace_id, criterion_node_id, criterion_version, criterion_text,
       base_commit, head_commit, idempotency_key, requested_by)
    values (v_node.workspace_id, p_criterion_node_id, v_node.version, v_text,
            p_base_commit, p_head_commit, v_key || ':' || gen_random_uuid()::text, p_requested_by)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

-- A verdict, its finding, supersession and job completion commit together.
-- Holding the criterion lock through all four writes prevents an older run
-- from replacing a newer revision's finding, even if model calls finish out
-- of order. Obsolete runs retain their packet/pass logs but publish no result.
create or replace function public.complete_verification_job(
  p_job_id uuid,
  p_verdict jsonb,
  p_annotation text
)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_node public.nodes%rowtype;
  v_job public.verification_jobs%rowtype;
  v_verdict public.verdicts%rowtype;
  v_finding uuid;
begin
  select n.* into v_node from public.nodes n
    join public.verification_jobs j on j.criterion_node_id = n.id
   where j.id = p_job_id for update of n;
  if not found then raise exception 'unknown verification job %', p_job_id; end if;
  select * into v_job from public.verification_jobs where id = p_job_id for update;

  if v_job.state = 'succeeded' then
    select * into v_verdict from public.verdicts where job_id = p_job_id;
    select id into v_finding from public.findings where verdict_id = v_verdict.id;
    return jsonb_build_object('state', 'succeeded', 'verdictId', v_verdict.id, 'findingId', v_finding);
  end if;
  if v_job.state = 'cancelled' or v_node.valid_to is not null
     or v_job.criterion_version is distinct from v_node.version
     or v_job.criterion_text is distinct from v_node.payload ->> 'text' then
    update public.verification_jobs set state = 'cancelled', finished_at = now(),
           last_error = 'criterion changed or retired' where id = p_job_id;
    return jsonb_build_object('state', 'cancelled');
  end if;
  if v_job.state <> 'running' then raise exception 'verification job % is not running', p_job_id; end if;

  v_verdict := jsonb_populate_record(null::public.verdicts, p_verdict || jsonb_build_object('job_id', p_job_id));
  if not exists (select 1 from public.context_packets p
                  where p.id = v_verdict.packet_id and p.criterion_node_id = v_node.id
                    and p.base_commit = v_job.base_commit and p.head_commit = v_job.head_commit) then
    raise exception 'packet does not belong to verification job %', p_job_id;
  end if;
  insert into public.verdicts select v_verdict.*;
  insert into public.findings
    (subject_node_id, origin, verdict_id, kind, idempotency_key, annotation, severity, state)
  values (v_node.id, 'verdict', v_verdict.id, 'criterion_verification',
          'verdict:' || v_verdict.id::text, p_annotation,
          (case v_verdict.status when 'CONTRADICTED' then 'critical' when 'PARTIAL' then 'high'
            when 'INSUFFICIENT_EVIDENCE' then 'medium' else 'low' end)::public.severity, 'open')
  returning id into v_finding;
  update public.findings set state = 'superseded', superseded_by_id = v_finding
   where subject_node_id = v_node.id and origin = 'verdict' and id <> v_finding
     and state in ('open', 'acknowledged', 'disputed');
  update public.verification_jobs set state = 'succeeded', finished_at = now(),
         last_stop_reason = v_verdict.stop_reason where id = p_job_id;
  return jsonb_build_object('state', 'succeeded', 'verdictId', v_verdict.id, 'findingId', v_finding);
end;
$$;

revoke all on function public.complete_verification_job(uuid, jsonb, text) from public, anon, authenticated;
grant execute on function public.complete_verification_job(uuid, jsonb, text) to service_role;

-- A cancelled run must stay cancelled, including when an old worker catches
-- an error while shutting down during the deployment.
create or replace function public.finish_verification_job(
  p_job_id uuid,
  p_state public.verification_job_state,
  p_stop_reason public.stop_reason default null,
  p_error text default null
)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if p_state not in ('succeeded', 'failed', 'cancelled') then
    raise exception 'finish_verification_job takes a terminal state, got %', p_state;
  end if;
  update public.verification_jobs set state = p_state, finished_at = now(),
         last_stop_reason = p_stop_reason, last_error = p_error
   where id = p_job_id and state not in ('succeeded', 'cancelled');
end;
$$;

do $$
declare v_job record;
begin
  for v_job in
    update public.verification_jobs set state = 'cancelled', finished_at = now(),
           last_error = 'replaced during criterion revision migration'
     where state = 'running' returning *
  loop
    if exists (select 1 from public.nodes where id = v_job.criterion_node_id and valid_to is null) then
      perform public.enqueue_verification(v_job.criterion_node_id, v_job.base_commit, v_job.head_commit, v_job.requested_by);
    end if;
  end loop;
end;
$$;
