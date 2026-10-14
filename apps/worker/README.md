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

## Evidence graph walk bound

The `GraphEvidenceProvider` performs a bounded BFS walk from the criterion
node. The default `maxHops` is **3** (previously 2). This walk reaches:

* **Hop 1** — nodes directly linked from the criterion (e.g. PullRequests
  via `SATISFIES` edges).
* **Hop 2** — nodes linked from hop-1 nodes (e.g. Commits, CodeSymbols,
  DesignArtifacts, neighbour notes).
* **Hop 3** — nodes linked from hop-2 nodes (e.g. deeper graph neighbours).

If a node type sits beyond 3 hops, it will not be included in the packet's
evidence slots. To reach such nodes, add direct edge types (e.g. `IMPLEMENTS`
from `PullRequest` → `CodeSymbol`) or increase `maxHops` further.

The worker `TYPE_TO_SLOT` mapping (derived from `NODE_TYPE_META` in
`@unify/contracts`) determines which slot each reached node's `payload.slotItems`
lands in.

## Run it

```bash
npm install                 # postinstall links packages/contracts (live, not a copy)
cp .env.example .env        # SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required

npm run once                # drain the queue once, print one JSON line per job
npm run dev                 # poll forever (JSON-lines log, one object per event)
```

`.env` holds **only the secrets** (Supabase URL + service-role key, plus
`ANALYSIS_GIT_TOKEN` for private repositories). Every operational value —
model provider, budgets, poll interval, analysis settings — is hardcoded in
`src/config.ts` (`WORKER_SETTINGS`), so a run's inputs are a recorded decision
in git rather than a shell export. Change a value there, commit, redeploy.

## Configuration

`src/config.ts` is the whole story: the fixed budgets, the poll cadence, the
model seam and the evidence-enrichment settings, each with the reason in a
comment. Tests import `DEFAULT_SLOT_BUDGETS` from the same file, so the tests
and the live worker can never disagree about a budget.

## Live evidence enrichment (the webhook chain)

On the live path the web app only ever creates tickets, pull requests and
criteria — it has no access to git objects. `src/analyser/enrich.ts` closes
that gap: when a claimed job's (repo, base, head) has no code/test evidence in
the graph, the worker

1. walks criterion → Ticket → PullRequest to find the change (the exact
   `owner/repo#number` id the webhook created),
2. refuses to proceed unless the workspace has an `analysis_targets` row for
   that repository (migration 00019) — an analysis run is never silent,
3. clones/fetches the repository into the cache dir and verifies both commits
   are present,
4. runs the analyser (read-only git objects; the test command runs only in a
   throwaway worktree, only when the target configures one),
5. publishes the nodes/edges through the `publish_analysis` RPC, so the packet
   builder then attaches them to the PR node that already exists.

