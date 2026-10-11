# @unify/worker — verification pipeline

The backend half of Slice C: it takes a criterion off the queue, builds the
evidence packet for it, runs the bounded verifier loop, and pushes the answer
through the deterministic gate before anything is stored.

```
enqueue_verification (RPC)
        │
        ▼
claim_verification_job ── FOR UPDATE SKIP LOCKED, attempts ≤ 3
        │
        ├── EvidenceProvider.load()      graph | fixture → slot sources + gate inputs
        ├── buildPacket()                budgets → manifest → packetHash → rendered prompt
        ├── runVerifierLoop()            ≤ 3 passes, each with a logged stop reason
        │     pass 1 scope  → NO_APPLICABLE_EVIDENCE
        │     pass 2 verify → the verdict + citations
        │     pass 3 critic → only when disputed / partial / weakly cited / missing evidence
        ├── gate()  (packages/contracts) 5 ordered checks, may only lower a status
        └── persist → context_packets, verifier_passes, verdicts, findings
                │
                ▼
        finish_verification_job (succeeded | failed)
```

Everything the loop produces is recorded per pass in `verifier_passes`, so a
reviewer can re-read *why* a verdict stopped where it did — and the stored
verdict is only ever written by `gate()`, never by the model directly.

## Run it

```bash
npm install                 # postinstall links packages/contracts (live, not a copy)
cp .env.example .env        # SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required

npm run seed                # write the demo case into the graph + enqueue a job
npm run once                # drain the queue once, print one JSON line per job
npm run dev                 # poll forever (JSON-lines log, one object per event)
```

`npm run seed [-- <bundle.json>]` is idempotent and stands in for the Slice B
analyser: it writes the same node payloads an analyser publishes
(`payload.slotItems`), wires the case's links, records an ingestion checkpoint
(so freshness reads `CURRENT`, not `UNKNOWN`), and enqueues the criterion.

## Model providers

`MODEL_PROVIDER=stub` (default) — deterministic, offline, no network. It reads
the rendered packet and answers from the evidence itself: a passing test ⇒
`SUPPORTED`, a failing one ⇒ `CONTRADICTED`, code without tests ⇒ `PARTIAL`,
empty packet ⇒ not applicable. Because it is bit-for-bit repeatable, the tests
drive the whole pipeline, including its failure paths, without a serving stack.

`MODEL_PROVIDER=opencode` — wraps `opencode run --standalone --format json`.
Each call gets a scratch directory containing an `opencode.json` that pins
`temperature: 0` (the CLI has no `--temperature` flag; OpenCode's config schema
does, which is what makes hard gate 2's "same packet ×3 at temperature 0"
honest) and `permission: {"*": "deny"}` so the model can only read and answer —
it cannot touch the repository. Failures (missing binary, non-zero exit,
timeout, empty reply) throw `ModelUnavailableError`, which the loop reports as
`stopReason = MODEL_UNAVAILABLE` and an `INSUFFICIENT_EVIDENCE` abstention.

There is deliberately **no silent fallback** from `opencode` to the stub. A
worker that thinks it is running the real model and quietly is not would be the
worst possible failure mode for an evidence pipeline.

## Provenance it writes

| Table | What it answers |
| --- | --- |
| `context_packets` | what evidence did the model see? (`packet_hash`, `manifest`, budgets) |
| `verifier_passes` | why did the loop stop there? (per-pass `prompt_hash`, raw output, `parsed_ok`) |
| `verdicts` | what did it conclude, and did the gate agree? (`gate_outcome`, `reason_code`, `stop_reason`, `model_and_run`) |
| `findings` | what does a reviewer act on? (one open evidence case per criterion, superseded on re-verification) |

Packets, passes and verdicts are append-only (00005/00013 triggers + revoked
UPDATE/DELETE); re-verifying a criterion appends a *new* packet/verdict pair and
supersedes the old finding rather than editing it.

## Tests

```bash
npm test          # 40 tests: packet assembly, loop control flow, gate end-to-end
npm run typecheck # src + tests
```

The end-to-end suite (`test/e2e-gate.test.ts`) is the slice's contract: T10's
fabricated citation downgrades and never reaches a reviewer as decisive; a
decisive verdict with zero citations is rejected as an abstention (hard gate
1); a stale source shows no verdict (UC-01); a model outage reads as *not
verified*, never as *verified as fine* (ch5).

## Deterministic linking (FR-04)

Links a GitHub pull request to the Jira issues it names. Separate from the
verification pipeline above; it does not touch the queue.

| Piece | What it does |
|---|---|
| `src/linking/extract-keys.ts` | Finds keys such as `UNI-123` in the PR title, branch name and commit messages. Pure TypeScript. A project allow-list rejects lookalikes like `UTF-8`. |
| `supabase/migrations/00015_link_pull_request_event.sql` | `link_pull_request_event(...)` RPC, one transaction: records the event (stops if this delivery was seen before), upserts the `PullRequest` node, looks up each key's `Ticket` node, inserts a `TRACKS` edge (`observed`, confidence 1.0, resolver `explicit-reference`). `service_role` only, like the queue RPCs. |
| `src/linking/link-pull-request.ts` | Extracts the keys, then makes the one RPC call. |
| `src/linking/callers.ts` | `viaSupabase(client)` calls the RPC through supabase-js; `viaSql(db)` calls the same function over plain SQL (tests, local demo). |
| `src/linking/local-db.ts` | In-process Postgres (PGlite) loaded with migrations 00001–00003, 00005, 00010 and 00015. Tests and local demo only. |

Outcomes: `linked`; `no_key`; `unknown_key` (no edge and no invented node;
the key stays in `events.references`); `duplicate_event` (via
`UNIQUE (source_tool, vendor_delivery_id)`); `already_linked` (via
`edges_current_identity_uidx`, so a dismissed link stays dismissed and a
revoked one can be re-created). The RPC's `ON CONFLICT` names the predicate
`where link_state <> 'revoked'`, which must match 00010 exactly.

The steps live in SQL because they must commit together, and supabase-js sends
each call as its own transaction.

```bash
npm run demo:linking              # local: in-process Postgres, same migrations
npm run demo:linking -- --live    # hosted project: needs SUPABASE_URL and
                                  # SUPABASE_SERVICE_ROLE_KEY in .env, and 00015 applied
```

`--live` writes to its own workspace (slug `linking-demo`) and uses a fresh
demo repo name per run. Not yet: a webhook endpoint that builds the
`PullRequestEvent` from a real GitHub payload.

## Known simplifications

- The OpenCode wrapper runs one process per model call (warm sessions would be
  the optimisation later).
- Passes are persisted after the loop rather than streamed per pass; a worker
  killed mid-run loses that job's pass rows but never writes a partial verdict.
- The fixture bundle (`fixtures/demo_case.json`) carries the case's text, which
  the dataset's gold packets do not (they store hashes + line ranges only);
  keeping the case in-repo makes the build network-free and immutable.
