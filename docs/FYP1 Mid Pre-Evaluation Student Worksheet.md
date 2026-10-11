# **FYP 1 Mid Student Evidence Worksheet** 

### **Preparation for the supervisory presentation demo and report evaluations** 

_Complete as a group and submit with the FYP 1 mid report at least 48 hours before the evaluation meeting_[cite: 1]

**Purpose.** This worksheet helps the group prepare verifiable evidence for the two handbook instruments used at the FYP-1 mid stage: Form 2 for the presentation and live demo, and Form 3 for the mid report. It supports the official forms; it does not replace the prescribed mid report or the supervisor's official assessment.[cite: 1]

**What the handbook now requires.** The presentation/demo and the report are each assessed on a separate 100-mark rubric. Do not treat this worksheet as a request for extra features. Use it to show that the approved scope, current implementation, design, tests, repository history and report agree with one another.[cite: 1]

**Use of GenAI and other tools.** You may use GenAI to support literature search, coding, design, report drafting, testing and related work. For every materially assisted artefact, disclose the applicable assistance level, identify what entered the project, distinguish the student's own contribution, explain how the output was verified or corrected, and retain evidence. Every member must be able to explain and modify the work attributed to them.[cite: 1]

## **Submission package** 

| Completed editable worksheet ☐ | FYP 1 mid report in the prescribed format ☐ |
|---|---|
| Proposal panel comments and action register ☐ | Supervisor has repository access ☐ |
| Stable evaluation commit or release tag ☐ | Runnable live prototype or build ☐ |
| Design artefacts connected to implementation ☐ | Tests or validation outputs for the completed module ☐ |
| Task log and member ownership evidence ☐ | GenAI register, prompt journal and external dependency disclosures ☐ |

## **Project identification** 

| **Project ID** | FYP1 project identifier not present in the repository; registration-record entry required |
|---|---|
| **Project title** | UNIFY — Cross-Tool Change Assurance for Product Teams |
| **Panel number** | Not assigned in the repository |
| **Supervisor** | Dr. Ali Zeeshan Ijaz |
| **Evaluation date** | 12 October 2026; exact scheduled time is not present in the repository |
| **Repository** | https://github.com/abdullahamin231/fyp |
| **Evaluation version** | `ce0ae2cc3c7bac61ecded081eba52670453673da` (`ce0ae2c`, 12 Oct 2026); final tag pending |

**Runnable artifact** 

Runnable artifact: Next.js web application in `apps/web`; worker service in `apps/worker`; local setup and demo commands are documented in the repository READMEs and integration testing guide.

#### **Group members** 

| **Member** | **Registration number** | **Repository identity** | **Current technical ownership** |
|---|---|---|---|
| Abdullah Amin | 23i-0691 | `abdullahamin231` | Verifier loop, packet builder, verdict/provenance gate, analyser support and architecture diagrams |
| Haaniah Ismail | Registration number not present in repository | Repository username/email not present in repository | GitHub/Jira/Figma integrations, normalized events, OAuth/webhooks, reliability and report evidence |
| Mishal Fatima | i230776 | `mishalfatima09` | Evidence graph, linking, change analyser, rules, dataset validation and requirements/traceability |

## **1 Official evaluation map** 

Use these tables as a preparation map. Students do not award marks. The supervisor scores the official criteria after reviewing the report and observing the live evaluation.[cite: 1]

**Form 2 Presentation and Demo Evaluation**[cite: 1]

| **Official criterion** | **CLO** | **Max** | **Evidence the student submission must make easy to verify** |
|---|---|---|---|
| Previous proposal actions addressed | FYP1-CLO6 | 10 | Panel action register shows each required change, status and evidence link. |
| Iteration plan and work breakdown progress | FYP1-CLO2 | 10 | Planned milestone completed, or delay is justified with a recovery plan. |
| Live prototype with core module demo | FYP1-CLO4 | 25 | Meaningful module works live; not only screenshots or video. Edge/failure case shown if possible. |
| Requirements and acceptance criteria quality | FYP1-CLO2 | 10 | User interactions, FRs/NFRs and acceptance checks are technically correct and aligned with scope. |
| Design artefacts and design evolution | FYP1-CLO3 | 15 | Architecture plus data/process/behavior artefacts connect to implementation; changes since proposal are justified. |
| Repository, milestone and member evidence | FYP1-CLO6 | 10 | Tagged code, commit timeline, task log and member ownership are visible. Commit count alone is not enough. |
| Testing and early validation | FYP1-CLO4 | 10 | Tests/validation checks exist for the current module; one failure/edge case is discussed. |
| Team dynamics and tool ownership | FYP1-CLO5 | 10 | Team coordination and tool-assisted outputs are defended. |
| **Total** | | **100** | Prepare traceable evidence for every criterion. |

#### **Form 3 Report Evaluation**[cite: 1]

| **Official criterion** | **CLO** | **Max** | **Evidence the student submission must make easy to verify** |
|---|---|---|---|
| Report format and required artefacts present | FYP1-CLO2 | 5 | Prescribed format followed; required sections and artefacts included. |
| Problem formulation, R&D and existing solution analysis | FYP1-CLO1 | 15 | Report shows what was studied, what gap remains and what complex challenge is addressed. |
| Project vision, scope, modules and success criteria | FYP1-CLO2 | 10 | Scope, modules, success criteria and feasibility are clear and consistent with approval. |
| Requirements and acceptance criteria | FYP1-CLO2 | 15 | User interactions, FRs/NFRs and acceptance checks are precise and testable. |
| Architecture and component/interface design | FYP1-CLO3 | 15 | Architecture, components, dependencies and interfaces are clear and justified. |
| Data/process/behavior design | FYP1-CLO3 | 10 | Appropriate ERD/schema/data flow/activity/sequence/state diagram included and explained. |
| Implementation documentation of completed module | FYP1-CLO4 | 15 | Completed module described with setup, main files/classes/functions and technical decisions. |
| Testing/validation plan and tool/risk disclosure | FYP1-CLO5 | 15 | Test plan, early results, external dependency disclosure, risk/security/privacy and limitations documented. |
| **Total** | | **100** | Prepare traceable evidence for every criterion. |

## **2 Proposal action register** 

Include every required modification from the proposal decision. Do not list only the changes that are already complete.[cite: 1]

| **Panel comment or required change** | **Decision and rationale** | **Owner** | **Status** | **Evidence link** | **Next action and date** |
|---|---|---|---|---|---|
| Reduce PM involvement in the verification loop | Accepted: automate evidence gathering and bounded verification while retaining human review for conflicts, abstentions and policy decisions | Abdullah, with all members | Complete for the Iteration 1 design; final live rehearsal remains | Verifier loop, verdict gate, reviewer findings; `apps/worker/src/verifier/`; Ch. 6 | Demonstrate normal, critic, abstention and failure paths; final rehearsal by evaluation |
| Research which LLM and resources to use | Accepted: keep the model behind a typed local client seam and record model/run metadata; do not claim hosted-model use in the committed slice | Abdullah | In progress | `apps/worker/src/model/`; Ch. 6 and Ch. 9 limitations | Benchmark local candidates for latency, memory and quantisation before final evaluation |
| Add traceability to the project | Accepted: trace criteria through graph edges, packets, citations, verdicts and report matrix entries | Mishal, with Abdullah | Partially complete; requirement anchors remain planned | `docs/traceability/`; `packages/contracts/src/gate.ts`; `apps/worker/src/packet/` | Complete FR-22–FR-24 anchors and regenerate the matrix |
| Document LLM use, capacity and required models | Accepted: classify GenAI assistance by artefact and separate model assistance from the product's local verifier model | All; Haaniah coordinates register | Complete for current artefacts; final model benchmark open | `docs/genai_register.md`; worksheet Section 10; model seam | Add measured resource results and freeze the model configuration |
| Validate the dataset and annotation process | Accepted: use blind annotation, adjudication and agreement metrics before relying on the dataset | Mishal, with Abdullah and Haaniah annotators | Pilot complete; supervisor/final validation remains | `docs/dataset/`; κ 0.90 pilot; adjudication log | Finish audit and freeze the evaluation set before final evaluation |
| Treat comments as semantics and restrict scope to explainable code | Accepted: analyze projects with meaningful names, comments, filenames and directory structure; disclose failure outside that scope | Haaniah and Mishal | Implemented as a documented scope assumption; broader validation remains | `apps/worker/src/analyser/`; Ch. 4/6 scope and limitations | Add representative fixtures and measure analyser failures on unsuitable code |
| Positive panel assessment and use of LLMs for large-code design | Accepted: preserve the approved direction while making context management, model boundaries and validation explicit | All | Addressed in architecture, verifier, dataset, GenAI and report sections | Ch. 5/6/8/9; `docs/genai_register.md`; packet builder and analyser | Demonstrate the bounded context pipeline and record final model/resource evidence |

#### **Proposal response summary** 

| **Actions completed** | The team implemented a bounded verifier and reviewer gate, added traceability artefacts, established the GenAI register and model seam, ran a dataset agreement pilot, documented semantic-code scope assumptions, and added real GitHub/Jira/Figma integration code with replay guidance. |
|---|---|
| **Actions still open** | Final model resource benchmark, requirement-anchor implementation, supervisor audit of the dataset, live provider rehearsal, and final report/tag review remain before the FYP 1 final evaluation. |
| **Scope consequence** | Approved scope is clarified, not expanded: the system remains read-only and evidence-preserving, while its analysis scope is limited to codebases with sufficiently semantic names, comments, filenames and directory structures. |
| **Supervisor-approved exceptions** | None recorded in the repository; outstanding items are tracked as planned validation rather than silently treated as complete. |

