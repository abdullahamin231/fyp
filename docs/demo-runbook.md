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
| 7. Figma (optional beat) | workspace admin | Register the Figma app at `/settings/integrations?workspace=mishals-workspace` → connect via OAuth → on the workspace page add a file key → **Poll now** | A version lands in `/ingest` as a `design_artifact` event; `/graph` shows the `DesignArtifact` node |
| 8. Figma poll loop (optional) | presenter | `cd apps/web && npx tsx scripts/figma-poll-loop.ts` (or `npm run figma:poll`) | JSON lines every 60s; `--once` polls a single pass. Vercel Hobby allows only daily crons, so the scheduled half runs here rather than in `vercel.json` |

Environment notes:

- **Vercel** needs the same `sb_secret_…` value as `SUPABASE_SECRET_KEY` (the webhook route's admin client). The `sb_publishable_…` key is the anon key and fails with `permission denied`.
- The Jira leg is **replayed**, not live (§13.4-sanctioned delivery-source substitute): real-shaped, HMAC-signed payloads posted at the real endpoint. Say "replayed" when you show it. GitHub stays fully real.
- Test command on the analysis target: `cd packages/contracts && npm install --ignore-scripts && npx vitest run`. **Never `npm test`** — npm exits 0 for a failing script inside a workspace, which would record PASS for a broken suite.

---

## 3. Rehearsal — DONE, green (2026-10-15)

Rehearsed end to end against the live project: real GitHub webhooks, real
`enqueue_verification` from the delivery, real clone-and-analyse of
`abdullahamin231/fyp`, real test run, real verdicts stored.

| PR | Ticket | Head | Result |
|---|---|---|
| #47 `demo/uni-7-supported` | UNI-7 | `b6e5230` | **SUPPORTED** — both criteria, 3 evidence spans each |
| #48 `demo/uni-7-contradicted` | UNI-8 | `205953a` | **CONTRADICTED** — both criteria, 9 spans, reason "the test-run evidence records a FAIL", severity critical |

The earlier findings were superseded by the re-verification (the finding
lifecycle works). Both PRs are now **closed**: at the meeting, reopening one
fires `reopened` → a fresh job per criterion → verdicts land live. Nothing
needs re-doing, and the chain takes ~25s per PR at rehearsal speed.

---

## 4. Live run (8 minutes)

Both demo PRs are **open** with live results already on screen from the
rehearsal (2 × `SUPPORTED` low, 2 × `CONTRADICTED` critical). Each beat below
*regenerates* its result live: close the PR, reopen it, and a fresh job per
criterion runs the whole chain (webhook → linker → enqueue → clone → analyse →
test run → packet → loop → gate → verdict + finding), superseding the old row.

**Beat 0 — orient (0:00–0:30).** Log in at
`https://unify-web-weld.vercel.app`. Open `/graph`: the evidence graph is
already populated — `Ticket UNI-7` → `UNI-7/AC-1` / `AC-2` (criterion lane),
the pull requests, and the code/test evidence they link to. Say what it is:
one verified change, per criterion, with every decisive claim traceable.

**Beat 1 — the normal case (0:30–2:30).**

```bash
gh pr close 47 && gh pr reopen 47
```

~25s later refresh `/conflicts`: two new rows, verdict **SUPPORTED**, severity
low, superseding the rehearsal rows. Open one — citations (symbol card + the
**passing** test run), the verifier's pass log, the packet manifest, gate
`PASSED`.

**Beat 2 — the bad PR (2:30–4:00).** PR #48 names `UNI-8` (its own ticket),
so the two beats' results coexist in the inbox — nothing supersedes anything
and there is no lifecycle concept to explain mid-demo.

```bash
gh pr close 48 && gh pr reopen 48
```

Refresh: **CONTRADICTED**, critical, with the failing test cited verbatim
(`FAIL (exit 1, …)` and the two failing test names). Show the GitHub diff beside
it — the change looks fine; the test run says otherwise.

**Beat 3 — the failure case, T10 (4:00–6:00).** The gate catching a model that
invents evidence:

```bash
sed -i 's/stubFabricate: "none"/stubFabricate: "only"/' apps/worker/src/config.ts
sudo systemctl restart unify-worker
gh pr close 48 && gh pr reopen 48        # same change, badly-behaved model
```

Refresh: the finding flips to **INSUFFICIENT_EVIDENCE**, gate `DOWNGRADED`,
reason code `INVALID_CITATION` — the citation was never in the packet. Then
disarm:

```bash
git checkout -- apps/worker/src/config.ts
sudo systemctl restart unify-worker
journalctl -u unify-worker -n 2 --no-pager   # confirm stubFabricate: "none"
```

**Beat 4 — proof it was all real (6:00–7:00).** `/graph` (the growth), `/ingest`
(raw payloads with secrets redacted, real GitHub delivery ids), `/evaluation`
(real counts over stored verdicts).

**Beat 5 — the Figma leg (7:00–7:45), if wired.** `/settings/integrations?workspace=mishals-workspace`
shows the Figma app + connection; the workspace page shows watched files;
"Poll now" ingests new versions as `design_artifact` events, visible in
`/ingest` and as `DesignArtifact` nodes in `/graph`. Wiring steps in §2.

**Beat 6 — boundaries, said plainly (7:45–8:00).** The verdict is only ever
written by the gate. The model behind the seam today is the deterministic stub
(the local-model selection study is still open — proposal §25). The Jira leg is
replayed §13.4-style (real-shaped, HMAC-signed at the real endpoint); GitHub and
the analyser's test runs are fully real. Design→criterion linking is not wired:
Figma versions are ingested as evidence, not yet attached to a criterion.

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
