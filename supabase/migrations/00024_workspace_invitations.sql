-- =============================================================================
-- UNIFY — 00018: workspace invitations
--
-- In-app team invitations: a workspace owner/admin invites an email address;
-- the invitee sees the pending invite in the app (top-bar bell) and accepts or
-- declines. Matching is by email at read time, so an address with no account
-- yet can be invited — the invite surfaces when that person signs up.
--
-- Writes go through SECURITY DEFINER RPCs for the same reason as
-- `create_workspace` (00008): PostgREST wraps `.insert().select()` in a
-- data-modifying CTE where `auth.uid()` reads NULL, so RLS `WITH CHECK` sees
-- the caller as anonymous. The plain-insert policy stays as defense-in-depth.
--
-- Accept/decline are RPCs too because accept must write two tables atomically
-- (membership insert + invitation update) and the invitee has no
-- `workspace_members` insert privilege of their own.
-- =============================================================================

-- ---- enum (database-internal vocabulary, like workspace_role) ----------------

create type public.invitation_status as enum ('pending', 'accepted', 'declined');

-- ---- caller's email (policy + RPC helper) ------------------------------------

create or replace function public.current_user_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(email) from auth.users where id = auth.uid();
$$;

revoke all on function public.current_user_email() from public, anon;
grant execute on function public.current_user_email() to authenticated, service_role;

-- ---- table -------------------------------------------------------------------

create table public.workspace_invitations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  invited_email text not null check (position('@' in invited_email) > 1),
  invited_by    uuid references auth.users (id) on delete set null,
  role          public.workspace_role not null default 'member',
  status        public.invitation_status not null default 'pending',
  created_at    timestamptz not null default now(),
  responded_at  timestamptz
);

comment on table public.workspace_invitations is
  'In-app workspace invitations keyed by email. Written via RPCs; invitees read rows addressed to them.';

-- One pending invite per (workspace, email). RPCs lowercase the email before
-- insert, so a plain-column index enforces it. A second invite is allowed once
-- the previous one is answered (or revoked, which deletes the row).
create unique index workspace_invitations_pending_uidx
  on public.workspace_invitations (workspace_id, invited_email)
  where status = 'pending';

create index workspace_invitations_email_idx
  on public.workspace_invitations (invited_email)
  where status = 'pending';

-- ---- RLS ---------------------------------------------------------------------

alter table public.workspace_invitations enable row level security;

-- The invitee reads invites addressed to them; owners/admins read the
-- workspace's invites (sent list).
create policy "workspace_invitations_select"
  on public.workspace_invitations for select
  to authenticated
  using (
    invited_email = public.current_user_email()
    or public.has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[])
  );

-- Defense-in-depth for the plain-insert path; the supported client API is
-- `invite_to_workspace` below.
create policy "workspace_invitations_insert_admin"
  on public.workspace_invitations for insert
  to authenticated
  with check (
    public.has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[])
  );

-- Revoking a pending invite is a plain DELETE by an owner/admin.
create policy "workspace_invitations_delete_admin"
  on public.workspace_invitations for delete
  to authenticated
  using (
    public.has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[])
  );

-- No UPDATE policy: status transitions happen only inside the accept/decline
-- RPCs (definer), so an invitee cannot flip `role` or resurrect a row.

-- An invitee may read the invited workspace's row (name/slug) so the app can
-- render what they were invited to. Permissive policy — ORs with
-- `workspaces_select_member`, it does not weaken it.
create policy "workspaces_select_invited"
  on public.workspaces for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_invitations wi
      where wi.workspace_id = workspaces.id
        and wi.status = 'pending'
        and wi.invited_email = public.current_user_email()
    )
  );

-- ---- RPCs --------------------------------------------------------------------

-- Invite an email to a workspace. Caller must be an owner/admin of it.
create or replace function public.invite_to_workspace(
  p_workspace_id uuid,
  p_email text,
  p_role public.workspace_role default 'member'
)
returns public.workspace_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_role  public.workspace_role := coalesce(p_role, 'member');
  v_invite public.workspace_invitations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if position('@' in v_email) <= 1 then
    raise exception 'a valid email address is required' using errcode = '23514';
  end if;

  if v_role = 'owner' then
    raise exception 'invitations cannot grant the owner role' using errcode = '23514';
  end if;

  if not public.has_workspace_role(
    p_workspace_id, array['owner','admin']::public.workspace_role[]
  ) then
    raise exception 'only workspace owners and admins can invite members'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.workspace_members m
    join public.profiles p on p.id = m.user_id
    where m.workspace_id = p_workspace_id
      and lower(p.email) = v_email
  ) then
    raise exception 'that user is already a member of this workspace'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.workspace_invitations wi
    where wi.workspace_id = p_workspace_id
      and wi.invited_email = v_email
      and wi.status = 'pending'
  ) then
    raise exception 'an invitation is already pending for that email'
      using errcode = '23505';
  end if;

  insert into public.workspace_invitations (workspace_id, invited_email, invited_by, role)
  values (p_workspace_id, v_email, auth.uid(), v_role)
  returning * into v_invite;

  return v_invite;
end;
$$;

-- Accept a pending invite addressed to the caller: adds the membership row and
-- marks the invite answered. Already-a-member is tolerated (idempotent accept).
create or replace function public.accept_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.workspace_invitations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_invite
  from public.workspace_invitations
  where id = p_invitation_id;

  if v_invite.id is null or v_invite.invited_email <> public.current_user_email() then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'invitation is no longer pending' using errcode = '23514';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, auth.uid(), v_invite.role)
  on conflict (workspace_id, user_id) do nothing;

  update public.workspace_invitations
  set status = 'accepted', responded_at = now()
  where id = v_invite.id;
end;
$$;

-- Decline a pending invite addressed to the caller.
create or replace function public.decline_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.workspace_invitations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_invite
  from public.workspace_invitations
  where id = p_invitation_id;

  if v_invite.id is null or v_invite.invited_email <> public.current_user_email() then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'invitation is no longer pending' using errcode = '23514';
  end if;

  update public.workspace_invitations
  set status = 'declined', responded_at = now()
  where id = v_invite.id;
end;
$$;

revoke execute on function public.invite_to_workspace(uuid, text, public.workspace_role)
  from public, anon;
revoke execute on function public.accept_workspace_invitation(uuid) from public, anon;
revoke execute on function public.decline_workspace_invitation(uuid) from public, anon;

grant execute on function public.invite_to_workspace(uuid, text, public.workspace_role)
  to authenticated;
grant execute on function public.accept_workspace_invitation(uuid) to authenticated;
grant execute on function public.decline_workspace_invitation(uuid) to authenticated;
