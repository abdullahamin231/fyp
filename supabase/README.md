# UNIFY — Supabase (PostgreSQL + Auth)

Hosted Postgres for the UNIFY evidence graph, with email+password auth and
row-level security scoped to workspaces.

**Project:** `unify` · ref `viosyhihgoiitcmysnbr` · region `ap-northeast-1`
**URL:** `https://viosyhihgoiitcmysnbr.supabase.co`

## Migrations

`supabase/migrations/` is the source of truth and mirrors what is applied to
the remote project (applied via the Supabase MCP `apply_migration`). Order:

| File | What it does |
|---|---|
| `00001_enums.sql` | 18 enum types — vocabulary mirrors `packages/contracts/src/enums.ts` |
| `00002_tenancy.sql` | `workspaces`, `workspace_members`, `profiles` + signup/`handle_new_workspace` triggers |
| `00003_schema.sql` | The 13 ERD tables (from `docs/…/diagrams/erd.tex`) + indexes/constraints |
| `00004_rls.sql` | RLS enabled on all tables + ~40 policies |
| `00005_immutability.sql` | `forbid_mutation()` triggers on append-only tables |
| `00006_security_hardening.sql` | Locked-down `search_path`s, revoked RPC access to trigger functions, `created_by` trigger |
| `00007_workspace_created_by.sql` | `set_created_by()` BEFORE INSERT trigger (defaults `created_by`) |
| `00008_create_workspace_rpc.sql` | `create_workspace(name, slug)` SECURITY DEFINER RPC |
| `00009_seed_rules.sql` | Seeds version 1 of deterministic Rules 1–3 |
| `00010_integrations.sql` | `integration_connections` (encrypted OAuth tokens) + `integration_deliveries` webhook receipts |
| `00011_finding_state_superseded.sql` | Adds `superseded` to the `finding_state` enum |
| `00012_findings_superseded_by.sql` | `findings.superseded_by_id` self-FK + the `state = superseded ⟺ superseded_by_id set` CHECK |
| `00013_verification_queue.sql` | `verification_jobs`, `verifier_passes`, claim/finish/enqueue RPCs |
| `00014_verification_vocab.sql` | Verification enum additions |
| `00015_link_pull_request_event.sql` | `link_pull_request_event` RPC (PR → Ticket linking) |
| `00016_publish_analysis.sql` | `publish_analysis` RPC (analyser output → graph) |
| `00017_reverification_new_job.sql` | Re-verification creates a new job |
| `00018_integration_apps.sql` | Per-workspace provider OAuth app registrations |
| `00019_figma_watched_files.sql` | First version of `figma_watched_files` (superseded by 00020/00026) |
| `00020_figma_watched_files.sql` | `figma_watched_files` as the poller reads it |
| `00021_demo_controls.sql`, `00022_drop_demo_controls.sql` | Added then removed with the demo tooling |
| `00023_edge_dedupe.sql` | One current edge per `(from_id, to_id, type)`, a partial unique index scoped to `link_state <> 'revoked'` |
| `00024_workspace_invitations.sql` | `workspace_invitations` table + `invite_to_workspace` / `accept_workspace_invitation` / `decline_workspace_invitation` RPCs |
| `00025_ingestion_pipeline.sql` | `integration_apps.criteria_field` and `analysis_targets` |
| `00026_figma_watched_files_converge.sql` | Brings a fresh database's `figma_watched_files` to the live shape |
| `00035_events_delivery_per_workspace.sql` | Vendor delivery uniqueness scoped to a workspace |
| `00036_ingest_jira_issue.sql` | Jira criteria lifecycle, NFR ingestion and re-verification |
| `00037_workspace_event_identity.sql` | Workspace-scoped GitHub event IDs; preserves legacy event identities on replay |
| `00038_jira_version_order.sql` | Rejects Jira deliveries older than the issue already stored |
| `00039_verification_criterion_revision.sql` | Pins verification work to criterion version/text; publishes results atomically |

