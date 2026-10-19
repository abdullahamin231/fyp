# UNIFY — reviewer web app (`apps/web`)

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 implementation of the UNIFY
reviewer surface. Every screen is ported from the Google Stitch project
**Unified Dev Collaboration Hub** (`projects/14858991041797474900`); the exported
designs are vendored in `docs/stitch-reference/screens/` (HTML source of truth +
PNG render per screen).

## Run it

Run everything from `apps/web` — the package manifest, lockfile and
`node_modules` all live here (there is no repo-root `package.json`):

```sh
npm install            # in apps/web
npm run dev            # → http://localhost:3000
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
```

## Routes

```
/                            /conflicts/[id]         /policies/simulation
/activity                    /evaluation             /profile
/alerts                      /graph                  /search
/audit                       /graph/artifacts        /settings/notifications
/links                       /onboarding             /settings/slack
/conflicts                   /policies               /settings/workspace
                                                     /study
```

## Layout

```
src/app/                 routes (one folder per Stitch screen)
src/components/layout/   AppShell — 240px side rail + sticky omnibar top bar
src/components/ui/       shared kit: Icon, Panel, Badge/ToolPill, Button,
                         SegmentedTabs, StatCard, PageHeader
src/lib/types.ts         domain model (Finding, CriterionResult, Verdict, …)
src/lib/mock/            typed mock data — replaced by the API client later
src/lib/nav.ts           side-rail navigation
```

## Design tokens

`src/app/globals.css` carries a `@theme` block that is a 1:1 port of the
`tailwind.config` embedded in the Stitch screen exports: the Material 3-ish
colour set (`surface*`, `primary`, `secondary`, `tertiary`, `error`, `outline*`),
the type scale (`headline-lg/md/sm`, `body-lg/md/sm`, `label-caps`,
`mono-code`), spacing (`gutter`, `margin-page`, `stack-*`) and radius. Do not
introduce ad-hoc hex values or font sizes — extend the token block instead.

Fonts are self-hosted: Inter + JetBrains Mono via `next/font`, Material Symbols
via `/fonts/material-symbols-outlined.woff2`, so the app runs fully offline
(the project's local-first commitment).

## Domain rules baked into the UI

- Verdicts are only `SUPPORTED | CONTRADICTED | PARTIAL | INSUFFICIENT_EVIDENCE`,
  with freshness (`CURRENT/STALE/UNKNOWN`), `review_required` and `reason_code`
  kept as separate fields.
- Links that are `inferred`/`unconfirmed` may be listed and confirmed, but never
  produce a decisive finding or notification.
- Slack is delivery-only — never an input to reasoning.
- No external image CDNs: avatars are initials, thumbnails are gradients.

## Auth (Supabase)

Email + password sign-in against the `unify` Supabase project (no email
confirmation — auto-confirm is on). See `supabase/README.md` for the schema,
RLS and the full rationale.

```
src/lib/supabase/client.ts   browser client (@supabase/supabase-js)
src/lib/supabase/server.ts   server/route-handler client (@supabase/ssr)
src/proxy.ts                 session refresh + route guard (PUBLIC_PATHS)
src/app/login, /signup       auth pages (components/auth/auth-form.tsx)
src/app/auth/callback         PKCE code exchange
src/app/auth/signout          clear session → redirect
```

`src/proxy.ts` redirects any signed-out request to `/login?next=…`; only
`/login`, `/signup` and `/auth/*` are public. The sign-out button is in the
top bar of `components/layout/app-shell.tsx`.

Env lives in `apps/web/.env.local` (gitignored):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Provider integrations use the server-only bootstrap variables below. Provider
OAuth client IDs, client secrets and webhook secrets are registered per
workspace at `/settings/integrations?workspace=<slug>` and stored encrypted in
the database. The OAuth callback stores access and refresh tokens encrypted
with AES-256-GCM; the webhook endpoint never accepts a token from the browser.

```
SUPABASE_SERVICE_ROLE_KEY   (or SUPABASE_SECRET_KEY)
INTEGRATION_ENCRYPTION_KEY  (the worker needs the same value)
OAUTH_STATE_SECRET
CRON_SECRET                 (only for /api/cron/figma-poll)
GITHUB_OAUTH_SCOPE, JIRA_OAUTH_SCOPE, FIGMA_OAUTH_SCOPE   (optional overrides)
```

Register each provider app and webhook from the workspace settings page.
GitHub sends `X-Hub-Signature-256`, Jira sends
`X-Hub-Signature`, and Figma v2 sends its creation passcode in the payload.
Webhook requests are verified against the raw body, persisted idempotently,
and then normalized into `events`. Apply every migration in `supabase/migrations` in order before enabling
live delivery (see `supabase/README.md`). `npm run poll` runs the local loop
that polls watched Figma files and reconciles GitHub pull requests.

**Creating a workspace:** call `supabase.rpc("create_workspace", { p_name, p_slug })`,
not a direct `.insert().select()` — the latter hits a PostgREST
data-modifying-CTE path where `auth.uid()` evaluates NULL in the RLS
with-check. Full explanation in `supabase/README.md`.

## Status

Auth is wired end-to-end (signup → session → guarded routes → sign-out).
Every screen reads Supabase through `src/lib/data/**` under the caller's RLS
session, and every write goes through a server action in `src/lib/actions/**`
that appends an `audit_log` row. Controls with no backend were removed rather
than left as placeholders.
