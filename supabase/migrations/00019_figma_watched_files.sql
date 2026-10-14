-- UNIFY — Figma files polled for new versions.
-- Figma gates webhook creation behind a paid team plan, so Figma ingestion
-- reads version history on an interval instead of receiving pushes.
create table public.figma_watched_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  file_key text not null,
  file_name text,
  last_seen_version_id text,
  last_polled_at timestamptz,
  last_poll_error text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (workspace_id, file_key)
);

alter table public.figma_watched_files enable row level security;

create policy "figma_watched_files_member_read"
  on public.figma_watched_files for select to authenticated
  using (is_workspace_member(workspace_id));
create policy "figma_watched_files_admin_write"
  on public.figma_watched_files for all to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]));
