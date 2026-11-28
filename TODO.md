# UNIFY — Team TODO

Working checklist for **Abdullah Amin · Haaniah Ismail · Mishal Fatima**
Sources: `docs/UNIFY Final Proposal v2 (Post Defense).docx` (Rev. 2 + Rev. 3), `docs/FYP1 Mid Pre-Evaluation Student Worksheet.docx`, `docs/FYP1 Mid Presentation Demo and Evidence Protocol.docx`, `docs/UNIFY Dataset Construction and Validation Action Plan.pdf`.

**No deadlines or duration estimates in this file.** Items are ordered by dependency: an item is ready when its blockers are checked. Status snapshots are dated; refresh them as work progresses.

**Status update (2026-11-28):** reconciled against the current tracked code,
tests, migrations, and project documents. A checked implementation item means
the capability has code or a test in the repository; it does not mean the full
evaluation, deployment, report, or team sign-off is complete. Unchecked items
are genuinely outstanding or need evidence beyond code inspection. Partial
implementations are described inline rather than treated as complete.

---

## 0. How to use this file

- **Owner** is the person accountable for the row; others may help, but one name defends it at the evaluation.
- **Evidence** is what must exist before the box is ticked. "Done" without evidence is not done — every claim in the worksheet, report and demo must trace to a commit, test, diagram, log or dataset file.
- **L1–L4 GenAI disclosure** applies to every materially assisted artefact. Log it when you make it, never afterwards.
- Re-read `docs/FYP1 Mid Pre-Evaluation Student Worksheet.docx` §12 (final check) before declaring anything complete.

---

## 1. Panel feedback → work items

Each panel comment becomes one tracked action. Status values: `open · in progress · complete · blocked`.

### 1.1 Reduce PM involvement in the loop — *Abdullah (design) · Mishal (rules)*
- [ ] Write the three-loop analysis: **configuration**, **confirmation**, **resolution** — what the PM does today vs. what the system does
- [ ] Configuration loop: derive canonical workflow state map from observed transitions; default grace period from observed merge-to-done delay; PM **approves a pre-filled proposal** instead of authoring it
- [ ] Confirmation loop: two-threshold link policy — above upper threshold auto-confirm with `system-confirmed` provenance (reversible), inside the band ask the code owner/assignee (not the PM), below the band hold silently as a suggestion
- [ ] Resolution loop: keep human, reduce cost with grouping/bulk actions
- [ ] Metrics to report: human interventions per 100 ingested events (vs. all-manual baseline), PM-directed prompts per finding (separate from developer/designer), auto-confirmation precision at the upper threshold (must be ≥ manual-confirmation precision or the threshold moves)
- [ ] Learned/adaptive thresholds: **deferred to FYP-II** — record the deferral and its condition (fixed-threshold version stable at Mid-2)

### 1.2 Research: which LLMs and what resources — *Abdullah*
- [x] Fixed model selected: **Inkling 2 Mini** because the team selected it as the best currently available open-weight model; worker pins Ollama tag `inkling-2-mini:26b-a5b`, JSON mode, temperature 0 (`apps/worker/src/config.ts`). Abdullah reports independently running and verifying the model (2026-11-28); the reusable Colab smoke test is `apps/worker/scripts/colab-inkling-smoke.py`. This records the team's choice, not a comparative benchmark claim.
- [x] Runtime integration is wired: the worker calls local Ollama and reports unavailable/malformed responses rather than silently falling back to a stub (`apps/worker/src/model/ollama.ts`; `apps/worker/test/ollama.test.ts`).
- [ ] Record the group's supported local hardware and measured resource/latency figures when preparing evaluation results; do not reopen model selection unless those measurements show the fixed setup is infeasible.

