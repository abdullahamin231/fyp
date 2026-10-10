-- =============================================================================
-- UNIFY — 00008: create_workspace RPC
--
-- Why an RPC instead of a direct table insert?
--
-- PostgREST wraps an INSERT in a data-modifying CTE whenever the client asks
-- for the created row back (`Prefer: return=representation`), which is exactly
-- what supabase-js `.insert().select()` sends. On this Postgres build,
-- `auth.uid()` evaluates to NULL inside such a CTE's RLS `WITH CHECK`, so the
-- `workspaces_insert_authenticated` policy (`created_by = auth.uid()`) rejects
-- every CTE-wrapped insert — even when `created_by` is supplied correctly.
-- Verified: a policy of `with check (auth.uid() is not null)` passes on a
-- plain INSERT and fails on the CTE-wrapped equivalent.
--
-- A SECURITY DEFINER function performs a *plain* INSERT in its body, which is
-- unaffected. It also lets us set `created_by = auth.uid()` explicitly and
-- keep the strict policy as defense-in-depth for the plain-insert path.
--
-- The AFTER ROW trigger `on_workspace_created` still adds the owner membership
-- row, so callers get a fully-provisioned workspace in one call.
-- =============================================================================

create or replace function public.create_workspace(p_name text, p_slug text)
returns public.workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  ws public.workspaces;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'workspace name is required' using errcode = '23514';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'slug must be lowercase kebab-case' using errcode = '23514';
  end if;

  insert into public.workspaces (name, slug, created_by)
  values (btrim(p_name), p_slug, auth.uid())
  returning * into ws;

  return ws;
end;
$$;

revoke execute on function public.create_workspace(text, text) from public, anon;
grant execute on function public.create_workspace(text, text) to authenticated;

-- The debug RPC from root-cause isolation is no longer needed.
drop function if exists public.debug_insert_probe();
