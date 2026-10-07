# UNIFY — Team TODO

Working checklist for **Abdullah Amin · Haaniah Ismail · Mishal Fatima**
Sources: `docs/UNIFY Final Proposal v2 (Post Defense).docx` (Rev. 2 + Rev. 3), `docs/FYP1 Mid Pre-Evaluation Student Worksheet.docx`, `docs/FYP1 Mid Presentation Demo and Evidence Protocol.docx`, `docs/UNIFY Dataset Construction and Validation Action Plan.pdf`.

**No dates or durations in this file.** Items are ordered by dependency: an item is ready when its blockers are checked. Commit the file as work progresses.

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
- [ ] Model-selection study as a **deliverable** (proposal §25): candidate classes, selection protocol, and the resource budget table are written before any model is downloaded
- [ ] Candidate shortlist re-verified at selection time: Qwen2.5-Coder class (3B/7B), Llama 3.1 / Code Llama class, mid 20–30B class, sparse MoE coder class, small code-embedding/reranker model
- [ ] Deployment constraint first: record actual GPU/VRAM available to the group (or state honestly that there is none → mid-class becomes the ceiling)
- [ ] Selection protocol frozen: development split + verdict schema frozen first; identical prompts/packets; temperature 0; constrained JSON decoding; record verdict F1, p50/p95 latency, peak VRAM, tokens/verdict, context limit, licence, schema-violation rate
- [ ] Weighting, winner, fallback model and switch conditions recorded; model named in the report with version and selection date
- [ ] Resource budget table: index storage per 100k LOC, one-off embedding time, incremental re-index time, tokens + wall-clock per verdict, cost of one full benchmark pass
- [ ] Hosted frontier API used only as an offline reference ceiling on sanitised data, labelled as a comparison — never a runtime dependency

### 1.3 Traceability aspect — *Mishal (anchors) · Abdullah (matrix)*
- [ ] Graph gains `Requirement` entity + `SATISFIES(CodeUnit, Requirement)` edge carrying a **CodeAnchor**: repo, file path, fully-qualified symbol, start/end line, blob hash, commit SHA, confidence, provenance
- [ ] Commit-pinned anchoring + re-anchoring order: fully-qualified symbol name → content hash → diff-hunk mapping → mark **broken** (never silently wrong)
- [ ] Policy **P4 (requirement/implementation divergence)**: requirement text changes materially while anchored code unchanged beyond grace, or anchored code changes with no linked requirement/ticket change; guards for formatting-only and generated-file edits; outputs divergence finding with both sides of the anchor
- [ ] Anchoring granularity stated explicitly: FR → symbol + line range, commit-pinned; NFR → enforcement point + verifying test (**not** line-anchored) + coverage metric
- [ ] `anchor_survival_rate` across commits implemented and reported
- [ ] Maintain UNIFY's own traceability matrix (FR → design element → module → test case → evaluation scenario), versioned in the repo, regenerated at each gate — this doubles as a worked example of the product capability

### 1.4 Where LLMs are used, at what level — *Abdullah*
- [ ] LLM Usage Register written into the SRS/SDS: per stage → task, autonomy level, deterministic fallback
- [ ] Autonomy ladder enforced: L0 deterministic parsing/rules · L1 retrieve-and-rank only · L2 suggest (needs confirmation/threshold) · L3 explain/verify over confirmed facts with citations · L4 autonomous write — **prohibited**
- [ ] Register rows cover: ingestion (L0), candidate generation (L1), link adjudication (L2), drift review (L2), conflict explanation (L3), adaptation/LoRA (L2), verdicting (L2 + gate)
- [ ] One rule stated everywhere: **no LLM output writes to the graph of truth; no LLM output fires a policy on its own**
- [ ] Degraded mode demonstrated: one benchmark pass with the model server switched off, showing which capabilities survive and which numbers drop

### 1.5 Dataset validation — *see §4 below (full package) — Abdullah owns format/splits, Haaniah provenance, Mishal anchors*
- [ ] Merge proposal §12.3 and §28 into **one authoritative dataset protocol** (the action plan flags the duplication)

