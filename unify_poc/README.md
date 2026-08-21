# Unify POC Engine

Bare-minimum proof-of-concept for the Unify FYP: cross-tool consistency and
drift detection across Figma, GitHub and Jira.

It runs the core pipeline end-to-end:

```
ingest (fixtures) -> normalize -> auto-link -> conflict rules -> role route -> alert log + minimal UI
```

No OAuth, no live webhooks, no database, no Slack — data comes from JSON
fixtures in `data/` (the Section 12 "fallback POC" approach). The ingestion
layer is built around a pluggable `Adapter` so a real GitHub/Jira/Figma adapter
can be dropped in later without touching the linking or conflict logic.

## Layout

```
unify_poc/
  run.py                 # CLI: runs pipeline, prints alerts + eval report
  src/unify/
    models.py            # common normalized schema (Entity/Event/Link/Alert)
    config.py            # confidence + role/severity mapping
    ingestion/           # adapter.py (Adapter ABC), normalizer.py, fixtures.py
    resolution/linker.py # auto-link by textual reference + manual links
    store/memory_store.py# in-memory entities/events/links
    conflicts/           # rules.py (R1-R3) + engine.py (rule runner)
    notify/              # sink.py (log + alerts.json)
    feed/feed.py         # linked-chain + timeline view (FR-05)
    eval/harness.py      # precision/recall + latency vs labels.json
    ui/app.py            # minimal Flask UI
    pipeline.py          # orchestrates the whole flow
  data/                  # github.json, jira.json, figma.json, manual_links.json, labels.json
  tests/                 # linking / conflict / notify tests
```

## Run

```bash
cd unify_poc
pip install -r requirements.txt
PYTHONPATH=src python run.py            # CLI with human-readable eval
PYTHONPATH=src python run.py --json     # eval report as JSON
PYTHONPATH=src python -m pytest         # tests
PYTHONPATH=src python -m unify.ui.app   # minimal UI at http://127.0.0.1:5000
```

## What it proves (Section 12 POC)

A simulated Figma change (`fig:ABC123` updated 2026-08-04) is ingested, the
linked Jira ticket `PROJ-15` and PR `gh:pr:42` are found via the relationship
layer (auto-linked from a Jira key in the PR title and a Figma URL in the
ticket), and three conflict rules fire:

- `design_changed_after_code` — design updated after code started (→ designer)
- `ticket_stale_in_progress` — ticket still In Progress after PR merge (→ PM)
- `done_without_code` — ticket Done with no linked PR (→ developer)

The eval harness compares the produced links/alerts against `data/labels.json`
and reports linking precision/recall, alert precision/recall, false-positive
rate, and batch rule-eval latency.

## Conflict rules

| Rule | Condition | Role |
|------|-----------|------|
| `design_changed_after_code` | Figma frame updated after a linked PR's first commit | designer |
| `ticket_stale_in_progress` | Jira ticket "In Progress" after linked PR merged | pm |
| `done_without_code` | Jira ticket "Done" with no linked PR | developer |

## Out of scope (POC only)

OAuth / live webhooks, Postgres + graph query, background worker / job queue,
real Slack delivery, dashboard beyond a read-only feed, AI layer. The `Adapter`
ABC and `MemoryStore` keep these swappable for the full build.
