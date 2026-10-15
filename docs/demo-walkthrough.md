# UNIFY — full live walkthrough for the supervisor

The supervisor wants to see **everything we built, running live**. This is the
exact procedure: what to prepare, which window to look at, what to type, what
to say, what must appear on screen, and what to do when it does not.

- `docs/demo-runbook.md` remains the **8-minute** mid-evaluation script (three
  beats: SUPPORTED / CONTRADICTED / T10). Its §6 landmines apply here too.
- This document is the **full tour (~30 min)**. It covers every live part of
  the product in pipeline order. §7 has a 12-minute cut if time runs short.

Everything in Acts 1–9 is produced live by the real system. Act 10 states
plainly what is still UI-only. Do not skip Act 10: the supervisor should hear
the boundaries from us before he finds them himself.

---

## 0. What gets shown, and where

| Act | Capability | Live proof on screen | Owner presents |
|---|---|---|---|
| 1 | Auth, workspaces, tenancy | login, workspace switcher, `/workspaces` | Abdullah |
| 2 | Provider apps + OAuth connections, pipeline config | `/settings/integrations`, `/workspaces/<slug>/integrations`, `/settings/workspace` | Haaniah |
| 3 | Jira ingestion → Ticket + Criterion nodes | replay terminal → `/ingest` → `/graph` | Haaniah |
| 4 | Deterministic linking: idempotency, unknown key, late link, Rule 2 | `demo-linking.mjs` PASS lines → `/links`, `/conflicts` | Mishal |
| 5 | Normal case: GitHub webhook → worker → analyser → loop → gate → **SUPPORTED** | worker log streaming → `/conflicts/<id>` | Abdullah |
| 6 | Bad PR: **CONTRADICTED** with the failing test cited | GitHub diff beside the finding | Mishal |
| 7 | Failure case T10: fabricated citation → gate **DOWNGRADED** | worker log `gateOutcome` → finding | Abdullah |
| 8 | Reviewer lifecycle: acknowledge / dispute / resolve / reopen, audited | finding resolution dock + audit section | Abdullah |
| 9 | Evidence graph explorers | `/graph`, `/graph/artifacts`, dashboard panel | Mishal |
| 9b | Figma leg (if connected) | Poll now → `/ingest` → `DesignArtifact` node | Haaniah |
| 10 | Proof + boundaries | `/ingest` raw payloads, `/activity`, `/alerts`, `/evaluation`, three test suites, honest mocked list | all three |

---

## 1. One-time setup (the day before)

Do all of this on the **presenting laptop**, which is also the worker machine.

1. **Code.** `git checkout feat/live-demo-chain && git pull` (or `main` once
   merged). Vercel must show the matching deployment as **READY** on
   `https://unify-web-weld.vercel.app`.
2. **Web env.** `apps/web/.env.local` (or `.env`) holds
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (the `sb_secret_…`
   value) and `INTEGRATION_ENCRYPTION_KEY`, copied from Vercel. The encryption
   key **must equal Vercel's**, or no script can sign a webhook.
3. **Worker.** `apps/worker/.env` holds the same Supabase URL + `sb_secret_…`
   key. Install the service: `cd apps/worker && ./deploy/install.sh`. Verify:
   `journalctl -u unify-worker -n 5 --no-pager` shows `worker started` with
   `stubFabricate: "none"`.
4. **GitHub leg.** `cd apps/web && node scripts/github-webhook-setup.mjs mishals-workspace abdullahamin231/fyp`,
   then run the `gh api` command it prints. Expect `ping self-test: 200` and
   `delivery recorded: yes`.
