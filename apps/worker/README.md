# @unify/worker

Background processing for UNIFY. Right now it does one thing: **deterministic
linking** (FR-04). It links a GitHub pull request to the Jira issues it names.

```sh
cd apps/worker
npm install
npm test               # 14 tests, against a real Postgres (PGlite) loaded with supabase/migrations
npm run typecheck
npm run demo:linking   # the live-demo walkthrough
```

## Deterministic linking

| File | What it does |
|---|---|
| `src/linking/extract-keys.ts` | Finds keys such as `UNI-123` in the PR title, branch name and commit messages. Pure function, no I/O. |
| `src/linking/link-pull-request.ts` | One transaction: records the event (and stops if it was already seen), upserts the `PullRequest` node, looks up each key's `Ticket` node, then inserts a `TRACKS` edge. |
| `src/linking/db.ts` | The single `query(sql, params)` method the linker needs. Both `pg.Client` and PGlite provide it. |
| `supabase/migrations/00009_edge_dedupe.sql` | Partial unique index: one live edge per `(from_id, to_id, type)`. |

The edge is written as `source_class = observed`, `confidence = 1.0` and
`resolver = explicit-reference`, so it may support a decisive finding (FR-05).

### Outcomes

| Case | Result | Where it is decided |
|---|---|---|
| Key found, ticket exists | `linked`: new edge | edge insert |
| No key in the PR | `no_key`: event kept, no edge | after extraction |
| Key found, no such ticket | `unknown_key`: no edge, no invented node; the key stays in `events.references` | ticket lookup |
| Same webhook delivered twice | `duplicate_event`: nothing written | `UNIQUE (source_tool, vendor_delivery_id)` on `events` |
| New event, key already linked | `already_linked`: no second edge, and a dismissed link stays dismissed | index from 00009 |

Lookalikes such as `UTF-8`, `SHA-256` and `ISO-8601` are rejected by the
project allow-list (`projectKeys: ["UNI"]`).

### Not done yet

- A webhook endpoint that turns a real GitHub payload into a `PullRequestEvent`.
- Re-resolving `unknown_key` references once that Jira issue is ingested.
- Closing an edge (`valid_to`) when a key is removed from the PR.
- Running against Supabase. The worker would connect with `pg.Client` and a
  server-side connection string. Migration `00009` must be applied there first.
