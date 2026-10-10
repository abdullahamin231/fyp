-- =============================================================================
-- UNIFY — 00004: row-level security
--
-- Every table gets RLS enabled. Tenancy is by workspace: a user sees a row
-- when they are a member of the workspace that row belongs to, either
-- directly (`workspace_id` column) or through a foreign key chain back to
-- `nodes` / `workspaces`.
--
-- The `*_workspace()` helpers are SECURITY DEFINER so policy subqueries do not
-- re-enter RLS on the tables they join (which would recurse or mis-scope), and
-- so membership checks against `workspace_members` work from policies on
-- `workspace_members` itself.
-- =============================================================================

-- ---- helper functions --------------------------------------------------------

-- The caller's role in a workspace, or null when they are not a member.
create or replace function public.workspace_role_of(ws uuid)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.workspace_members m
  where m.workspace_id = ws
    and m.user_id = auth.uid();
$$;

create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(ws uuid, roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
      and m.role = any (roles)
  );
$$;

-- Workspace of a node (graph tables resolve tenancy through `nodes`).
create or replace function public.node_workspace(n uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.nodes where id = n;
$$;

-- Workspace of an edge, via its `from` endpoint.
create or replace function public.edge_workspace(e uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.workspace_id
  from public.edges ed
  join public.nodes n on n.id = ed.from_id
  where ed.id = e;
$$;

-- Workspace of a finding, via its subject node.
create or replace function public.finding_workspace(f uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.workspace_id
  from public.findings fd
  join public.nodes n on n.id = fd.subject_node_id
  where fd.id = f;
$$;

-- Workspace of a context packet, via its criterion node.
create or replace function public.packet_workspace(p uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.workspace_id
  from public.context_packets cp
  join public.nodes n on n.id = cp.criterion_node_id
  where cp.id = p;
$$;

-- Workspace of an artifact snapshot, via its node.
create or replace function public.snapshot_workspace(s uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.workspace_id
  from public.artifact_snapshots sn
  join public.nodes n on n.id = sn.node_id
  where sn.id = s;
$$;

-- Execute grants for API roles (definer functions still need EXECUTE).
revoke all on function public.workspace_role_of(uuid) from public, anon;
revoke all on function public.is_workspace_member(uuid) from public, anon;
revoke all on function public.has_workspace_role(uuid, public.workspace_role[]) from public, anon;
revoke all on function public.node_workspace(uuid) from public, anon;
revoke all on function public.edge_workspace(uuid) from public, anon;
revoke all on function public.finding_workspace(uuid) from public, anon;
revoke all on function public.packet_workspace(uuid) from public, anon;
revoke all on function public.snapshot_workspace(uuid) from public, anon;

grant execute on function public.workspace_role_of(uuid) to authenticated, service_role;
grant execute on function public.is_workspace_member(uuid) to authenticated, service_role;
grant execute on function public.has_workspace_role(uuid, public.workspace_role[]) to authenticated, service_role;
grant execute on function public.node_workspace(uuid) to authenticated, service_role;
grant execute on function public.edge_workspace(uuid) to authenticated, service_role;
grant execute on function public.finding_workspace(uuid) to authenticated, service_role;
grant execute on function public.packet_workspace(uuid) to authenticated, service_role;
grant execute on function public.snapshot_workspace(uuid) to authenticated, service_role;

-- ---- tenancy tables ----------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- Profiles: readable by any signed-in user (names shown on findings/audit),
-- editable only by their owner. Insert is trigger-driven (definer).
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Workspaces: members see them; any signed-in user may create one (the
-- creator trigger makes them owner); owners/admins manage them.
create policy "workspaces_select_member"
  on public.workspaces for select
  to authenticated
  using (is_workspace_member(id));

create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "workspaces_update_admin"
  on public.workspaces for update
  to authenticated
  using (has_workspace_role(id, array['owner','admin']::public.workspace_role[]))
  with check (has_workspace_role(id, array['owner','admin']::public.workspace_role[]));

create policy "workspaces_delete_owner"
  on public.workspaces for delete
  to authenticated
  using (has_workspace_role(id, array['owner']::public.workspace_role[]));

-- Memberships: co-members visible; owners/admins manage; anyone may leave
-- their own membership.
create policy "workspace_members_select"
  on public.workspace_members for select
  to authenticated
  using (user_id = auth.uid() or is_workspace_member(workspace_id));

create policy "workspace_members_insert_admin"
  on public.workspace_members for insert
  to authenticated
  with check (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]));

create policy "workspace_members_update_owner"
  on public.workspace_members for update
  to authenticated
  using (has_workspace_role(workspace_id, array['owner']::public.workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));

create policy "workspace_members_delete_admin_or_self"
  on public.workspace_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[])
  );

-- ---- uIngest -----------------------------------------------------------------

alter table public.events enable row level security;
alter table public.artifact_snapshots enable row level security;
alter table public.checkpoints enable row level security;

-- Events: append-only. Members of the event's workspace read and append;
-- there are no UPDATE/DELETE policies (and 00005 blocks them outright).
create policy "events_select_member"
  on public.events for select
  to authenticated
  using (is_workspace_member(workspace_id));

create policy "events_insert_member"
  on public.events for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

-- Snapshots: immutable. Members of the owning node's workspace read and append.
create policy "artifact_snapshots_select_member"
  on public.artifact_snapshots for select
  to authenticated
  using (is_workspace_member(snapshot_workspace(id)));

create policy "artifact_snapshots_insert_member"
  on public.artifact_snapshots for insert
  to authenticated
  with check (is_workspace_member(snapshot_workspace(id)));

-- Checkpoints: per-workspace ingestion state.
create policy "checkpoints_select_member"
  on public.checkpoints for select
  to authenticated
  using (is_workspace_member(workspace_id));

create policy "checkpoints_write_member"
  on public.checkpoints for update
  to authenticated
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "checkpoints_insert_member"
  on public.checkpoints for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

-- ---- uGraph ------------------------------------------------------------------

alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.code_anchors enable row level security;

-- Nodes: members read/write their workspace's graph; deletion is owner/admin.
create policy "nodes_select_member"
  on public.nodes for select
  to authenticated
  using (is_workspace_member(workspace_id));

create policy "nodes_insert_member"
  on public.nodes for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

create policy "nodes_update_member"
  on public.nodes for update
  to authenticated
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "nodes_delete_admin"
  on public.nodes for delete
  to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::public.workspace_role[]));