### 1.3 Traceability aspect — *Mishal (anchors) · Abdullah (matrix)*
- [ ] Graph gains `Requirement` entity + `SATISFIES(CodeUnit, Requirement)` edge carrying a **CodeAnchor**: repo, file path, fully-qualified symbol, start/end line, blob hash, commit SHA, confidence, provenance
- [ ] Commit-pinned anchoring + re-anchoring order: fully-qualified symbol name → content hash → diff-hunk mapping → mark **broken** (never silently wrong)
- [ ] Policy **P4 (requirement/implementation divergence)**: requirement text changes materially while anchored code unchanged beyond grace, or anchored code changes with no linked requirement/ticket change; guards for formatting-only and generated-file edits; outputs divergence finding with both sides of the anchor
- [ ] Anchoring granularity stated explicitly: FR → symbol + line range, commit-pinned; NFR → enforcement point + verifying test (**not** line-anchored) + coverage metric
- [ ] `anchor_survival_rate` across commits implemented and reported
- [x] Maintain UNIFY's own traceability matrix (FR → design element → module → test case → evaluation scenario) — **implemented** (`docs/traceability/`): 43 rows, canonical CSV + `build_matrix.py` validator/generator + generated Markdown and LaTeX; the fragment is included in ch4.
- [ ] Resolve the remaining `[decide]` discrepancies in `docs/traceability/README.md` with the team and regenerate the matrix at the evaluation tag.

### 1.4 Where LLMs are used, at what level — *Abdullah*
- [ ] LLM Usage Register written into the SRS/SDS: per stage → task, autonomy level, deterministic fallback
- [ ] Autonomy ladder enforced: L0 deterministic parsing/rules · L1 retrieve-and-rank only · L2 suggest (needs confirmation/threshold) · L3 explain/verify over confirmed facts with citations · L4 autonomous write — **prohibited**
- [ ] Register rows cover: ingestion (L0), candidate generation (L1), link adjudication (L2), drift review (L2), conflict explanation (L3), adaptation/LoRA (L2), verdicting (L2 + gate)
- [ ] One rule stated everywhere: **no LLM output writes to the graph of truth; no LLM output fires a policy on its own**
- [ ] Degraded mode demonstrated: one benchmark pass with the model server switched off, showing which capabilities survive and which numbers drop

### 1.5 Dataset validation — *see §4 below (full package) — Abdullah owns format/splits, Haaniah provenance, Mishal anchors*
- [ ] Merge proposal §12.3 and §28 into **one authoritative dataset protocol** (the action plan flags the duplication)

### 1.6 Code comments → semantics — *Mishal*
- [x] **Symbol cards** are produced for changed symbols and included in analyser evidence: qualified name, signature, source location, comments/docstrings, imports/callers and unresolved dynamic sites. Introducing commit messages and a full repository-wide embedding/index are not currently part of the implementation.
- [ ] **Comment–code consistency check**: docstring/comment claims behaviour the signature or body contradicts → a genuine finding, rendered by templates (model may rephrase, never add facts)
- [ ] **Repository eligibility gate** (mandatory scope limit): TypeScript/React principal language, permissive licence, resolvable base/head commits, installs + tests run, usable issue/PR history with at least one atomic criterion derivable **without inventing intent**, extractable code/test evidence, generated/vendor files identifiable, no secrets, full provenance (source, version, retrieval date, checksum)
- [ ] Gate score published to the user at connection time; below-threshold repos admitted only with an explicit warning
- [ ] Documentation-quality profiling per repo: comment/docstring coverage, identifier informativeness, directory conventionality, README/architecture docs, test presence/naming → well / moderately / poorly documented cohorts
- [ ] Report results **stratified by cohort**; keep 3–4 deliberately low-documentation repos as a measured degradation curve rather than removing them

### 1.7 Robust context management (incl. large codebases) — *Abdullah*
- [x] Deterministic packet construction under fixed total and per-slot budgets, fixed assembly/eviction order, hashed manifest, and explicit omission/truncation records (`apps/worker/src/packet/`; tests in `apps/worker/test/assemble.test.ts` and `slot-priority.test.ts`).
- [x] **AST-aligned chunking** for supported TypeScript/JavaScript symbols; Python parsing is also present. Dynamic imports/calls that cannot be resolved are represented as unresolved sites rather than guessed edges.
- [ ] Hybrid retrieval: sparse + dense fused, deduplicated, diversity-enforced so ten near-identical chunks cannot crowd out the relevant one
- [x] **Packet manifest** persisted with each verification: admitted/omitted evidence, base/head commits, budget, packet and prompt hashes; model/run metadata is recorded on the verdict and passes.
- [ ] Map-then-zoom for whole-repo scale (never whole-repository prompting): repository map of directory/file summaries + symbol index → model selects regions → retrieve detail for selected regions only, inside the bounded pass cap
- [ ] Incremental indexing by content hash (only changed symbols re-parsed/re-embedded)
- [x] Python and TypeScript/JavaScript analysis paths exist. The ~500k LOC ceiling and scalability characteristics are not measured yet.
- [ ] Scalability benchmark and supported upper-size limit: repo sizes ≈10k / 100k / 500k LOC, index build/update, storage, Recall@k, p95 verdict latency and truncation rate.