## **3 Iteration plan and work breakdown progress** 

| **Planned milestone or work package** | **Owner** | **Planned date** | **Current state** | **Evidence** | **Variance and recovery action** |
|---|---|---|---|---|---|
| Live provider source adapters and event reliability | Haaniah | 11 Oct 2026 | Partial: implementation complete, live validation pending | `c95df34`; adapters, OAuth/webhook routes, migration `00010` | Configure provider apps/secrets and run the documented live rehearsal before final evaluation |
| OAuth onboarding and encrypted connection persistence | Haaniah | 11 Oct 2026 | Complete in code; deployment/configuration rehearsal pending | Signed state, callbacks, AES-256-GCM storage; `c95df34` | Verify all three callbacks with real provider apps and rotate test credentials |
| Webhook normalization, replay and duplicate safety | Haaniah | 11 Oct 2026 | Partial: route guards and uniqueness implemented; fixture/live execution pending | Raw-body verification, 10 MiB limit, delivery receipts, `docs/INTEGRATION_WEBHOOK_TESTING.md` | Run positive, invalid-auth, duplicate, ignored-event and oversized-payload cases |
| Verification loop, packet builder and verdict gate | Abdullah | 9 Oct 2026 | Complete in code; final edge-case rehearsal pending | `a037d16`; worker/contract tests; Ch. 6 Abdullah section | Run the targeted worker and contracts suites and record final output |
| Evidence graph, linking and change analyser | Mishal | 11 Oct 2026 | Complete for pilot scope; anchors and external-review rerun remain | `9a376c7`, `1808fe9`, `fcaaf76`, `3171080`; TC-10–TC-22 | Finish FR-22–FR-24 anchors and final validation set |
| Dataset validation, GenAI disclosure and report evidence | Mishal/Haaniah | 11 Oct 2026 | Pilot and report evidence drafted; audit/final review pending | `docs/dataset/`; `docs/genai_register.md`; Chapters 3, 6, 9 | Complete supervisor audit, own-words review and report compilation |
| Architecture and design artefacts | Abdullah/Haaniah/Mishal | 11 Oct 2026 | Core diagrams and schema exist; final wiring review pending | `docs/F26 FYP1 Mid Report LaTeX/diagrams/`; traceability matrix | Compile diagrams/report and resolve remaining cross-reference issues |

| **Iteration objective** | Deliver a replayable source-ingestion boundary and production-shaped read-only integrations for GitHub, Jira and Figma, while preserving raw-payload authenticity, normalized events and duplicate safety. |
|---|---|
| **Objective status** | Partially met: implementation and documentation are committed; live OAuth/webhook execution, provider rate-limit checks and concrete reconciliation polling remain outstanding. |
| **Critical blocker** | No code blocker. External provider credentials, HTTPS tunnel, Supabase migration application and dependency installation are required for live validation. |
| **Recovery plan** | Haaniah: configure provider apps and environment variables, apply migration `00010`, run the three-provider guide and add recorded results. Team: review report claims and freeze an evaluation commit after the live rehearsal. |
| **Next iteration outcome** | A demonstrable provider-to-event persistence path for GitHub, Jira and Figma, with replay fixtures for failure cases, verified delivery idempotency, and documented reconciliation behavior for missed vendor deliveries. |

## **4 Live prototype and core module** 

| **Core module** | Verifier loop / context packet / verdict gate |
|---|---|
| **Why it is meaningful** | Central to the approved problem: enables automated verification of findings with a deterministic verdict gate, not a peripheral UI feature |
| **Input** | Verification requests (packetized), model state, finding data from Supabase verification queue |
| **Processing** | Verifier loop iterates over findings, applies verdict gate enums/rules, produces provenance-tagged verdicts; core algorithm = type-system analyser |
| **Output** | Verdict (proven/ordered/reviewed) per finding, stored in verification queue with evidence graph links |
| **Dependencies** | Supabase verification queue, contracts gate/enums, worker packet builder, type-system analyser (TS) |
| **Known limitations** | Verdict gate depends on complete type analysis; edge cases with unresolved type ambiguity may require manual review |

#### **Implementation boundary** 

| **Component** | **Implemented and integrated** | **Mocked or substituted** | **Evidence** | **Plan to remove substitute** |
|---|---|---|---|---|
| _Client or interface_ | Web review UI (apps/web/src/components/conflict-detail/) | None | Commit d2d7d0c; rendered diagrams | Not applicable — interface is the implemented frontend |
| _Backend or service_ | Supabase verification queue (migrations 00013, 00014) + worker service | None | Commit a037d16; Supabase migrations | Not applicable — backend is fully implemented |
| _Core algorithm or model_ | Type-system analyser (packages/contracts/src/gate.ts, apps/worker/src/model/) | None | Commit a037d16; 68 files changed including verdict gate and model seam | Not applicable — core algorithm is fully implemented |
| _Data or external dependency_ | GitHub, Jira Cloud and Figma read-only OAuth/webhook connections; normalized events persisted to Supabase | Fixture/replay payloads remain the fallback until live provider credentials and tunnels are configured | Commit `c95df34`; `docs/INTEGRATIONS.md`; `docs/INTEGRATION_WEBHOOK_TESTING.md`; migration `00010_integrations.sql` | Configure provider OAuth apps and webhook secrets, run the documented live rehearsal, then add reconciliation/polling coverage for delivery gaps |

#### **Live demonstration plan** 

| **Step** | **Action** | **Expected result** | **Evidence visible** | **Presenter** |
|---|---|---|---|---|
| 1 | Start OAuth from onboarding for GitHub, Jira and Figma | Provider authorization opens with a signed, workspace-bound state; callback stores encrypted access/refresh tokens without returning them to the browser | Browser redirect; `apps/web/src/app/api/integrations/[provider]/authorize/route.ts` and `callback/route.ts`; `integration_connections` | Haaniah |
| 2 | In `apps/worker`, run `npm run demo:linking -- --live`: five pull-request events through the real linker on the hosted Supabase project | Outcomes printed in order: `linked`, `no_key`, `unknown_key`, `duplicate_event`, `already_linked`; afterwards `edges` holds one `TRACKS` edge (observed, confidence 1.0, resolver `explicit-reference`) and `events` holds four rows | Terminal log; `edges` and `events` tables in the Supabase dashboard | Mishal |
| 3 | Run `npm run analyse:evaluate` on the 15 pilot cases, then open the symbol card for pilot P01 (react-hook-form, `createFormControl.clearErrors`) | Scores printed: files 29/29, changed tests 14/14, changed named symbols 11/11, unchanged not flagged 21/21, one known miss (P06-S3); card shows name, signature, JSDoc, imports, callers and commit message | Terminal output; card text; `test/analyser-packet.test.ts` showing the card admitted to a packet (TC-22) | Mishal |
| 4 | Send a signed GitHub `pull_request` or `push` delivery to the workspace webhook | Raw-body HMAC verification succeeds; one immutable delivery receipt and one normalized event are persisted, including repository and base/head SHA data for PRs | Tunnel/provider delivery log; `integration_deliveries`; `events`; `apps/web/src/app/api/webhooks/[provider]/[workspaceId]/route.ts` | Haaniah |
| 5 | Send a signed Jira issue update containing `changelog.items[]` | The normalized event records the issue reference and the status transition from the changelog without a second issue read | Provider delivery log; `integration_deliveries`; `events`; Jira adapter in `apps/web/src/lib/integrations/adapters.ts` | Haaniah |
| 6 | Send Figma `FILE_VERSION_UPDATE` and `DEV_MODE_STATUS_UPDATE` payloads, then replay one delivery | Named-version/dev-mode events are normalized; duplicate delivery is a no-op; `FILE_UPDATE` is ignored | Provider delivery log; `events`; Figma adapter and uniqueness constraints | Haaniah |

#### **Normal edge and failure cases** 