5. **Jira leg.** Jira is connected once in
   `/settings/integrations?workspace=mishals-workspace` (the replay script signs
   with that connection's secret).
6. **Analysis target.** `/settings/workspace?workspace=mishals-workspace` →
   *Analysis targets* lists `abdullahamin231/fyp` with test command
   `cd packages/contracts && npm install --ignore-scripts && npx vitest run`
   (**never** `npm test`; see runbook landmine 1).
7. **Scratch workspace for Act 4.** In the app: `/workspaces/new`, name
   `Demo Linking` (slug `demo-linking`). Act 4 writes throwaway tickets and PRs.
   They go into this workspace so the main demo graph stays clean.
8. **Rehearse Acts 3–8 once end to end.** Then leave PRs #47 and #48 **open**
   with their verdicts on screen.
9. **Optional Figma (Act 9b).** Register the Figma app, connect via OAuth, add
   one file key on `/workspaces/mishals-workspace/integrations`, press *Poll now*
   once to confirm a version arrives.

---

## 2. Thirty minutes before

```bash
cd ~/repos/fyp/apps/web
npm run demo:preflight -- mishals-workspace      # every line PASS (WARN on Figma is fine)
```

The preflight is read-only. It checks the env file, the deployed app, the
workspace, the GitHub/Jira/Figma connections and whether their secrets decrypt
with your key, the analysis target and its test command, tickets UNI-7/UNI-8,
stuck queue jobs, the worker service and its process count, the fault
injection switch, and the state of PRs #47/#48. Fix every **FAIL** with the
`fix:` line it prints. Run it again five minutes before you start.

**Arrange the screen.** Use one browser window with tabs in this order, all
logged in:

1. `/` (dashboard)  2. `/settings/integrations?workspace=mishals-workspace`
3. `/workspaces/mishals-workspace/integrations`  4. `/ingest`  5. `/graph`
6. `/links`  7. `/conflicts`  8. `/graph/artifacts`  9. `/evaluation`
10. GitHub PR #48 → *Files changed*

Open three terminals, side by side, with a large font:

| Terminal | Directory | Purpose |
|---|---|---|
| **T1** | `apps/web` | replay + demo scripts |
| **T2** | anywhere | `journalctl -fu unify-worker -o cat`. Leave it streaming the whole time |
| **T3** | repo root | `gh pr …`, the T10 switch, the test suites |

Turn off notifications. Set browser zoom to 110%.

---

## 3. The live procedure

Each step lists what to **do**, what to **say**, and what to **expect** on
screen. If a step's expectation does not appear within the stated time, use
its **if not** line. Do not improvise a fix in front of the supervisor.

### Act 1 — Orientation: auth, workspaces, dashboard (2 min)

1. **Do:** sign out, then sign in at `/login`.
   **Say:** "Supabase email auth. A session guard protects every route. Row-level security scopes every query to the workspaces you belong to."
2. **Do:** open the workspace switcher in the top bar, then `/workspaces`.
   **Expect:** `mishals-workspace` and `demo-linking`.
   **Say:** "Every row in the database carries its workspace. Tenancy is enforced in Postgres, not in the UI."
3. **Do:** tab 1, the dashboard. Point at the verdict distribution, then the evidence-graph panel. Scroll it to pan and Ctrl+scroll to zoom.
   **Say:** "This is the state of the system right now. Everything you will see change in the next half hour changes here too."

### Act 2 — Connections and configuration (3 min)

1. **Do:** tab 2, `/settings/integrations`.
   **Expect:** the GitHub, Jira and Figma provider apps, each registered and connected.
   **Say:** "Each workspace registers its own OAuth app. Tokens and webhook secrets are encrypted at rest with AES-256-GCM. Access is read-only. We never write back to the tools."
2. **Do:** tab 3, `/workspaces/mishals-workspace/integrations`.
   **Expect:** the connections and the watched Figma files.
3. **Do:** `/settings/workspace?workspace=mishals-workspace` → *Live pipeline*.
   **Expect:** the Jira acceptance-criteria field and the analysis target `abdullahamin231/fyp` with its test command.
   **Say:** "The worker refuses to analyse a repository nobody registered. An analysis run is never silent."

### Act 3 — Ingestion: a Jira ticket arrives (3 min)

1. **Do (T1):**
   ```bash
   node scripts/jira-replay.mjs mishals-workspace --issue UNI-7 \
     --summary "Mark ingestion sources stale after a quiet window (packages/contracts: isSourceStale)" \
     --criteria "a checkpoint whose last successful ingest is older than the staleness threshold is marked stale;;a checkpoint that never recorded a success is stale, since freshness cannot be claimed for a source that was never observed;;a checkpoint dated in the future (clock skew) reads as fresh, not stale"
   ```
   **Expect:** `200 {… criteria: { created: 3 …}}` (or `created: 0` with existing ones updated on a re-run).
   **Say:** "This delivery is *replayed*. It is a real-shaped Jira payload, HMAC-signed with the connection's secret, posted at the real endpoint. Jira Cloud cannot reach a demo laptop. GitHub, next, is fully live."
2. **Do:** tab 4, `/ingest`, then refresh.
   **Expect:** a new delivery on top. Open it to show the raw receipt (secrets redacted) and the normalised event it produced.
   **Say:** "Two layers: the raw delivery exactly as received, and the normalised event. A delivery can normalise to nothing, and a duplicate normalises once."
3. **Do:** tab 5, `/graph`. Hover `UNI-7`.
   **Expect:** the ticket in the first column and its three `UNI-7/AC-n` criteria in the second. Hovering dims everything except its links.
   **Say:** "Acceptance criteria are first-class nodes. Every verdict is per criterion, not per PR."
4. **Do:** replay UNI-8 the same way (runbook §4, beat 2). That sets up Act 6.

**If not 200:** a `401` means the encryption key differs from Vercel's. Copy it and re-run. A `404` means the wrong workspace slug.

### Act 4 — Linking and its edge cases (3 min)

1. **Do (T1):**
   ```bash
   node scripts/demo-linking.mjs demo-linking https://unify-web-weld.vercel.app
   ```
   **Expect:** eight `PASS` lines, then `8/8 passed`:
   - Jira UNI-1..3 → Ticket nodes
   - PR "UNI-2: add login page" → linked to UNI-2
   - **the same delivery again → `duplicate_event`, nothing written** (idempotency)
   - a PR naming a ticket that does not exist yet → `unknown_key`, no edge, no fake ticket ("UTF-8" in the title is correctly not treated as a key)
   - **that ticket arrives later → the earlier PR is linked to it** (out-of-order delivery converges)
   - PR merged while UNI-2 is still *In Progress* → **Rule 2 finding**
   **Say:** "Webhooks arrive duplicated and out of order in real life. The linker is deterministic. A ticket key in a PR title is an explicit reference, so the link is system-confirmed. Nothing here involves a model."
2. **Do:** tab 6, `/links`.
   **Expect:** the new explicit edges, with eligibility and provenance on each.
   **Say:** "Solid links are decisive. Inferred and unconfirmed links are shown, but they can never support a decisive verdict."
3. **Do:** tab 7, `/conflicts`.
   **Expect:** a Rule 2 finding on the `demo-linking` PR: merged while its ticket was still *In Progress*.

**If a FAIL appears on the last line:** the deployment is older than the code. Say so, move on, and show the rehearsal's Rule 2 row instead.

### Act 5 — Normal case: PR #47 → SUPPORTED (4 min)

**Say first:** "`isSourceStale` in `packages/contracts`. UNI-7 states its contract, and PR #47 implements it. Watch the right-hand terminal."

1. **Do (T3):** `gh pr close 47 && gh pr reopen 47`
2. **Watch T2 (~25 s).** It streams the chain as it happens:
   `evidence enrichment` → `evidence enrichment published` (repo, base, head, nodes, edges) → one `verification finished` per criterion, with `status: SUPPORTED`, `gateOutcome: PASSED`, `stopReason` and `passes`.
   **Say, while it runs:** "GitHub delivered `reopened`. The linker matched UNI-7 and enqueued one job per criterion, pinned to the PR's base and head. The worker cloned the repo, analysed the diff and symbols, ran the test suite at head, built an evidence packet under a fixed token budget, ran the bounded verifier loop, and the gate checked every citation against that packet."
3. **Do:** tab 7, refresh `/conflicts`.
   **Expect:** new rows for UNI-7 criteria, **SUPPORTED**, severity low. The rehearsal rows are now superseded.
4. **Do:** open one row and walk down the page:
   - **Criterion scorecard / composite verdict:** the verdict per criterion.
   - **The evidence case:** the citations, namely the symbol card for `isSourceStale` and the **passing** test run.
   - **Verification passes:** pass 1 scope, pass 2 verify (pass 3 critic only when warranted), each with its stop reason.
   - **Packet manifest:** packet hash, slot budgets, what was truncated.
   - **Gate:** `PASSED`.
   **Say:** "The model never writes a verdict. The gate does, and it can only lower a status. Re-run the same packet and you get the same hash and the same answer."

**If nothing in T2 after 60 s:** check `gh api repos/abdullahamin231/fyp/hooks` for the last delivery. If the webhook is slow, push an empty commit on the branch instead (runbook §5). If T2 shows an error, the rehearsal verdicts are still on screen. Show those and name the error honestly.

### Act 6 — Bad PR: PR #48 → CONTRADICTED (3 min)

1. **Do:** tab 10, the PR #48 diff.
   **Say:** "UNI-8 says a checkpoint *exactly at* the threshold is stale. PR #48 'tightens' `>=` to `>`. It looks harmless in review."
2. **Do (T3):** `gh pr close 48 && gh pr reopen 48`. Watch T2 for `status: CONTRADICTED`.
3. **Do:** refresh `/conflicts` and open the new UNI-8 row.
   **Expect:** **CONTRADICTED**, critical, with the test run cited verbatim: `FAIL (exit 1, …)` and the two failing test names.
   **Say:** "The repository's own tests disprove the change. The system says so and cites the exact run."

### Act 7 — Failure case T10: a model that invents evidence (4 min)

1. **Say:** "Now the model misbehaves on purpose. It cites evidence that was never in the packet."
2. **Do (T3):**
   ```bash
   sed -i 's/stubFabricate: "none"/stubFabricate: "only"/' apps/worker/src/config.ts
   git diff apps/worker/src/config.ts        # show the one-line switch
   sudo systemctl restart unify-worker
   gh pr close 48 && gh pr reopen 48
   ```
   **Expect in T2:** `worker started … stubFabricate: "only"`, then `verification finished` with `gateOutcome: DOWNGRADED`.
3. **Do:** refresh and open the UNI-8 row.
   **Expect:** **INSUFFICIENT_EVIDENCE**, gate **DOWNGRADED**, reason `INVALID_CITATION`.
   **Say:** "The citation does not resolve against the immutable packet, so the gate refuses the decisive verdict. A hallucinated citation can never reach a reviewer as fact."
   *No password prompt on stage:* the unit runs as you with `Restart=always`,
   so `kill $(systemctl show unify-worker -p MainPID --value)` restarts it in
   ~5 s without sudo. Use it in place of `sudo systemctl restart unify-worker`.
4. **Disarm. Do not skip this.**
   ```bash
   git checkout -- apps/worker/src/config.ts
   sudo systemctl restart unify-worker
   journalctl -u unify-worker -n 2 --no-pager     # stubFabricate: "none"
   gh pr close 48 && gh pr reopen 48             # restores CONTRADICTED for later acts
   ```

### Act 8 — The reviewer acts on a finding (2 min)

1. **Do:** on the CONTRADICTED UNI-8 finding, use the resolution dock and click **Acknowledge**.
   **Expect:** toast "Conflict acknowledged", status "Acknowledged — awaiting resolution", and a new row in the finding's **Audit Trail** section.
2. **Do:** **Dispute** it, with a reason (e.g. "boundary semantics under discussion").
   **Say:** "Every transition carries a reason and is audited. The lifecycle is the one the contracts package exports, so the UI cannot offer a transition the model of the lifecycle would reject. A dispute becomes a labelled correction for the next adaptation round."
3. **Do:** **Reopen** it, to leave it open for the evidence tour.
4. **Do:** tab 6, `/links`. **Confirm** one inferred suggestion and **dismiss** another.
   **Say:** "A human confirmation upgrades a link to decisive. It is reversible, and the resolver is recorded."

### Act 9 — The evidence graph (3 min)

1. **Do:** tab 5, `/graph`, then refresh. Fit with the ⛶ button.
   **Expect:** the chain grew. PR #47/#48 → commits → the `isSourceStale` symbol → the tests that cover it, laid out left to right (ticket → criteria → design → PR → commit → code → tests). Each workspace is its own lane, so `demo-linking` sits below.
2. **Do:** scroll to pan, Ctrl+scroll to zoom, and drag a node aside (↺ resets the layout). Hover PR #48 to trace only its links. Click it to open the detail panel.
3. **Do:** **Show Only Conflicts**, then untick *Figma Frames*, then toggle relationship types.
   **Say:** "Solid strokes are decisive links. Dashed and dotted ones are inferred or unconfirmed. The legend is the product's central rule."
4. **Do:** tab 8, `/graph/artifacts`. Type `isSourceStale` in *Focus on node* and press Enter. Then switch layouts: **Hierarchical → Force-directed → Radial**. Then try *Divergences* and *Selected ±1* under Quick Focus, and the confidence-cutoff slider.
   **Expect:** the canvas pans to the node, and the inspector lists its edges with eligibility and confidence.

### Act 9b — Figma leg, only if connected (1 min)

1. **Do:** tab 3, *Poll now* on a watched file. If someone has edited the file since the last poll, a new version arrives.
2. **Do:** `/ingest`. **Expect:** a `design_artifact` event. `/graph`. **Expect:** a `DesignArtifact` node in the design column.
   **Say:** "Design versions are ingested as evidence. Linking a design to a criterion is not wired yet."

### Act 10 — Proof it was real, and the boundaries (3 min)

1. **Do:** `/ingest`. Point at the GitHub delivery ids from Acts 5–7. They match the webhook's *Recent Deliveries* page on GitHub.
2. **Do:** `/activity` and `/alerts`. Today's events and the critical findings, read from the same tables.
3. **Do:** tab 9, `/evaluation`. **Expect:** counts over the stored verdicts, including verdicts stored, passed the gate unchanged, downgraded by the gate (Act 7 is in there) and needing review.
4. **Do (T3):** run the suites live:
   ```bash
   (cd packages/contracts && npx vitest run)   # 115 tests — schemas, gate invariants, lifecycle
   (cd apps/worker && npx vitest run)          # 88 tests — packet, loop, gate e2e incl. T10, analyser, linker
   (cd apps/web && npx vitest run)             # 15 tests — criteria parsing, graph layouts
   ```
5. **Say the boundaries plainly:**
   - The model behind the seam is the **deterministic stub**. The OpenCode/local-model provider exists (`modelProvider: "opencode"`), but the model-selection study (proposal §25) is still open. The gate, packet and loop are real, and the stub is what makes runs reproducible.
   - **Jira is replayed** (§13.4-sanctioned): real endpoint, real signature, real pipeline. GitHub and the test runs are fully live.
   - **Design → criterion linking is not wired.** Figma versions are evidence nodes only.
   - **UI built from the Stitch screens but not yet wired to data:** Policy Configuration, Policy Simulation, Search, Slack Delivery, Notifications, the Audit Trail console page, Onboarding, Profile. Show one of them only if asked, and say "screen only".

---

## 4. After the demo

```bash
git status                                   # config.ts must be clean
journalctl -u unify-worker -n 2 --no-pager   # stubFabricate: "none"
```

Leave PRs #47/#48 **open**. The superseded findings stay in the database by
design: they are the audit history.

---

## 5. Recovery table

| Symptom | Cause | Do this |
|---|---|---|
| Replay returns `401` | encryption key ≠ Vercel's | copy `INTEGRATION_ENCRYPTION_KEY` from Vercel, re-run |
| PR reopened, T2 silent | webhook slow or missing | `gh api repos/abdullahamin231/fyp/hooks/<id>/deliveries`; push an empty commit; else show the rehearsal rows |
| T2: `analysis target missing` | target row deleted | Act 2 page → add it back with the vitest command |
| Verdict PARTIAL where SUPPORTED expected | test command `npm test`, or the suite output not on its own line | runbook landmines 1–2 |
| Two verdicts per criterion at once | two workers racing | `pgrep -af "src/index.ts"`, kill all but the service (landmine 9) |
| No criteria were enqueued | the ticket was replayed **after** the PR event | replay the ticket, then close/reopen the PR (landmine 8) |
| Venue network down | — | `npm run dev` locally, `--base http://localhost:3000` on the replay, and run the worker against the same Supabase (runbook §5) |

---

## 6. Questions to expect, and where the answer is on screen

| Question | Show |
|---|---|
| "How do you know the model didn't make that up?" | Act 7: gate `DOWNGRADED`, `INVALID_CITATION`; packet manifest hash |
| "What if GitHub sends the webhook twice?" | Act 4 line 3: `duplicate_event`; `verification_jobs.idempotency_key` is unique |
| "What if the PR arrives before the ticket?" | Act 4 lines 4–5: `unknown_key`, then the late link |
| "Is the same input always the same answer?" | Packet hash on two runs of the same head; the stub is deterministic; temperature 0 is pinned for `opencode` |
| "Why not just trust the link?" | `/graph` legend: inferred links are never decisive (`AMBIGUOUS_LINK`) |
| "What does the reviewer actually do?" | Act 8: the lifecycle with reasons, audited |

---

## 7. Short cut (12 minutes)

Use Act 1 step 3 → Act 3 step 1 → Act 5 → Act 6 → Act 7 → Act 9 step 1 → Act 10 step 5.
That is the runbook's three beats plus the ingestion and graph context.
