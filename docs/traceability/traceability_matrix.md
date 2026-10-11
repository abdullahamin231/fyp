# UNIFY traceability matrix

> **Generated file — do not edit by hand.**
> Source: [`traceability_matrix.csv`](traceability_matrix.csv)  
> Generator: `python3 docs/traceability/build_matrix.py`  
> CSV SHA-256 (first 12): `48d4ff1b431d` · rows: **43** (29 FR + 14 NFR)

Regenerate and commit at every gate (proposal §18.1 delivery gates and the
evaluation tag freeze, TODO §7). See [`README.md`](README.md) for column
definitions, the worksheet §5 mapping and the discrepancy register.

## Coverage

- Requirements: **43** = 29 functional (FR-01..FR-29) + 14 non-functional (NFR-01..NFR-14); no gaps, no duplicates (asserted by `build_matrix.py`).
- Status: `designed` 35, `partially_implemented` 8
- Empty cells (`--`): design_figure 4, module 6, code_artifact 35, test_case 26, demo_step 36, evidence_link 0

## Functional requirements (FR-01..FR-29)

| ID | Requirement | Design element | Figure | Module | Code artefact | Test | Demo | Status | Evidence | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| FR-01 | Receive and normalise vendor events into the common envelope | Normalised event envelope (ch5 Interfaces); DFD webhook -> normalisation path | fig:dfd | ingestion/ | -- | T7, T8 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/dfd.tex | Haaniah Ismail |
| FR-02 | Discard duplicate events and reconcile checkpoint gaps | DFD no-op duplicate path; ingestion sequence for duplicate/out-of-order delivery | fig:dfd; diagrams/05_ingestion_sequence.tex (unwired) | ingestion/ | -- | T7, T8 | demo-failure | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/dfd.tex | Haaniah Ismail |
| FR-03 | Store each artifact version as an immutable snapshot | artifact_snapshots table; append-only/immutable rule (ch5 Data Design) | fig:erd | store/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Haaniah Ismail |
| FR-04 | Link artifacts across tools and record resolver provenance | Typed edges carrying provenance; link eligibility (ch5 Domain Model) | fig:domain-model | apps/worker/src/linking/; supabase/migrations/00015 | apps/worker/src/linking/link-pull-request.ts; apps/worker/src/linking/extract-keys.ts; apps/web/src/components/links/link-wizard.tsx | T1 | demo-normal | partially_implemented | apps/worker/src/linking/link-pull-request.ts @ 6a7998e | Mishal Fatima |
| FR-05 | Prevent unconfirmed inferred links from producing decisive findings | Link eligibility gate; only deterministic or confirmed edges may fire (ch5 Domain Model) | fig:domain-model | resolution/ | -- | T1 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/domain-model.tex | Mishal Fatima |
| FR-06 | Extract base/head diff, changed symbols, neighbourhood and test evidence | CodeSymbol entity; analyser responsibilities (ch1 Project Modules) | fig:domain-model | apps/worker/src/analyser/ | apps/worker/src/analyser/analyse.ts; apps/worker/src/analyser/parse.ts; apps/worker/src/analyser/parse-python.ts | -- | demo-normal | partially_implemented | apps/worker/src/analyser/analyse.ts @ 1808fe9 | Mishal Fatima |
| FR-07 | Treat atomic criteria and approved design constraints as the verification unit | Criterion decomposition; use case UC-01 (ch4 Detailed Use Cases) | fig:usecase | verify/ (planned) | -- | T10 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin, Mishal Fatima |
| FR-08 | Build a deterministic, size-bounded context packet with a truncation manifest | context_packets table and per-slot budgets (ch5 Data Design) | fig:erd | verify/ (planned) | -- | T10 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Abdullah Amin |
| FR-09 | Run the bounded verification loop with per-pass logging | Bounded verifier loop, pass 1-2-3 with stop reasons (ch5 Process/Behavior Design) | fig:verifier-loop | verify/ (planned) | -- | T10 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/verifier-loop.tex | Abdullah Amin |
| FR-10 | Validate every citation and downgrade invalid decisive verdicts | Verdict/provenance gate and hard gate 1 (ch5 Process/Behavior Design) | fig:verifier-loop | verify/ (planned) | -- | T10 | demo-failure | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/verifier-loop.tex | Abdullah Amin |
| FR-11 | Produce a per-criterion evidence case | Evidence case view, UC-01 step 4 (ch4 Detailed Use Cases) | fig:usecase | verify/ (planned) | apps/web/src/components/conflict-detail/criterion-results.tsx | T10 | demo-normal | partially_implemented | apps/web/src/components/conflict-detail/criterion-results.tsx @ 7b411b1 | Abdullah Amin |
| FR-12 | Evaluate deterministic Rules 1-3 with rule version and grace evidence | Versioned rule records (rules table, ch4 traceability; ERD) | fig:erd | conflicts/ | -- | T2, T3, T4, T5, T6 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Mishal Fatima |
| FR-13 | Re-evaluate only the rules and criteria affected by a change | Reverse-index dispatch and incremental-vs-full equivalence decision (ch5 Architecture Decisions) | fig:dfd | conflicts/ | -- | T11 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter5_design.tex | Mishal Fatima |
| FR-14 | Route findings to the responsible role through configurable rules and channels | Role-edge resolution over OWNS, ASSIGNED_TO, WATCHES (ch5 Domain Model) | fig:domain-model | notify/ | -- | T9 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/domain-model.tex | Abdullah Amin |
| FR-15 | Create exactly one finding per rule/criterion/evidence state | findings.idempotency_key unique constraint (ch5 Data Design) | fig:erd | conflicts/ | -- | T7 | demo-failure | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Mishal Fatima |
| FR-16 | Mark artifacts SOURCE_STALE and downgrade dependent findings | Source-freshness state machine and checkpoints | diagrams/06_state_machines.tex (unwired) | ingestion/ | -- | T8 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/06_state_machines.tex | Haaniah Ismail |
| FR-17 | Show one unified view of a change | Reviewer surface; UC-01 select change and read evidence | fig:usecase | ui/ | apps/web/src/app/conflicts/[id]/page.tsx | -- | demo-normal | partially_implemented | apps/web/src/app/conflicts/[id]/page.tsx @ 7b411b1 | Abdullah Amin |
| FR-18 | Support acknowledge, resolve, dispute, suppress and reopen with audit history | Finding lifecycle (UC-03) and audit_log | fig:usecase; diagrams/06_state_machines.tex (unwired) | ui/ | apps/web/src/components/conflict-detail/resolution-dock.tsx | -- | -- | partially_implemented | apps/web/src/components/conflict-detail/resolution-dock.tsx @ 7b411b1 | Abdullah Amin |
| FR-19 | Allow authorised, versioned configuration editing | UC-05 approval flow; versioned rule records | fig:usecase | conflicts/ | apps/web/src/components/policies/policy-workbench.tsx | -- | -- | partially_implemented | apps/web/src/components/policies/policy-workbench.tsx @ 7b411b1 | Mishal Fatima |
| FR-20 | Store disputed verdicts as labelled corrections respecting the data split | UC-03 dispute alternative (labelled correction); dataset split policy | fig:usecase | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin |
| FR-21 | Export benchmark and audit evidence without secrets | Export audit evidence (use case in fig:usecase); audit record (ch5 Data Design) | fig:usecase | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin, Haaniah Ismail, Mishal Fatima |
| FR-22 | Store versioned requirement entities with commit-pinned SATISFIES anchors | Requirement entity + CodeAnchor association class on SATISFIES (ch5 Domain Model) | fig:domain-model; fig:anchor | graph/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/domain-model.tex | Mishal Fatima |
| FR-23 | Re-anchor after each commit and mark failed anchors broken | Re-anchoring order: symbol name -> content hash -> diff hunk -> broken (ch5 Process/Behavior Design) | fig:anchor | graph/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/anchor-reanchoring.tex | Mishal Fatima |
| FR-24 | Evaluate policy P4 and raise requirement-code divergence findings | Policy P4 rule record; UC-04 divergence review (ch4 Detailed Use Cases) | fig:usecase | conflicts/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Mishal Fatima |
| FR-25 | Build a symbol card for every indexed function or class | CodeSymbol / symbol card (ch4 traceability; proposal §26.1) | fig:domain-model | apps/worker/src/analyser/ | apps/worker/src/analyser/payloads.ts (symbolCard) | -- | -- | partially_implemented | apps/worker/src/analyser/payloads.ts @ 1808fe9 | Mishal Fatima |
| FR-26 | Raise a finding when a comment contradicts the code | Comment-code consistency check rendered by templates (proposal §26.1; TODO §1.6) | -- | analyser/ (planned) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Mishal Fatima |
| FR-27 | Score repository documentation quality at connection time | UC-06 connect repository and view eligibility score (ch4 Detailed Use Cases) | fig:usecase | analyser/ (planned) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Mishal Fatima |
| FR-28 | Auto-confirm, route or hold links by confidence band | Confirmation loop; UC-02 two-threshold link policy (ch4 User Interactions) | fig:usecase | resolution/ | packages/contracts/src/gate.ts; apps/worker/src/graph/nodes.ts (loadLinkPolicy) | -- | -- | partially_implemented | packages/contracts/src/gate.ts @ a037d16 | Mishal Fatima |
| FR-29 | Propose the workflow state map and default grace period for PM approval | Configuration loop; UC-05 approve a pre-filled workflow configuration | fig:usecase | conflicts/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Mishal Fatima |