| **Case** | **Input or condition** | **Expected behavior** | **Latest result** | **Evidence** |
|---|---|---|---|---|
| Normal | PR titled, branched and committed with `UNI-123`, an ingested Jira ticket | One `TRACKS` edge PR → ticket, `observed`, confidence 1.0, resolver `explicit-reference`; all three places the key appeared stored as provenance | Pass (local test and live run on Supabase, 11 Oct) | TC-11; `apps/worker/test/link-pull-request.test.ts`; demo step 2 |
| Edge | (a) PR that names no key; (b) the same webhook delivery sent twice | (a) Event and PR node stored, no edge; (b) second delivery writes nothing, because the unique `(source_tool, vendor_delivery_id)` insert returns no row | Pass: `no_key`, `duplicate_event`; one event row and one edge | TC-12, TC-14; demo step 2 |
| Failure | PR naming `UNI-999`, a key with no ticket (title also contains `UTF-8`) | No edge and no placeholder ticket node; key kept on the event for later re-resolution; `UTF-8` rejected by the project allow-list | Pass: `unknown_key`; node count rises by one (the PR only). Atomicity also tested: a failure injected on the edge insert rolls back the event and PR node (TC-15) | TC-13, TC-15; demo step 2 |
| Normal | Valid GitHub, Jira or Figma webhook with the configured secret/passcode | Provider authenticity is checked against the raw body or payload passcode, then the event is normalized and persisted | Implemented in the route and adapters; live provider execution remains pending | `c95df34`; `docs/INTEGRATION_WEBHOOK_TESTING.md` |
| Edge | Duplicate delivery, ignored Figma `FILE_UPDATE`, or Jira update without a status changelog item | Duplicate receipt is acknowledged without a second event; ignored Figma event produces no normalized version event; Jira event remains valid without inventing a transition | Implemented by delivery uniqueness and provider event filters; live replay remains pending | `00010_integrations.sql`; `apps/web/src/lib/integrations/adapters.ts` |
| Failure | Invalid signature/passcode or request body over 10 MiB | Request is rejected before JSON normalization or persistence | Implemented route guards; numeric live response not yet recorded | Webhook route; `docs/INTEGRATION_WEBHOOK_TESTING.md` |

## **5 Requirements scope and acceptance evidence** 

| **Problem and primary users** | A reviewer deciding whether one pull request still matches the intent it claims to implement has to check the tracker, the design tool, the diff and the tests by hand, from memory, and no record of the evidence survives the merge, so mismatches surface late (Ch. 1 §1.2). Primary users: code reviewers and developers; secondary: product managers and designers who own the criteria and designs (Ch. 4 Table 4.1). |
|---|---|
| **Current scope** | Committed system (Ch. 1 §1.6): read-only ingestion from GitHub, Jira Cloud and Figma through OAuth/webhooks; deterministic and manually confirmed linking; immutable versioned artifact store; typed evidence graph with provenance; Rules 1–3 and P4; code and test analysis for Python and TypeScript/JavaScript; criterion decomposition and deterministic context packets; bounded local verifier; verdict and provenance gate; reviewer interface. **Iteration 1 boundary:** verification pipeline and gate with a stub model, deterministic PR→ticket linker, change analyser, replayable ingestion engine, reviewer UI, and the live provider adapter/webhook implementation. Live provider credentials, tunnel execution, reconciliation polling and final end-to-end provider-to-graph rehearsal remain release-gate validation tasks. |
| **Explicit exclusions** | Autonomous code generation or repair; any claim of general program correctness; languages beyond Python and TypeScript/JavaScript; open-ended chat with the system; write-back to source tools; hosted model APIs in the committed system; pixel-level design certification; integrations beyond GitHub, Jira and Figma (Ch. 1 §1.6). Repository code quality is out of scope beyond the documentation-quality warning of FR-27 (Ch. 4). |
| **Success criteria** | Project targets (Ch. 1 §1.9): explicit-reference link precision ≥ 0.95; evidence recall@5 ≥ 0.90; contradiction precision ≥ 0.90; unsupported confident assertions ≤ 2%; provenance completeness 100%; correct abstention ≥ 80%; convergence under duplicate/out-of-order delivery 100%; incremental = full evaluation ≥ 99%; annotator agreement above the stated threshold. **This iteration:** each built component covered by automated tests (worker 76/76, contracts 115/115); dataset pilot κ ≥ 0.70 (achieved 0.90); analyser matches the pilot cases (TC-17); linker runs live on the hosted database. |

| **ID** | **User interaction or requirement** | **Type** | **Acceptance criterion** | **Status** | **Evidence** |
|---|---|---|---|---|---|
| R1 | FR-04: link a PR to a ticket from explicit keys in its title, branch and commits, recording the resolver | FR | Normal, no-key, unknown-key and duplicate cases give the specified outcome; precision ≥ 0.95 on the labelled oracle sample | Partial: deterministic linking built and live; manual links, design-URL links and oracle precision not done | TC-10 to TC-15; live run 11 Oct; demo step 2 |
| R2 | FR-06: extract the base/head diff, changed symbols, bounded callers and candidate test evidence for Python and TypeScript/JavaScript | FR | For a labelled PR, extracted files, symbols and tests match the gold expectation | Partial: matches 14 of 15 pilot cases fully (one miss in `package.json`); Python on synthetic repositories only | TC-17, TC-18; demo step 3 |
| R3 | FR-25: symbol card with qualified name, signature, docstring, leading comments, path tokens, imports, callers and introducing commit message | FR | Each indexed symbol has a card with every listed field | Partial: cards for every changed symbol; whole-repository indexing not built | TC-18; P01 card (Ch. 6 §6.4.1) |
| R4 | Analyser output reaches the verifier's input (FR-06 → FR-08 hand-off) | FR | Analyser nodes placed in the graph fill the diff-hunk, symbol-card and test-evidence slots of a packet | Met for the hand-off (test, not live) | TC-22 |
| R5 | NFR-01 (linking slice): duplicate delivery creates no duplicate event or edge | NFR | Same delivery twice → one event row, one edge; repeated mention of a linked key → no new edge | Partial: met for the linker; findings and out-of-order delivery belong to the ingestion engine (TC-21) | TC-14 |
| R6 | NFR-07: p95 analysis time per PR under 60 s (provisional) | NFR | Timed over the pilot cases on the declared hardware | Partial: analyser median 0.3 s, max 4 s; model inference not measured | TC-17 |
| R7 | NFR-09/NFR-10 (linking and publishing): graph writes only through the service-role key; repository code executed only on explicit request | NFR | `anon` and `authenticated` roles refused; test runs only with `--run-tests`, in a throwaway worktree; integration credentials remain server-only and encrypted | Partial: met for linker/analyser and implemented for integration credential/webhook boundaries; provider scope and live egress review remain pending | TC-15; `run-tests.ts`; `c95df34` |
| R8 | FR-22/FR-23: requirement entities with commit-pinned anchors, re-anchored after each commit | FR | Anchor stores every field; scripted moves/renames/deletion re-anchored or marked broken; survival rate reported | Deferred to FYP-II: designed only (domain model, anchor diagram) | Ch. 5 Fig. anchor; Ch. 4 status paragraph |

#### **Requirement traceability** 

| **Requirement** | **Design element** | **Implementation** | **Test or validation** | **Demo step** | **Owner** |
|---|---|---|---|---|---|
| FR-04 | Domain model: typed edges with provenance; ERD `nodes`/`edges`/`events` | `apps/worker/src/linking/extract-keys.ts`, `link-pull-request.ts`; `supabase/migrations/00015_link_pull_request_event.sql` | TC-10 to TC-15: 16/16 pass; live run 11 Oct | Step 2 | Mishal |
| FR-06 | `CodeSymbol`, `TestCase` entities; analyser component (Ch. 5 Architectural Components) | `apps/worker/src/analyser/analyse.ts`, `parse.ts`, `parse-python.ts`, `git.ts` | TC-17: files 29/29, symbols 11/11, unchanged 21/21 | Step 3 | Mishal |
| FR-25 | Symbol card (proposal §26.1) | `apps/worker/src/analyser/payloads.ts` (`symbolCard`) | TC-18; P01 card | Step 3 | Mishal |
| FR-06 → FR-08 | `IMPLEMENTS`, `COVERS`, `PART_OF` edges; packet slots | `payloads.ts` edges; `publish.ts` + `00016_publish_analysis.sql`; `packet/providers/graph.ts` (Abdullah) | TC-22: both runs as expected | Step 3 → Abdullah's packet step | Mishal, Abdullah |
| FR-28 | UC-02 two-threshold link policy | `packages/contracts/src/gate.ts`; `apps/worker/src/graph/nodes.ts` (`loadLinkPolicy`) | Worker e2e gate test: below-band link holds the verdict | Abdullah's gate step | Mishal (req.), Abdullah (gate) |
| NFR-01 (linking) | Unique `(source_tool, vendor_delivery_id)`; partial unique index on current edges (00010) | `00015_link_pull_request_event.sql` steps 1 and 4 | TC-14 | Step 2 | Mishal |
| FR-22 / FR-23 | Requirement entity; `CodeAnchor` on `SATISFIES`; anchor and re-anchoring diagram | Not implemented | — (FYP-II) | — | Mishal |

## **6 Design artefacts and design evolution** 

