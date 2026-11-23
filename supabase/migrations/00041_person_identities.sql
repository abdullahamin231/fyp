-- UNIFY — provider accounts resolved to Person nodes.
-- Identity is the provider's stable account id. Email is not a key: Jira
-- usually omits it, GitHub's is null unless public, and both are mutable.
-- A Person may hold several identities; an unresolved identity gets its own
-- provider-scoped Person until a human merges it.
create table public.person_identities (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references public.workspaces (id) on delete cascade,
  -- No cascade, deliberately: a merged Person node is retired, never deleted
  -- (audit_log.actor_id references nodes), so a cascade should never be needed.
  person_node_id      uuid not null references public.nodes (id),
  tool                public.source_tool not null check (tool in ('github', 'jira', 'figma')),
  external_account_id  text not null,
  display_name        text,
  handle              text,
  email               text,
  source_class        public.source_class not null default 'observed',
  first_seen          timestamptz not null default now(),
  last_seen           timestamptz not null default now(),
  unique (workspace_id, tool, external_account_id)
);

create index person_identities_person_idx on public.person_identities (person_node_id);

alter table public.person_identities enable row level security;

create policy "person_identities_member_read"
  on public.person_identities for select to authenticated
  using (is_workspace_member(workspace_id));
create policy "person_identities_admin_write"
  on public.person_identities for all to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]));

-- The provider account that authorised each connection, so that account can be
-- bound to the member who connected it. `external_account_id` is not enough:
-- for Jira it is the site's cloudId, not a user. Never holds a token.
alter table public.integration_connections add column connected_account_id text;

-- FR-14 routing drops a Person without payload.role. Reviewer Persons written
-- before this migration have none, so they were invisible to routing.
update public.nodes
set payload = payload || jsonb_build_object('role', 'developer', 'role_source', 'default')
where type = 'Person'
  and (payload ->> 'role') is null;