## Non-functional requirements (NFR-01..NFR-14)

| ID | Requirement | Design element | Figure | Module | Code artefact | Test | Demo | Status | Evidence | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| NFR-01 | Idempotency and convergence | Reliability state machine; unique constraints on event id and finding key (ch5 Data Design) | fig:erd | ingestion/ | -- | T7 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Haaniah Ismail |
| NFR-02 | Outage tolerance | Queue plus checkpoint reconciliation (ch5 Interfaces and Dependencies) | diagrams/05_ingestion_sequence.tex (unwired) | ingestion/ | -- | T8 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/05_ingestion_sequence.tex | Haaniah Ismail |
| NFR-03 | Incremental correctness (>=99% agreement with full rescan) | Incremental-vs-full equivalence as a reported metric (ch5 Architecture Decisions) | -- | conflicts/ | -- | T11 | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter5_design.tex | Mishal Fatima |
| NFR-04 | Graceful degradation with the model server down | Autonomy-ladder fallbacks; model-server failure behaviour (ch5 Architectural Components) | fig:autonomy-ladder | verify/ (planned) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/autonomy-ladder.tex | Abdullah Amin |
| NFR-05 | PM completes the acceptance task without developer help | UC-05 configuration approval; reviewer surface | fig:usecase | ui/ | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin |
| NFR-06 | PM-directed prompts and human interventions reported separately | Three-loop metrics: interventions per 100 events, prompts per finding (TODO §1.1) | -- | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin, Mishal Fatima |
| NFR-07 | p95 pull-request analysis under 60 seconds (provisional) | Single-host performance budget (ch5 Architectural Components) | -- | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter4_requirements.tex | Abdullah Amin |
| NFR-08 | Single-host Docker Compose deployment including the model server | Deployment footprint (proposal §14) | diagrams/11_deployment.tex (unwired) | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/11_deployment.tex | Haaniah Ismail |
| NFR-09 | Read-only least-privilege scopes with tokens encrypted at rest | Inbound interface: read-only, least privilege, credentials held by one service (ch5 Interfaces) | fig:components | Source adapters (ch1 module name) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/chapters/chapter5_design.tex | Haaniah Ismail |
| NFR-10 | Artifact text treated as untrusted input, output schema enforced | Verdict schema validation at the gate (ch5 Process/Behavior Design) | fig:verifier-loop | verify/ (planned) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/verifier-loop.tex | Abdullah Amin |
| NFR-11 | No repository, ticket or design content leaves the deployment | Trust boundary around the deployment (ch5 System Architecture) | fig:layered-arch | -- | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/layered-arch.tex | Abdullah Amin |
| NFR-12 | 100% provenance on decisive verdicts, <=2% unsupported assertions | Verdict/provenance gate; hard gate 1 (ch5 Process/Behavior Design) | fig:verifier-loop | verify/ (planned) | -- | -- | -- | designed | docs/dataset/08_integrity_report.md | Abdullah Amin |
| NFR-13 | At least 80% correct abstention on labelled ambiguous cases | INSUFFICIENT_EVIDENCE as a first-class verdict (ch5 Design Evolution) | fig:verifier-loop | verify/ (planned) | -- | -- | -- | designed | docs/dataset/03_annotation_manual.md | Abdullah Amin |
| NFR-14 | Same packet, pinned model and settings give the same verdict class | Packet manifest plus pinned model settings (ch5 Data Design) | fig:erd | verify/ (planned) | -- | -- | -- | designed | docs/F26 FYP1 Mid Report LaTeX/diagrams/erd.tex | Abdullah Amin |

