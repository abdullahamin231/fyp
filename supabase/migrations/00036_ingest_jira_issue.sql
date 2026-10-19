-- =============================================================================
-- UNIFY — 00036: Jira issue ingestion as one converging write
--
-- The web app parses a Jira webhook into a typed issue (apps/web/src/lib/
-- integrations/jira-issue.ts) and hands it to `ingest_jira_issue`, which brings
-- the graph to match it in one transaction:
--
--   kind 'ticket'   Ticket node upserted (and revived if it was retired), any
--                   Requirement node for the key retired, criteria synced.
--   kind 'nfr'      Requirement node upserted (revived if retired), the Ticket
--                   node for the key retired together with its criteria.
--   kind 'partial'  The payload does not say which (comment webhooks carry no
--                   labels): a live Requirement is left alone, otherwise the
--                   Ticket is updated and its criteria are not touched.
--
-- Criterion identity is `KEY/AC-n` by position in the ticket's list. A reorder
-- is therefore a text change on each moved position, not a move: positions
-- are what reviewers and verdicts refer to, and a text match across positions
-- would guess at intent the author never stated.
--
--   new position        Criterion created, Ticket -REFERENCES-> Criterion, snapshot.
--   text changed        version := issue version, payload text replaced, snapshot.
--   position removed    valid_to set, status 'retired', queued jobs cancelled.
--   retired, back again revived like a text change.
--
-- Every new or changed criterion is queued for verification on each pull
-- request that TRACKS the ticket, at that PR node's current head, so criteria
-- written after the PR do not wait for its next push. Doing this inside the
-- same transaction as the change is what keeps it convergent: a crash after
-- the change but before the enqueue cannot leave a criterion that no replay
-- will ever queue again.
--
-- Replaying a delivery is a no-op: an unchanged criterion is neither written
-- nor snapshotted nor re-queued.
-- =============================================================================

