-- Demo controls: the T10 fault switch, flipped from the reviewer UI.
--
-- The deterministic stub model can be told to behave like a badly-behaved
-- model (WORKER_SETTINGS.stubFabricate in apps/worker/src/config.ts). That
-- switch used to need a file edit and a worker restart; this row lets the
-- `/demo` control page arm and disarm it per workspace, and the worker reads it
-- on every claimed job. It only affects the stub provider — a real model is
-- never asked to fabricate — and an armed fault is logged on every job and
-- recorded in the verdict's model_and_run, so it can never be silent.

create table if not exists public.demo_controls (
  workspace_id   uuid primary key references public.workspaces (id) on delete cascade,
  stub_fabricate text not null default 'none' check (stub_fabricate in ('none', 'extra', 'only')),
  updated_by     uuid references auth.users (id) on delete set null,
  updated_at     timestamptz not null default now()
);

comment on table public.demo_controls is
  'Per-workspace demo fault injection (T10). Read by the worker per job; written only through the service role by the /demo page after an owner/admin check.';

alter table public.demo_controls enable row level security;

-- Members can see whether a fault is armed (the /demo banner); nobody writes
-- through the API — the page's server action uses the service role.
create policy demo_controls_member_read
  on public.demo_controls for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

revoke insert, update, delete on public.demo_controls from anon, authenticated;