## Proposal reference

| ID | Proposal source | Type |
|---|---|---|
| FR-01 | proposal §15.1 FR-01 | functional |
| FR-02 | proposal §15.1 FR-02 | functional |
| FR-03 | proposal §15.1 FR-03 | functional |
| FR-04 | proposal §15.1 FR-04 | functional |
| FR-05 | proposal §15.1 FR-05 | functional |
| FR-06 | proposal §15.1 FR-06 | functional |
| FR-07 | proposal §15.1 FR-07 | functional |
| FR-08 | proposal §15.1 FR-08 | functional |
| FR-09 | proposal §15.1 FR-09 | functional |
| FR-10 | proposal §15.1 FR-10 | functional |
| FR-11 | proposal §15.1 FR-11 | functional |
| FR-12 | proposal §15.1 FR-12 | functional |
| FR-13 | proposal §15.1 FR-13 | functional |
| FR-14 | proposal §15.1 FR-14 | functional |
| FR-15 | proposal §15.1 FR-15 | functional |
| FR-16 | proposal §15.1 FR-16 | functional |
| FR-17 | proposal §15.1 FR-17 | functional |
| FR-18 | proposal §15.1 FR-18 | functional |
| FR-19 | proposal §15.1 FR-19 | functional |
| FR-20 | proposal §15.1 FR-20 | functional |
| FR-21 | proposal §15.1 FR-21 | functional |
| FR-22 | proposal §22.1 | functional |
| FR-23 | proposal §22.2 | functional |
| FR-24 | proposal §22.3 | functional |
| FR-25 | proposal §26.1 | functional |
| FR-26 | proposal §26.1 | functional |
| FR-27 | proposal §26.2 | functional |
| FR-28 | proposal §23.1 | functional |
| FR-29 | proposal §23.1 | functional |
| NFR-01 | proposal §15.2 Idempotency / convergence (unnumbered in proposal) | non_functional |
| NFR-02 | proposal §15.2 Reliability / availability (unnumbered in proposal) | non_functional |
| NFR-03 | proposal §15.2 Incremental correctness (unnumbered in proposal) | non_functional |
| NFR-04 | proposal §14; §24.1 (no matching §15.2 row) | non_functional |
| NFR-05 | proposal §15.2 Usability (unnumbered in proposal) | non_functional |
| NFR-06 | proposal §23.2 New measurable targets | non_functional |
| NFR-07 | proposal §15.2 Performance / latency (unnumbered in proposal) | non_functional |
| NFR-08 | proposal §15.2 Deployment / resource (unnumbered in proposal) | non_functional |
| NFR-09 | proposal §15.2 Security (unnumbered in proposal) | non_functional |
| NFR-10 | proposal §15.2 Security (unnumbered in proposal) | non_functional |
| NFR-11 | proposal §15.2 Privacy / locality (unnumbered in proposal) | non_functional |
| NFR-12 | proposal §15.2 Grounding (unnumbered in proposal) | non_functional |
| NFR-13 | proposal §15.2 Abstention quality (unnumbered in proposal) | non_functional |
| NFR-14 | proposal §15.2 Model reproducibility (unnumbered in proposal) | non_functional |

