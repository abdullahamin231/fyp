# Unify POC Engine

Proof-of-concept for the Unify FYP: cross-tool consistency and drift
detection across Figma, GitHub and Jira. Implements the full Section 12 POC
plan — both the fixture path and the live-API path — plus the failure/fallback
experiment required by Sections 12/13.

```
ingest (fixtures or live API) -> normalize -> auto-link (with suggestion queue)
  -> conflict rules -> role routing + delivery log -> alert log + eval + UI
```

## Layout

```
unify_poc/
  run.py                 # CLI: pipeline, eval, --live-github, --experiment-outage
  src/unify/
    models.py            # Entity/Event/Link/Suggestion/Alert/Delivery
    config.py            # confidence thresholds, role channels, noise/stale limits
    ingestion/
      adapter.py         # Adapter ABC (load_raw) + FixtureAdapter
      github_api.py      # LIVE GitHub REST adapter (GITHUB_TOKEN optional)
      normalizer.py      # vendor record -> common schema; reference extraction
      fixtures.py        # raw loading + store ingestion helpers
      outage.py          # OutageQueue + Section 12/13 failure experiment
    resolution/linker.py # auto-link w/ confidence gating + manual confirmation
    store/memory_store.py# entities/events/links/suggestions; ingest timestamps; stale flags
    conflicts/           # rules.py (R1-R3, coalesced) + engine.py (dedup + latency)
    notify/sink.py       # role channels, delivery log, noise threshold
    feed/feed.py         # linked-chain + timeline view (FR-05)
    eval/harness.py      # negatives-aware precision/recall/F1/FPR + p50/p95 latency
    ui/app.py            # Flask UI: alerts, deliveries, suggestions, calibration
  data/                  # fixtures: github/jira/figma.json, manual_links.json,
                         #   labels.json (positives AND negatives), outbox.json
  tests/                 # 28 tests: linking, conflicts, notify, latency, eval, outage, adapter
```

## Run

```bash
cd unify_poc
pip install -r requirements.txt

PYTHONPATH=src python3 run.py                          # fixture pipeline + eval
PYTHONPATH=src python3 run.py --json                   # eval report as JSON
PYTHONPATH=src python3 run.py --live-github owner/repo # live GitHub REST ingestion
PYTHONPATH=src python3 run.py --experiment-outage      # failure/fallback experiment
PYTHONPATH=src python3 -m pytest                       # test suite
PYTHONPATH=src python3 -m unify.ui.app                 # UI at http://127.0.0.1:5000
```

The UI includes `/graph` — a server-rendered SVG relationship graph (no JS):
Figma/GitHub/Jira columns, commits nested under their PRs, edges colored by
kind (auto / manual / fired-conflict), amber dashed rings on stale entities,
and hollow ghost nodes for unresolved references awaiting manual confirmation.

`GITHUB_TOKEN` (env var) is optional for `--live-github`; it only raises the
API rate limit.

## What it proves (Section 12 POC plan)

**Q1 — risky assumption.** Reference-based auto-linking plus rule-based
conflict detection identifies downstream conflicts across Figma → GitHub →
Jira with measurable precision.

**Q2 — input/setup.** Two paths:
- *Primary-path seed*: `--live-github` fetches real PRs and commits from any
  GitHub repo through the same `Adapter` interface as the fixtures — the
  normalization/linking/conflict stack is untouched by the swap.
- *Fallback path*: JSON fixtures covering five scenarios (below).

**Q3 — expected result.** A simulated Figma change (`fig:ABC123`, updated
after the first commit referencing it) is ingested, the linked ticket
`PROJ-15` and PR `gh:pr:42` are found via the relationship layer, three
conflict rules fire, and each alert is routed to a role's channels with a
logged delivery record:

| Rule | Fires when | Routed to |
|------|-----------|-----------|
| `design_changed_after_code` | design updated after linked PR's first commit (coalesced per chain) | designer |
| `ticket_stale_in_progress` | ticket still In Progress after linked PR merged | pm |
| `done_without_code` | ticket Done with no linked PR | developer |

**Q4 — what is learned.** The evaluation is *not* circular: `labels.json`
contains 13 positive links **and 6 labeled non-links**, 3 expected alerts
**and 4 expected silences** (benign scenarios that must stay quiet). The
harness reports linking/alert precision, recall, F1 and false-positive rate
computed against both sets, plus p50/p95 event→alert latency measured from
each event's ingestion timestamp (so queue/replay delay is included).

Current numbers on the fixture scenario: linking P=R=F1=1.0 (FPR 0 over 6
negatives), alert P=R=F1=1.0 (FPR 0 over 4 silences).

**Q5 — how it changes the plan.** Confidence is load-bearing: auto-links are
assigned `AUTO_LINK_CONFIDENCE` (0.9) and trusted only above
`AUTO_LINK_TRUST_THRESHOLD` (0.8); below threshold they degrade to pending
suggestions. References to non-ingested entities (e.g. `PROJ-99`, a deleted
Figma frame) are never silently dropped — they enter the ambiguous-link queue
for manual confirmation, and `manual_links.json` records confirmed pairs.
Lowering the confidence in config demonstrates the degradation path.

## Failure / fallback experiment (Sections 12–13)

`--experiment-outage` simulates Figma being unreachable:

1. Last-known Figma entities stay in the store but are marked
   **stale/unverified**; their new events go to a persistent outbox
   (`data/outbox.json`).
2. Conflict rules refuse to treat stale chains as up to date — the
   design-conflict rule is suppressed while the tool is down.
3. On reconnect the outbox replays, staleness clears, and the suppressed
   conflict fires with event→alert latency measured from replay time.

## Scenarios in the fixture data

| Scenario | Chain | Outcome |
|----------|-------|---------|
| S1 conflict | fig:ABC123 → PROJ-15 → gh:pr:42 | design changed after code + ticket stale after merge |
| S2 conflict | PROJ-16 (Done, no PR) | done-without-code; its Figma ref is unresolved → suggestion |
| S3 benign | fig:GHI789 → PROJ-20 → gh:pr:51 | design updated *before* first commit, PR open → silence |
| S4 benign | PROJ-21 → gh:pr:55 (merged) | healthy done-with-code → silence |
| S5 manual | PROJ-22 ↔ fig:JKL333 | no textual refs; linked via manual_links.json |
| negative | gh:pr:60 → PROJ-99 | unknown Jira key → suggestion, no link |

## Out of scope (POC only)

OAuth handshake, Jira/Figma live adapters (same `Adapter` interface),
Postgres + graph queries, background workers, real Slack delivery (channels
are simulated with logged deliveries). All are drop-in extensions of the
interfaces exercised here.