| **Artefact** | **Purpose** | **Version or date** | **Implementation connection** | **Change since proposal** | **Rationale** |
|---|---|---|---|---|---|
| _Architecture_ | Layered architecture separating web client, Supabase persistence, worker analysis/verifier and provider adapters | Commit `d2d7d0c`; architecture diagrams | `apps/web/`, `apps/worker/`, `packages/contracts/`, `supabase/`, `apps/web/src/lib/integrations/` | Live integrations and evidence graph were added after the initial mock boundary | Clear boundaries keep provider authentication, deterministic analysis and verdict admission independently testable |
| Data/schema/ERD | Relational schema for the evidence graph, events, snapshots, packets and findings | `diagrams/erd.tex`, 7 Oct; migrations up to 00016 (11 Oct) | `supabase/migrations/`: one `nodes` table with a type discriminator, one `edges` table with source class, confidence, resolver and validity; append-only `events` with unique delivery id; 00015 (linking RPC) and 00016 (publish RPC) write to these tables | Requirement entity and anchor added; storage frozen as relational (Ch. 5 §5.5) | Type-agnostic traversal needs one node table; uniqueness constraints make duplicate processing a database no-op instead of relying on worker logic |
| _Process/data flow_ | Shows provider delivery through authentication, normalization, idempotent persistence, graph linking, packet construction and verdict review | `diagrams/dfd.tex`; Ch. 5; integration guide | Webhook route, adapters, `events`, graph/linking RPC, packet builder and verifier gate | Extended the original mock ingestion flow to real OAuth/webhook provider boundaries | Raw-body verification and immutable receipts preserve provenance before downstream processing |
| _Behavior/state/sequence_ | Event lifecycle, source freshness and finding lifecycle state machines; sequence from provider delivery through verification persistence | `diagrams/06_state_machines.tex`; Chapter 5 behavior/process material | Event received → authenticated → normalized → deduplicated → persisted; stale/missing deliveries remain reviewable and reconciliation is the recovery path | Haaniah | Partially wired; final diagram compilation and live sequence rehearsal pending |
| Project-specific: requirement-to-code anchor and re-anchoring | Shows how a requirement stays linked to the code that satisfies it as the code moves (FR-22 to FR-24) | `diagrams/anchor-reanchoring.tex`, 7 Oct | Designed only; the analyser already produces the per-symbol fields an anchor needs (qualified name, line range, content, commit) | New since the proposal defence | Panel asked for requirement-to-code traceability; anchors are pinned to a commit so a verdict can be re-read against the code it cited. The example in the figure is invented and says so |

#### **Architecture and interface decisions** 

