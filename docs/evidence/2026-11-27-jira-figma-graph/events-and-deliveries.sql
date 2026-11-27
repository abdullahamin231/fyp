-- Events and delivery receipts behind the Jira ticket and Figma design nodes in
-- workspace `testing`: every Figma row, and the Jira delivery of the
-- 27 November 2026 SCRUM-5 edit (08:45 UTC). Read-only.
select e.source_tool,
       e.entity_id,
       e.action,
       d.vendor_delivery_id,
       e.occurred_at,
       e.received_at  as event_received_at,
       d.received_at  as delivery_received_at
  from public.integration_deliveries d
  join public.events e     on e.event_id = d.event_id
  join public.workspaces w on w.id = d.workspace_id
 where w.slug = 'testing'
   and (d.provider = 'figma'
        or (d.provider = 'jira' and d.received_at >= '2026-11-27 08:45:00+00'))
 order by e.received_at;
