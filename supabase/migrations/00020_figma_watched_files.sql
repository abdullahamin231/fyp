-- =============================================================================
-- UNIFY — 00020: Figma watched files
--
-- The table the Figma version poller (apps/web/src/lib/integrations/figma-poll.ts)
-- reads and maintains. One row per watched file per workspace, carrying the
-- high-water mark (`last_seen_version_id`) the poller advances: polling is
-- resume-from-a-mark, not a full-history import — the first poll only baselines
-- a file, so wiring a file never back-fills its entire version history.
--
-- `last_poll_error` is written on failure and shown in the workspace surface:
-- a file whose token expired or whose key is wrong must stay visible with its
-- reason, not silently drop out of the rotation.
--
-- Owner: team. Writes go through the service-role routes/files handler (same
-- pattern as integration_apps); members read their own workspace's rows.
-- =============================================================================

create table if not exists public.figma_watched_files (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references public.workspaces (id) on delete cascade,
  file_key              text not null,
  file_name             text,
  created_by            uuid not null references auth.users (id) on delete cascade,
  created_at            timestamptz not null default now(),
  -- The poller's high-water mark: the newest version id already ingested.
  last_seen_version_id  text,
  last_polled_at        timestamptz,
  -- Last failure, kept for the reviewer surface; cleared by a successful poll.
  last_poll_error       text,

  unique (workspace_id, file_key)
);

comment on table public.figma_watched_files is
  'Figma files a workspace polls for versions, with the high-water mark the poller advances. The first poll baselines a file without importing its history.';

create index if not exists figma_watched_files_workspace_idx
  on public.figma_watched_files (workspace_id, created_at);

alter table public.figma_watched_files enable row level security;

drop policy if exists "figma_watched_files_select_member" on public.figma_watched_files;
create policy "figma_watched_files_select_member"
  on public.figma_watched_files for select
  to authenticated
  using (is_workspace_member(workspace_id));

grant select on public.figma_watched_files to authenticated;
