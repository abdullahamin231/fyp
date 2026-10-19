-- UNIFY — 00026: one shape for figma_watched_files.
--
-- 00019 and 00020 both create this table; 00020 uses `if not exists`, so a
-- fresh database keeps 00019's shape: an admin write policy and a created_by
-- foreign key without a cascade. The live project was built from 00020 alone.
-- This brings a fresh database to the live shape and is a no-op on live.

drop policy if exists "figma_watched_files_admin_write" on public.figma_watched_files;
drop policy if exists "figma_watched_files_member_read" on public.figma_watched_files;

drop policy if exists "figma_watched_files_select_member" on public.figma_watched_files;
create policy "figma_watched_files_select_member"
  on public.figma_watched_files for select
  to authenticated
  using (is_workspace_member(workspace_id));

alter table public.figma_watched_files
  drop constraint if exists figma_watched_files_created_by_fkey,
  add constraint figma_watched_files_created_by_fkey
    foreign key (created_by) references auth.users (id) on delete cascade;

create index if not exists figma_watched_files_workspace_idx
  on public.figma_watched_files (workspace_id, created_at);
