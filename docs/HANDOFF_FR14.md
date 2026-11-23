# Handoff — FR-14 routing (24 Nov 2026)

Where FR-14 (route each finding to the responsible role) stands, what is open, and what to do first.

## State of the work

| PR | What | Status |
|---|---|---|
| #63 | Bounded notify-set resolution; `routing_outcomes` (migration 00040); Rule 2 findings routed | merged |
| #64 | `person_identities` (migration 00041); provider account -> Person; Jira/GitHub role edges derived at ingestion | merged |
| #65 | Re-route unroutable findings when edges appear; in-app delivery (`pending` -> `sent` -> `delivered`); inbox in the top-bar bell | **open** |
| #66 | Figma version-author `OWNS` edge; opt-in `WATCHES` watch/unwatch action + toggle on the conflict page | **open** |

#65 and #66 both branch from `main` at `baf2fe9` and touch different files; merge in either order.

**After merging both,** add one call to `syncFigmaDesign` (`apps/web/src/lib/integrations/figma-sync.ts`): when `syncRoleEdges` returns `created > 0`, call `rerouteUnroutableAround(db, artifactId)` (from `@/lib/data/route-finding`, introduced in #65). Jira and GitHub already do this in `pipeline.ts`; Figma cannot until #65 lands.

## How routing works now

1. Ingestion (`pipeline.ts`, `figma-sync.ts`) resolves provider accounts to Person nodes (`people.ts`) and writes role edges from the vendor's own fields: Jira assignee -> `ASSIGNED_TO`, Jira reporter -> `OWNS`, PR author -> `OWNS`, PR assignees -> `ASSIGNED_TO`, Figma version author -> `OWNS` (resolver `figma:version-author`).
2. `WATCHES` is created only by a member's own action (`lib/actions/watch.ts`), never by ingestion.
3. Rule 2 creates a finding -> `routeAndDeliver` (`lib/data/route-finding.ts`) walks at most two hops from the subject node (`lib/domain/notify-set.ts`), filters people by the rule's `roles` and their muted channels, then queues `notifications` or records a `routing_outcomes` row (`no_role_edge` / `no_matching_user`).
4. In-app notifications are marked `sent` once routed and `delivered` when the recipient opens the bell. Slack rows stay `pending`: there is no Slack adapter.

Identity rule: provider **account id only** (Jira `accountId`, GitHub numeric `id`, Figma user `id`). Email and names are stored, never matched on.

## To do, in order

1. **Merge #65 and #66**, then add the Figma re-route call above.
2. **Apply migration `00041`** (`person_identities`, `integration_connections.connected_account_id`, role backfill on existing Person nodes) to the real Supabase project. Never run against a real instance so far; the worker's PGlite test only proves it applies cleanly.
3. **Reconnect Jira** so the grant includes `read:me` (added to the default scopes). Until then Jira's connection-owner binding is skipped and Jira assignees stay "unresolved" Persons.
4. **Click through the UI.** The bell inbox and the Watch toggle are verified only by typecheck, lint and build, never in a browser.
5. **Poll a real Figma file** and confirm `version.user.id` is actually present in the versions response.
6. **Docs:** `docs/traceability/traceability_matrix.csv` still lists FR-14 as "designed" with the note "no notification engine". Update the CSV and regenerate with `build_matrix.py` (needs Python, not installed on this machine). Chapter 4's FR-14 paragraph was updated on #66's branch (assumes delivery is not built; if #65 merges, say in-app delivery exists) and Chapter 5 line ~505 still says role-edge derivation is not implemented, which is no longer true.

## Open decisions

- **Should unresolved Persons route?** An actor matching no workspace member becomes a provider-scoped Person (`jira:<id>`, `github:<id>`, `figma:<id>`) with a default `developer` role, and findings route to them. The spec's rule 5 says unresolved people must not drive outcomes; satisfying it needs a change to `route-finding.ts`. Chapter 4 currently describes the existing behaviour.
- **Figma authors accumulate.** Each version's author gets an `OWNS` edge and nothing retires older ones, so every past author of a file is eligible. Decide whether to retire the previous `figma:version-author` edge when a new author appears.
- **Audit values for watch.** `audit_action` has no watch value, so watch is logged as `link_confirmed` and unwatch as `link_dismissed` (told apart by `evidence_snapshot.kind`). Exports will show `link_dismissed` for an unwatch. Adding `watch`/`unwatch` enum values needs a migration.
- **Default role is `developer`.** `setPersonRole` exists (`people.ts`, tested) but has no UI or server action, so only direct data edits change a role. A watcher or assignee whose role is not in the rule's `roles` is silently filtered out.

## Known gaps and risks

- Only Rule 2 has an evaluator, so only Rule 2 findings are routed. Rules 1 and 3 are seeded but not evaluated.
- Slack delivery, digests and any outbound channel beyond in-app are not built.
- `notifications` RLS is workspace-wide: any member can technically mark another member's notification delivered. Tightening needs a policy change.
- `events.actor` holds a Jira `accountId`, a GitHub `login` or a Figma handle depending on provider (three kinds of value in one column). Left alone on purpose.
- Findings recorded `unroutable` before #65 deploys are only retried the next time a role edge is created near them; there is no backfill job.
- `next build` fails once with a Next.js security-advisory error and passes on retry; the installed Next.js version is flagged as vulnerable. Upgrading is undecided (`next upgrade --agent=security` was suggested by the tool output, not run).

## Working notes

- Git author is `haani-maybe`. Never add a Claude co-author or attribution to commits or PRs (saved preference).
- Python is not installed on this machine; `node -e` / the Edit tool were used for scripted edits.
- Tests use `apps/web/src/test/fake-supabase.ts`: it applies no column defaults and enforces no unique indexes. Set `link_state`/`valid_to` explicitly in fixtures, and simulate `23505` by hand where a test depends on it (see `lib/actions/watch.test.ts`).
- Suite counts when this was written: web 161, contracts 123, worker 114 (on the #66 branch). Verify with `npm test` in `apps/web` and `apps/worker`, and `npm run test:contracts` at the root.
- Task specs used: `C:\Users\hp\Downloads\AGENT_PERSON_IDENTITY.md` and `AGENT_FIGMA_OWNER_AND_WATCHES.md` (outside the repo).