Any failure throws and fails the **job** — enrichment that cannot run must
never become a verdict. An existing commit node for the head skips the whole
path, so a re-enqueued job is a no-op. The repository cache lives in
`WORKER_SETTINGS.repoCacheDir` (under the worker user's home); private
repositories need `ANALYSIS_GIT_TOKEN` in `.env`.

## Model providers

`modelProvider: "stub"` (the current setting) — deterministic, offline, no
network. It reads the rendered packet and answers from the evidence itself: a
passing test ⇒ `SUPPORTED`, a failing one ⇒ `CONTRADICTED`, code without tests
⇒ `PARTIAL`, empty packet ⇒ not applicable. Because it is bit-for-bit
repeatable, the tests drive the whole pipeline, including its failure paths,
without a serving stack.

`modelProvider: "opencode"` — wraps `opencode run --standalone --format json`.
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

## TypeScript change analyser (FR-06, FR-25)

`src/analyser/` reads a repository at two commits (base, head) and reports
what changed, at symbol level. It reads git objects only (never a working
tree) and never runs repository code, so the same base/head always give the
same output.

| File | What it does |
|---|---|
| `git.ts` | Changed files (`--name-status -M`), diff hunks with exact line ranges (`-U0`), file content at a commit, `git grep` for names. |
| `parse.ts` | TypeScript compiler parser (syntax only): every function, method, class and function-valued variable at any depth (nested ones get dotted names, e.g. `createFormControl.clearErrors`), with signature, JSDoc, leading comments; imports; `it`/`test` blocks; dynamic sites (`import(x)`, `require(x)`, `obj[x]()`). |
| `analyse.ts` | Each changed line → the innermost symbol around it (head for added lines, base for removed ones) → added / modified / deleted. Bounded callers (same file, or files whose relative import resolves to the symbol's file; name-only matches are counted, not trusted). Test evidence: changed test blocks, and test blocks that mention a changed symbol. Dynamic sites inside changed symbols are reported as unresolved, never as edges. |
| `payloads.ts` | Graph nodes with `payload.slotItems` in the contracts' `EvidenceItem` shape: `Commit` (diff hunks), `CodeSymbol` (one symbol card, FR-25 fields in fixed order), `TestCase` (test blocks). Edges only for established relations: with a known PR (`--pr`), `Commit PART_OF PullRequest`, `PullRequest IMPLEMENTS CodeSymbol` for every changed symbol and `PullRequest IMPLEMENTS TestCase` for every changed test file; always `TestCase COVERS CodeSymbol` when the test imports the symbol's file. |

```bash
npm run analyse -- --repo <git repo> --base <rev> --head <rev> [--name owner/repo] [--pr <id>] [--json out.json]
npm run analyse:evaluate -- --clones <empty folder outside the repo> --fetch    # FR-06 check on the 15 pilot cases
```

`analyse:evaluate` fetches only the base/head commits each pilot case needs,
applies the case's `head_patch` where it has one, and scores the analyser
against the case files (never the constructor's answer key). On 11 Oct:
29/29 changed files, 14/14 changed tests; named-symbol spans 11/11 changed
found and 21/21 unchanged not flagged; one miss (P06-S3, a key inside
`package.json`: JSON is listed as a changed file but not parsed into symbols).
Median 0.3 s per case, max 4 s.

**Python** (`parse-python.ts`): `.py` files go through an indentation-based
parser (functions, methods, classes with dotted nesting, decorators,
docstrings, `import`/`from` imports, `test_*` functions, `importlib` /
`getattr` dynamic sites). Not a full grammar: functions made with `exec` or
`type(...)` are not seen. Tested on synthetic repos only; the pilot cases are
all TypeScript.

**Test runs and coverage** (`run-tests.ts`, `coverage.ts`), opt-in because
this is the only part that executes repository code. `--run-tests "<cmd>"`
runs the command in a throwaway worktree at head (removed afterwards, `npm_*`
variables not inherited), records pass/fail and the log tail as a `test_run`
item, and if `--coverage-file` names the LCOV file it writes, adds per-symbol
line coverage (all lines and changed lines) to the symbol cards. Where the
LCOV file lands depends on the repo's own test config. Pilot P01
(react-hook-form), 11 Oct:

```bash
npm run analyse -- --repo <RHF clone> --base 3413809 --head 0d24669 \
  --coverage-file scripts/jest/coverage/lcov.info \
  --run-tests "pnpm install --frozen-lockfile --ignore-scripts; pnpm exec jest --config ./scripts/jest/jest.config.js --coverage --coverageReporters=lcov --collectCoverageFrom=../../src/logic/createFormControl.ts src/__tests__/useForm/formState.test.tsx -t 'new errors reference'"
# createFormControl.clearErrors  coverage 8/11 lines run; changed lines 1/1
# createFormControl.setError     coverage 9/9 lines run; changed lines 1/1
```

`--lcov <file> [--lcov-root <dir>]` reads a report produced elsewhere instead.

**Publishing** (`publish.ts`, migration `00016_publish_analysis.sql`):
`--publish [--workspace <slug>]` writes the nodes and edges through the
`publish_analysis` RPC (service_role only, one transaction). Nodes are
upserted, so re-running updates rather than duplicates; an edge whose endpoint
is not in the graph (e.g. a PR not ingested yet) is reported as skipped, never
invented. Needs 00016 applied and the worker's `.env`.

Reaching the packet: the graph provider walks outward from a criterion
(criterion → PR → …). The `IMPLEMENTS` edges from the PR are what put symbol
cards and test blocks within reach; without them only the commit's diff hunks
arrive. `test/analyser-packet.test.ts` checks this end to end: real analyser
output → `GraphEvidenceProvider` → `buildPacket`, with all three code slots
filled, and a control with the `IMPLEMENTS` edges removed.

## Known simplifications

- The OpenCode wrapper runs one process per model call (warm sessions would be
  the optimisation later).
- Passes are persisted after the loop rather than streamed per pass; a worker
  killed mid-run loses that job's pass rows but never writes a partial verdict.
- The test case (`test/case.ts`) carries the case's text, which the dataset's
  gold packets do not (they store hashes + line ranges only); keeping it in-repo
  makes the build network-free and immutable. The analyser's live output does
  not have this property, so a packet built from a real repository can differ
  from the test packet in length and content.
