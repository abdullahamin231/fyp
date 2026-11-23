-- UNIFY — FR-14: a finding whose notify set resolves to nobody is recorded,
-- never dropped. `notifications` needs a recipient, so the unroutable case
-- lives here.
create type public.routing_outcome as enum ('unroutable');
create type public.unroutable_reason as enum ('no_role_edge', 'no_matching_user');

create table public.routing_outcomes (
  id          uuid primary key default gen_random_uuid(),
  finding_id  uuid not null unique references public.findings (id),
  node_id     uuid not null references public.nodes (id),
  outcome     public.routing_outcome not null,
  reason      public.unroutable_reason not null,
  hops        smallint not null check (hops between 1 and 2),
  created_at  timestamptz not null default now()
);

alter table public.routing_outcomes enable row level security;

create policy "routing_outcomes_select_member"
  on public.routing_outcomes for select
  to authenticated
  using (is_workspace_member(finding_workspace(finding_id)));

create policy "routing_outcomes_insert_member"
  on public.routing_outcomes for insert
  to authenticated
  with check (is_workspace_member(finding_workspace(finding_id)));

create policy "routing_outcomes_update_member"
  on public.routing_outcomes for update
  to authenticated
  using (is_workspace_member(finding_workspace(finding_id)))
  with check (is_workspace_member(finding_workspace(finding_id)));
