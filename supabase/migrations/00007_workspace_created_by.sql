-- =============================================================================
-- UNIFY — 00007: default workspaces.created_by to the caller
--
-- The `workspaces_insert_authenticated` policy requires
-- `created_by = auth.uid()`. If a client omits `created_by` the column is NULL,
-- `NULL = auth.uid()` is NULL, and the insert is rejected — found by the
-- end-to-end PostgREST smoke test. Defaulting the column in a BEFORE INSERT
-- trigger keeps the policy strict while letting any signed-in user create a
-- workspace by naming it alone.
-- =============================================================================

create or replace function public.set_created_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger workspaces_set_created_by
  before insert on public.workspaces
  for each row execute function public.set_created_by();