## Worksheet §5 view

The six columns of `FYP1 Mid Pre-Evaluation Student Worksheet.docx` §5
("Requirement traceability"), rendered from the same rows:

| Requirement (ID) | Design element (diagram/component) | Implementation (path/function/module) | Test or validation (test/result) | Demo step | Owner |
|---|---|---|---|---|---|
| FR-01 | Normalised event envelope (ch5 Interfaces); DFD webhook -> normalisation path · fig:dfd | ingestion/ | T7, T8 · designed | -- | Haaniah Ismail |
| FR-02 | DFD no-op duplicate path; ingestion sequence for duplicate/out-of-order delivery · fig:dfd; diagrams/05_ingestion_sequence.tex (unwired) | ingestion/ | T7, T8 · designed | demo-failure | Haaniah Ismail |
| FR-03 | artifact_snapshots table; append-only/immutable rule (ch5 Data Design) · fig:erd | store/ | designed | -- | Haaniah Ismail |
| FR-04 | Typed edges carrying provenance; link eligibility (ch5 Domain Model) · fig:domain-model | apps/worker/src/linking/; supabase/migrations/00015 · apps/worker/src/linking/link-pull-request.ts; apps/worker/src/linking/extract-keys.ts; apps/web/src/components/links/link-wizard.tsx | T1 · partially_implemented | demo-normal | Mishal Fatima |
| FR-05 | Link eligibility gate; only deterministic or confirmed edges may fire (ch5 Domain Model) · fig:domain-model | resolution/ | T1 · designed | -- | Mishal Fatima |
| FR-06 | CodeSymbol entity; analyser responsibilities (ch1 Project Modules) · fig:domain-model | apps/worker/src/analyser/ · apps/worker/src/analyser/analyse.ts; apps/worker/src/analyser/parse.ts; apps/worker/src/analyser/parse-python.ts | partially_implemented | demo-normal | Mishal Fatima |
| FR-07 | Criterion decomposition; use case UC-01 (ch4 Detailed Use Cases) · fig:usecase | verify/ (planned) | T10 · designed | -- | Abdullah Amin, Mishal Fatima |
| FR-08 | context_packets table and per-slot budgets (ch5 Data Design) · fig:erd | verify/ (planned) | T10 · designed | -- | Abdullah Amin |
| FR-09 | Bounded verifier loop, pass 1-2-3 with stop reasons (ch5 Process/Behavior Design) · fig:verifier-loop | verify/ (planned) | T10 · designed | -- | Abdullah Amin |
| FR-10 | Verdict/provenance gate and hard gate 1 (ch5 Process/Behavior Design) · fig:verifier-loop | verify/ (planned) | T10 · designed | demo-failure | Abdullah Amin |
| FR-11 | Evidence case view, UC-01 step 4 (ch4 Detailed Use Cases) · fig:usecase | verify/ (planned) · apps/web/src/components/conflict-detail/criterion-results.tsx | T10 · partially_implemented | demo-normal | Abdullah Amin |
| FR-12 | Versioned rule records (rules table, ch4 traceability; ERD) · fig:erd | conflicts/ | T2, T3, T4, T5, T6 · designed | -- | Mishal Fatima |
| FR-13 | Reverse-index dispatch and incremental-vs-full equivalence decision (ch5 Architecture Decisions) · fig:dfd | conflicts/ | T11 · designed | -- | Mishal Fatima |
| FR-14 | Role-edge resolution over OWNS, ASSIGNED_TO, WATCHES (ch5 Domain Model) · fig:domain-model | notify/ | T9 · designed | -- | Abdullah Amin |
| FR-15 | findings.idempotency_key unique constraint (ch5 Data Design) · fig:erd | conflicts/ | T7 · designed | demo-failure | Mishal Fatima |
| FR-16 | Source-freshness state machine and checkpoints · diagrams/06_state_machines.tex (unwired) | ingestion/ | T8 · designed | -- | Haaniah Ismail |
| FR-17 | Reviewer surface; UC-01 select change and read evidence · fig:usecase | ui/ · apps/web/src/app/conflicts/[id]/page.tsx | partially_implemented | demo-normal | Abdullah Amin |
| FR-18 | Finding lifecycle (UC-03) and audit_log · fig:usecase; diagrams/06_state_machines.tex (unwired) | ui/ · apps/web/src/components/conflict-detail/resolution-dock.tsx | partially_implemented | -- | Abdullah Amin |
| FR-19 | UC-05 approval flow; versioned rule records · fig:usecase | conflicts/ · apps/web/src/components/policies/policy-workbench.tsx | partially_implemented | -- | Mishal Fatima |
| FR-20 | UC-03 dispute alternative (labelled correction); dataset split policy · fig:usecase | -- | designed | -- | Abdullah Amin |
| FR-21 | Export audit evidence (use case in fig:usecase); audit record (ch5 Data Design) · fig:usecase | -- | designed | -- | Abdullah Amin, Haaniah Ismail, Mishal Fatima |
| FR-22 | Requirement entity + CodeAnchor association class on SATISFIES (ch5 Domain Model) · fig:domain-model; fig:anchor | graph/ | designed | -- | Mishal Fatima |
| FR-23 | Re-anchoring order: symbol name -> content hash -> diff hunk -> broken (ch5 Process/Behavior Design) · fig:anchor | graph/ | designed | -- | Mishal Fatima |
| FR-24 | Policy P4 rule record; UC-04 divergence review (ch4 Detailed Use Cases) · fig:usecase | conflicts/ | designed | -- | Mishal Fatima |
| FR-25 | CodeSymbol / symbol card (ch4 traceability; proposal §26.1) · fig:domain-model | apps/worker/src/analyser/ · apps/worker/src/analyser/payloads.ts (symbolCard) | partially_implemented | -- | Mishal Fatima |
| FR-26 | Comment-code consistency check rendered by templates (proposal §26.1; TODO §1.6) | analyser/ (planned) | designed | -- | Mishal Fatima |
| FR-27 | UC-06 connect repository and view eligibility score (ch4 Detailed Use Cases) · fig:usecase | analyser/ (planned) | designed | -- | Mishal Fatima |
| FR-28 | Confirmation loop; UC-02 two-threshold link policy (ch4 User Interactions) · fig:usecase | resolution/ · packages/contracts/src/gate.ts; apps/worker/src/graph/nodes.ts (loadLinkPolicy) | partially_implemented | -- | Mishal Fatima |
| FR-29 | Configuration loop; UC-05 approve a pre-filled workflow configuration · fig:usecase | conflicts/ | designed | -- | Mishal Fatima |
| NFR-01 | Reliability state machine; unique constraints on event id and finding key (ch5 Data Design) · fig:erd | ingestion/ | T7 · designed | -- | Haaniah Ismail |
| NFR-02 | Queue plus checkpoint reconciliation (ch5 Interfaces and Dependencies) · diagrams/05_ingestion_sequence.tex (unwired) | ingestion/ | T8 · designed | -- | Haaniah Ismail |
| NFR-03 | Incremental-vs-full equivalence as a reported metric (ch5 Architecture Decisions) | conflicts/ | T11 · designed | -- | Mishal Fatima |
| NFR-04 | Autonomy-ladder fallbacks; model-server failure behaviour (ch5 Architectural Components) · fig:autonomy-ladder | verify/ (planned) | designed | -- | Abdullah Amin |
| NFR-05 | UC-05 configuration approval; reviewer surface · fig:usecase | ui/ | designed | -- | Abdullah Amin |
| NFR-06 | Three-loop metrics: interventions per 100 events, prompts per finding (TODO §1.1) | -- | designed | -- | Abdullah Amin, Mishal Fatima |
| NFR-07 | Single-host performance budget (ch5 Architectural Components) | -- | designed | -- | Abdullah Amin |
| NFR-08 | Deployment footprint (proposal §14) · diagrams/11_deployment.tex (unwired) | -- | designed | -- | Haaniah Ismail |
| NFR-09 | Inbound interface: read-only, least privilege, credentials held by one service (ch5 Interfaces) · fig:components | Source adapters (ch1 module name) | designed | -- | Haaniah Ismail |
| NFR-10 | Verdict schema validation at the gate (ch5 Process/Behavior Design) · fig:verifier-loop | verify/ (planned) | designed | -- | Abdullah Amin |
| NFR-11 | Trust boundary around the deployment (ch5 System Architecture) · fig:layered-arch | -- | designed | -- | Abdullah Amin |
| NFR-12 | Verdict/provenance gate; hard gate 1 (ch5 Process/Behavior Design) · fig:verifier-loop | verify/ (planned) | designed | -- | Abdullah Amin |
| NFR-13 | INSUFFICIENT_EVIDENCE as a first-class verdict (ch5 Design Evolution) · fig:verifier-loop | verify/ (planned) | designed | -- | Abdullah Amin |
| NFR-14 | Packet manifest plus pinned model settings (ch5 Data Design) · fig:erd | verify/ (planned) | designed | -- | Abdullah Amin |

