-- UNIFY — 00038: delayed Jira deliveries cannot roll the graph back.
-- Equal versions still run: a full issue can complete a partial/comment body.
-- CREATE OR REPLACE preserves the service-role-only grants from 00036.

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
  v_current record;
  v_current_at timestamptz;
  v_incoming_at timestamptz := v_version::timestamptz;
begin
  -- Deliveries for one issue are applied one at a time; the ticket and
  -- requirement paths lock rows in opposite orders otherwise.
  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':jira:' || v_key, 0));

  -- Serialising arrival order is not enough: a delayed webhook/replay can be
  -- older than the issue already stored. Compare instants (Jira uses several
  -- timestamp/offset spellings), across both sides of an NFR relabelling.
  select id, type, version, last_modified into v_current
    from public.nodes
   where workspace_id = p_workspace_id and external_id = v_key
     and type in ('Ticket', 'Requirement')
   order by (valid_to is null) desc, last_modified desc
   limit 1;
  if found then
    begin
      v_current_at := v_current.version::timestamptz;
    exception when invalid_datetime_format or datetime_field_overflow then
      -- Older imported nodes may have a non-timestamp version.
      v_current_at := v_current.last_modified;
    end;
    if v_incoming_at < coalesce(v_current_at, v_current.last_modified) then
      return jsonb_build_object('kind', case when v_current.type = 'Requirement' then 'nfr' else 'ticket' end,
                                'nodeId', v_current.id, 'skipped', true, 'reason', 'stale_version');
    end if;
  end if;


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