### 1.8 Utilise the LLM for large-code design + validation process — *Abdullah (loop) · Mishal (gates)*
- [x] Bounded verifier loop: pass 1 scope/retrieval (stop → `INSUFFICIENT_EVIDENCE` when no evidence applies), pass 2 verify, and conditional pass 3 critic; pass inputs/outputs, timing, metadata and stop reason are persisted (`apps/worker/src/verifier/loop.ts`).
- [ ] **Five-layer validation plan** written and executed in order: Data (agreement stats, adjudication, integrity, dataset card) → Component (per-stage metrics in isolation) → System (acceptance test per FR + reliability + security scan) → Comparative (baselines) → Human (expert verdict review + crossover workflow study)
- [ ] Ablations committed and run: comments/docstrings stripped from symbol cards · path+file-name tokens removed · structural chunking → fixed windows · verifier removed (threshold only) · base vs. adapted model under identical retrieval
- [x] **Hard gate 1**: a verdict without a resolved evidence span cannot be decisive; contract gate tests cover rejection/downgrade.
- [ ] **Hard gate 2**: same packet run 3× at temperature 0 agrees ≥ 95%, else the configuration is not fit to be measured

### 1.9 Scope limit on repository quality — *Mishal*
- [ ] State in scope section: the approach targets projects with proper code comments, self-explanatory names and conventional directory structure; without them relationship/dependency/inconsistency detection degrades — and the low-documentation cohort is how that claim is **measured, not asserted**

---

## 2. Bootstrap — repo and environment *(blocks everything below)*

- [ ] Agree and sign off the proposal §16 ownership table (named sign-off, recorded in the repo)
- [x] Working monorepo exists: `apps/web`, `apps/worker`, `packages/contracts`, `supabase/migrations/`, `docs/`, and worker fixtures. The API routes live in the Next.js web app; `apps/api`, `db/migrations`, and the planned `tools/mock-vendor` replay harness were not created.
- [x] Put the **Zod contracts** in `packages/contracts` first: normalised event envelope, node/edge types, rule schema, context-packet schema, verdict/output schema — single source of truth for DB, tests, UI, diagrams and report — **done** (`feat/contracts`: `packages/contracts`, 60 tests, strict schemas + FR-05/FR-10/hard-gate-1/FR-18 helpers; enum values still to sign off are listed in its README)
- [ ] `docker-compose.yml`: postgres, redis, api, worker, web, local model-serving container
- [ ] CI: `.github/workflows/pr-check.yml` runs workspace typechecks, web lint and workspace tests on PRs. Add an explicit production build check and confirm branch protection / required peer review.
- [ ] Task board with three swimlanes + an integration column; every work item has an owner
- [ ] **GenAI artefact register** exists at `docs/genai_register.md`; keep it current and complete the prompt journal with retained prompts/outputs, verification/corrections and assistance levels (worksheet §10).
- [ ] Start the **individual defence notebook** per member: problem personally diagnosed · one limitation found · one task performable without GenAI · three technical growth questions (worksheet §11)
- [x] Proposal action register is represented by this checklist and the report appendix. Keep statuses and evidence links synchronized as work changes.

---

## 3. Deliverable 1 — Working implementation

Ordered by dependency. Each feature's **Definition of Done**: tests green · evidence row on the board · diagram updated if it changes structure · report note · GenAI disclosure logged.

