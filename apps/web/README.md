# UNIFY — reviewer web app (`apps/web`)

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 implementation of the UNIFY
reviewer surface. Every screen is ported from the Google Stitch project
**Unified Dev Collaboration Hub** (`projects/14858991041797474900`); the exported
designs are vendored in `docs/stitch-reference/screens/` (HTML source of truth +
PNG render per screen).

## Run it

```sh
npm install            # from the repo root (npm workspaces)
npm run dev            # → http://localhost:3000
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
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

## Status

Screens are implemented against the Stitch reference with typed mock data.
The next step is the API/contracts layer (`packages/contracts`, Zod) and the
real ingestion/verdict back end; the mock modules are shaped so they can be
swapped for a client without touching the screens.
