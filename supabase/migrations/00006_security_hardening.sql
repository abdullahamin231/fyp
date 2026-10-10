-- =============================================================================
-- UNIFY — 00006: security hardening (advisor follow-up)
--
-- Fixes the three classes of finding from `get_advisors(security)`:
--   1. `set_updated_at` / `forbid_mutation` had a mutable search_path.
--   2. `handle_new_user` / `handle_new_workspace` were SECURITY DEFINER and
--      executable by anon/authenticated via PostgREST RPC. They are trigger
--      functions only; triggers do not check EXECUTE at fire time, so the
--      PUBLIC grant is revoked. Trigger functions are also pinned to a fixed
--      search_path.
--   3. The `*_workspace()` / membership helpers stay executable by
--      `authenticated` — RLS policies run as the querying role and therefore
--      need EXECUTE. They only return workspace UUIDs or booleans, never row
--      data, so this is the accepted trade-off of the policy-scoping pattern
--      and is documented rather than "fixed".
-- =============================================================================

-- 1. pin search_path on the trigger helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.forbid_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is not allowed: %.% is append-only/immutable',
    tg_op, tg_table_schema, tg_table_name
    using errcode = 'restrict_violation';
end;
$$;

-- 2. trigger functions: not callable over the API
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.workspace_members (workspace_id, user_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_workspace() from public, anon, authenticated;