### 3.1 Slice A — ingestion reliability — *Haaniah*
- [ ] `tools/mock-vendor` replay harness: duplicate, out-of-order, delayed, missing-webhook, outage and replay sequences
- [x] Normalisation of GitHub / Jira / Figma inputs into the shared event model through provider adapters, webhooks and polling. Provider coverage is limited to the integrations present in the app.
- [x] Delivery deduplication by workspace/provider delivery identity and idempotent event/finding writes; covered by integration and migration tests.
- [x] Per-resource checkpoints and reconciliation/polling exist for GitHub, Jira and watched Figma files (`apps/web/src/lib/integrations/`).
- [x] Checkpoints store source-stale state; the worker reads freshness and the verdict gate withholds affected verdicts. A complete automatic stale-timeout/recovery replay harness remains unverified.
- [x] Append-only artifact snapshots and immutable packet/verdict/pass records are implemented in Supabase migrations and persistence code. Confirm coverage for every provider/version type in the integration suite.
- [ ] Full §8.4 reliability state machine and mock-vendor outage/replay acceptance suite; current webhook, reconcile, idempotency and queue pieces are implemented, but are not yet proven together across all scenarios.

### 3.2 Slice B — code/test evidence graph — *Mishal*
- [x] Supabase/Postgres property graph with `nodes`, `edges`, `artifact_snapshots` and graph indexes is defined by the migrations.
- [x] Deterministic linking from explicit Jira references in GitHub pull-request events, Figma artifact links, and manual link confirmation/rejection with resolver provenance is implemented. No general inferred-link model is claimed.
- [x] Link eligibility is represented in shared contracts and enforced by the verification gate/routing path; inferred or unconfirmed links are not decisive.
- [x] Repository analyser resolves base/head, emits changed files and diff hunks, parses changed/affected symbols, bounded imports/callers, and test/coverage evidence. TypeScript/JavaScript and Python parsing are present; this is not a general all-language index.
- [x] Dynamic import/require and computed-call sites are emitted as unresolved markers; unresolved runtime dispatch/reflection is not guessed.
- [x] Symbol cards/evidence are produced by the analyser and supplied to the context packet (see §1.6).
- [ ] Traceability: `Requirement` entity, commit-pinned `CodeAnchor`, re-anchoring, broken-anchor marking (§1.3)
- [ ] Rule 1–3 definitions are versioned in contracts and seeded in the database; end-to-end trigger/guard/grace-period behavior is not complete across the full rule set. P4 requirement/implementation divergence remains unimplemented.
- [ ] Indexed rule dispatch + reverse-index criterion invalidation with bounded hop count; incremental-vs-full equivalence test
- [x] Role-edge notification resolution uses bounded BFS over `OWNS`, `ASSIGNED_TO` and `WATCHES`, with routing outcomes and tests (`apps/web/src/lib/data/route-finding.ts`).

### 3.3 Slice C — verification and reviewer surface — *Abdullah*
- [x] Deterministic context-packet builder with fixed per-slot/total budgets, reproducible assembly, explicit truncation manifest and hashes (`apps/worker/src/packet/`).
- [ ] Local model-serving container is not provided. Worker is wired to local Ollama with Inkling 2 Mini pinned in config; Ollama itself must be installed and served on the worker host.
- [x] Bounded three-pass verifier and structured outputs are implemented; each pass, output, stop reason and model/run metadata are persisted.
- [x] **Verdict/provenance gate** validates output and citations against the packet and checks link eligibility/freshness before publishing; failed checks are rejected or downgraded with a recorded gate outcome.
- [x] Verdict semantics separate the four statuses from freshness, review requirement and reason code in shared contracts and persistence.
- [x] Reviewer web app has workspace, link confirmation, criterion/conflict, evidence/verifier-pass, policy, activity/audit and finding-resolution surfaces. The current UI is a working implementation, not a pixel-certified match to the Stitch reference.
- [x] Finding actions include acknowledge, resolve, dispute, suppress-with-reason and reopen, with transition validation and audit records. Dispute data is not yet a labelled adaptation/training pipeline.
- [x] Slack notification delivery/settings and routing are implemented as delivery surfaces; Slack is not used as model input.

### 3.4 End-to-end scenario set *(integration tests, all three)*
- [ ] T1 explicit-reference chain resolves end-to-end
- [ ] T2/T3 Rule 1 positive + negative (cosmetic edit must not fire)
- [ ] T4/T5 Rule 2 positive + negative (mapped acceptable post-merge state must not fire)
- [ ] T6 Rule 3 positive + negative
- [ ] T7 duplicate / out-of-order delivery converges to one final state across the complete event-to-finding path; component tests cover delivery replay and Jira version ordering, but not the full scenario.
- [ ] T8 simulated outage → `SOURCE_STALE` → reconciliation recovery
- [ ] T9 role routing correctness
- [x] T10 fabricated-citation injection → gate downgrades, never shown as decisive (`apps/worker/test/e2e-gate.test.ts`).
- [ ] T11 incremental vs. full rescan equivalence
- [ ] Degraded mode: model server off → Rules 1–3 + unresolved-evidence reporting still work (§1.4)

