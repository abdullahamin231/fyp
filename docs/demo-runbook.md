# UNIFY — FYP-1 mid-evaluation demo runbook

One workflow, demonstrated live on the reviewer surface: **a proposed code change
is verified against its linked Jira acceptance criteria, and the system shows
what the evidence supports, contradicts, or cannot support — with every decisive
finding tied to its cited source.**

Session context (Form 2): live core-module demo, 8 minutes, **must include an
edge or failure condition**. Screenshots/prerecorded video are backup evidence
only. This document is the script required by TODO §7.

---

## 1. What the audience sees

| # | Beat | Verdict on screen | The point being made |
|---|---|---|---|
| 1 | Normal case — PR #47 | `SUPPORTED` with citations | A correct change, verified against its criteria, citing the symbol card and the passing test run |
| 2 | Bad PR — PR #48 | `CONTRADICTED` with the failing test cited | A change that looks fine in review and breaks its own contract — the system says so with evidence |
| 3 | Failure case — T10 | `INSUFFICIENT_EVIDENCE`, gate `DOWNGRADED` | A model that cites evidence it was never shown cannot produce a decisive verdict. The gate can only lower a status. |

Everything is produced by the real pipeline: GitHub delivery → linker →
criterion enqueue → worker → analyser on the real repository → bounded
verifier loop → provenance gate → reviewer surface.

---

## 2. One-time setup (before the meeting)