### 1.6 Code comments → semantics — *Mishal*
- [ ] **Symbol cards** per indexed symbol: fully-qualified name, signature, docstring, leading comment block, directory-path tokens, file name, imports/callers, introducing commit message — this is what gets embedded and what enters the context packet
- [ ] **Comment–code consistency check**: docstring/comment claims behaviour the signature or body contradicts → a genuine finding, rendered by templates (model may rephrase, never add facts)
- [ ] **Repository eligibility gate** (mandatory scope limit): TypeScript/React principal language, permissive licence, resolvable base/head commits, installs + tests run, usable issue/PR history with at least one atomic criterion derivable **without inventing intent**, extractable code/test evidence, generated/vendor files identifiable, no secrets, full provenance (source, version, retrieval date, checksum)
- [ ] Gate score published to the user at connection time; below-threshold repos admitted only with an explicit warning
- [ ] Documentation-quality profiling per repo: comment/docstring coverage, identifier informativeness, directory conventionality, README/architecture docs, test presence/naming → well / moderately / poorly documented cohorts
- [ ] Report results **stratified by cohort**; keep 3–4 deliberately low-documentation repos as a measured degradation curve rather than removing them

### 1.7 Robust context management (incl. large codebases) — *Abdullah*
- [ ] Deterministic packet construction under a fixed token budget with **per-slot budgets** (requirement text, symbol cards, diff hunks, neighbouring graph edges, policy definition), fixed assembly order, fixed eviction order, truncation recorded not silent
- [ ] **AST-aligned chunking** (a chunk is a function or class, not a line window)
- [ ] Hybrid retrieval: sparse + dense fused, deduplicated, diversity-enforced so ten near-identical chunks cannot crowd out the relevant one
- [ ] **Packet manifest** stored with every verdict: chunks, commit, budget, model version, prompt hash
- [ ] Map-then-zoom for whole-repo scale (never whole-repository prompting): repository map of directory/file summaries + symbol index → model selects regions → retrieve detail for selected regions only, inside the bounded pass cap
- [ ] Incremental indexing by content hash (only changed symbols re-parsed/re-embedded)
- [ ] Scalability benchmark: repo sizes ≈10k / 100k / 500k LOC → full index build time, incremental update time per commit, index storage, Recall@k, p95 verdict latency, packet truncation rate
- [ ] Stated limits recorded: two language families (Python + TypeScript/JavaScript per §27.3, which governs §7.2 where they differ), ~500k LOC upper bound, beyond = future work

### 1.8 Utilise the LLM for large-code design + validation process — *Abdullah (loop) · Mishal (gates)*
- [ ] Bounded verifier loop implemented exactly as specified: pass 1 scope/retrieval (stop → `INSUFFICIENT_EVIDENCE` if nothing applicable), pass 2 verify, pass 3 conditional critic; pass cap, inputs, outputs and stop reason logged per run
- [ ] **Five-layer validation plan** written and executed in order: Data (agreement stats, adjudication, integrity, dataset card) → Component (per-stage metrics in isolation) → System (acceptance test per FR + reliability + security scan) → Comparative (baselines) → Human (expert verdict review + crossover workflow study)
- [ ] Ablations committed and run: comments/docstrings stripped from symbol cards · path+file-name tokens removed · structural chunking → fixed windows · verifier removed (threshold only) · base vs. adapted model under identical retrieval
- [ ] **Hard gate 1**: a verdict citing no evidence span is rejected automatically and counted as an abstention — 100% enforcement
- [ ] **Hard gate 2**: same packet run 3× at temperature 0 agrees ≥ 95%, else the configuration is not fit to be measured

### 1.9 Scope limit on repository quality — *Mishal*
- [ ] State in scope section: the approach targets projects with proper code comments, self-explanatory names and conventional directory structure; without them relationship/dependency/inconsistency detection degrades — and the low-documentation cohort is how that claim is **measured, not asserted**

---

## 2. Bootstrap — repo and environment *(blocks everything below)*