---

## 4. Dataset validation package *(panel requirement — full spec in the action plan PDF)*

- [ ] **Phase 1 — protocol freeze**: merge proposal §12.3 + §28 into one authoritative protocol; freeze taxonomy (4 verdicts + `freshness_state` + `review_required` + `reason_code` + `origin`), case schema, eligibility gate, roles, split policy
- [x] **Phase 2 — pilot repository screening**: `docs/dataset/01_repository_catalogue.csv` screens 8 candidates (3 accepted, 4 rejected, 1 deferred) with language, licence, evidence and decision reasons. The full 12–20 candidate target is not met.
- [x] **Phase 3 — pilot**: construct 12–20 cases from ≥3 TypeScript/React repositories covering SUPPORTED / CONTRADICTED / PARTIAL / INSUFFICIENT_EVIDENCE; blind-label 10–15 — **done** (`66e85c7`): 15 cases from react-hook-form (7), excalidraw (4), mantine (4); same-module hard negatives in every case; blind-labelled by Abdullah and Haaniah
- [ ] **Phase 4 — guide revision**: measure raw agreement + Cohen's κ (target ≥ 0.70) and span overlap (line/token F1 or IoU); rewrite guide and re-pilot if below gate; freeze annotation manual v1 — **measured, gate passed**: verdict **κ 0.90** (raw 0.93), freshness κ 1.00, review κ 1.00, span Jaccard 0.83 (exact match 9/15). **No re-pilot needed.** *Open:* 1 verdict disagreement (P10: Abdullah `SUPPORTED` vs Haaniah `INSUFFICIENT_EVIDENCE`) and 6 span disagreements for **Mishal** to adjudicate in `06_adjudication_log.csv`; then freeze manual v1. Supervisor audit still pending
- [ ] **Phase 5 — full construction**: training pool (200–500, later), development set (20–30), gold oracle (30–50, later), event-reliability suite (20–30 sequences, later); preserve `REAL / CONTROLLED_MUTATION / SYNTHETIC` origin
- [ ] **Phase 6 — audit and freeze**: pilot integrity tooling/report exists (`docs/dataset/08_integrity_report.md`: 138 checks, 0 failures); duplicate-across-split checks, frozen checksum manifest, supervisor/external audit and frozen split manifest remain outstanding.
- [ ] **Phase 7 — evaluation**: freeze model/prompt/retrieval/thresholds; open gold test labels once; per-class results + confusion matrix + abstention + error analysis
- [ ] Split discipline enforced throughout: **by repository, never by example**; forks/templates stay together; controlled mutations inherit their source's split; synthetic data only from training repos; test set never used for prompts, few-shot, thresholds or model choice
- [ ] Roles enforced: case constructor ≠ primary annotator for that case; two blind annotators; adjudicator records decision + rationale; supervisor approves taxonomy and audits; no student validates their own subsystem's data
- [ ] Mid-checkpoint minimum evidence assembled (action plan §10): frozen taxonomy · eligibility checklist with ≥3 accepted repos · 12–20-case pilot · same-module hard negatives · ≥3 deliberate abstention cases · annotation manual with worked examples · two independent annotation files + preliminary κ · one documented adjudication · dataset card draft + split plan + integrity output · one end-to-end case from source artefact to gold verdict
- [ ] Dataset package files written: `01_repository_catalogue.csv` … `12_results/` per the action plan checklist
- [ ] Prepare the ten "questions the students must be able to answer" answers (action plan §11)

---

## 5. Deliverable 3 — Diagrams

Editable source committed + rendered PDF, each stamped with the commit it matches. Regenerate all at the evaluation tag.

*Location/tool note:* twelve TikZ diagram sources and a `build.sh` renderer exist in `docs/F26 FYP1 Mid Report LaTeX/diagrams/`; rendered outputs are committed. Three newer standalone diagrams (ingestion sequence, state machines, deployment) are not yet wired into report chapters. Still outstanding: verify all diagrams against current implementation, add evaluation commit stamps, regenerate at the evaluation tag, and obtain team sign-off on the tooling choice.