-- Edges: scoped through the `from` node's workspace; both endpoints must sit
-- in workspaces the caller belongs to on write.
create policy "edges_select_member"
  on public.edges for select
  to authenticated
  using (is_workspace_member(edge_workspace(id)));

create policy "edges_insert_member"
  on public.edges for insert
  to authenticated
  with check (
    is_workspace_member(node_workspace(from_id))
    and is_workspace_member(node_workspace(to_id))
  );

create policy "edges_update_member"
  on public.edges for update
  to authenticated
  using (is_workspace_member(edge_workspace(id)))
  with check (is_workspace_member(edge_workspace(id)));

-- Code anchors: scoped through their SATISFIES edge's workspace.
create policy "code_anchors_select_member"
  on public.code_anchors for select
  to authenticated
  using (is_workspace_member(edge_workspace(edge_id)));

create policy "code_anchors_insert_member"
  on public.code_anchors for insert
  to authenticated
  with check (is_workspace_member(edge_workspace(edge_id)));

create policy "code_anchors_update_member"
  on public.code_anchors for update
  to authenticated
  using (is_workspace_member(edge_workspace(edge_id)))
  with check (is_workspace_member(edge_workspace(edge_id)));

-- ---- uVerify -----------------------------------------------------------------

alter table public.context_packets enable row level security;
alter table public.verdicts enable row level security;
alter table public.rules enable row level security;
alter table public.findings enable row level security;
alter table public.finding_evidence enable row level security;
alter table public.audit_log enable row level security;
alter table public.notifications enable row level security;

