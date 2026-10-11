-- UNIFY — provider connections and immutable webhook receipts.
create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider public.source_tool not null check (provider in ('github', 'jira', 'figma')),
  external_account_id text,
  external_account_name text,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  webhook_secret_ciphertext text,
  scopes text[] not null default '{}',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

create table public.integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider public.source_tool not null check (provider in ('github', 'jira', 'figma')),
  vendor_delivery_id text not null,
  event_id text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (workspace_id, provider, vendor_delivery_id)
);

alter table public.integration_connections enable row level security;
alter table public.integration_deliveries enable row level security;

create policy "integration_connections_member_read"
  on public.integration_connections for select to authenticated
  using (is_workspace_member(workspace_id));
create policy "integration_connections_admin_write"
  on public.integration_connections for all to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]));
create policy "integration_deliveries_member_read"
  on public.integration_deliveries for select to authenticated
  using (is_workspace_member(workspace_id));

