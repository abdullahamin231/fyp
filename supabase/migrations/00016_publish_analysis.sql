-- =============================================================================
-- UNIFY — 00016: publish one analyser run into the evidence graph (FR-06)
--
-- `publish_analysis` writes what the code analyser produced for one change
-- (apps/worker/src/analyser/payloads.ts `toGraph`) in a single transaction:
--
--   1. nodes: Commit / CodeSymbol / TestCase rows, each carrying its evidence
--      in `payload.slotItems` (the shape the packet builder reads). Upserted
--      on (workspace_id, type, external_id): re-running the analyser on the
--      same change updates the nodes instead of duplicating them.
--   2. edges: only relations the analyser established (Commit PART_OF
--      PullRequest, TestCase COVERS CodeSymbol). Endpoints are looked up by
--      (type, external_id). An endpoint that is not in the graph (e.g. the PR
--      has not been ingested yet) is reported as skipped, never invented.
--      Duplicates are a no-op via edges_current_identity_uidx (00010).
--
-- Returns counts plus the skipped edges, so the caller can print them.
-- service_role only, like link_pull_request_event (00015).
-- =============================================================================

create or replace function public.publish_analysis(
  p_workspace_id uuid,
  p_nodes        jsonb,  -- [{externalId, type, version, payload}]
  p_edges        jsonb   -- [{from, fromType, to, toType, type, sourceClass, confidence, resolver}]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_node      jsonb;
  v_edge      jsonb;
  v_inserted  boolean;
  v_from      uuid;
  v_to        uuid;
  v_edge_id   uuid;
  v_nodes_new int := 0;
  v_nodes_upd int := 0;
  v_edges_new int := 0;
  v_edges_old int := 0;
  v_skipped   jsonb := '[]'::jsonb;
begin
  -- ---- 1. nodes ------------------------------------------------------------
  for v_node in select * from jsonb_array_elements(p_nodes) loop
    insert into nodes (workspace_id, type, external_id, version, last_modified, payload)
    values (
      p_workspace_id, (v_node ->> 'type')::node_type, v_node ->> 'externalId',
      v_node ->> 'version', now(), coalesce(v_node -> 'payload', '{}'::jsonb)
    )
    on conflict (workspace_id, type, external_id) do update
      set version = excluded.version,
          last_modified = excluded.last_modified,
          payload = excluded.payload
    -- xmax = 0 only for a freshly inserted row: distinguishes insert from update.
    returning (xmax = 0) into v_inserted;
    if v_inserted then v_nodes_new := v_nodes_new + 1; else v_nodes_upd := v_nodes_upd + 1; end if;
  end loop;

  -- ---- 2. edges ------------------------------------------------------------
  for v_edge in select * from jsonb_array_elements(p_edges) loop
    select id into v_from from nodes
     where workspace_id = p_workspace_id
       and type = (v_edge ->> 'fromType')::node_type and external_id = v_edge ->> 'from';
    select id into v_to from nodes
     where workspace_id = p_workspace_id
       and type = (v_edge ->> 'toType')::node_type and external_id = v_edge ->> 'to';

    if v_from is null or v_to is null then
      v_skipped := v_skipped || jsonb_build_object(
        'from', v_edge ->> 'from', 'to', v_edge ->> 'to', 'type', v_edge ->> 'type',
        'reason', case when v_from is null then 'from node not in graph' else 'to node not in graph' end);
      continue;
    end if;

    v_edge_id := null;
    insert into edges (from_id, to_id, type, source_class, confidence, resolver, metadata)
    values (
      v_from, v_to, (v_edge ->> 'type')::edge_type, (v_edge ->> 'sourceClass')::source_class,
      (v_edge ->> 'confidence')::real, v_edge ->> 'resolver',
      jsonb_build_object('publishedBy', 'publish_analysis')
    )
    on conflict (from_id, to_id, type) where link_state <> 'revoked' do nothing
    returning id into v_edge_id;
    if v_edge_id is not null then v_edges_new := v_edges_new + 1; else v_edges_old := v_edges_old + 1; end if;
  end loop;

  return jsonb_build_object(
    'nodesInserted', v_nodes_new, 'nodesUpdated', v_nodes_upd,
    'edgesInserted', v_edges_new, 'edgesExisting', v_edges_old,
    'edgesSkipped', v_skipped);
end;
$$;

revoke all on function public.publish_analysis(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.publish_analysis(uuid, jsonb, jsonb) to service_role;