create or replace function public.sync_ticket_criteria(
  p_workspace_id   uuid,
  p_ticket_node_id uuid,
  p_ticket_key     text,
  p_criteria       jsonb,       -- {texts: text[], source, resolver}
  p_version        text,
  p_event_id       text,
  p_occurred_at    timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_texts     text[] := array(select jsonb_array_elements_text(coalesce(p_criteria -> 'texts', '[]'::jsonb)));
  v_source    text := p_criteria ->> 'source';
  v_prefix    text := p_ticket_key || '/AC-';
  v_kept      text[] := '{}';
  v_created   uuid[] := '{}';
  v_changed   uuid[] := '{}';
  v_unchanged uuid[] := '{}';
  v_retired   uuid[] := '{}';
  v_jobs      uuid[] := '{}';
  v_ext       text;
  v_text      text;
  v_id        uuid;
  v_row       record;
  v_pr        record;
begin
  for i in 1 .. coalesce(array_length(v_texts, 1), 0) loop
    v_ext := v_prefix || i;
    v_text := v_texts[i];
    v_kept := v_kept || v_ext;

    select id, payload ->> 'text' as text, valid_to into v_row
      from nodes
     where workspace_id = p_workspace_id and type = 'Criterion' and external_id = v_ext;

    if not found then
      insert into nodes (workspace_id, type, external_id, version, last_modified, payload)
      values (
        p_workspace_id, 'Criterion', v_ext, p_version, p_occurred_at,
        -- `loadCriterion` (worker) reads requirementRef, ruleApplicable, policyId.
        jsonb_build_object(
          'text', v_text, 'ticketKey', p_ticket_key, 'source', v_source,
          'requirementRef', p_ticket_key, 'ruleApplicable', true, 'policyId', null)
      )
      returning id into v_id;
      -- `derived` maps to system-confirmed eligibility, so verdicts built on
      -- this criterion can be decisive (packages/contracts eligibilityFor).
      insert into edges (from_id, to_id, type, source_class, confidence, resolver)
      values (p_ticket_node_id, v_id, 'REFERENCES', 'derived', 1.0, p_criteria ->> 'resolver')
      on conflict (from_id, to_id, type) where link_state <> 'revoked' do nothing;
      v_created := v_created || v_id;
    elsif v_row.text is distinct from v_text or v_row.valid_to is not null then
      update nodes
         set version       = p_version,
             status        = null,
             last_modified = p_occurred_at,
             valid_from    = case when valid_to is null then valid_from else now() end,
             valid_to      = null,
             payload       = payload || jsonb_build_object('text', v_text, 'source', v_source)
       where id = v_row.id;
      v_id := v_row.id;
      v_changed := v_changed || v_id;
    else
      v_unchanged := v_unchanged || v_row.id;
      continue;
    end if;

    insert into artifact_snapshots (node_id, source_event_id, version, content_hash, content)
    values (
      v_id, p_event_id, p_version,
      encode(sha256(convert_to(v_text, 'UTF8')), 'hex'),
      jsonb_build_object('text', v_text, 'ticketKey', p_ticket_key, 'source', v_source)
    )
    on conflict (node_id, version) do nothing;
  end loop;

  with retired as (
    update nodes
       set valid_to = now(), status = 'retired', last_modified = p_occurred_at
     where workspace_id = p_workspace_id
       and type = 'Criterion'
       and left(external_id, length(v_prefix)) = v_prefix
       and valid_to is null
       and external_id <> all (v_kept)
    returning id
  )
  select coalesce(array_agg(id), '{}') into v_retired from retired;

  update verification_jobs
     set state = 'cancelled', finished_at = now(), last_error = 'criterion retired'
   where criterion_node_id = any (v_retired) and state = 'queued';

  if cardinality(v_created || v_changed) > 0 then
    for v_pr in
      select n.version as head,
             -- The linker does not record the base on the PR node; the latest
             -- GitHub delivery for this head does.
             coalesce(n.payload ->> 'baseSha', (
               select d.raw_payload #>> '{pull_request,base,sha}'
                 from integration_deliveries d
                where d.workspace_id = p_workspace_id
                  and d.provider = 'github'
                  and d.raw_payload #>> '{pull_request,head,sha}' = n.version
                  and d.raw_payload #>> '{repository,full_name}' = n.payload ->> 'repo'
                order by d.received_at desc
                limit 1)) as base
        from edges e
        join nodes n on n.id = e.from_id
       where e.to_id = p_ticket_node_id
         and e.type = 'TRACKS'
         and e.link_state = 'active'
         and n.type = 'PullRequest'
    loop
      continue when not (coalesce(v_pr.head ~ '^[0-9a-f]{40}$', false)
                         and coalesce(v_pr.base ~ '^[0-9a-f]{40}$', false));
      foreach v_id in array v_created || v_changed loop
        v_jobs := v_jobs || public.enqueue_verification(v_id, v_pr.base, v_pr.head);
      end loop;
    end loop;
  end if;

  return jsonb_build_object(
    'created', to_jsonb(v_created),
    'changed', to_jsonb(v_changed),
    'unchanged', to_jsonb(v_unchanged),
    'retired', to_jsonb(v_retired),
    'jobIds', to_jsonb(v_jobs)
  );
end;
$$;

create or replace function public.ingest_jira_issue(
  p_workspace_id uuid,
  p_event_id     text,
  p_issue        jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_key      text := p_issue ->> 'key';
  v_kind     text := p_issue ->> 'kind';
  v_version  text := p_issue ->> 'version';
  v_at       timestamptz := (p_issue ->> 'occurredAt')::timestamptz;
  v_node     uuid;
  v_ticket   uuid;
  v_old_text text;
  v_criteria jsonb;
begin
  -- Deliveries for one issue are applied one at a time; the ticket and
  -- requirement paths lock rows in opposite orders otherwise.
  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':jira:' || v_key, 0));

  if v_kind = 'partial' then
    if exists (select 1 from nodes
                where workspace_id = p_workspace_id and type = 'Requirement'
                  and external_id = v_key and valid_to is null) then
      return jsonb_build_object('kind', 'nfr', 'skipped', true);
    end if;
    v_kind := 'ticket';
  end if;

  if v_kind = 'nfr' then
    select payload ->> 'text' into v_old_text
      from nodes
     where workspace_id = p_workspace_id and type = 'Requirement' and external_id = v_key;

    insert into nodes (workspace_id, type, external_id, version, status, owner, last_modified, payload)
    values (p_workspace_id, 'Requirement', v_key, v_version, p_issue ->> 'status',
            p_issue ->> 'owner', v_at, p_issue -> 'payload')
    on conflict (workspace_id, type, external_id) do update
      set version       = excluded.version,
          status        = excluded.status,
          owner         = excluded.owner,
          last_modified = excluded.last_modified,
          payload       = excluded.payload,
          valid_from    = case when nodes.valid_to is null then nodes.valid_from else now() end,
          valid_to      = null
    returning id into v_node;

    if v_old_text is distinct from p_issue #>> '{payload,text}' then
      insert into artifact_snapshots (node_id, source_event_id, version, content_hash, content)
      values (v_node, p_event_id, v_version,
              encode(sha256(convert_to(p_issue #>> '{payload,text}', 'UTF8')), 'hex'),
              p_issue -> 'payload')
      on conflict (node_id, version) do nothing;
    end if;

    update nodes set valid_to = now()
     where workspace_id = p_workspace_id and type = 'Ticket'
       and external_id = v_key and valid_to is null;
    select id into v_ticket
      from nodes
     where workspace_id = p_workspace_id and type = 'Ticket' and external_id = v_key;
    if v_ticket is not null then
      v_criteria := public.sync_ticket_criteria(
        p_workspace_id, v_ticket, v_key, '{"texts": []}'::jsonb, v_version, p_event_id, v_at);
    end if;
    return jsonb_build_object('kind', 'nfr', 'nodeId', v_node, 'criteria', v_criteria);
  end if;

  insert into nodes (workspace_id, type, external_id, version, status, owner, last_modified, payload)
  values (p_workspace_id, 'Ticket', v_key, v_version, p_issue ->> 'status',
          p_issue ->> 'owner', v_at, p_issue -> 'payload')
  on conflict (workspace_id, type, external_id) do update
    set version       = excluded.version,
        status        = excluded.status,
        owner         = excluded.owner,
        last_modified = excluded.last_modified,
        payload       = excluded.payload,
        valid_from    = case when nodes.valid_to is null then nodes.valid_from else now() end,
        valid_to      = null
  returning id into v_node;

  update nodes set valid_to = now()
   where workspace_id = p_workspace_id and type = 'Requirement'
     and external_id = v_key and valid_to is null;

  if jsonb_typeof(p_issue -> 'criteria') = 'object' then
    v_criteria := public.sync_ticket_criteria(
      p_workspace_id, v_node, v_key, p_issue -> 'criteria', v_version, p_event_id, v_at);
  end if;
  return jsonb_build_object('kind', 'ticket', 'nodeId', v_node, 'criteria', v_criteria);
end;
$$;

-- Ingestion runs with the service role inside the webhook request; no client
-- role writes the graph.
revoke all on function public.sync_ticket_criteria(uuid, uuid, text, jsonb, text, text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.ingest_jira_issue(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.sync_ticket_criteria(uuid, uuid, text, jsonb, text, text, timestamptz)
  to service_role;
grant execute on function public.ingest_jira_issue(uuid, text, jsonb) to service_role;