-- Context packets: immutable, scoped through the criterion node.
create policy "context_packets_select_member"
  on public.context_packets for select
  to authenticated
  using (is_workspace_member(packet_workspace(id)));

create policy "context_packets_insert_member"
  on public.context_packets for insert
  to authenticated
  with check (is_workspace_member(packet_workspace(id)));

-- Verdicts: scoped through their packet's workspace.
create policy "verdicts_select_member"
  on public.verdicts for select
  to authenticated
  using (is_workspace_member(packet_workspace(packet_id)));

create policy "verdicts_insert_member"
  on public.verdicts for insert
  to authenticated
  with check (is_workspace_member(packet_workspace(packet_id)));

-- Rules: global policy definitions (no workspace column) — readable and
-- toggleable by any signed-in user; new versions come from the backend.
create policy "rules_select_authenticated"
  on public.rules for select
  to authenticated
  using (true);

create policy "rules_update_authenticated"
  on public.rules for update
  to authenticated
  using (true)
  with check (true);

create policy "rules_insert_authenticated"
  on public.rules for insert
  to authenticated
  with check (true);

-- Findings: scoped through the subject node's workspace. Reviewers transition
-- state with UPDATE.
create policy "findings_select_member"
  on public.findings for select
  to authenticated
  using (is_workspace_member(finding_workspace(id)));

create policy "findings_insert_member"
  on public.findings for insert
  to authenticated
  with check (is_workspace_member(finding_workspace(id)));

create policy "findings_update_member"
  on public.findings for update
  to authenticated
  using (is_workspace_member(finding_workspace(id)))
  with check (is_workspace_member(finding_workspace(id)));

-- Finding evidence: scoped through the finding.
create policy "finding_evidence_select_member"
  on public.finding_evidence for select
  to authenticated
  using (is_workspace_member(finding_workspace(finding_id)));

create policy "finding_evidence_insert_member"
  on public.finding_evidence for insert
  to authenticated
  with check (is_workspace_member(finding_workspace(finding_id)));

-- Audit log: append-only. Scoped through the finding when present, otherwise
-- through the actor's own Person node.
create policy "audit_log_select_member"
  on public.audit_log for select
  to authenticated
  using (
    is_workspace_member(
      coalesce(finding_workspace(finding_id), node_workspace(actor_id))
    )
  );

create policy "audit_log_insert_member"
  on public.audit_log for insert
  to authenticated
  with check (
    is_workspace_member(
      coalesce(finding_workspace(finding_id), node_workspace(actor_id))
    )
  );

-- Notifications: scoped through the finding's workspace.
create policy "notifications_select_member"
  on public.notifications for select
  to authenticated
  using (is_workspace_member(finding_workspace(finding_id)));

create policy "notifications_insert_member"
  on public.notifications for insert
  to authenticated
  with check (is_workspace_member(finding_workspace(finding_id)));

create policy "notifications_update_member"
  on public.notifications for update
  to authenticated
  using (is_workspace_member(finding_workspace(finding_id)))
  with check (is_workspace_member(finding_workspace(finding_id)));

-- ---- privilege hardening -----------------------------------------------------
-- RLS gates *which* rows; these grants gate *what operations* exist at all for
-- the API roles. service_role keeps full access (it bypasses RLS anyway).

-- Append-only / immutable tables: no UPDATE or DELETE for API roles.
revoke update, delete on public.events          from anon, authenticated;
revoke update, delete on public.artifact_snapshots from anon, authenticated;
revoke update, delete on public.context_packets from anon, authenticated;
revoke update, delete on public.audit_log       from anon, authenticated;

-- anon has no business touching anything: strip table privileges outright.
revoke all on all tables in schema public from anon;
