-- =============================================================================
-- UNIFY — 00005: immutability triggers (FR-03, FR-15, FR-18)
--
-- RLS gates the API roles; these triggers make the append-only / immutable
-- tables immutable for *everyone*, including the service role. Historical
-- findings must stay re-readable against what they actually cited, so once a
-- row lands in `events`, `artifact_snapshots`, `context_packets` or
-- `audit_log` it can never be updated or deleted.
-- =============================================================================

create or replace function public.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception '% is not allowed: %.% is append-only/immutable',
    tg_op, tg_table_schema, tg_table_name
    using errcode = 'restrict_violation';
end;
$$;

create trigger events_append_only
  before update or delete on public.events
  for each row execute function public.forbid_mutation();

create trigger artifact_snapshots_immutable
  before update or delete on public.artifact_snapshots
  for each row execute function public.forbid_mutation();

create trigger context_packets_immutable
  before update or delete on public.context_packets
  for each row execute function public.forbid_mutation();

create trigger audit_log_append_only
  before update or delete on public.audit_log
  for each row execute function public.forbid_mutation();

-- `findings.idempotency_key` uniqueness (FR-15) is a plain UNIQUE constraint
-- in 00003; nothing further needed here. `code_anchors` are append-only by
-- convention (re-anchoring inserts a new row chained via prev_anchor_id) but
-- `status` flips active → broken, so they are deliberately NOT trigger-locked.
