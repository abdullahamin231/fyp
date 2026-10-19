-- =============================================================================
-- UNIFY — 00035: event delivery ids are unique per workspace
--
-- 00003 made (source_tool, vendor_delivery_id) unique across the whole table.
-- Two workspaces can legitimately receive the same vendor delivery (one Jira
-- site connected to both, or a body-hash delivery id when Jira omits
-- X-Atlassian-Webhook-Identifier), and the second workspace's event then hit
-- the constraint and the webhook answered 400. Receipts
-- (`integration_deliveries`, 00010) were already scoped per workspace; events
-- now match.
--
-- `link_pull_request_event` (00015) relies on `on conflict do nothing` without
-- naming the constraint, so it keeps detecting duplicates unchanged.
-- =============================================================================

alter table public.events
  drop constraint events_delivery_unique;

alter table public.events
  add constraint events_delivery_unique
  unique (workspace_id, source_tool, vendor_delivery_id);