- [x] Layered architecture + trust boundary (adapter → reviewer surface) — *Abdullah* — proposal §8.1 — **done** (`diagrams/layered-arch.tex` + `rendered/layered-arch.pdf`, `d2d7d0c`, wired into ch5 §System Architecture; re-rendered clean via the `texlive/texlive` container). *Follow-up:* commit stamp + regeneration at the evaluation tag still outstanding (applies to every diagram).
- [x] Component/interface diagram: API, worker, queue, DB, model server, external tools — *Abdullah* — §8.2 — **done** (`diagrams/components.tex` + `rendered/components.pdf`, `d2d7d0c`, wired into ch5 §Architectural Components). *Follow-up:* commit stamp + evaluation-tag regeneration.
- [x] **ERD** — nodes, edges, artifact_snapshots, events, checkpoints, requirements/anchors, criteria, findings — *Mishal* — §9.1/§9.9 — **done** (`diagrams/erd.tex` + `rendered/erd.pdf`, `717a7af`; 13 tables, schema fields match §8.3/§9.3/§9.9/§11.6/§22.1; cardinalities and the `context_packets → nodes` routing checked, clean). *Follow-up:* checkpoints composite PK reads ambiguously (`resource_id` styled as an index row).
- [x] Data-flow / DFD of the full pipeline (webhook → … → reviewer UI) — *Abdullah* — §8.2 — **done** (`diagrams/dfd.tex` + `rendered/dfd.pdf`, `d2d7d0c`, wired into ch5 §Process / Behavior Design). *Follow-up:* commit stamp + evaluation-tag regeneration.
- [x] Sequence diagram: ingestion with duplicate + out-of-order handling — *Haaniah* — source and rendered output exist; wire into the report chapter.
- [x] State machine: event processing and finding lifecycle incl. `SOURCE_STALE` — *Haaniah* — source and rendered output exist; wire into the report chapter and verify against current behavior.
- [x] Use-case diagram for the four roles — *Mishal* — §1.1 — **done** (`diagrams/usecase.tex`, `717a7af`, wired into ch4). *Follow-up:* FR-17 is "any authenticated user", so PM should also associate to *view evidence case* (and likely *export*); §1.1 says the PM wants project-level visibility.
- [x] Domain/class model of graph entities and edge types — *Mishal* — §9.1 — **done** (`diagrams/domain-model.tex`, `717a7af`, wired into ch5). *Follow-ups:* `Artifact.raw` vs ERD `nodes.payload` naming must match; `workspace_id` missing from the class; `Person` is a `nodes` row in the ERD but not an `Artifact` subclass here while `Message` is — state why; `BLOCKS`/`DUPLICATES`/`REFERENCES` (§9.1) not drawn.
- [x] Activity diagram: bounded verifier loop (pass 1 → 2 → conditional 3) into the verdict gate — *Abdullah* — §11.4/§11.8 — **done** (`diagrams/verifier-loop.tex` + `rendered/verifier-loop.pdf`, `d2d7d0c`, wired into ch5 §Process / Behavior Design; covers the verdict/provenance gate and hard gate 1). *Follow-up:* commit stamp + evaluation-tag regeneration.
- [x] Traceability matrix: FR → design element → module → test case → demo step — *Abdullah maintains, all three feed* — worksheet §5 — **done** (`docs/traceability/`, commits `ddf58b2`/`76da2e7`/`90af24b`; ch4 §Requirements Traceability has carried a real `longtable` since `33b00e7`, so the "placeholder line" wording below was stale). 43 rows, canonical CSV, validator/generator, generated markdown + LaTeX fragment. *Follow-ups:* (1) **add `\usepackage{booktabs}` to `main.tex`** — ch1 and ch3 use `\toprule`/`\midrule`/`\bottomrule` without it, 24 pre-existing errors; (2) swap the fragment into ch4 §4.7 via `\input{../traceability/chapter4_table}` to close the five FRs ch4's own table omits (FR-19, 20, 21, 26, 27); (3) 14 **[decide]** discrepancies in `docs/traceability/README.md` need a team decision
- [x] Deployment/containers diagram source and render exist — *Haaniah* — §14. The pictured Docker/model-serving deployment is a design target; no compose deployment currently exists in the repository.
- [x] Requirement → code **anchor** illustration (commit-pinned, re-anchoring, broken state) — *Mishal* — §22 — **done** (`diagrams/anchor-reanchoring.tex`, `717a7af`, wired into ch5). *Follow-ups:* drop the invented **FR-07** label (it collides with the proposal's real FR-07 — use e.g. `REQ-42`); move the figure out of *Process / Behavior Design* (it belongs with the domain model / traceability text) and add a `\ref` in the body — no figure is referenced in the text yet.
- [x] LLM autonomy ladder / usage-register diagram (L0–L4 with fallbacks) — *Abdullah* — §24 — **done** (`diagrams/autonomy-ladder.tex` + `rendered/autonomy-ladder.pdf`, `d2d7d0c`, wired into ch5 §Architecture Decisions and Rationale; L0–L3 with fallbacks, L4 prohibited, the no-write invariant in the caption). *Follow-up:* commit stamp + evaluation-tag regeneration.
- [ ] Final cross-check: every diagram matches the evaluation version and can be explained by its owner — *all three* — **partly**: four reviewed against the proposal (`717a7af`), all consistent; the follow-ups above must be closed first

---

## 6. Deliverable 2 — Mid report (LaTeX)

Draft chapters and appendices are present in `docs/F26 FYP1 Mid Report LaTeX/`. Owners must verify facts against the current implementation, revise in their own words, and obtain peer review before the report is considered done. Do not paste proposal text (anti-plagiarism declaration applies).

- [ ] ch1 Introduction and Project Vision — *Abdullah* — **written** (337 lines, content added in `7d3c99c`); awaiting Abdullah's review in his own words
- [ ] ch2 Research, existing solutions and gap — *Haaniah* — **a chapter draft exists** (`chapter2_research.tex`, 531 lines), not a section skeleton. Verify research claims against primary sources, add dated product-trial evidence if still required, and complete owner review/revision in her own words.
- [x] ch3 Proposal feedback and iteration plan — *Haaniah* — **draft exists** (`chapter3_iteration_plan.tex`, 488 lines); `booktabs` is now loaded in `main.tex`. Owner review, current-state reconciliation and final approval remain.
- [ ] ch4 Software requirements — *Mishal* — **draft exists** (`chapter4_requirements.tex`) with six use cases, FR/NFR, acceptance criteria and generated traceability matrix. Agree the open FR decisions with the team and complete owner review/revision.
- [ ] ch5 System design — *Abdullah + Mishal* — body and figures are present (`chapter5_design.tex`, 521 lines). Update the chapter to match current code and close diagram follow-ups; `anchor-reanchoring.tex` still labels its illustrative requirement **FR-07**, which collides with the real FR-07. The figure is now referenced in the body.
- [ ] ch6 Iteration 1: design and implementation — each writes their own subsection against real files/functions/algorithms — *all three* — **substantial draft exists** (`chapter6_iteration1.tex`, 1,017 lines). Update its implementation/mocked split to the current web, Supabase, contracts and worker code; review each member's subsection and replace stale "execution pending" text with current evidence.
- [ ] ch8 Testing and early validation — *Mishal* — **substantial draft exists** (`chapter8_testing.tex`, 771 lines), including current test and dataset material. Refresh results against the latest implementation and resolve the remaining dataset adjudication/supervisor-audit status before finalizing.
- [ ] ch9 Project management and development evidence — *Haaniah* — **substantial draft exists** (`chapter9_development_evidence.tex`, 599 lines). Verify each person's contribution and GenAI disclosures against actual records/commits, then complete owner review in her own words.
- [ ] ch10 Remaining FYP plan — *Abdullah consolidates* — **draft exists** (`chapter10_fyp2_plan.tex`, 322 lines); reconcile it with this updated TODO and complete owner review.
- [ ] Front/back matter: source files exist for submission, anti-plagiarism, authors declaration, abstract, acknowledgments, executive summary and abbreviations; complete, verify and sign them — *rotation*.
- [ ] Appendices: source files exist for action register, requirements, test cases, repository, diagrams and meetings; update them to the current implementation and verify report references — *all three*.
- [ ] `references/references.bib` maintained continuously; every research claim checked against its original source (worksheet §10)
- [ ] **Traceability of report ↔ implementation**: worksheet Form 3 evidence index filled (section/page → artefact → owner)
- [ ] Compile clean (pdflatex → bibtex → pdflatex ×2); figures and tables lists populated — `booktabs` and the student/title macros are now present in `main.tex`; perform a fresh clean build and fix any remaining errors. The last recorded 121-page build at `7766cbc` predates the current chapter drafts and must not be used as current evidence.

---

## 7. Mid-evaluation readiness (Form 2 + worksheet)

- [ ] Worksheet sections 1–12 completed from live evidence (not written retrospectively)
- [ ] Iteration objective + status, variance and recovery plan recorded
- [ ] Implemented vs. mocked/substituted table filled honestly, with a plan to remove each substitute
- [ ] Demo script written with normal / edge / failure steps, expected result, visible evidence, presenter per step
- [ ] **Live demo run-through**: identify evaluation tag → normal case (chain + `SUPPORTED` verdict with citations) → edge/failure case (fabricated citation downgraded, or duplicate event producing no duplicate finding) → open logs/DB rows/tests as technical evidence → state implemented vs. mocked boundaries
- [ ] Fallback prepared for external dependencies (mock-vendor replay mode) — explains an outage, never converts unimplemented work into implemented
- [ ] Seven-slide deck (max) with seven-minute rehearsal; slides identify evidence, no report paragraphs, no fresh project pitch
- [ ] Evaluation commit/tag frozen, clean, recorded in the worksheet; repository access granted to supervisor ≥48 h before; worksheet + report submitted ≥48 h before
- [ ] Repository walkthrough items ready in order: action register → tag → history (explain any large/late commits) → task/milestone record → per-member contribution evidence (beyond commit counts) → design↔implementation link → tests → tool/dependency disclosure
- [ ] Each member: own work in own words · distinguish from teammates' work · one personally diagnosed problem + how it was validated · one limitation/failure + what was done · a small technical task performable without GenAI · a live modification they are prepared to make
- [ ] GenAI register, prompt journal, citation-verification record, external dependency table all complete and disclosed at the right L-level
- [ ] Final checklist from worksheet §12 ticked by all three; group confirmation signed

---

## 8. Continuous (every merged change)

- [ ] Board item moved with commit/PR/test reference
- [ ] Test added or updated for the change
- [ ] Diagram touched if structure changed
- [ ] Report note drafted for anything that will appear in ch6/ch8
- [ ] GenAI assistance level logged for materially assisted artefacts
- [ ] Contract change propagated to DB, UI, tests, diagrams, report

---

## 9. Frozen — do not build (recorded so it cannot creep back)

- [ ] New integrations (GitLab, Linear, Notion, Vercel) — adapter-role design means they are one adapter each, and none adds an evaluable claim
- [ ] Autonomous code generation/fixes, L4 autonomy, two-way write-back, hosted production LLM, unrestricted chat
- [ ] Pixel-perfect Figma certification; screenshot/DOM/vision-language comparison (stretch, separately evaluated)
- [ ] Dedicated graph DB / full event-sourcing / Neo4j — deferred until multi-hop pattern queries are actually needed
- [ ] AI chain summarisation, natural-language graph querying, standup summaries — presentation features with no evaluable claim
- [ ] Multi-hop cascade analytics, community/centrality analytics — deferred
- [ ] Learned/adaptive confirmation thresholds — FYP-II, contingent on fixed thresholds being stable at Mid-2

---

## 10. Open decisions to settle before building

- [ ] Record the group's supported local GPU/VRAM for reproducible model-runtime measurements; the Inkling model choice is fixed and is not waiting on this decision.
- [ ] Confirm which live GitHub/Jira/Figma integrations and credentials will be available for evaluation; OAuth/webhook/reconciliation code exists, but end-to-end access depends on provider setup.
- [ ] Diagram tooling sign-off by all three members — the repository has standardized on TikZ sources in `docs/F26 FYP1 Mid Report LaTeX/diagrams/` with a shared `build.sh`.
- [ ] Board of record and review rule (who reviews whom)
- [ ] Annotation tooling format for blind double-labelling (two files per case, no discussion before both submitted)
- [ ] Sign-off of the §16 ownership rows by all three members