The live project applied these by hand under timestamped versions, so the file
numbers only govern fresh setups. `apps/worker/test/migrations.test.ts` applies
the whole chain in order on an empty Postgres and fails on a reused version.

### Deploying 00037–00039 to the existing live project

The live project already has 00026, 00035 and 00036. These follow-up migrations
do not modify those applied files or rewrite immutable event history.

1. Stop the worker: `sudo systemctl stop unify-worker`.
2. Apply **00037, 00038, then 00039** using the SQL editor or `psql -f`, each
   migration in a transaction. Do not use `supabase db push`: the live history
   uses timestamped versions and would attempt to replay the earlier chain.
3. Deploy the updated web app and start the updated worker:
   `sudo systemctl start unify-worker`. Check `systemctl status unify-worker`
   and `journalctl -u unify-worker` for startup/job errors.

00039 replaces any jobs left running by the old worker with queued jobs pinned
to the current criterion. Queued jobs adopt the current revision; finished
jobs, packets, passes and verdicts remain historical records. The new worker
requires 00039's columns and `complete_verification_job` RPC before it starts.

Schema highlights:

- 16 tables live; RLS enabled on **every** one.
- `findings` uses `origin` (rule|verdict discriminator — the ERD's `kind`) plus
  `kind` (finding_kind); a CHECK enforces exactly one origin. Composite FK
  `(rule_id, rule_version) → rules(id, version)`.
- `events."references"` is quoted (reserved word).
- `rules` are global (no workspace scoping) — readable/updatable by any
  authenticated user.
- Append-only: `events`, `artifact_snapshots`, `context_packets`, `audit_log`
  have UPDATE/DELETE revoked from anon+authenticated **and** `forbid_mutation()`
  triggers. `code_anchors` is deliberately *not* trigger-locked (status flips
  `active → broken`); re-anchoring appends rows via `prev_anchor_id`.

### Edge dedupe — and why dismissal is sticky (`00010`)

`edges_current_identity_uidx` is a **partial** unique index over
`(from_id, to_id, type)` scoped to `link_state <> 'revoked'`. Scoping it that
way — rather than to `link_state = 'active'` — is the whole design:

| State | Holds the identity? | Effect on a re-mention |
|---|---|---|
| `active` | yes | rejected as a duplicate |
| `dismissed` | **yes** | rejected — the link stays gone |
| `revoked` | no | a fresh link may be created |

**The side effect, stated plainly:** once a reviewer dismisses a link,
mentioning that `(PR, ticket, type)` key again does **not** bring it back. The
dismissed row still occupies the identity, so the insert violates the index.
This is deliberate — a human "no" is not overturned by the next vendor webhook,
and the reviewer stays the authority over what counts as a link.

To genuinely re-establish a dismissed link, **revoke the old row first** (with a
reason, so it lands in the audit trail) and then insert afresh. Nothing in the
API should flip `dismissed → active` directly; that would silently re-assert a
link a human rejected.

`00010` also revokes any pre-existing duplicate rows, keeping the newest edge
per identity, so the index can be created on a populated table.

### Security-definer helpers (intentional)

`is_workspace_member`, `workspace_role_of`, `has_workspace_role`,
`node_workspace`, `edge_workspace`, `finding_workspace`, `packet_workspace`,
`snapshot_workspace` are SECURITY DEFINER and callable by `authenticated` —
they resolve workspace scoping across FK chains so RLS policies can be written
as simple predicates. The Supabase advisor flags this class (WARN, lint 0029);
it is **by design**, not an oversight. `create_workspace`,
`current_user_email` and the three invitation RPCs (`invite_to_workspace`,
`accept_workspace_invitation`, `decline_workspace_invitation`) are in the same
class — the invitation RPCs additionally enforce their own role/email checks
before writing.

## Auth

Email + password, **no email confirmation** (auto-confirm is enabled on the
project, so signup returns a session immediately — no dashboard change needed).

### Frontend env (`apps/web/.env.local`, gitignored)

```
NEXT_PUBLIC_SUPABASE_URL=https://viosyhihgoiitcmysnbr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fCwnqASkY7sytY9iXDWU-A_N3EYSFmV
```

### Sign-in flow (`apps/web`)

- `src/lib/supabase/client.ts` — browser client (`@supabase/supabase-js`)
- `src/lib/supabase/server.ts` — server/route-handler client (`@supabase/ssr`
  cookie adapter)
- `src/proxy.ts` — Next 16 session-refresh + route guard. `PUBLIC_PATHS` =
  `/login`, `/signup`, `/auth/*`; everything else redirects to
  `/login?next=…` when signed out.
- `/login`, `/signup` — pages using `components/auth/auth-form.tsx`
- `/auth/callback` — PKCE code exchange
- `/auth/signout` — clears the session and redirects
- Sign-out button lives in the top bar of `components/layout/app-shell.tsx`

## Creating a workspace — use the RPC

**Do not** create workspaces with a direct table insert from the client. Use:

```ts
const { data, error } = await supabase.rpc("create_workspace", {
  p_name: "Acme Engineering",
  p_slug: "acme-eng",
});
```

`create_workspace` is SECURITY DEFINER, sets `created_by = auth.uid()`,
validates the slug (`^[a-z0-9]+(-[a-z0-9]+)*$`) and returns the new row. The
`on_workspace_created` AFTER trigger adds the owner's `workspace_members` row,
so one call provisions a fully-owned workspace.

### Why an RPC? (PostgREST + data-modifying CTE + `auth.uid()`)

`supabase-js` `.insert().select()` sends `Prefer: return=representation`.
PostgREST honours that by wrapping the INSERT in a **data-modifying CTE**
(`WITH … AS (INSERT … RETURNING …)`). On this Postgres build, `auth.uid()`
evaluates to **NULL** inside such a CTE's RLS `WITH CHECK`, so a policy of
`created_by = auth.uid()` rejects every CTE-wrapped insert — *even when
`created_by` is supplied correctly*.

Isolated with a minimal repro: a policy `with check (auth.uid() is not null)`
passes on a plain INSERT and fails on the identical CTE-wrapped INSERT. Plain
INSERT shapes (direct SQL, prepared statements, generic plans, plpgsql bodies)
are unaffected, which is why:

- `.insert()` **without** `.select()` → 201 (plain INSERT, no CTE)
- `.insert().select()` → 42501 (CTE-wrapped)
- `rpc("create_workspace", …)` → works (function body is a plain INSERT)

The strict `workspaces_insert_authenticated` policy stays as defense-in-depth
for the plain-insert path; the RPC is the supported client API.

## Inviting members — use the RPCs

Workspace owners/admins invite by email; the invitee sees the pending invite
in-app (top-bar bell) and joins on accept. No email is sent — matching is by
address at read time, so an invite surfaces even if the person signs up later.

```ts
await supabase.rpc("invite_to_workspace", {
  p_workspace_id: workspaceId,
  p_email: "teammate@example.com",
  p_role: "member", // or "admin"; "owner" is rejected
});

// Invitee side:
await supabase.rpc("accept_workspace_invitation", { p_invitation_id: id });
await supabase.rpc("decline_workspace_invitation", { p_invitation_id: id });
```

Accepting inserts the `workspace_members` row and marks the invite answered in
one definer call; an invitee has no direct UPDATE on `workspace_invitations`
(there is deliberately no update policy). Revoking a pending invite is a plain
DELETE by an owner/admin. The permissive `workspaces_select_invited` policy
lets an invitee read the invited workspace's name/slug so the UI can render it.

## Regenerating TypeScript types

The generated DB types (34 KB) are not committed. Regenerate after schema
changes with the Supabase MCP:

```
generate_typescript_types({ project_id: "viosyhihgoiitcmysnbr" })
```

…or the Supabase CLI: `supabase gen types typescript --project-id viosyhihgoiitcmysnbr`.
