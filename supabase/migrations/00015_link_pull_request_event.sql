-- =============================================================================
-- UNIFY — 00015: deterministic PR → Jira linking as one RPC (FR-04)
--
-- `link_pull_request_event` does the database half of deterministic linking.
-- The TypeScript half (apps/worker/src/linking/extract-keys.ts) finds the Jira
-- keys in the PR's title, branch and commits and passes them in as `p_keys`.
--
-- Why a function: the four steps below must happen together or not at all,
-- so an event is never recorded without its links. supabase-js sends every
-- call as its own request (its own transaction), so a multi-step transaction
-- cannot be driven from the worker. A Postgres function always runs inside a
-- single transaction: if any step raises, everything it wrote is rolled back.
-- Same pattern as the queue RPCs in 00013.
--
--   1. record the event; if this delivery was seen before, stop
--      (events UNIQUE (source_tool, vendor_delivery_id))
--   2. create or update the PullRequest node
--      (nodes UNIQUE (workspace_id, type, external_id))
--   3. no keys → done (the event is still recorded: it is a log)
--   4. per key: find the Ticket node; none → `unknown_key` (no node is
--      invented); otherwise insert a TRACKS edge, or report the edge that
--      already holds that slot (edges_current_identity_uidx, 00010)
--
-- Returns a jsonb report the worker passes straight back to its caller:
--   {status: 'duplicate_event', eventId}
--   {status: 'no_key', eventId, prNodeId}
--   {status: 'processed', eventId, prNodeId, keys: [{key, status, ...}]}
--
-- service_role only, like claim/finish_verification_job: it is SECURITY
-- DEFINER (bypasses RLS) and must not be callable from the browser.
-- =============================================================================

create or replace function public.link_pull_request_event(
  p_workspace_id uuid,
  p_delivery_id  text,         -- GitHub X-GitHub-Delivery; same on redelivery
  p_action       text,         -- opened | edited | synchronize | ...
  p_actor        text,         -- GitHub login
  p_occurred_at  timestamptz,
  p_raw_hash     text,         -- sha256 of the raw webhook body
  p_pr           jsonb,        -- {repo, number, title, branch, headSha, state}
  p_keys         jsonb         -- [{key, foundIn: [...]}] from extract-keys.ts
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Same delivery id -> same event id, so a redelivery collides with itself.
  v_event_id  text := 'github:' || p_delivery_id;
  v_pr_ext_id text := (p_pr ->> 'repo') || '#' || (p_pr ->> 'number');
  v_inserted  text;
  v_pr_node   uuid;
  v_item      jsonb;
  v_key       text;
  v_ticket    uuid;
  v_edge      uuid;
  v_state     text;
  v_outcomes  jsonb := '[]'::jsonb;
begin
  -- ---- Step 1: record the event, or stop if we have seen it before. --------
  -- `on conflict do nothing` + `returning ... into` leaves v_inserted null
  -- when the UNIQUE (source_tool, vendor_delivery_id) constraint is hit. That
  -- null is how a duplicate is detected, with no gap between check and insert.
  insert into events (
    event_id, vendor_delivery_id, workspace_id, source_tool,
    entity_type, entity_id, version, action, actor,
    occurred_at, "references", raw_hash
  )
  values (
    v_event_id, p_delivery_id, p_workspace_id, 'github',
    'PullRequest', v_pr_ext_id, p_pr ->> 'headSha', p_action, p_actor,
    p_occurred_at,
    -- The keys are kept on the event, so an unknown key can be re-resolved
    -- later once that Jira issue has been ingested.
    coalesce(
      (select jsonb_agg(jsonb_build_object(
                'sourceTool', 'jira', 'entityType', 'Ticket', 'entityId', k ->> 'key'))
         from jsonb_array_elements(p_keys) as k),
      '[]'::jsonb),
    p_raw_hash
  )
  on conflict do nothing
  returning event_id into v_inserted;

  if v_inserted is null then
    return jsonb_build_object('status', 'duplicate_event', 'eventId', v_event_id);
  end if;

  -- ---- Step 2: create or update the PullRequest node. ----------------------
  insert into nodes (workspace_id, type, external_id, version, status, owner, last_modified, payload)
  values (
    p_workspace_id, 'PullRequest', v_pr_ext_id, p_pr ->> 'headSha', p_pr ->> 'state',
    p_actor, p_occurred_at,
    jsonb_build_object(
      'repo', p_pr ->> 'repo', 'number', (p_pr ->> 'number')::int,
      'title', p_pr ->> 'title', 'branch', p_pr ->> 'branch')
  )
  on conflict (workspace_id, type, external_id) do update
    set version       = excluded.version,
        status        = excluded.status,
        last_modified = excluded.last_modified,
        payload       = excluded.payload
  returning id into v_pr_node;

  -- ---- Step 3: no key -> done. ---------------------------------------------
  if jsonb_array_length(p_keys) = 0 then
    return jsonb_build_object('status', 'no_key', 'eventId', v_event_id, 'prNodeId', v_pr_node);
  end if;

  -- ---- Step 4: resolve each key to a Ticket node and link it. ---------------
  for v_item in select * from jsonb_array_elements(p_keys) loop
    v_key := v_item ->> 'key';

    select id into v_ticket
      from nodes
     where workspace_id = p_workspace_id and type = 'Ticket' and external_id = v_key;

    if v_ticket is null then
      -- Never invent a Ticket node: an edge to a guessed node would be
      -- evidence we do not have.
      v_outcomes := v_outcomes || jsonb_build_object(
        'key', v_key, 'status', 'unknown_key', 'foundIn', v_item -> 'foundIn');
      continue;
    end if;

    -- observed + confidence 1.0: the PR author typed this key, so the link may
    -- support a decisive finding (FR-05). The WHERE clause must match the
    -- predicate of edges_current_identity_uidx (00010) exactly, or Postgres
    -- rejects the ON CONFLICT.
    v_edge := null;
    insert into edges (from_id, to_id, type, source_class, confidence, resolver, metadata)
    values (
      v_pr_node, v_ticket, 'TRACKS', 'observed', 1.0, 'explicit-reference',
      jsonb_build_object('key', v_key, 'foundIn', v_item -> 'foundIn', 'eventId', v_event_id)
    )
    on conflict (from_id, to_id, type) where link_state <> 'revoked' do nothing
    returning id into v_edge;

    if v_edge is not null then
      v_outcomes := v_outcomes || jsonb_build_object(
        'key', v_key, 'status', 'linked', 'edgeId', v_edge, 'foundIn', v_item -> 'foundIn');
    else
      -- The slot is held by an earlier edge. Report it with its state: a link
      -- a reviewer dismissed must not be quietly revived by a new mention.
      select id, link_state::text into v_edge, v_state
        from edges
       where from_id = v_pr_node and to_id = v_ticket and type = 'TRACKS'
         and link_state <> 'revoked';
      v_outcomes := v_outcomes || jsonb_build_object(
        'key', v_key, 'status', 'already_linked', 'edgeId', v_edge,
        'linkState', v_state, 'foundIn', v_item -> 'foundIn');
    end if;
  end loop;

  return jsonb_build_object(
    'status', 'processed', 'eventId', v_event_id, 'prNodeId', v_pr_node, 'keys', v_outcomes);
end;
$$;

revoke all on function public.link_pull_request_event(uuid, text, text, text, timestamptz, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.link_pull_request_event(uuid, text, text, text, timestamptz, text, jsonb, jsonb)
  to service_role;
