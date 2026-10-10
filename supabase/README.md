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

### Security-definer helpers (intentional)

`is_workspace_member`, `workspace_role_of`, `has_workspace_role`,
`node_workspace`, `edge_workspace`, `finding_workspace`, `packet_workspace`,
`snapshot_workspace` are SECURITY DEFINER and callable by `authenticated` —
they resolve workspace scoping across FK chains so RLS policies can be written
as simple predicates. The Supabase advisor flags this class (WARN, lint 0029);
it is **by design**, not an oversight. `create_workspace` is in the same class.

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

## Regenerating TypeScript types

The generated DB types (34 KB) are not committed. Regenerate after schema
changes with the Supabase MCP:

```
generate_typescript_types({ project_id: "viosyhihgoiitcmysnbr" })
```

…or the Supabase CLI: `supabase gen types typescript --project-id viosyhihgoiitcmysnbr`.