| Step | Who | Command / action | Verify |
|---|---|---|---|
| 1. Deploy | team | Merge PR #49 (`feat/live-demo-chain`) → Vercel deploys to `unify-web-weld` | Deployment READY on `main` |
| 2. Local env | demo presenter | Create `apps/web/.env.local` with the Vercel values: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTEGRATION_ENCRYPTION_KEY` | — |
| 3. GitHub leg | demo presenter | `node scripts/github-webhook-setup.mjs mishals-workspace abdullahamin231/fyp` → follow the printed `gh api` command | Script prints `ping self-test: 200` and `delivery recorded: yes` |
| 4. Jira leg | demo presenter | `node scripts/jira-replay.mjs mishals-workspace --issue UNI-7 --summary "Discount codes at checkout" --criteria "the total drops by the code percentage;;the receipt shows the discounted total"` | Response `200` with `criteria: { created: 2, … }` |
| 5. Worker | demo presenter | Put the **`sb_secret_…`** key in `apps/worker/.env`, then `cd apps/worker && ./deploy/install.sh` | `journalctl -u unify-worker` shows `worker started` with `stubFabricate: "none"` |
| 6. Settings check | any member | `/settings/workspace?workspace=mishals-workspace` shows the analysis target `abdullahamin231/fyp` | Criteria field may stay empty (description fallback is in use) |

Environment notes:

- **Vercel** needs the same `sb_secret_…` value as `SUPABASE_SECRET_KEY` (the webhook route's admin client). The `sb_publishable_…` key is the anon key and fails with `permission denied`.
- The Jira leg is **replayed**, not live (§13.4-sanctioned delivery-source substitute): real-shaped, HMAC-signed payloads posted at the real endpoint. Say "replayed" when you show it. GitHub stays fully real.
- Test command on the analysis target: `cd packages/contracts && npm install --ignore-scripts && npx vitest run`. **Never `npm test`** — npm exits 0 for a failing script inside a workspace, which would record PASS for a broken suite.

---

## 3. Rehearsal — DONE, green (2026-10-15)

Rehearsed end to end against the live project: real GitHub webhooks, real
`enqueue_verification` from the delivery, real clone-and-analyse of
`abdullahamin231/fyp`, real test run, real verdicts stored.

| PR | Head | Result |
|---|---|---|
| #47 `demo/uni-7-supported` | `b6e5230` | **SUPPORTED** — both criteria, 3 evidence spans each |
| #48 `demo/uni-7-contradicted` | `205953a` | **CONTRADICTED** — both criteria, 9 spans, reason "the test-run evidence records a FAIL", severity critical |

The earlier findings were superseded by the re-verification (the finding
lifecycle works). Both PRs are now **closed**: at the meeting, reopening one
fires `reopened` → a fresh job per criterion → verdicts land live. Nothing
needs re-doing, and the chain takes ~25s per PR at rehearsal speed.

---

## 4. Live run (8 minutes)

| Time | Action | Screen | Expected |
|---|---|---|---|
| 0:00 | "Here is the ticket and the criterion it states." | Jira (UNI-7) + the criterion it states | 2 acceptance criteria, written as prose |
| 0:30 | Reopen PR #47. "This PR implements the criterion." | `/conflicts` on refresh | New finding, `SUPPORTED`, citations on the symbol card + the passing test run |
| 1:30 | Open the evidence case | `/conflicts/<id>` | Pass log (why the loop stopped where it did), packet manifest, gate outcome PASSED |
| 2:45 | Reopen PR #48. "Same criterion, different implementation." | `/conflicts` | New finding, `CONTRADICTED`, the failing test cited verbatim |
| 4:00 | Show the diff next to the cited failing test | GitHub + evidence case | The PR says one thing; the test run says another |
| 5:00 | **Arm the T10 fault**: set `stubFabricate: "only"` in `WORKER_SETTINGS`, rebuild, restart the service, push a commit to PR #48 | worker log shows `stubFabricate: "only"`; new verdict | `INSUFFICIENT_EVIDENCE`, gate `DOWNGRADED`, reason code `INVALID_CITATION` — the citation was never in the packet |
| 6:30 | **Disarm**: back to `"none"`, rebuild, restart | `journalctl` | fault off |
| 7:00 | Show it was all real | `/graph` (Ticket → Criterion → PR → CodeSymbol / TestCase / Commit), `/ingest` (raw payloads, secrets redacted), `/evaluation` (real counts) | The graph the verdicts were built from |
| 7:45 | State the boundaries plainly | — | Model = the deterministic seam (see below); Jira = replayed; Figma = connected + ingested only |

Say out loud, once, without being asked:

- The verdict is only ever written by the gate — never by the model.
- Every decisive finding cites an evidence span that was in the packet, or it is downgraded. That is the whole claim, and beat 3 proves it.
- The model currently configured is the deterministic stub — a seam, not a result. The local-model selection study (proposal §25) is not finished, and no verdict claim here depends on which model sits behind the seam.

---

## 5. Fallbacks (venue reality)

| If | Then |
|---|---|
| GitHub webhook delivery is slow | The rehearsed verdicts stay on screen; the chain is still live, just re-triggered by a push instead of an open |
| Network dies at the venue | Re-run `scripts/jira-replay.mjs --file <captured.json>` against a local `next dev` on the same machine — the pipeline is identical |
| Worker machine is asleep | Wake it before the session; verify `journalctl -u unify-worker` shows `worker started` |
| Both fail | Show the recording; every claim on it is backed by rows the supervisor can re-read in `/conflicts` |

---

## 6. Known landmines — every one of these actually bit during the rehearsal

1. **npm swallows failure inside a workspace.** `npm test` exits 0 when the
   script fails (npm prints `npm ERR!` and returns 0). The analysis target must
   invoke the runner directly: `npx vitest run`.
2. **The test-run verdict must be on its own line.** The stub model and the
   gate tests key off `\nFAIL\n` / `\nPASS\n` inside `TEST_EVIDENCE`. The
   analyser used to write `FAIL (exit 1, …)` on one line — a failing suite
   silently read as PARTIAL.
3. **Evidence must be attributed to the PR at the job's head.** Enrichment
   first picked the *first* PR linked to the ticket, so one PR's analysis was
   published against another's node. It matches the PR whose node `version` is
   the job's pinned head (the linker records the head there, not in payload).
4. **The test-run node needs an edge.** It was an orphan — in the graph, never
   reached by the bounded walk — so the packet carried test *sources* but not
   the record of whether the suite passed.
5. **The evidence window is shared until it is scoped.** Two open PRs on one
   criterion produced one identical packet (and verdict) because the walk is
   criterion-centric. The provider now scopes to the pinned revision pair.
6. **TEST_EVIDENCE budget order is load-bearing.** The assembler never squeezes
   a smaller item in, so the run must be admitted ahead of the sources (fixed
   priority) and the recorded log tail is bounded (~600 chars).
7. **Criterion edges must be decisive-eligible.** `REFERENCES` with
   `source_class: "derived"` maps to `system-confirmed`. A `model_candidate` or
   `unresolved` edge downgrades every verdict built on it — `AMBIGUOUS_LINK`.
8. **Order matters.** The Jira ticket must exist before the PR delivery, or the
   linker records `unknown_key`, no `TRACKS` edge is created, and no criterion
   is ever enqueued.
9. **One worker, on the right branch.** `npm run dev` runs the *source*
   (via tsx), on whichever branch is checked out — and stale workers from
   earlier shells keep polling and racing. Before a rehearsal: confirm the
   branch is `feat/live-demo-chain` and exactly one worker is running.