- [ ] Agree and sign off the proposal §16 ownership table (named sign-off, recorded in the repo)
- [ ] Scaffold monorepo: `apps/web`, `apps/api`, `apps/worker`, `packages/contracts`, `db/migrations`, `fixtures/`, `tools/mock-vendor/`, `docs/`
- [ ] Put the **Zod contracts** in `packages/contracts` first: normalised event envelope, node/edge types, rule schema, context-packet schema, verdict/output schema — single source of truth for DB, tests, UI, diagrams and report
- [ ] `docker-compose.yml`: postgres, redis, api, worker, web, local model-serving container
- [ ] CI: lint + test + build on every PR; branch protection requiring one other member's review (worksheet wants a review practice, not just commits)
- [ ] Task board with three swimlanes + an integration column; every work item has an owner
- [ ] Start the **GenAI artefact register** and **prompt journal** now (worksheet §10) — L-level per artefact, retained output, verification/correction
- [ ] Start the **individual defence notebook** per member: problem personally diagnosed · one limitation found · one task performable without GenAI · three technical growth questions (worksheet §11)
- [ ] Record the proposal **action register** from panel feedback (§1 above) in `docs/` — status + evidence link per row, including incomplete items

---

## 3. Deliverable 1 — Working implementation

Ordered by dependency. Each feature's **Definition of Done**: tests green · evidence row on the board · diagram updated if it changes structure · report note · GenAI disclosure logged.

### 3.1 Slice A — ingestion reliability — *Haaniah*
- [ ] `tools/mock-vendor` replay harness: duplicate, out-of-order, delayed, missing-webhook, outage and replay sequences
- [ ] Normalisation of GitHub / Jira / Figma events into the common envelope
- [ ] Idempotency by stable `event_id` (duplicate → no-op, no duplicate finding)
- [ ] Per-resource checkpoints + reconciliation polling that synthesises gap events
- [ ] `SOURCE_STALE` marking past a configurable threshold, with dependent findings downgraded
- [ ] Immutable artifact/version store — snapshots never overwritten; a finding re-opened later still resolves to the version it cited
- [ ] Reliability state machine implemented per §8.4 (persist → dedupe → version guard → transactional apply → indexed rule dispatch → idempotent finding write → checkpoint advance)

### 3.2 Slice B — code/test evidence graph — *Mishal*
- [ ] Postgres property graph: `nodes`, `edges`, `artifact_snapshots`, indexes on `(from_id, type)` / `(to_id, type)`
- [ ] Deterministic linking from explicit references (Jira key in PR title/commit message, Figma URL/dev resource) + manual confirm/reject with resolver provenance
- [ ] Link eligibility gate: unconfirmed/inferred edges can exist but can never produce a decisive finding or notification
- [ ] TS/React analyser: base/head resolution, changed files + diff hunks with line ranges, changed/affected symbols via parsing, bounded import/call neighbourhood, test evidence (changed tests, tests referencing changed symbols, coverage where executable)
- [ ] Explicit unresolved markers for dynamic relations (runtime dispatch, dynamic imports, reflection) — never guessed edges
- [ ] Symbol cards (§1.6) produced by the analyser
- [ ] Traceability: `Requirement` entity, commit-pinned `CodeAnchor`, re-anchoring, broken-anchor marking (§1.3)
- [ ] Deterministic rules 1–2 (+ rule 3 supporting, P4 from §1.3) as versioned declarative records with triggers, guards, grace periods, severity, notify template, resolution options
- [ ] Indexed rule dispatch + reverse-index criterion invalidation with bounded hop count; incremental-vs-full equivalence test
- [ ] Role-edge notification resolution: bounded BFS (1–2 hops) over `OWNS` / `ASSIGNED_TO` / `WATCHES`

### 3.3 Slice C — verification and reviewer surface — *Abdullah*
- [ ] Deterministic context-packet builder with per-slot budgets, truncation manifest, byte-identical reproducibility
- [ ] Local model serving container (pinned model, tokenizer, quantisation, settings recorded per run)
- [ ] Bounded verifier loop (3 passes max) producing the structured output schema: `criterion_id`, `status`, `evidence[]`, `reason`, `missing_evidence`, `divergence_tag`, `model_and_run`
- [ ] **Verdict/provenance gate**: schema validation (malformed rejected, not leniently parsed), every citation resolved against the immutable packet, rule applicability + link eligibility + freshness + thresholds checked, downgrade to `INSUFFICIENT_EVIDENCE`/review with logged reason, provenance recorded
- [ ] Verdict semantics: four verdicts only; `freshness_state` / `review_required` / `reason_code` as separate fields
- [ ] Reviewer UI (Stitch project `Unified Dev Collaboration Hub`): change selection · relationship view (confirm/reject links) · criterion view · verification passes view · evidence case · drift/rule view · resolution + audit
- [ ] Findings lifecycle: acknowledge, resolve, dispute (dispute → labelled correction for the next adaptation round, respecting the split), suppress with reason, reopen
- [ ] Notification delivery adapter (Slack) — delivery only, never an input to reasoning