## Notes and gaps

- **FR-01** — ch4 traceability maps FR-01/02 to T7+T8. No ingestion code exists (`ls apps` returns only web). Stale POC fragment unify_poc/src/unify/ingestion/figma_api.py imports unify.ingestion.adapter and unify.ingestion.normalizer, which are absent from the repo; `python3 -m pytest unify_poc` fails at collection.
- **FR-02** — T8 is the SOURCE_STALE/reconciliation leg (also tracked under FR-16). The duplicate leg (duplicate event -> no duplicate finding) is one of the two demo failure cases offered in TODO §7.
- **FR-03** — ch4 traceability also leaves this test cell as -- (checked by a component test, not an end-to-end scenario). No database or store code exists yet.
- **FR-04** — Explicit Jira keys in PR title/branch/commits -> TRACKS edge with resolver explicit-reference (16 tests; live demo on Supabase 11 Oct). Design URLs and manual-link persistence not done; oracle precision not measured.
- **FR-05** — Eligibility gate exists only in the design; there is no rule engine or graph code to enforce it yet.
- **FR-06** — Diff, changed symbols, bounded callers and test evidence for TS/JS and Python. Pilot evaluation: files 29/29, changed symbols 11/11, unchanged not flagged 21/21 (npm run analyse:evaluate). Python tested on synthetic repos only.
- **FR-07** — Inherited from ch4, which groups FR-07..FR-11 against T10. A tighter mapping would test FR-07 only through its acceptance check (three criteria -> three units); flagged for human adjudication rather than silently changed.
- **FR-08** — T10 inherited from ch4's FR-07..11 grouping; no packet builder code exists.
- **FR-09** — T10 inherited from ch4's FR-07..11 grouping; no verifier code exists (TODO §3.3 open).
- **FR-10** — TODO §3.4 names T10 (fabricated-citation injection) as the demo's failure case; TODO §7 lists the same case in the live demo run-through.
- **FR-11** — Criterion cards render verdict, freshness, citations and missing evidence from typed mock data. Nothing builds or produces an evidence case; the ch4 acceptance check (gold expectation match) cannot run.
- **FR-12** — T2/T3 = Rule 1 positive/negative, T4/T5 = Rule 2 positive/negative, T6 = Rule 3 (TODO §3.4). A policy simulation screen exists (apps/web/src/components/policies/simulation-lab.tsx) but is mock-driven; no engine.
- **FR-13** — The DFD draws the criterion-queue path but no diagram shows the reverse index itself; ch4 names the design element without a figure.
- **FR-14** — Slack dispatch-rule screens exist in the UI (apps/web/src/components/settings/slack-dispatch-rules.tsx, mock only); there is no notification engine or queue.
- **FR-15** — Duplicate-leg demo case (TODO §7: duplicate event producing no duplicate finding) pairs with T7.
- **FR-16** — The state-machine diagram is built but not yet input into a chapter (TODO §5), so it has no fig: label; freshness logic exists only on paper.
- **FR-17** — 19 reviewer routes render typed mock data (apps/web/src/lib/mock/); there is no API client or backend. ch4 leaves the FR-17/18 test cell as --. TODO §5 follow-up: FR-17 is any authenticated user, so the PM should also associate to view-evidence and export.
- **FR-18** — All five actions and the suppress/dispute dialogs exist in local component state with a transient toast. No persistence, no audit log, no server; ch4 acceptance check not runnable.
- **FR-19** — Policy workbench edits grace periods, thresholds, severity and recipients in local state only - no authorisation, no versioning, no storage. FR-19 is one of five FRs missing from ch4's traceability table; the module cell is derived here from the rules group.
- **FR-20** — No planned package for label/split handling in TODO §2's monorepo list, so the module cell is --. FR-20 is missing from ch4's traceability table. Wording differs: proposal §15.1 says project-level data split, ch4 says repository-level (the dataset README says splits are by repository, never by example).
- **FR-21** — FR-21 is missing from ch4's traceability table; no planned module exists. The audit export panel (apps/web/src/components/audit/audit-header-actions.tsx) only simulates an export with timers, so it is not recorded as a code artefact. ch4 owner column reads All.
- **FR-22** — New since the defence (ch4 marks FR-22..29 as new). ch4 traceability leaves the test cell as --; no graph schema or anchor code exists.
- **FR-23** — ch4 leaves the test cell as --; anchor_survival_rate (TODO §1.3) is not implemented. TODO §5 follow-up: the figure still carries an invented illustrative FR-07 label that collides with the real FR-07.
- **FR-24** — P4 itself is not drawn in any diagram (fig:anchor shows anchoring, not divergence); the fig:usecase entry is UC-04. ch4 leaves the test cell as --.
- **FR-25** — Card with every listed field for each changed symbol; whole-repository indexing (every indexed symbol) not built.
- **FR-26** — No diagram covers comment semantics, hence --. FR-26 is one of five FRs missing from ch4's traceability table; the module cell is derived here from the code-semantics group.
- **FR-27** — FR-27 is one of five FRs missing from ch4's traceability table; the module cell is derived here from the code-semantics group.
- **FR-28** — Gate reads the workspace two-threshold band and holds verdicts resting on below-band links (worker e2e-gate test). Auto-confirmation above the band and routing to the code owner not implemented.
- **FR-29** — A static workflow-state-map screen exists (apps/web/src/components/settings/workflow-state-map.tsx) with no derivation from history and no approval flow. ch4 test cell is --.
- **NFR-01** — NFR numbering is ch4's: proposal §15.2 lists quality attributes without IDs. Convergence is measured by T7 (duplicate/out-of-order) at 100% on the controlled suite.
- **NFR-02** — NFR numbering is ch4's. The sequence diagram is built but not wired into a chapter (TODO §5), so it carries no fig: label.
- **NFR-03** — No diagram shows the dispatch/equivalence loop, hence --. NFR numbering is ch4's.
- **NFR-04** — ch4 adds this NFR; the proposal has no §15.2 equivalent row. Covered by the unnumbered degraded-mode run in TODO §3.4/§1.4, which has no T-ID, hence test_case --.
- **NFR-05** — Needs a user-acceptance task set (6-10 tasks per the dataset action plan) with a participant; none has been run. NFR owner derived from proposal §16 (reviewer UI) - ch4 assigns owners only for FRs.
- **NFR-06** — No metric reporting exists and no diagram covers it, hence -- in design_figure and module. TODO §1.1 (Abdullah design / Mishal rules) is still open; owner derived from that row since ch4 assigns no NFR owners.
- **NFR-07** — No benchmark harness exists (scalability benchmark, TODO §1.7, open) and no figure shows analysis timing, hence -- for design_figure and module. The measurement spans the analyser (Mishal) and the verifier (Abdullah); ch4 assigns no NFR modules or owners.
- **NFR-08** — No docker-compose.yml exists at the repo root (verified). Deployment is infrastructure rather than a code module, hence module --. The diagram is built but not wired into a chapter (TODO §5).
- **NFR-09** — ch4 gives module paths only for FRs, so this cell uses ch1's module name. No api service, OAuth flow or credential storage exists.
- **NFR-10** — The contract package (TODO §2 packages/contracts) does not exist. Schema enforcement is exercised indirectly by T10 through FR-10, but there is no dedicated NFR test, hence test_case --.
- **NFR-11** — Egress inspection during testing is not implemented and locality is a deployment property rather than a code module, hence module --. No containers exist yet.
- **NFR-12** — Dataset pilot-0.1 exists (15 cases, 138 integrity checks, 0 failures, commit 66e85c7) but the annotation sheets are blank and no verdict has been produced, so the metric is not measured. No verdict pipeline exists.
- **NFR-13** — Requires labelled ambiguous cases: docs/dataset/05_raw_annotations/ holds blank sheets and Cohen's kappa has not been computed (dataset action plan Phase 4 open).
- **NFR-14** — No model server, packet builder or rerun harness exists; the temperature-0 triple-run agreement check (TODO §1.8 hard gate 2) is not implemented.

---

Owners: Abdullah Amin maintains this file; Haaniah Ismail and Mishal Fatima
feed their rows. Every `implemented`/`partially_implemented` claim must be
backed by a command that was actually run against the repository at the
gate (see README.md).
