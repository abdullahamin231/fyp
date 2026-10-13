-- UNIFY - per-workspace provider OAuth app registrations.
create table public.integration_apps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider public.source_tool not null check (provider in ('github', 'jira', 'figma')),
  client_id text not null,
  client_secret_ciphertext text not null,
  webhook_secret_ciphertext text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

alter table public.integration_apps enable row level security;