| **Decision** | **Alternatives considered** | **Chosen option** | **Trade-off** | **Evidence** |
|---|---|---|---|---|
| Architecture selection | Monolithic vs modular vs micro-service | Modular architecture with clear component boundaries | Lower complexity, easier testing and future extension | Commit d2d7d0c (five diagrams); layered-arch.tex |
| Interface contract design | RPC vs event-driven vs graph-based | Event-driven packet protocol (verifier loop / verdict gate) | Better separation of concerns, deterministic verdicts | Commit a037d16 (verdict gate, contracts); packages/contracts/src/ |
| Data access pattern | Direct DB queries vs repository pattern vs CQRS | Repository pattern with Supabase RLS | Type-safe data access, security via RLS | Commit a037d16 (Supabase migrations 00013, 00014); worker model |
| Client-server boundaries | Tightly coupled vs API gateways vs edge functions | Frontend (Next.js) calls Supabase directly | Simpler deployment, direct data ownership | Commit d2d7d0c (web frontend); apps/web/next.config.ts |
| Diagram coordination | Separate diagrams per owner vs single unified diagram | Five core diagrams (arch, components, DFD, verifier loop, autonomy ladder) | Clear ownership, traceability, avoids divergence | Commit 7abdfc7 (consolidate diagrams); d2d7d0c (Abdullah's five diagrams) |

## **7 Repository milestone member and team evidence** 

Commit count alone is not enough. Show what each member designed, implemented, tested, reviewed or integrated and how the work relates to the iteration plan.[cite: 1]

| **Work item** | **Owner** | **Task or issue** | **Commit PR or tag** | **Files or artefact** | **Review/test evidence** | **State** |
|---|---|---|---|---|---|---|
| Deterministic PR → ticket linker | Mishal | FR-04; checklist "Graph tables + deterministic linking" | `9a376c7`, `6a7998e`; PR #21 | `apps/worker/src/linking/`; migration 00015 | 16 tests (TC-10 to TC-15); live run on Supabase | Merged; webhook pending (D-09) |
| Change analyser (TS, Python, coverage, publish) | Mishal | FR-06, FR-25 | `1808fe9`, `fcaaf76`; PR #22 | `apps/worker/src/analyser/`; migration 00016 | 18 tests (TC-18); pilot evaluation (TC-17); P01 coverage (TC-19) | Merged |
| Analyser → packet hand-off | Mishal (with Abdullah's packet builder) | D-11 | `3171080`; PR #25 | `payloads.ts`; `test/analyser-packet.test.ts` | TC-22 | Merged |
| Dataset pilot, adjudication, external review analysis | Mishal | Panel action: dataset validation | `66e85c7`, `aaeb6f1`; PRs #5, #10 | `docs/dataset/`; `tools/agreement_multi.py` | 138 integrity checks; κ 0.90; external α 0.48 (pilot) | Pilot done; re-run open (D-08) |
| Report: Ch. 4, Ch. 6 §6.4.1, Ch. 7, four diagrams | Mishal | Report chapters | `33b00e7`, `8fe18d6`, `b6f71c7`, `6c8aca3` | `docs/F26 FYP1 Mid Report LaTeX/` | Report compiles; numbers re-run 11 Oct | Drafted; own-words review pending |
| Live provider integrations and source reliability | Haaniah | FR-01, FR-02, FR-16; source-adapter and webhook checklist | `c95df34` | `apps/web/src/lib/integrations/`; `apps/web/src/app/api/integrations/`; `apps/web/src/app/api/webhooks/`; migration `00010_integrations.sql` | OAuth state signing, encrypted token storage, raw-body verification, delivery idempotency and normalization are implemented; live provider run remains pending | Implemented; live validation pending |
| Report evidence and integration documentation | Haaniah | Chapters 3, 6 and 9; integration setup/test evidence | `de5c1ff`, `45e5ed7`, `c95df34` | `docs/F26 FYP1 Mid Report LaTeX/chapters/`; `docs/INTEGRATIONS.md`; `docs/INTEGRATION_WEBHOOK_TESTING.md` | Evidence checked against git history and implementation; provider test guide records required environment and tunnel setup | Drafted; final review and live rehearsal pending |
| Evaluation tag | All | Final evaluation freeze | `45e5ed7` (current evidence baseline) | Repository history and report chapters | No release tag has been created yet | Pending final review |
| **Evaluation tag** | **or commit** | | `ce0ae2cc3c7bac61ecded081eba52670453673da`, 12 Oct 2026 | | | Final release tag to be created after report review |

| **Task tracking method** | Shared `TODO.md`, worksheet action register, pull requests, commit history and report evidence tables; ownership is tracked by artefact and technical responsibility, not commit count alone. |
|---|---|
| **Review practice** | Each member reviews the artefacts they own and the other members challenge integration boundaries, report claims and test evidence. Corrections are recorded in commits, test changes, the GenAI register, report limitations and the worksheet. |
| **Large or late commits** | The integrations work was consolidated in `c95df34` because it crossed adapters, OAuth routes, webhook ingress, persistence and onboarding. The verifier work was also broad in `a037d16`; the worksheet reports these as multi-file feature milestones rather than presenting commit size as individual proof. |
| **Integration responsibility** | Haaniah integrated provider adapters and web routes with the existing Next.js/Supabase codebase; Abdullah integrated the verifier, packet and gate path; Mishal integrated graph linking, analysis and packet evidence. Conflicts were resolved by preserving shared contracts and recording boundary decisions in documentation and commits. |
| **Team coordination evidence** | Ownership tables in the README/TODO, pull requests, commit history, the worksheet, `docs/genai_register.md`, traceability matrix and report chapter evidence provide the retained coordination record. |

## **8 Testing and early validation** 

| **Test or validation ID** | **Requirement/module** | **Method and data** | **Expected result** | **Actual result** | **Evidence** | **Owner** |
|---|---|---|---|---|---|---|
| TC-10 | FR-04 key extraction | Vitest, `test/extract-keys.test.ts`: titles, branches and commits incl. `[UNI-7]`, `uni-123`, `XUNI-1`, `UNI-0123`, `UTF-8`, `SHA-256` | Real keys found once with location; lookalikes rejected | Pass 6/6 | Test file | Mishal |
| TC-11 to TC-15 | FR-04, NFR-01 linker | Vitest on PGlite with the project's real migrations: normal, no key, unknown key, duplicate, atomicity, roles | Outcomes as in §4; rollback on injected failure; `anon`/`authenticated` refused | Pass 10/10; same five outcomes live on Supabase | `test/link-pull-request.test.ts`; live log | Mishal |
| TC-17 | FR-06 analyser | `npm run analyse:evaluate` on 15 pilot cases (3 repositories), scored against the case files | Every changed file/test/symbol found; no unchanged symbol flagged | Files 29/29, tests 14/14, symbols 11/11, unchanged 21/21; 1 miss (P06-S3); median 0.3 s | Command output | Mishal |
| TC-18 | FR-06, FR-25 | Vitest on throwaway git repositories: nesting, added/deleted symbols, callers, dynamic code, Python, coverage, publish | Each behaviour as specified | Pass 18/18 | `analyser.test.ts`, `analyser-extras.test.ts` | Mishal |
| TC-19 | FR-06 test evidence | react-hook-form regression test for P01 run with Jest coverage via `--run-tests` | Changed lines executed by the test | Pass: changed lines 1/1 and 1/1 | Command output | Mishal |
| TC-22 | Analyser → packet | Real analyser output → production `GraphEvidenceProvider` → `buildPacket`; control without `IMPLEMENTS` edges | All three slots filled; control only diff hunks | Pass, both runs | `test/analyser-packet.test.ts` | Mishal |
| TC-06 | Evaluation data | `agreement.py` on two blind annotation sheets, 15 cases | κ ≥ 0.70 gate | Pass: verdict κ 0.90; 7 disagreements adjudicated | §7.5; adjudication log | Mishal (adjudicator) |
| TC-16 | Evaluation data | `agreement_multi.py` on 10 external reviewers' sheets, 2 per case | Krippendorff α per field and agreement with reference | 19/22 decisive judgements match; α 0.48 (95% CI 0.08–0.80): inconclusive pilot | §7.6 | Mishal |
| INT-01 | FR-01, FR-02, FR-16 | Provider adapter normalization and webhook route review for GitHub, Jira and Figma; raw-body/signature or passcode path, delivery receipt and event upsert | Authenticated supported events normalize to the shared event shape and persist once; unsupported events are ignored | Implementation complete; live provider execution not yet run | `apps/web/src/lib/integrations/adapters.ts`; webhook route; `c95df34` | Haaniah |
| INT-02 | NFR-01, NFR-03 | Replay fixtures for invalid authenticity, duplicate delivery, ignored Figma `FILE_UPDATE`, Jira changelog omission and >10 MiB payload | Invalid/oversized requests reject; duplicates converge; ignored events do not create version events | Route branches and database uniqueness implemented; fixture execution pending dependency installation | `docs/INTEGRATION_WEBHOOK_TESTING.md`; migration `00010_integrations.sql` | Haaniah |

#### **Required failure or edge case discussion** 

| **Case selected** | Failure case: a pull request naming `UNI-999`, a well-formed key for which no ticket exists (TC-13, demo step 2) |
|---|---|
| **Why it matters** | An edge to an invented ticket would be evidence the system does not have, and a later verdict could cite it. The safe behaviour is to record the reference and link nothing, so a decisive finding can never rest on it (FR-05 principle) |
| **Observed behavior** | Outcome `unknown_key`; no edge, no ticket node; node count rises by one (the PR); key kept on the event. Same result locally (PGlite, real migrations) and live on Supabase, 11 Oct; reproducible with `npm run demo:linking` |
| **Interpretation** | Establishes that the linker never fabricates graph nodes for unresolved keys. It does not establish linking precision on real repositories (FR-04 target ≥ 0.95), because only scripted events have been run, and it does not yet re-resolve the key when the ticket arrives later |
| **Corrective action** | Mishal: add the GitHub webhook endpoint and repeat TC-11 to TC-15 with real pull requests (D-09); add re-resolution of stored unknown keys when a ticket is ingested. Before the FYP-I final evaluation |

#### **Validation quality** 

| **Area** | **Current evidence** | **Limitation** | **Next validation action** |
|---|---|---|---|
| Functional correctness | Worker 76/76 (pipeline, linking, analyser); contracts 115/115; analyser matches the pilot (TC-17); linker live on Supabase; provider adapters, OAuth routes and webhook persistence implemented | No front-end tests; live GitHub/Jira/Figma source run and fresh web/contract rerun are not recorded here; Rules 1–3 not evaluated | Install dependencies; run web/contract checks; execute `docs/INTEGRATION_WEBHOOK_TESTING.md`; complete provider-to-graph scenario matrix |
| Performance/resource use | Analyser median 0.3 s, max 4 s per pilot case against the 60 s target (NFR-07) | Model inference not measured | Local-inference spike: latency, memory, quantisation |
| Model/algorithm quality | Gate and verifier loop behave as specified with a stub model, incl. T10; analyser scored on 15 cases | No real model evaluated; 15 cases is a pilot, not an oracle | Model selection protocol, then per-class verdict metrics on the frozen gold set |
| User/field validation | Interface checked against its exported design; internal κ 0.90; external review piloted with 10 engineers | No task-based user session; external α inconclusive at two reviewers per case | Re-run external review with the revised page and ≥ 3 reviewers per case (D-08); crossover study against the manual baseline |
| Security/privacy/safety | Integration routes use signed OAuth state, workspace authorization, AES-256-GCM token/secret storage, raw-body authenticity checks, a 10 MiB body limit and service-role server boundaries | Live egress inspection, provider scope review and credential-rotation rehearsal remain outstanding | Review provider scopes and encrypted storage; run invalid-auth, oversized-payload and secret-rotation cases from the integration guide |

## **9 Mid report preparation record** 

| **Official report criterion** | **What the report contains** | **Section/page** | **Primary artefact or evidence** | **Owner** | **Ready** |
|---|---|---|---|---|---|
| Report format and required artefacts present | Chapters 3, 6 and 9 updated with implementation evidence, ownership disclosures and limitations; front matter and final compilation remain a team check | Ch. 3, Ch. 6, Ch. 9 | `docs/F26 FYP1 Mid Report LaTeX/chapters/` | Haaniah for owned chapters; all for final format review | Partial |
| Problem formulation, R&D and existing solution analysis | Problem, stakeholders, related solutions and the evidence-preserving integration gap are documented; Haaniah owns the Ch. 1/2 evidence feed and source-adapter rationale | Ch. 1–2 | Proposal, architecture documentation and integration specification | Haaniah | Partial pending final citation/own-words review |
| Project vision, scope, modules and success criteria | Vision, objectives, included and excluded scope, ten modules, measurable success criteria | Ch. 1 §1.4–§1.9 | Ch. 1 success-criteria table; Ch. 4 scope limit on repository quality | Mishal | Yes |
| Requirements and acceptance criteria | Roles, use-case diagram, 6 detailed use cases, FR-01–FR-29 with owners, NFR-01–NFR-14 with targets, one acceptance check per FR, status of new FRs, full traceability table | Ch. 4 §4.1–§4.7 | `docs/traceability/traceability_matrix.csv` and generator | Mishal (traceability with Abdullah) | Yes |
| Architecture and component/interface design | Provider adapters, OAuth routes, webhook ingress, normalized event envelope and Supabase persistence boundaries are documented alongside the verifier architecture | Ch. 5; Ch. 6 Haaniah subsection; `docs/INTEGRATIONS.md` | `apps/web/src/lib/integrations/`; API routes; migration `00010_integrations.sql` | Abdullah owns architecture; Haaniah supplies integration interfaces and evidence | Partial pending final review |
| Data/process/behavior design | Domain model, ERD with the three schema rules, process and behaviour diagrams, anchor diagram, plus source-event reliability and lifecycle behavior | Ch. 5 §5.6–§5.8; Ch. 6 | `diagrams/06_state_machines.tex`; `supabase/migrations/`; integration adapters | Haaniah for ingestion/state behavior; Mishal for ERD; team review | Partial; diagram wiring and compilation remain to be checked |
| Implementation documentation of completed module | Read-only GitHub/Jira/Figma OAuth and webhook implementation, normalized events, encrypted credentials, raw-body verification, delivery receipts and replay/testing procedure are documented | Ch. 6 Haaniah subsection; `docs/INTEGRATIONS.md`; `docs/INTEGRATION_WEBHOOK_TESTING.md` | `apps/web/src/lib/integrations/`; OAuth/webhook routes; `00010_integrations.sql` | Haaniah | Partial pending live provider rehearsal |
| Testing/validation plan and tool/risk disclosure | Strategy, TC-01–TC-22 with real results, internal and external agreement, edge/failure cases, defects D-01–D-11, validation status; GenAI register | Ch. 7 §7.1–§7.10; `docs/genai_register.md` | Test files in `apps/worker/test/`; `docs/dataset/` | Mishal (Ch. 7); each member for own register rows | Yes |

#### **Problem formulation R and D and existing solutions** 

| **Problem evidence** | Reviewers currently compare tracker intent, design decisions, code changes and tests manually; the project addresses the loss of traceable evidence across those tools. Haaniah's integration work supplies the source-ingestion evidence needed to connect that problem to real vendor events. |
|---|---|
| **Existing solutions reviewed** | Existing issue/design/code tools and webhook/OAuth APIs were treated as source systems rather than verification systems. Provider documentation for GitHub, Jira Cloud and Figma was reviewed for read-only access, authenticity, event semantics and delivery limitations. |
| **Remaining gap** | Existing tools do not preserve a shared, provenance-bearing normalized event and evidence record across source versions; vendor webhooks are also best-effort and require idempotency and reconciliation handling. |
| **Complex computing challenge** | The system must accept heterogeneous, differently authenticated payloads without losing raw-body verification, normalize them into one contract, prevent duplicate deliveries, and preserve enough provider identity/version data for deterministic downstream linking. A simple JSON endpoint would not provide those guarantees. |
| **Investigative work completed** | Implemented pure GitHub, Jira and Figma adapters, signed OAuth state, encrypted connection storage, raw-body webhook verification, delivery receipts, event upserts, provider filters and replay fixtures; documented the environment and live test procedure. |
| **Claims not yet proven** | Live provider OAuth/webhook execution, vendor rate-limit behavior, reconciliation polling and provider-to-graph end-to-end delivery remain unproven in committed evidence. These are final evaluation validation tasks. |

#### **Implementation documentation checklist** 

- ☐ Clean setup and execution instructions 
- ☐ Dependencies and versions 
- ☐ Main files classes functions or modules 
- ☐ Configuration and data requirements 
- ☐ Technical decisions and trade-offs 
- ☐ Known limitations and failure behavior 
- ☐ Link to evaluation commit or tag 
- ☐ Steps allow another person to reproduce the completed module 

## **10 GenAI use external dependencies and research ownership** 

Classify the effect of GenAI on each materially assisted artefact. Classification is by artefact, so different parts of the same project may have different levels.[cite: 1]

| **Level** | **Meaning** | **Student responsibility** |
|---|---|---|
| L1 Supportive | Grammar, formatting, brainstorming, minor debugging hints or documentation polish. | Student led the work and can explain the result. |
| L2 Assisted | Significant code, tests, diagrams or report sections were generated with GenAI. | Review, modify, integrate, test and fully explain the output. |
| L3 Core assist | GenAI produced a major module or central feature. | Demonstrate ownership through design reasoning, testing, correction and modification. |
| L4 Substituted | GenAI effectively completed work the student cannot independently explain or modify. | Do not present substituted work as independently completed work; disclose it accurately. |

#### **GenAI artefact register** 

| **Artefact or module** | **Tool model and level** | **Assistance and output used** | **Student contribution** | **Verification corrections and evidence** | **Owner** |
|---|---|---|---|---|---|
| Deterministic linker (`apps/worker/src/linking/`, migration 00015) | Claude (Opus 5.5), L3 | Code, SQL function, tests and demo script written with Claude; retained after review | Set the rule (explicit keys only, no placeholder nodes); chose the `supabase-js` RPC route with Abdullah over a connection string; applied 00015 on Supabase and ran the live demo. | 16 tests on the real migrations; tests caught an `ON CONFLICT` predicate that did not match migration 00010; first version used separate calls with no transaction, moved into one SQL function | Mishal |
| Change analyser (`apps/worker/src/analyser/`, migration 00016) | Claude (Opus 5.5), L3 | Analyser, Python parser, coverage, publish RPC, evaluation script and tests written with Claude | Asked for Python, coverage and publishing in one pass; chose to connect it to the packet with `IMPLEMENTS` edges. | 18 tests + pilot evaluation; first scorer was too literal and was corrected; coverage path bug for react-hook-form found and fixed | Mishal |
| Ch. 6 §6.4.1, Ch. 7 refresh, Ch. 4 status paragraph, worksheet draft | Claude (Opus 5.5), L3 (draft) | Draft text from the code, test output and live run | Wrote the external-review paragraph herself; decided how the pilot is reported. Checked every number in the drafts against the test output and the live run before keeping them | Every number re-run from the repository on 11 Oct; stale values from an earlier draft (TC-01–TC-04, FR-22–FR-29 status) replaced with current results | Mishal |
| SE diagrams, Ch. 4 draft, dataset pilot | Claude (Opus 5.5), L3 | See `docs/genai_register.md`, rows of 7–9 Oct | As recorded in the register | As recorded in the register | Mishal |
| GitHub/Jira/Figma integration layer | Copilot/Claude-assisted development, L3 Core assist | Adapter types, provider normalizers, OAuth routes, webhook route, encryption and Supabase migration were drafted and retained after integration work | Adapted the proposed `apps/api` shape to the actual Next.js `apps/web` route handlers; preserved existing contracts, RLS and onboarding behavior; intentionally kept read-only scopes | Reviewed provider-specific headers/event filters, raw-body ordering, workspace authorization, idempotency and 10 MiB guard; removed unsupported claims about live runs and polling; `c95df34`, `docs/INTEGRATIONS.md` | Haaniah |
| Integration testing/setup documentation | Copilot/Claude-assisted documentation, L2 Assisted | `docs/INTEGRATION_WEBHOOK_TESTING.md` with environment variables, OAuth registration, tunnel setup, fixtures and verification queries | Converted implementation requirements into repeatable positive, negative, duplicate and ignored-event checks | Checked commands and database table names against the implementation; live commands intentionally left for the team to run | Haaniah |

#### **Prompt journal for significant use** 

Record significant interactions that materially affected the project. Routine spelling, formatting or trivial lookups do not require exhaustive logging.[cite: 1]

| **Date** | **Task** | **Prompt or interaction reference** | **Output retained** | **Student review modification or rejection** | **Evidence** |
|---|---|---|---|---|---|
| 11 Oct | Linking implementation | Session transcript: PR → Jira linking with normal/edge/failure demo | Linker, RPC, tests, demo | Required the unknown-key case to create no placeholder; moved logic into one SQL function after finding supabase-js has no multi-call transaction | PR #21 |
| 11 Oct | External review reporting | Session transcript: how to report α 0.48 | Inconclusive-pilot framing; numbers kept | Asked to drop the four badly-labelled cases; this was not done because it would misreport the data. Wrote her own paragraph reporting the pilot as inconclusive with the CI | Ch. 7 §7.6; D-08 |
| 11 Oct | Analyser → packet | Session transcript: does analyser output reach the packet builder | `IMPLEMENTS` edges and end-to-end test | Chose `IMPLEMENTS` after the gap was shown by a control run | PR #25; TC-22 |
| 12 Oct | Live integrations and report evidence | Session transcript: implement real GitHub/Jira/Figma OAuth/webhooks and complete Chapters 3, 6 and 9 | Provider adapters, OAuth/webhook routes, integration migration, testing guide and report evidence | Reconciled the specification with the actual `apps/web` layout; stated live-provider and polling work as pending rather than claiming it was run | `c95df34`; `docs/INTEGRATIONS.md`; report chapters |

#### **Research and citation verification** 

| **Claim or research task** | **Original source** | **How GenAI assisted** | **Verification against source** | **Correction rejection or outcome** | **Owner** |
|---|---|---|---|---|---|
| Krippendorff's alpha for the external review | Krippendorff (2018), *Content Analysis*, 4th ed. (`krippendorff2018`) | Explained the coefficient and bootstrap interval | Values from `agreement_multi.py` matched the `krippendorff` Python package to three decimals | Retained; CI reported with α | Mishal |
| Source-adapter and webhook behavior | GitHub webhook signature documentation; Jira Cloud webhook documentation; Figma webhook documentation | Summarized provider payload, OAuth, signature/passcode and delivery requirements | Cross-checked the implementation against the provider-specific headers, event names and raw-body/passcode constraints recorded in `docs/INTEGRATIONS.md` and the testing guide | Retained read-only scopes and explicit unsupported-event behavior; live provider execution remains an open validation task | Haaniah |
| Provider webhook and OAuth behavior | GitHub Webhooks, Jira Cloud Webhooks and Figma Webhooks documentation; provider OAuth documentation | Compared required headers, event names, callback behavior and delivery limitations | Confirmed the implementation's raw-body verification, Jira changelog handling, Figma event filtering and signed callback state against the provider requirements recorded in `docs/INTEGRATIONS.md` | Read-only scopes and unsupported-event behavior retained; live provider evidence remains a separate validation step | Haaniah |
| Traceability and dataset validation | Project proposal, requirements traceability matrix, annotation manual and agreement scripts | Used the project artefacts to connect requirements to design, code, tests and demo steps; reviewed the validation workflow | Confirmed matrix ownership, blind annotation, adjudication and κ calculation procedure; retained limitations where evidence is incomplete | Claims are limited to the pilot and current repository evidence | Haaniah/Mishal |

#### **External tool and dependency record** 

| **Tool service library dataset model or hardware** | **Purpose** | **Validation performed** | **Risk or limitation** | **Fallback** | **Owner** |
|---|---|---|---|---|---|
| Supabase (Postgres, PostgREST, `supabase-js`) | Graph storage; linking and publish RPCs | Same migrations tested locally on PGlite; live demo on the hosted project | Availability of the hosted service; service-role key must stay in the gitignored `.env` | Local PGlite / self-hosted Postgres with the same migrations | Mishal (linking), Abdullah (project) |
| TypeScript compiler API (`typescript` npm) | Syntax-only parsing in the analyser | TC-17, TC-18 | No type information, so dynamic calls are unresolved (reported, never linked) | Tree-sitter if type-aware resolution is needed | Mishal |
| PGlite (`@electric-sql/pglite`) | In-process Postgres for tests with the real migrations | Same outcomes as the hosted run | Not identical to hosted Postgres (stub `auth` schema and roles) | Run tests against a local Supabase instance | Mishal |
| GitHub, Jira Cloud and Figma OAuth/webhook services | Read-only source integrations and event delivery | Adapter normalization, raw-body authentication branches and persistence paths implemented; live provider setup is documented but not yet run | Vendor availability, rate limits, best-effort delivery and credential configuration | Replay fixtures; reconciliation/polling when implemented; provider-specific retry behavior | Haaniah |

| **Sensitive data handling** | Provider access/refresh tokens and webhook secrets are credentials: they are server-only, encrypted with AES-256-GCM before storage, and never returned to the browser. Webhook payloads retain vendor metadata needed for evidence, not provider secrets. |
|---|---|
| **Security controls** | OAuth state is signed and short-lived, callbacks verify workspace authorization, webhook routes verify raw-body signatures or Figma passcodes, payloads are capped at 10 MiB, and Supabase RLS/service-role boundaries constrain access. Provider secrets are configured through server-only environment variables. |
| **Licensing and attribution** | Provider APIs and SDK/runtime dependencies remain subject to their vendor terms; the integration uses read-only access and stores no copied provider assets beyond normalized evidence metadata. Supabase and open-source package notices remain part of the project dependency review. |
| **External availability risk** | OAuth providers, webhook delivery, Supabase or a tunnel can be unavailable. The system rejects unauthenticated deliveries, preserves already recorded delivery receipts/events, and uses replay fixtures for development; reconciliation is required for vendor delivery gaps. Live rate-limit and outage measurements remain pending. |

_Summarize the highest assistance level, verification_ **Responsible GenAI use** _performed, mistakes found and material rejected or corrected_[cite: 1]

## **11 Individual evidence Member 1** 

Complete this section individually. The supervisor may ask the member to locate, explain, test or modify any claimed contribution during the meeting.[cite: 1]

| **Name and registration number** | Abdullah Amin 23i-0691 |
|---|---|
| **Repository identity** | GitHub: abdullahamin231/fyp (commit history with abdullahamin231@gmail.com) |
| **Primary technical ownership** | Core verifier loop, verdict gate, type-system analyser, architecture diagrams (5 diagrams: layered-arch, components, DFD, verifier loop, autonomy ladder) |
| **Most substantial contribution** | Designed and implemented the verifier loop / verdict gate core module (68 files, 8791 insertions), five domain diagrams for chapter 5, and consolidated diagram build system. Enables automated verification of findings with deterministic verdicts. |
| **Problem personally resolved** | Diagnosed verifier loop integration issues with Supabase queue packet format; resolved by implementing packet builder (assemble.ts, builder.ts) with deterministic parsing; verified with e2e-gate.test.ts passing |
| **Highest GenAI assistance level** | L2 Assisted: significant code, tests, and diagrams generated with GenAI, reviewed, modified, integrated and fully explained |
| **AI-generated output reviewed** | Verifier loop code and verdict gate enums were generated with GenAI (L2); evaluated by reviewing type consistency, running tests in apps/worker/test/, and verifying against contract enums in packages/contracts/ |
| **Error or limitation identified** | Verdict gate has limitation with unresolved type ambiguity; handled by falling back to fixture data for edge cases and documenting the boundary in Known limitations row of core module table |
| **Substantive modification made** | Integrated GenAI-generated code into the worker service, wrote the verifier/loop.ts (435 lines) from scratch, implemented the packet builder (assemble.ts, builder.ts), and wrote extract.test.ts and loop.test.ts from scratch; modified GenAI outputs before retaining |
| **Task demonstrable without GenAI** | Can rebuild the verifier loop from scratch, implement the verdict gate enums, write type-system analyser, rebuild architecture diagrams, and modify the packet builder without GenAI assistance |
| **Live modification readiness** | Prepared to modify the verdict gate rules, change the type-system analyser output format, add new edge cases to the verifier loop, or alter the autonomy ladder design and explain the trade-offs |
| **Next committed work** | Complete the FYP 1 final report and evaluation preparation; implement remaining edge cases for the verifier loop; add additional edge case testing before the final evaluation date |

| **Contribution** | **Repository or artefact** | **Commit PR issue or version** | **Test or result** | **Role** |
|---|---|---|---|---|
| Verifier loop & verdict gate core module | apps/worker/src/verifier/loop.ts, packages/contracts/src/gate.ts | Commit a037d16 (feat: verification worker, verdict gate, and reviewer data layer) | 8791 insertions; e2e-gate.test.ts passes; assemble.test.ts passes | Designed, implemented, tested, reviewed, integrated |
| Five domain diagrams (layered architecture, components, DFD, verifier loop, autonomy ladder) | docs/FYP1 Mid Report LaTeX/diagrams/ (layered-arch.tex, components.tex, dfd.tex, verifier-loop.tex, autonomy-ladder.tex) | Commit d2d7d0c (Add Abdullah's five diagrams and wire into ch5) | Rendered PDFs; traceability matrix wired into ch5 | Designed, implemented, tested, reviewed, integrated |
| Diagram build system & consolidated rendering | docs/FYP1 Mid Report LaTeX/diagrams/build.sh, README.md | Commit 7abdfc7 (Consolidate diagrams: one folder builds all 12) | All 12 diagrams render verified pixel-identically; build.sh extended | Designed, implemented, tested, reviewed, integrated |

#### **Member declaration** 

- ☐ I can explain the architecture and data flow relevant to my work. 
- ☐ I can locate and explain my implementation and tests. 
- ☐ I can explain a design decision and its alternatives. 
- ☐ I have accurately disclosed material GenAI and external tool assistance. 
- ☐ I checked citations and research claims against the original sources. 
- ☐ I reviewed, tested and corrected generated outputs before retaining them. 
- ☐ I can modify the work attributed to me during technical questioning. 
- ☐ I have not represented L4 substituted work as independently completed work. 
- ☐ The evidence above accurately represents my contribution. 

#### **Technical growth record** 

Record three technical questions you cannot yet answer confidently. These questions may be revisited at a later evaluation to assess growth.[cite: 1]

| **Technical question** | **Why it matters to my work** | **Learning and evidence plan** | **Target date** |
|---|---|---|---|
| How should model uncertainty be calibrated when evidence slots are truncated? | Incorrect calibration could turn weak evidence into an overconfident verdict | Compare gate outcomes across controlled packet truncation fixtures and document the chosen threshold policy | Before final evaluation |
| What local model/resource profile gives acceptable verifier latency without weakening provenance controls? | Model choice affects the bounded loop's usability and deployment feasibility | Benchmark candidate local models for latency, memory and quantisation with identical packets | Before final evaluation |
| How should the reviewer surface expose superseded verdicts without confusing the current finding? | Re-verification must preserve history while presenting an actionable current state | Add a fixture with two verdicts for one criterion and verify the UI/state transition | Before final evaluation |

| **Member confirmation** | Abdullah Amin — signature/confirmation pending | **Date** | 12 October 2026 |
|---|---|---|---|

## **11 Individual evidence Member 2** 

Complete this section individually. The supervisor may ask the member to locate, explain, test or modify any claimed contribution during the meeting.[cite: 1]

| **Name and registration number** | Haaniah Ismail; registration number to be entered |
|---|---|
| **Repository identity** | GitHub identity and commits for Haaniah Ismail; exact username/email should be confirmed before submission |
| **Primary technical ownership** | GitHub/Jira/Figma adapters, normalized event envelope, OAuth callbacks, raw-body webhook verification, delivery idempotency/replay, encrypted integration credentials, and source-reliability documentation |
| **Most substantial contribution** | Implemented the real read-only provider integration layer for GitHub, Jira Cloud and Figma. It converts authenticated vendor deliveries into the shared event shape, preserves provider references and version identifiers, and persists delivery receipts/events without duplicate processing. |
| **Problem personally resolved** | The repository had a mock ingestion path but no production-shaped boundary for provider authenticity and raw payload handling. I placed the adapters and webhook routes inside the existing Next.js application, read the raw request bytes before parsing, added provider-specific verification, signed OAuth state, encrypted server-side credentials, and workspace-scoped persistence instead of inventing a separate API application. |
| **Highest GenAI assistance level** | L3 Core assist for the integration implementation and documentation; the retained code was reviewed, adapted to the existing Next.js/Supabase layout, and documented with explicit unrun/live-validation boundaries. |
| **AI-generated output reviewed** | Provider adapter, OAuth/webhook route and documentation drafts were checked against the existing event contracts, Supabase schema/RLS conventions, provider header/event requirements and the integration testing guide. Unsupported claims about live execution, polling and numeric test results were removed. |
| **Error or limitation identified** | The implementation does not yet provide a concrete polling/reconciliation adapter method, and live OAuth/webhook runs were not available in the repository evidence. This is recorded as a release-gate limitation; replay fixtures and the documented environment/tunnel procedure are the fallback until live validation. |
| **Substantive modification made** | Adapted the integration design to the actual repository layout (`apps/web` route handlers rather than the specification's absent `apps/api`), added `00010_integrations.sql`, connected onboarding buttons to OAuth, allowed webhook routes through the proxy, and added the setup/replay guide with invalid-auth, duplicate, ignored-event and oversized-payload cases. |
| **Task demonstrable without GenAI** | Explain and modify the GitHub HMAC, Jira HMAC/changelog and Figma passcode/version-event paths; trace a normalized event from raw request through delivery idempotency into `events`; and update a provider fixture without changing the shared contract. |
| **Live modification readiness** | Add or remove a supported provider event, change a reference extractor, alter a webhook failure guard, or add a delivery-replay case while preserving raw-body verification and event idempotency. |
| **Next committed work** | Install dependencies, apply migration `00010_integrations.sql`, configure OAuth/webhook environment variables, execute the GitHub/Jira/Figma live testing guide, and add reconciliation/polling behavior before the FYP 1 final evaluation. |

| **Contribution** | **Repository or artefact** | **Commit PR issue or version** | **Test or result** | **Role** |
|---|---|---|---|---|
| GitHub/Jira/Figma adapters and normalized event contracts | `apps/web/src/lib/integrations/adapters.ts`; `types.ts`; `common.ts` | `c95df34` | Provider-specific verification and normalization implemented; live payload execution pending | Designed, implemented, reviewed, integrated |
| OAuth, webhook ingress, encrypted credentials and delivery receipts | `apps/web/src/app/api/integrations/`; `apps/web/src/app/api/webhooks/`; `supabase/migrations/00010_integrations.sql` | `c95df34` | Signed state, AES-256-GCM storage, raw-body verification, 10 MiB guard and idempotency implemented | Designed, implemented, reviewed, integrated |

#### **Member declaration** 

- ☐ I can explain the architecture and data flow relevant to my work. 
- ☐ I can locate and explain my implementation and tests. 
- ☐ I can explain a design decision and its alternatives. 
- ☐ I have accurately disclosed material GenAI and external tool assistance. 
- ☐ I checked citations and research claims against the original sources. 
- ☐ I reviewed, tested and corrected generated outputs before retaining them. 
- ☐ I can modify the work attributed to me during technical questioning. 
- ☐ I have not represented L4 substituted work as independently completed work. 
- ☐ The evidence above accurately represents my contribution. 

#### **Technical growth record** 

Record three technical questions you cannot yet answer confidently. These questions may be revisited at a later evaluation to assess growth.[cite: 1]

| **Technical question** | **Why it matters to my work** | **Learning and evidence plan** | **Target date** |
|---|---|---|---|
| How can reconciliation recover a missed vendor delivery without creating a duplicate event? | Webhooks are best-effort and duplicate safety is part of FR-02/NFR-01 | Implement provider checkpoint/poll fixtures and compare delivery IDs and event versions | Before final evaluation |
| Which provider-specific payload changes are most likely to break normalization? | GitHub, Jira and Figma payloads evolve independently | Pin representative fixtures, validate adapter schemas and add one changed-field regression case per provider | Before final evaluation |
| How should rate limits and provider outages be represented to the reviewer? | A missing source must not look like a clean verification result | Define retry/backoff and stale-source states, then exercise them with replay fixtures | Before final evaluation |

| **Member confirmation** | Haaniah Ismail — signature/confirmation pending | **Date** | 12 October 2026 |
|---|---|---|---|

## **11 Individual evidence Member 3** 

Complete this section individually. The supervisor may ask the member to locate, explain, test or modify any claimed contribution during the meeting.[cite: 1]

| **Name and registration number** | Mishal Fatima, i230776 |
|---|---|
| **Repository identity** | GitHub `mishalfatima09`; commits as Mishal Fatima <mishalfati9@gmail.com> |
| **Primary technical ownership** | Evidence graph linking (FR-04, FR-05, FR-22, FR-23, FR-28), code analysis (FR-06, FR-25–FR-27), rules (FR-12, FR-13, FR-15, FR-24, FR-29); dataset pilot; Ch. 4, Ch. 7 |
| **Most substantial contribution** | The change analyser: from a base/head pair it reports every changed symbol with a symbol card, its callers and its tests, and puts them in the graph where the packet builder finds them. It is what turns a diff into evidence the verifier can cite (TC-17, TC-22) |
| **Problem personally resolved** | Getting the linker to run on our real Supabase project. Abdullah asked why the linker needed a database connection string, since the rest of the worker only uses the Supabase client. I worked out that the linker has four steps (save the event, save the PR node, look up the ticket, write the edge) that must all succeed or all fail, and separate `supabase-js` calls can't guarantee that because each call is its own transaction. So we put the four steps in one database function (`link_pull_request_event`, migration 00015), called through `supabase-js` with the service-role key, so no connection string is needed. I applied the migration on Supabase myself and ran `npm run demo:linking -- --live`: all five cases gave the expected outcomes, with one edge and four events in the tables |
| **Highest GenAI assistance level** | L3: linker, change analyser, Ch. 4 draft, dataset pilot, diagrams |
| **AI-generated output reviewed** | Linker: checked the live run on Supabase against the expected five outcomes and the `edges`/`events` row counts |
| **Error or limitation identified** | The AI-written linker used an `ON CONFLICT` condition that did not match the partial unique index in migration 00010, so Postgres rejected it; the tests caught it and the condition was changed to match |
| **Substantive modification made** | Two. First, when the analyser was finished, its symbols and tests were in the graph but the packet builder couldn't reach them from a criterion. I decided to connect them by having the PR point to every changed symbol and test with `IMPLEMENTS` edges, rather than a bigger change to Abdullah's builder, and the end-to-end test (TC-22) now shows the symbol cards and tests reaching the packet. Second, I wrote the external-review paragraph in Ch. 7 §7.6 myself: it reports α = 0.48 with its interval as an inconclusive pilot of the review instrument, with no cases dropped, and states the re-run planned before the final evaluation (D-08) |
| **Task demonstrable without GenAI** | Explain the key pattern in `extract-keys.ts` and why `UTF-8` is rejected; walk through the four steps of `link_pull_request_event` and what each demo outcome means |
| **Live modification readiness** | Add a project key to the allow-list or a new lookalike to the key tests; change which edge types the analyser emits in `payloads.ts` |
| **Next committed work** | GitHub webhook into the linker (D-09); external review re-run with the revised page (D-08); begin FR-22 anchors. All before the FYP-I final evaluation |

| **Contribution** | **Repository or artefact** | **Commit PR issue or version** | **Test or result** | **Role** |
|---|---|---|---|---|
| Deterministic linker | `apps/worker/src/linking/`; `supabase/migrations/00015_link_pull_request_event.sql` | `9a376c7`, `6a7998e`, PR #21 | TC-10–TC-15; live run 11 Oct | Designed, integrated, tested |
| Change analyser and packet hand-off | `apps/worker/src/analyser/`; `00016_publish_analysis.sql` | `1808fe9`, `fcaaf76`, `3171080`; PRs #22, #25 | TC-17–TC-19, TC-22 | Designed, integrated, tested |

#### **Member declaration** 

- ☐ I can explain the architecture and data flow relevant to my work. 
- ☐ I can locate and explain my implementation and tests. 
- ☐ I can explain a design decision and its alternatives. 
- ☐ I have accurately disclosed material GenAI and external tool assistance. 
- ☐ I checked citations and research claims against the original sources. 
- ☐ I reviewed, tested and corrected generated outputs before retaining them. 
- ☐ I can modify the work attributed to me during technical questioning. 
- ☐ I have not represented L4 substituted work as independently completed work. 
- ☐ The evidence above accurately represents my contribution. 

#### **Technical growth record** 

Record three technical questions you cannot yet answer confidently. These questions may be revisited at a later evaluation to assess growth.[cite: 1]

| **Technical question** | **Why it matters to my work** | **Learning and evidence plan** | **Target date** |
|---|---|---|---|
| How should an anchor be re-found after a rename plus edit in the same commit, when symbol name and content hash both fail (FR-23)? | Anchors are the main new requirement I own | Read on diff-based origin tracking; script moves/renames/inlining on a test repo and measure survival | Before the FYP-I final evaluation |
| How should the two confidence thresholds for link confirmation be set and checked (FR-28)? | Auto-confirmation must be at least as precise as manual confirmation | Label link candidates from the pilot repositories and plot precision against threshold | Before the FYP-I final evaluation |
| How many reviewers per case are needed for a usable interval on Krippendorff's alpha? | Decides the external review re-run (D-08) | Simulate α intervals with 2–5 raters on 15 cases using `agreement_multi.py` | Before the external review re-run (D-08) |

| **Member confirmation** | Mishal Fatima — signature/confirmation pending | **Date** | 12 October 2026 |
|---|---|---|---|

## **12 Evidence index and final check** 

#### **Form 2 evidence index** 

| **Official criterion** | **Where addressed** | **Primary evidence** | **Owner** |
|---|---|---|---|
| Previous proposal actions addressed | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Iteration plan and work breakdown progress | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Live prototype with core module demo | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Requirements and acceptance criteria quality | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Design artefacts and design evolution | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Repository, milestone and member evidence | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Testing and early validation | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Team dynamics and tool ownership | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |

#### **Form 3 evidence index** 

| **Official criterion** | **Where addressed** | **Primary evidence** | **Owner** |
|---|---|---|---|
| Report format and required artefacts present | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Problem formulation, R&D and existing solution analysis | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Project vision, scope, modules and success criteria | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Requirements and acceptance criteria | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Architecture and component/interface design | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Data/process/behavior design | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Implementation documentation of completed module | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |
| Testing/validation plan and tool/risk disclosure | _Section/page in worksheet or mid report_ | _Repository, test, diagram, dataset, build or other link_ | _Member responsible_ |

#### **Group confirmation** 

- ☐ The live prototype is available and uses the stated evaluation version. 
- ☐ Every proposal action is recorded, including incomplete actions. 
- ☐ The mid report and worksheet match the repository and current design. 
- ☐ Acceptance criteria are measurable and traceable to evidence. 
- ☐ At least one edge or failure case is ready for discussion. 
- ☐ Member ownership is supported by more than commit counts. 
- ☐ Every materially GenAI-assisted artefact has an L1-L4 classification and named owner. 
- ☐ Significant prompts, retained outputs, verification and corrections are recorded. 
- ☐ Research claims and citations have been checked against original sources. 
- ☐ External dependencies, tools, risks, fallbacks and limitations are disclosed. 
- ☐ Each member has recorded three technical growth questions. 
- ☐ Each member is prepared to defend and modify their claimed work. 

| **Role** | **Confirmation** | **Date** |
|---|---|---|
| **Member 1** | _Name and signature_ | _Date_ |
| **Member 2** | _Name and signature_ | _Date_ |
| **Member 3** | _Name and signature_ | _Date_ |

```