### 3.4 End-to-end scenario set *(integration tests, all three)*
- [ ] T1 explicit-reference chain resolves end-to-end
- [ ] T2/T3 Rule 1 positive + negative (cosmetic edit must not fire)
- [ ] T4/T5 Rule 2 positive + negative (mapped acceptable post-merge state must not fire)
- [ ] T6 Rule 3 positive + negative
- [ ] T7 duplicate / out-of-order delivery converges to one final state
- [ ] T8 simulated outage → `SOURCE_STALE` → reconciliation recovery
- [ ] T9 role routing correctness
- [ ] T10 fabricated-citation injection → gate downgrades, never shown as decisive (**this is the demo's failure case**)
- [ ] T11 incremental vs. full rescan equivalence
- [ ] Degraded mode: model server off → Rules 1–3 + unresolved-evidence reporting still work (§1.4)

---

## 4. Dataset validation package *(panel requirement — full spec in the action plan PDF)*

- [ ] **Phase 1 — protocol freeze**: merge proposal §12.3 + §28 into one authoritative protocol; freeze taxonomy (4 verdicts + `freshness_state` + `review_required` + `reason_code` + `origin`), case schema, eligibility gate, roles, split policy
- [ ] **Phase 2 — repository screening**: inspect 12–20 candidates; record language, licence, history, testability, documentation profile, acceptance/rejection reason → `01_repository_catalogue.csv`
- [ ] **Phase 3 — pilot**: construct 12–20 cases from ≥3 TypeScript/React repositories covering SUPPORTED / CONTRADICTED / PARTIAL / INSUFFICIENT_EVIDENCE; blind-label 10–15
- [ ] **Phase 4 — guide revision**: measure raw agreement + Cohen's κ (target ≥ 0.70) and span overlap (line/token F1 or IoU); rewrite guide and re-pilot if below gate; freeze annotation manual v1
- [ ] **Phase 5 — full construction**: training pool (200–500, later), development set (20–30), gold oracle (30–50, later), event-reliability suite (20–30 sequences, later); preserve `REAL / CONTROLLED_MUTATION / SYNTHETIC` origin
- [ ] **Phase 6 — audit and freeze**: automated integrity report (commits resolve, anchors in range, tests exist, packet completeness, citation validity, secret scan, duplicate detection, checksums), supervisor/external audit of 10–20% + all rare classes + all defence-demo cases, split manifest frozen
- [ ] **Phase 7 — evaluation**: freeze model/prompt/retrieval/thresholds; open gold test labels once; per-class results + confusion matrix + abstention + error analysis
- [ ] Split discipline enforced throughout: **by repository, never by example**; forks/templates stay together; controlled mutations inherit their source's split; synthetic data only from training repos; test set never used for prompts, few-shot, thresholds or model choice
- [ ] Roles enforced: case constructor ≠ primary annotator for that case; two blind annotators; adjudicator records decision + rationale; supervisor approves taxonomy and audits; no student validates their own subsystem's data
- [ ] Mid-checkpoint minimum evidence assembled (action plan §10): frozen taxonomy · eligibility checklist with ≥3 accepted repos · 12–20-case pilot · same-module hard negatives · ≥3 deliberate abstention cases · annotation manual with worked examples · two independent annotation files + preliminary κ · one documented adjudication · dataset card draft + split plan + integrity output · one end-to-end case from source artefact to gold verdict
- [ ] Dataset package files written: `01_repository_catalogue.csv` … `12_results/` per the action plan checklist
- [ ] Prepare the ten "questions the students must be able to answer" answers (action plan §11)

---

## 5. Deliverable 3 — Diagrams

`docs/diagrams/` — editable source committed (draw.io XML or Mermaid) + rendered PDF, each stamped with the commit it matches. Regenerate all at the evaluation tag.

- [ ] Layered architecture + trust boundary (adapter → reviewer surface) — *Abdullah* — proposal §8.1
- [ ] Component/interface diagram: API, worker, queue, DB, model server, external tools — *Abdullah* — §8.2
- [ ] **ERD** — nodes, edges, artifact_snapshots, events, checkpoints, requirements/anchors, criteria, findings — *Mishal* — §9.1/§9.9
- [ ] Data-flow / DFD of the full pipeline (webhook → … → reviewer UI) — *Abdullah* — §8.2
- [ ] Sequence diagram: ingestion with duplicate + out-of-order handling — *Haaniah* — §8.4
- [ ] State machine: event processing and finding lifecycle incl. `SOURCE_STALE` — *Haaniah* — §8.4/§11.7
- [ ] Use-case diagram for the four roles — *Mishal* — §1.1
- [ ] Domain/class model of graph entities and edge types — *Mishal* — §9.1
- [ ] Activity diagram: bounded verifier loop (pass 1 → 2 → conditional 3) into the verdict gate — *Abdullah* — §11.4/§11.8
- [ ] Traceability matrix: FR → design element → module → test case → demo step — *Abdullah maintains, all three feed* — worksheet §5
- [ ] Deployment/containers diagram (single-host Docker footprint incl. model server) — *Haaniah* — §14
- [ ] Requirement → code **anchor** illustration (commit-pinned, re-anchoring, broken state) — *Mishal* — §22
- [ ] LLM autonomy ladder / usage-register diagram (L0–L4 with fallbacks) — *Abdullah* — §24
- [ ] Final cross-check: every diagram matches the evaluation version and can be explained by its owner — *all three*

---

## 6. Deliverable 2 — Mid report (LaTeX)

Skeleton: `docs/F26 FYP1 Mid Report LaTeX/` — owner writes, the other two review each chapter before it is considered done. Rewrite proposal content; do not paste it (anti-plagiarism declaration applies).

- [ ] ch1 Introduction and Project Vision — *Abdullah*
- [ ] ch2 Research, existing solutions and gap (incl. dated CodeRabbit / Rovo trial notes — still to be gathered) — *Haaniah*
- [ ] ch3 Proposal feedback and iteration plan (action register table, iteration 1/2, WBS, progress vs. plan, recovery) — *Haaniah*
- [ ] ch4 Software requirements (use cases + use-case diagram, FR/NFR, acceptance criteria, traceability) — *Mishal*
- [ ] ch5 System design (architecture, components, interfaces, decisions, design evolution, domain model, data design, process/behaviour design) — *Abdullah + Mishal*
- [ ] ch6 Iteration 1: design and implementation — each writes their own subsection against real files/functions/algorithms — *all three*
- [ ] ch8 Testing and early validation (strategy, test cases, results, edge/failure case, **dataset pilot agreement stats**, defects, current validation status) — *Mishal*
- [ ] ch9 Project management and development evidence (work completed/remaining, per-member contributions, repo evidence, GenAI + external components, risks, security/privacy, limitations) — *Haaniah*
- [ ] ch10 Remaining FYP plan — *Abdullah consolidates*
- [ ] Front/back matter: students submission, anti-plagiarism, authors declaration, abstract, acknowledgments, executive summary, abbreviations — *rotation*
- [ ] Appendices: action register · requirements · test cases · repository · diagrams · meetings — *all three*
- [ ] `references/references.bib` maintained continuously; every research claim checked against its original source (worksheet §10)
- [ ] **Traceability of report ↔ implementation**: worksheet Form 3 evidence index filled (section/page → artefact → owner)
- [ ] Compile clean (pdflatex → bibtex → pdflatex ×2); figures and tables lists populated

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

- [ ] Which GPU/VRAM the group actually has (decides the model ceiling — §1.2)
- [ ] Whether live GitHub/Jira/Figma OAuth is obtainable now, or the mock/exported-data fallback leads (proposal §13.4 sanctions either)
- [ ] Diagram tooling of record (draw.io vs. Mermaid vs. TikZ) — one choice, one folder, everyone uses it
- [ ] Board of record and review rule (who reviews whom)
- [ ] Annotation tooling format for blind double-labelling (two files per case, no discussion before both submitted)
- [ ] Sign-off of the §16 ownership rows by all three members
