



STREAM B DEVELOPMENT FYP | STUDENT WORKING PACK
UNIFY
Provenance-Aware Cross-Tool Consistency Assurance for Product Teams
Strengthened idea, stakeholder-validation protocol, proposal-stage POC, evaluation design and two-semester delivery plan




# 0. How to Use This Pack
The document is both a strengthened proposal foundation and a working guide. Sections 1-8 define the product and its technical core. Sections 9-10 tell the group exactly how to collect the missing proposal evidence. Sections 11-14 provide requirements, ownership, milestones and risks. The appendices contain instruments that can be used directly.

## What is already decided
Target stakeholders: developers, designers and project managers working across design, code and work-management tools.
Committed sources: Figma, GitHub and Jira. Slack is outbound notification only in the committed core.
Core technical work: reliable event handling, typed relationship/provenance model, temporal policy evaluation and role-aware routing.
MVP storage: plain PostgreSQL tables for events, entities, edges, policy versions, conflicts and audit records.
AI boundary: similarity or LLM-assisted link suggestions are optional/core-assist and cannot trigger a conflict until confirmed.
## What students must still supply
Named stakeholder contacts, interview dates, consent/notes and summarized findings.
Concrete mismatch incidents and evidence that the current workflow causes material loss or rework.
Actual API/access feasibility and POC results, including failures.
Measured baselines and final frozen performance/quality targets.
The final scope approver/client and acceptance participants.
Any design or scope change caused by stakeholder evidence or the POC.
## Document map


# 1. Revised FYP Identity
## 1.1 Proposed title
UNIFY: Provenance-Aware Cross-Tool Consistency Assurance for Product Teams
## 1.2 One-sentence product statement

## 1.3 Revised problem statement
Product teams frequently represent one unit of work in several tools: a Figma design or component, a GitHub pull request or commit, and a Jira ticket. The tools expose different identifiers, schemas, event guarantees and workflow states. Existing integrations can link, display, search, automate or synchronize selected records, but a team may still lack a reliable way to determine whether related artifacts remain mutually consistent over time.
The resulting failure is not merely missing visibility. A later design version may invalidate a merged implementation; a merged PR may be inconsistent with the linked workflow state; concurrent code changes may overlap without the responsible people being aware. These conditions are difficult to detect reliably because links may be missing or uncertain, vendor events may be delayed or duplicated, workflows differ between teams, and naive alerting creates notification fatigue.
## 1.4 Named stakeholders and decisions supported

## 1.5 Current workflow to validate
Team members paste Jira keys, Figma links or PR URLs into descriptions, comments or chat messages.
Individuals manually infer what is related and inspect several tools after a change.
Tool-native notifications report that something changed but may not explain its downstream consequence.
A mismatch is discovered during stand-up, review, QA, release or after rework has already begun.

## 1.6 Scope/client role to complete


# 2. Solution Landscape and Defensible Gap
The proposal should avoid absolute novelty claims. The correct statement is documentation-bounded: the reviewed products solve important adjacent problems, but the group must demonstrate that the precise consistency-assurance workflow below remains inadequately supported for the contacted stakeholders.


## 2.1 Prior FAST FYP positioning

## 2.2 Required product-verification record


# 3. Research and Technical Foundation
The literature and official documentation must change design decisions. The table below gives the initial research-to-decision map; students should add sources discovered during their work and remove any source that does not influence the project.

## 3.1 Contribution statement

## 3.2 Contribution types under the FAST guide
System/architecture contribution: dependable cross-vendor event and provenance handling under real API constraints.
Method contribution: incremental temporal consistency-policy evaluation over a typed artifact graph.
Human/workflow contribution: explainable alerts routed to accountable roles, with acknowledgement and resolution history.
Evaluation contribution: a labelled event/link benchmark and a multi-baseline protocol covering correctness, latency, reliability and workflow usefulness.

# 4. Complex Computing Problem

## 4.1 Why routine integration is insufficient
The same unit of work has no guaranteed shared identifier across Figma, GitHub and Jira.
A vendor event reports a change, not whether that change violates a team-specific workflow invariant.
A relationship may be explicit, inferred, manually confirmed, stale or contradicted.
Event delivery can be delayed, duplicated, reordered or missed entirely during downtime.
Workflow states and acceptable grace periods differ between teams.
Alerting every linked person maximizes coverage but creates noise and adoption failure.
## 4.2 Meaningful Seoul Accord characteristics

## 4.3 Central trade-offs to defend


# 5. Revised Product Scope
## 5.1 Core idea - the CCP-bearing capability
The core is a cross-tool consistency assurance engine. It maintains the evidence chain connecting design, implementation and work-management artifacts; evaluates temporal policies only when the underlying evidence is eligible; and produces an auditable violation record with responsible recipients.
## 5.2 Committed major features
Figma, GitHub and Jira adapters with normalized events, checkpoints, idempotency, deduplication, subscription renewal and reconciliation.
Typed, versioned artifact relationship layer with deterministic links, manual links, confidence, provenance and dismissal history.
Temporal consistency-policy engine with policy versioning, state mapping, grace periods, severity, exclusions and incremental evaluation.
Role-resolution and alert engine using source ownership/assignee data plus opt-in watchers and escalation rules.
Explainable conflict record showing the policy, evidence path, timestamps, confidence and reason for recipient selection.
Dashboard for unresolved/acknowledged/resolved/suppressed conflicts and an outbound Slack channel.
Deployment, workspace isolation, encrypted tokens, audit logging and reproducible evaluation harness.
## 5.3 Minor supporting features
Search and filtering by artifact, severity, team, policy and resolution state.
Digest versus immediate notification preference.
Manual link/unlink and relationship explanation view.
Policy preview on historical/simulated events before activation.
Export of evaluation and audit records without secrets or private payloads.
## 5.4 Optional extensions - only after the core is secure
Embedding or LLM-based link suggestions beyond explicit identifiers.
Natural-language questions or summaries over the evidence graph.
Additional sources such as GitLab, Linear, Notion or Vercel.
Centrality, community detection, bottleneck analytics or general user-authored rules DSL.
Two-way write-back or automatic resolution actions.
## 5.5 Explicit exclusions
Replacing Figma, GitHub or Jira as a system of record.
Full bidirectional synchronization of arbitrary fields.
Autonomous modification of designs, code, pull requests or ticket state.
Slack ingestion as a fourth relationship source in the committed core.
A generic automation platform or marketplace of integrations.
A claim that every artifact change is a conflict.


# 6. Technical Architecture

Figure 1. Recommended committed-core architecture. Slack is an outbound surface, not a fourth source adapter.
## 6.1 Executed architectural decisions

## 6.2 Normalized event envelope
Every adapter should emit the same minimum envelope. The raw vendor payload may be retained under access controls, but core policy logic must depend on normalized fields.

## 6.3 Reliability state machine
Receive and authenticate webhook or poll response.
Persist the raw/normalized event before evaluation.
Reject or merge duplicates by stable vendor/event key.
Apply only if its entity version/time is newer or explicitly reconciled.
Update artifact and relationship state transactionally.
Evaluate only indexed policies affected by the delta.
Write conflict/recipient/audit records idempotently.
Advance the adapter checkpoint after successful commit.
## 6.4 External outage correction


# 7. Relationship and Consistency-Policy Design
## 7.1 Typed artifact graph

Policy code must use semantic argument names such as `design`, `implementation` and `ticket`, not ambiguous `source` and `target`. This removes the direction inconsistency in the original draft.
## 7.2 Link eligibility


## 7.3 Committed policy P1 - design/implementation divergence
A linked DesignArtifact enters a meaningful new version or Dev Mode state after the implementation PR for the earlier mapped version was merged, and the change remains unacknowledged beyond the configured grace period.

## 7.4 Committed policy P2 - implementation/workflow divergence
A PR is merged, but the linked Jira ticket remains in a stakeholder-defined implementation state beyond the configured grace period. States such as QA, verification, release or documentation may be explicitly mapped as acceptable post-merge states.

## 7.5 Committed policy P3 - uncoordinated overlapping implementation
Two concurrently open PRs touch the same stakeholder-defined critical component above a configured overlap threshold, while no declared dependency, shared reviewer, acknowledgement or linked coordination record exists.

## 7.6 Policy record schema
Each policy should be a versioned declarative record containing: policy ID/version, applicable relation/entity types, trigger event, temporal condition, guards, grace period, severity, recipient roles, explanation template, suppression rules, created/approved by, and effective dates. The MVP does not require a general user-authored DSL; a validated internal schema is sufficient.


# 8. Requirements Snapshot
## 8.1 Functional requirements

## 8.2 Provisional measurable non-functional targets
These are proposal-ready starting targets. The group may revise them once using POC evidence before the requirements baseline is approved. It must not change them after viewing the final test results.

## 8.3 Hardest requirement acceptance sentence


# 9. Stakeholder Validation Protocol

## 9.1 Recruitment target


## 9.2 Ethical and practical boundaries
Obtain informed permission to take notes; do not record audio unless explicitly permitted.
Do not request source code, private design files, OAuth tokens, secrets or customer-identifying information.
Describe incidents in anonymized form unless the participant authorizes attribution.
Separate observed facts, participant claims and student interpretations in the notes.
Do not pressure participants to validate the idea; ask what existing tools already solve and what would make Unify unnecessary.
## 9.3 Evidence to obtain
At least three concrete mismatch/coordination incidents across at least two roles or teams.
The actual linking convention used: Jira key, URL, Dev Resource, branch name, manual memory or none.
Workflow-state maps and cases where PR merge does not mean Done.
Tolerance for false alerts and who should receive each category.
Existing integrations/automations and why they did or did not prevent the incident.
Installation, OAuth, privacy and self-hosting constraints.
Participants willing to return for prototype/acceptance testing.
## 9.4 Decision gates after interviews

## 9.5 Stakeholder contact record




# 10. Proposal-Stage Proof of Concept

## 10.1 Highest-risk assumption
The highest-risk assumption is not whether APIs can be called. It is whether heterogeneous events and relationship evidence can support a meaningful temporal consistency decision with acceptable precision, while the pipeline remains correct under duplicate, delayed or missed events.
## 10.2 Minimum POC setup
One controlled Figma workspace/file with at least two relevant nodes or named versions.
One GitHub repository with at least two PRs and realistic Jira-key/Figma references.
One Jira project with a small stakeholder-informed status map.
One outbound Slack test channel or logged delivery stub.
A minimal PostgreSQL event/entity/edge/policy/conflict store.
Exact-link extractor, manual confirmation screen/API and two initial policies.
## 10.3 POC inputs

## 10.4 Required POC scenarios

## 10.5 Provisional POC success criteria
All deterministic explicit-reference links in the controlled POC are correct.
Unconfirmed inferred links never trigger a conflict.
At least 90% of labelled POC policy sequences produce the expected result, with every error analysed.
Duplicate delivery produces zero duplicate conflict records.
The controlled outage is repaired by reconciliation and the final state matches the source snapshot.
All labelled routing cases produce the expected recipients and explanation.
Incremental evaluation returns the same policy results as full rescan and records latency for both.
## 10.6 POC design decisions based on outcomes

## 10.7 POC evidence record - leave blank until executed





# 11. Evaluation, Testing and Acceptance
## 11.1 Keep the three questions separate

## 11.2 Reproducible baselines

## 11.3 Benchmark construction
Build a versioned event/link/scenario corpus from sanitized POC events plus transparent synthetic cases.
Separate development cases used for tuning from a frozen final test set.
Include positive, negative and ambiguous cases for every policy; do not test only happy paths.
Have at least two students independently label links, policy outcomes and recipient sets; record disagreements and resolution rules.
Freeze policy parameters, confidence threshold and metric definitions before running the final test set.
Store raw method outputs so every reported metric can be recomputed.
## 11.4 Correct metric definitions

## 11.5 Manual workflow study
Use two equivalent scenario sets and a counterbalanced crossover design: half of participants complete manual workflow first and Unify second; the other half reverse the order. Do not reuse the exact same underlying chain for both conditions unless its state is sufficiently altered to avoid memory effects.
Recommended final target: 8-12 participants, with at least two representatives per stakeholder role where feasible.
Tasks: reconstruct affected chain, decide whether a violation exists, identify responsible person and choose a resolution.
Record completion time, missed/incorrect links, wrong policy decision, assistance required, confidence and satisfaction.
Declare proxy users separately; do not present student proxies as industry acceptance.
## 11.6 Acceptance decision


# 12. Security, Privacy and External Components
## 12.1 Minimum security design
Least-privilege OAuth scopes documented per adapter.
Tokens encrypted at rest, excluded from logs/exports and rotated/revoked through documented procedures.
Webhook signatures/passcodes verified and replay/duplicate identifiers checked.
Workspace-level authorization on entities, links, policies, conflicts and exports.
Metadata-only policy processing where content is not needed; no private code/design content sent to an LLM without explicit opt-in.
Retention and deletion behavior documented for raw vendor payloads.
Threat model includes token theft, cross-tenant access, forged/replayed webhooks, malicious references and notification leakage.
## 12.2 External-component classification

## 12.3 Disclosure record


# 13. Balanced Three-Student Technical Ownership
No student should be described as the sole CCP owner. Each responsibility below is CCP-relevant and must include design decisions, implementation, validation and defense. UI, documentation, security, integration and final quality remain shared.

## 13.1 Shared engineering responsibilities
End-to-end architecture and interface contracts.
Dashboard/product workflow and accessibility.
Security/privacy review and external-component disclosure.
Integration, system, performance and acceptance testing.
Docker/cloud deployment, rollback, monitoring and handover.
Requirements/design traceability and change control.
## 13.2 Removal test



# 14. Two-Semester Delivery Roadmap

## 14.1 Suggested next ten working days
Days 1-2: freeze interview protocol, candidate stakeholders, POC accounts and committed event types.
Days 2-5: conduct initial interviews; capture incidents, state maps, alert ownership and access constraints.
Days 3-7: build the minimal POC path and label its link/event scenarios.
Days 7-8: run positive, negative, duplicate and outage cases; calculate preliminary metrics.
Day 9: revise policies, architecture, scope and provisional targets based on evidence.
Day 10: produce concise defense slides with actual stakeholder and POC evidence before claims.
## 14.2 Initial RAID register

## 14.3 Scope-change rule
Any change to committed sources, policy semantics, storage approach, evaluation baseline, external-component boundary or ownership should be recorded with date, evidence, approver, schedule effect and traceability impact. Optional features must not enter committed scope merely because routine implementation finishes early.

# 15. Proposal-Defense Readiness Checklist
☐  The group can explain the problem, current workflow, gap and contribution in one minute.
☐  At least 6 stakeholder contacts across the three roles have been attempted and outcomes recorded.
☐  The problem statement contains actual incidents/evidence rather than only planned interviews.
☐  Product limitations are supported by official documentation, trial evidence or stakeholder observation.
☐  The revised CCP is central and every member can defend its trade-offs.
☐  The three policy definitions contain explicit triggers, guards, temporal conditions and resolution semantics.
☐  The graph direction/semantic roles are consistent throughout the proposal and code.
☐  The POC was demonstrated with actual inputs, outputs, measurements and at least one failure case.
☐  The group can state exactly what the POC changed.
☐  Preliminary baselines and metric formulas are correct and reproducible.
☐  At least one measurable non-functional target is frozen before requirements approval.
☐  API permissions, costs, scopes, webhook renewal and failure behavior are documented.
☐  Slack is presented as outbound delivery unless its ingestion is formally promoted and justified.
☐  Plain PostgreSQL is the committed storage unless evidence justifies an extension.
☐  AI suggestions cannot silently modify the graph of truth or trigger policies.
☐  All three members have CCP-relevant ownership and shared integration responsibility.
☐  FYP-I and FYP-II milestones show a working core by Final-1 and evaluation/deployment by Final-2.
☐  The proposal has a clean TOC, references, version/control block and no clipped tables or broken fields.


# Appendix A. Stakeholder Interview Guide
Suggested duration: 20-30 minutes. Ask follow-up questions for concrete examples. Avoid leading questions such as 'Would this product be useful?'
What is your role, team size and typical product-development workflow?
Which tools do you use for design, code/review, work tracking and communication?
How do you currently connect a design, PR/commit and ticket representing the same work?
Describe the most recent case where related artifacts became inconsistent or somebody missed a downstream change.
When and how was the mismatch discovered? Who discovered it?
What was the consequence: time, rework, delay, QA issue, release risk or communication cost?
Which existing integrations, notifications or automations were active? Why did they not prevent the incident?
Does a merged PR normally mean the ticket should be Done? Which states are legitimate after merge?
Which design changes should require developer attention, and which should not?
For overlapping code changes, what evidence tells you that coordination is required?
Who should receive each kind of alert? Who may acknowledge, suppress or resolve it?
How many incorrect alerts would make you ignore or disable the system?
What data or permissions would you refuse to provide to such a system?
Would self-hosting, metadata-only processing or limited scopes affect adoption?
What measurable improvement would make the system worth installing?
Would you participate in a later prototype/acceptance test? Under what conditions?
## Interview note structure






# Appendix B. POC Execution Record

## Scenario results

## Measured POC metrics





# Appendix C. Initial Source List
Students should verify access dates, retain copies where permitted, add peer-reviewed sources that directly influence the final method, and use the citation format required by FAST.
[1] FYP Idea Selection and Proposal Readiness Guide. FAST School of Computing, 2026. Primary institutional standard used to structure this pack.
[2] Jira and Figma. Figma Learn / Help Center. Official/source link
[3] Figma Webhooks V2 Events. Figma Developer Documentation. Official/source link
[4] Jira Cloud Platform REST API - Webhooks. Atlassian Developer Documentation. Official/source link
[5] Handling Failed Webhook Deliveries and Webhook Best Practices. GitHub Documentation. Official/source link
[6] GitHub / Jira Integration Capabilities. Unito official integration documentation. Official/source link
[7] Unblocked Product and Knowledge-Graph Description. Unblocked official product information. Official/source link
[8] Rovo Connectors for Figma and GitHub. Atlassian official connector documentation. Official/source link
[9] Rete: A Fast Algorithm for the Many Pattern/Many Object Pattern Match Problem. C. L. Forgy, Artificial Intelligence, 19(1), 17-37, 1982. DOI: 10.1016/0004-3702(82)90020-0. Official/source link
[10] Temporal Graph Functional Dependencies. M. Alipourlangouri, A. Mansfield, F. Chiang and Y. Wu, 2021/2022. Official/source link
[11] An Empirical Study on State-of-the-Art Methods for Requirement-to-Code Traceability Link Recovery. Journal of King Saud University - Computer and Information Sciences, 36(6), 2024. DOI: 10.1016/j.jksuci.2024.102118. Official/source link
[12] BS FYP Repository, Fall 2019-Fall 2025. FAST School of Computing repository supplied for local novelty comparison.
# Appendix D. Revision Summary

Declared stream | Stream B - application-derived
Group | Abdullah Amin | Haaniah Ismail | Mishal Fatima
Supervisor | Dr. Ali Zeeshan Ijaz
Institution | FAST School of Computing
Document status | Prepared foundation - stakeholder and POC evidence pending
Date | August 2026

Purpose of this pack
This document gives the group a technically stronger idea before stakeholder contact and POC execution. It deliberately does not invent stakeholder findings, POC outcomes or measured performance. All student-owned evidence fields remain blank and must be completed honestly before defense.

Recommended disposition
Retain Unify. Present it as a cross-tool consistency assurance product, not as a generic integration dashboard. Its defensible core is the reliable evaluation of temporal consistency policies over a provenance-aware artifact graph, followed by explainable, role-correct notification.

Section | Purpose
1-4 | Problem, gap, CCP and contribution
5-8 | Product scope, architecture, policies and requirements
9 | Stakeholder recruitment, interviews and evidence decisions
10 | Proposal-stage POC protocol and result worksheet
11 | Evaluation baselines, benchmark, metrics and acceptance
12-14 | Ownership, two-semester roadmap and risk control
Appendices | Interview guide, POC record and sources

Product statement
Unify is a deployable web product that connects Figma, GitHub and Jira, maintains a provenance-aware graph of related work artifacts, detects violations of configurable temporal consistency policies, and sends explainable alerts to the people responsible for resolving them.

Stakeholder | Operational need | Decision supported by Unify
Developer | Know when implementation assumptions have changed | Inspect the evidence chain, acknowledge impact, update or dismiss with reason
Designer | Know whether a changed design has an affected implementation | See linked PR/ticket state and route the issue to the accountable owner
Project manager | See unresolved cross-tool inconsistencies without event noise | Prioritize violations, confirm workflow mapping and monitor resolution

STUDENT EVIDENCE - Confirm or revise this workflow
Summarize what the contacted teams actually do. Do not retain assumptions that the interviews contradict.
 
 
 
 

STUDENT ENTRY - Named scope approver/client
Identify the stakeholder representative who will validate the requirements and acceptance scenario. If no partner accepts this role, state that the supervisor will approve scope on behalf of the named stakeholder group.
 
 
 

Existing approach | What it already solves | Remaining issue to verify | Implication for Unify
Figma for Jira | Linked design context, design-update/Dev Mode status and Jira workflow automation [2] | Pairwise Figma-Jira visibility does not by itself evaluate a multi-hop Figma-GitHub-Jira policy | Do not claim that design-change notification is new; differentiate through multi-tool evidence and policy semantics
Unito / Exalate | Field/relationship synchronization, mappings and conditional sync rules [6] | Synchronization is not necessarily the same as detecting a provenance-backed policy violation without becoming the system of record | Compare structural behavior, not feature count; verify with official documentation or a trial
Unblocked | Cross-tool software knowledge graph; product materials also claim source-conflict reconciliation [7] | The proposal must verify whether configurable temporal workflow policies and evaluated role routing are first-class capabilities | Narrow the gap; do not say no graph/conflict product exists
Atlassian Rovo | Search, chat and agents over connected GitHub and Figma knowledge [8] | Knowledge access does not necessarily provide deterministic temporal consistency guarantees | Position Unify as assurance and evidence, not general Q&A
Manual workflow | Flexible human judgement with no additional installation | Slow, inconsistent and difficult to audit; actual severity is not yet established | This is the primary workflow baseline and must be measured with stakeholders

Defensible gap statement
Among the product documentation and workflows reviewed, the group has not yet found first-class support for evaluating configurable temporal consistency policies across linked Figma design versions, GitHub implementation state and Jira workflow state, with artifact/link provenance, uncertainty gating and measured role-recipient accuracy. Stakeholder study and product verification must confirm whether this gap matters in practice.

Prior FYP | Closest overlap | Structural difference to defend
F25-291-D-GHOST | Multi-tool orchestration across Google services | Executes requested workflows; does not maintain a temporal developer-artifact consistency model
F25-162/F25-305-D-FYPilot | Multi-stage workflow automation and alerts | Institutional FYP process rather than evolving design-code-ticket consistency
F25-062-D-Allure-AI | Traceability, versioning, model QA and Jira/Trello/Slack integration | MBSE workshop/model context; Unify targets live development artifact invariants and event reliability
F25-099-D-MARS | Requirements traceability and conflict detection | Requirements engineering platform; not cross-vendor temporal artifact-state assurance
S22-11-D-SoftReq | Requirements validation and traceability | Single requirements domain rather than heterogeneous live tool events
S25-016-D-TaskWise | Project-management automation and integrations | Task allocation/productivity rather than cross-artifact consistency evidence
F23-088-D-FigForge | Figma-to-code workflow | Code generation rather than change-state consistency and role routing

STUDENT ENTRY - Products actually inspected
For each product, record official page/trial date, capability observed, limitation observed, and the exact resulting design decision. Replace marketing assumptions with evidence.
 
 
 
 
 

Source area | Finding relevant to Unify | Decision influenced | Evidence to produce
Traceability-link recovery [11] | Exact references are high-precision but incomplete; learned/similarity approaches require evaluation | Exact/manual links are committed; inferred links are suggestions under a confidence gate | Labelled candidate-pair benchmark and precision/recall/F1
Temporal graph constraints [10] | Inconsistencies may depend on topology, attribute state and time intervals | Policies include typed relations, state maps, versions, grace windows and policy versioning | Positive, negative and ambiguous temporal scenarios
Incremental rule matching [9] | Changed facts can be matched only against relevant rules instead of full rescans | Index policies by relation/event type; evaluate changed neighborhoods only | Output equivalence and p95 latency versus full rescan
Figma webhook semantics [3] | Generic FILE_UPDATE may be delayed; Dev Mode and named-version events carry stronger workflow meaning | Use DEV_MODE_STATUS_UPDATE/FILE_VERSION_UPDATE for core design policies; treat generic updates cautiously | Live POC event timing and payload record
Jira webhook constraints [4] | OAuth/app permissions and renewal affect reliability | Webhook registration/renewal becomes an adapter responsibility | Access proof, renewal test and fallback result
GitHub delivery behavior [5] | Failed deliveries are not automatically redelivered | Queueing is paired with checkpoints, deduplication and API reconciliation | Controlled outage and recovery experiment

Recommended contribution statement
Existing tools can synchronize, link, search or notify across parts of the product-development toolchain, but teams may still lack auditable assurance that linked artifacts remain consistent under delayed events, uncertain links and team-specific workflows. Unify will contribute a deployable provenance-aware relationship and temporal-policy engine, with confidence-gated linking and role-aware routing, evaluated against exact-link, full-rescan, simple-recipient and manual-workflow baselines.

Revised CCP
Given delayed, duplicated, out-of-order and partially linked events from heterogeneous development tools, how can a system maintain a provenance-aware artifact graph and incrementally determine when configurable temporal consistency policies are violated, while minimizing false alerts and routing each violation to the correct role?

Characteristic | Concrete evidence in Unify
Conflicting requirements | Detection recall versus alert precision; freshness versus rate limits; automation versus human confirmation; privacy versus useful context
No obvious solution / depth | No shared identity or universal definition of consistency; teams require different state maps and temporal policies
Depth of knowledge | Event-driven systems, idempotency, traceability recovery, temporal constraints, graph modelling and evaluation
Unfamiliar issues | Vendor-specific webhook guarantees, expired subscriptions, partial failure, event replay and schema drift
Beyond standard practice | The core is not API aggregation; it is evidence-backed temporal invariant evaluation under uncertainty
Diverse stakeholders | Developers, designers and PMs differ in ownership, acceptable noise and resolution authority
Significant consequences | False negatives create late rework; false positives disable trust in the system
Interdependence | Link confidence controls rule eligibility; event correctness controls graph state; policy results control routing
Ill-defined requirements | Stakeholder study must define what counts as linked, stale, conflicting and worth alerting

Trade-off | Design response | Evaluation evidence
Recall vs notification noise | Confidence gate, grace periods, severity and suppression | Conflict/recipient precision-recall and alerts per user
Freshness vs API limits | Webhooks plus bounded reconciliation polling | Vendor delay, internal latency, API calls and missed-event recovery
Automation vs verification | Exact links auto-eligible; inferred links require confirmation | Coverage gain and precision loss relative to exact-only baseline
Generic policies vs team fit | Configurable status map and policy parameters with version history | Correctness across at least two workflow configurations
Graph expressiveness vs operational complexity | Plain PostgreSQL adjacency/event tables for MVP | POC query/latency evidence before any graph extension

Scope protection
Do not strengthen this FYP by adding integrations or chatbot features. Strengthen it through policy semantics, event correctness, provenance, failure handling and evaluation.

Decision | Committed choice | Reason
Storage | Plain PostgreSQL event/entity/edge/conflict/audit tables | Sufficient for bounded 1-3 hop queries; avoids speculative graph-database complexity
Processing | Asynchronous worker with idempotent event keys | Webhook handlers acknowledge quickly and processing can retry safely
Reliability | Webhook plus periodic reconciliation/checkpoint | A queue alone cannot recover an event that was never delivered
Policy execution | Event/relation-indexed incremental evaluation | Only policies touching the changed neighborhood are re-evaluated
Linking | Exact/manual committed; inferred suggestion optional | Keeps the graph of truth auditable and provides a safe fallback
Delivery | Dashboard plus outbound Slack | Demonstrates product workflow without expanding the ingestion surface

Field | Purpose
event_id / vendor_delivery_id | Idempotency and audit
workspace_id / source_tool | Tenant isolation and adapter routing
entity_type / entity_id / version | Canonical artifact identity and ordering
action / state_before / state_after | Policy trigger and temporal comparison
actor / occurred_at / received_at | Ownership, vendor delay and internal latency
references | Explicit Jira keys, Figma resources, PR/commit URLs and other link candidates
raw_hash / schema_version | Provenance and vendor-schema change detection

Important correction
Do not claim that the incoming queue alone prevents event loss. GitHub may not automatically redeliver a failed webhook [5]. Each adapter therefore needs a reconciliation query/checkpoint that compares source state with the last processed state and generates a reconciled event when a gap is found.

Entity / relation | Committed semantics
DesignArtifact | Figma file/node plus named version or Dev Mode status
PullRequest / Commit | GitHub implementation artifact and changed components/files
Ticket | Jira work item with team-specific canonical state
Person | Tool-native owner, assignee or reviewer identity mapped within one workspace
IMPLEMENTS(PullRequest, DesignArtifact) | The PR implements the identified design version/node
TRACKS(PullRequest, Ticket) | The PR is part of the work represented by the ticket
TOUCHES(PullRequest, Component) | The PR modifies a normalized component/file path
OWNS / ASSIGNED_TO / WATCHES | Role evidence used for recipient resolution

Link type | Creation | May trigger a policy?
Deterministic | Explicit Jira key, PR URL, Figma Dev Resource or exact configured identifier | Yes, subject to validation and policy configuration
Manual confirmed | Authorized user links two known artifacts | Yes; provenance records the confirmer
Inferred suggestion | Embedding/LLM/similarity proposes a relationship | No, until confirmed or promoted under a separately validated threshold
Dismissed/revoked | User rejects a suggestion or invalidates an old link | No; history remains auditable

Policy element | Definition
Trigger | DEV_MODE_STATUS_UPDATE, FILE_VERSION_UPDATE, or a stakeholder-approved equivalent
Evidence | IMPLEMENTS relation, design version, PR merge time, policy version and grace window
Guards | Confirmed/eligible link; relevant node/version; exclude comments or generic edits without workflow meaning
Outputs | Potential stale implementation, severity, affected chain, owner/assignee recipients and explanation
Resolution | Acknowledge no impact, create/update implementation work, relink to correct version, or suppress with reason

Policy element | Definition
Trigger | GitHub PR merged or Jira transition
Evidence | TRACKS relation, PR merge time, Jira state map and grace window
Guards | Do not assume every state other than Done is inconsistent; use the validated canonical map
Outputs | Workflow mismatch with expected and observed state, accountable roles and resolution actions

Policy element | Definition
Trigger | PR opened, synchronized, updated or changed-file set modified
Evidence | TOUCHES relations, overlap measure, critical-component configuration and reviewer/dependency evidence
Guards | Ignore generated/vendor files and allow known parallel work; threshold must be validated
Outputs | Coordination risk rather than a certain defect; severity reflects overlap and branch age

STUDENT ENTRY - Stakeholder-validated policy changes
Record which policies stakeholders confirmed, rejected or redefined. Include state maps and acceptable grace periods.
 
 
 
 
 

ID | The system shall... | Acceptance evidence
FR-01 | Connect one Figma, GitHub and Jira workspace using least-privilege authorization | Access/scopes documented and connection test passes
FR-02 | Ingest and normalize committed event types into a versioned common envelope | Known vendor event produces the expected normalized record
FR-03 | Deduplicate repeated events and reconcile a detected source/checkpoint gap | Duplicate and outage tests produce one correct final state
FR-04 | Create deterministic and manual typed relationships with confidence and provenance | Known chain is reconstructed and its evidence is displayed
FR-05 | Prevent unconfirmed inferred links from triggering policies | Low-confidence/uncertain case produces no conflict alert
FR-06 | Evaluate only relevant temporal policies when an artifact/relationship delta occurs | Incremental and full-scan outputs match on the benchmark
FR-07 | Create one idempotent, explainable violation record per policy/evidence state | Repeated event does not duplicate the violation
FR-08 | Resolve recipients from native ownership/assignment plus configured watchers/escalations | Recipient set matches the labelled routing case
FR-09 | Deliver eligible alerts through the dashboard and outbound Slack channel | Delivery is logged with status and retry outcome
FR-10 | Support acknowledge, resolve, suppress and reopen actions with reason and audit history | Lifecycle transition and audit test passes
FR-11 | Allow an authorized user to configure state maps, grace periods and policy activation | Configuration changes create a policy version and preview
FR-12 | Export non-secret benchmark/audit evidence for evaluation | Export contains required evidence and excludes tokens/private raw content

Quality | Provisional target | Measurement condition
Internal processing latency | p95 <= 2 seconds from persisted receipt to violation record | 10,000 entities, 30,000 relations, 20 events/second, declared single-VM profile
Idempotency | 0 duplicate conflicts from duplicate delivery | Replay every POC/benchmark event at least twice
Recovery | 0 permanent state gaps in controlled 5-minute adapter outage | Restore service, run reconciliation and compare source snapshot
Auditability | 100% alerts retain policy version, evidence path and recipient reason | Automated audit-completeness check
Link quality | Suggested-link precision >= 0.85 at the selected threshold | Frozen labelled candidate-pair test set; exact/manual baseline reported separately
Conflict quality | Precision and recall each >= 0.85 on labelled scenarios | Positive, negative and ambiguous scenarios across all committed policies
Routing quality | Recipient precision >= 0.85 and recall >= 0.80 | Labelled role-routing scenarios
Security | 0 tokens/secrets in logs or exports; encrypted-at-rest token storage | Automated scan plus configuration inspection
Deployment | Clean installation and operation by a non-author using documented steps | Final acceptance/handover test

Specifiability test
The system shall detect and explain a stakeholder-defined temporal inconsistency for the accountable role, and we will know it works when its output matches the frozen labelled scenario, no ineligible relationship fires, repeated events do not duplicate the result, and the evidence can be traced to source events and a policy version.

Why this is mandatory
For Stream B, the main early risk is whether the problem is real, material and insufficiently solved. The interviews must be completed before the team presents the problem and gap as established facts.

Role | Minimum representation | Useful eligibility
Developer | At least 2 | Has worked with PRs plus Jira/another tracker and consumes design/requirements
Designer | At least 2 | Uses Figma and hands designs to implementation teams
PM / team lead | At least 2 | Owns ticket/workflow status and cross-role coordination
Total | 6-10 initial participants | Prefer more than one team; record proxies separately from industry users

Suggested first-contact message
We are final-year CS students validating a proposed product that would detect inconsistencies across design, code-review and work-tracking tools. We are requesting a 20-30 minute interview about your current workflow and past incidents, not a sales endorsement. We will not request source code, tokens, confidential designs or customer-identifying information, and notes can be anonymized. Participation is voluntary; if relevant, we may later invite you to review a prototype.

Finding | Required response
No repeated/material incidents are found | Do not manufacture importance; narrow to the validated failure or reconsider the idea
Existing product already solves the full workflow | Reposition around a verified constraint/evaluation gap or reject the claimed gap
Figma is not part of the target workflow | Replace it only if the actual design source provides comparable events/access and the CCP remains intact
Users reject broad OAuth/data access | Reduce scopes/content storage, use metadata-only processing, or revise deployment model
PR merge does not map uniformly to completion | Adopt stakeholder-specific canonical state maps and grace periods
Alert fatigue dominates perceived value | Make precision, digesting and acknowledgement/suppression core rather than minor features

Participant code | Role/team | Tool stack | Date | Consent | Follow-up?
 |  |  |  |  | 
 |  |  |  |  | 
 |  |  |  |  | 
 |  |  |  |  | 
 |  |  |  |  | 
 |  |  |  |  | 

STUDENT ENTRY - Validated problem and workflow summary
State the evidence, contradictions, and resulting requirement changes. Avoid percentages unless the sample and calculation are shown.
 
 
 
 
 
 
 

STUDENT ENTRY - Stakeholder-driven scope changes
List each change, who/what motivated it, and whether it affects committed scope, architecture, evaluation or acceptance.
 
 
 
 
 

POC objective
Test whether one real Figma-GitHub-Jira chain can be captured, linked and evaluated reliably enough to support the proposed core - including ambiguous links, benign changes, duplicate events and one missed-delivery recovery case.

Input set | Minimum suggested size | Purpose
Link candidates | 30 pairs: explicit true, ambiguous/related and unrelated | Estimate exact-link and suggestion behavior; manual labels are ground truth
Policy event sequences | 18 sequences across P1-P3 with positive and negative cases | Detect trivial rules that fire on benign workflow states
Reliability cases | Duplicate, out-of-order, service-down and reconciliation scenarios | Verify final state, idempotency and recovery
Routing cases | At least 6 owner/assignee/watcher combinations | Verify recipient-set reasoning
Scale fixture | 1,000 entities and 3,000 relations | Early comparison of incremental versus full-rescan latency

ID | Scenario | Expected behavior
T1 | Explicit Jira key and Figma reference connect one PR-ticket-design chain | Correct typed links with provenance
T2 | Meaningful design version/status changes after mapped PR merge | P1 fires after configured grace period
T3 | Generic/unrelated Figma edit or unconfirmed suggested link | P1 does not fire
T4 | PR merged; Jira remains in an implementation state beyond grace | P2 fires with observed/expected state
T5 | PR merged; Jira is in stakeholder-approved QA/release state | P2 does not fire
T6 | Two PRs overlap on a critical component without coordination evidence | P3 produces coordination risk; benign parallel case remains silent
T7 | Same event delivered twice and another arrives out of order | One correct final state and no duplicate alert
T8 | Processor is unavailable while source state changes | Reconciliation detects the gap and restores state
T9 | Conflict connects owner, assignee, watcher and unrelated user | Only labelled recipients are selected; reason is displayed

Observed result | Design/scope decision
Figma event meaning is too coarse/noisy | Use Dev Mode/named version events only; require node/version mapping; remove generic FILE_UPDATE from P1
API permissions cannot be secured | Do not claim live integration as committed; secure a legal/feasible access route or reduce scope before approval
Automatic link precision is weak | Commit to deterministic/manual linking; retain inferred linking as optional suggestion
Rules fire on benign workflow states | Add state maps, guards, grace periods and policy preview; revise thresholds before requirements baseline
Reconciliation cannot recover a gap | Change checkpoint/recovery design before committing to reliability claims
Incremental dispatch has no benefit at FYP scale | Keep correctness-focused simple dispatch; do not add RETE/graph extensions solely for appearance

STUDENT ENTRY - Environment and exact inputs
Accounts/plans, permissions, repository/project/file identifiers (anonymized), event types, dataset sizes, hardware and software versions.
 
 
 
 
 

STUDENT ENTRY - Actual results and measurements
Include link confusion matrix, policy pass/fail count, internal/vendor latency, duplicate result, outage/reconciliation result and routing result.
 
 
 
 
 
 
 

STUDENT ENTRY - Failure analysis
For every unexpected result, state cause, evidence, severity and whether it invalidates the current approach.
 
 
 
 
 

STUDENT ENTRY - What the POC changed
State the resulting architecture, scope, policy, metric or timeline change. A POC that changes nothing is not automatically a strong POC.
 
 
 
 
 

Activity | Question | Evidence
Testing | Does the product behave as specified? | Unit, integration, system, security, edge/failure tests and defect record
Evaluation | Does the contribution perform better than reproducible alternatives? | Frozen benchmark, baselines, metrics, ablations and failure analysis
Acceptance | Will intended users adopt it for realistic tasks? | Counterbalanced tasks, stakeholder outcomes, issues and recorded acceptance decision

Contribution | Baseline | Proposed method | Primary metrics
Linking | Exact identifiers/URLs only | Exact + manual + confidence-gated suggestions | Precision, recall, F1, coverage, confirmation/dismissal
Policy evaluation | Full graph scan after every event | Relation/event-indexed neighborhood evaluation | Output equivalence, p50/p95 latency, throughput, memory
Role routing | Broadcast-to-all or native assignee only | Graph-derived owner/assignee/watcher/escalation | Recipient precision/recall, alerts per user
Workflow | Manual cross-tool investigation | Unify-assisted investigation | Task time, missed/incorrect relationships, confidence, satisfaction

Metric | Definition / use
Precision | TP / (TP + FP): among generated links/conflicts/recipients, how many were correct?
Recall | TP / (TP + FN): among required links/conflicts/recipients, how many were found?
F1 | Harmonic mean of precision and recall
False-positive rate | FP / (FP + TN); it is not the complement of precision
Internal processing latency | Persisted event receipt to violation record; report p50, p95 and p99
Vendor observation delay | Artifact change to webhook receipt; report separately from internal latency
Alert burden | Alerts per person/task/time period plus dismissal/suppression rate
Recovery correctness | Expected source state versus reconstructed system state after outage

STUDENT ENTRY - Final acceptance criteria and approver
After stakeholder contact, state who will accept the system, the realistic task, measurable acceptance conditions and any conditions on approval.
 
 
 
 
 

Category | Components | Boundary
Support | Web framework, UI kit, PostgreSQL, Redis/job library, Docker, OAuth libraries, Slack delivery API | May provide infrastructure but not relationship semantics or policy results
Core-assist | Embedding model or hosted LLM for link suggestions/summaries | Suggestions remain unconfirmed; core works with exact/manual linking when unavailable
Core-replacement - prohibited for claimed contribution | Commercial cross-tool graph, sync or policy engine | Students must implement and defend their event/provenance, relationship and temporal-policy logic

STUDENT ENTRY - External assistance and dependencies
List APIs, libraries, generated code, AI tools, prompts, datasets/event fixtures, templates and copied/adapted logic according to current university policy.
 
 
 
 
 
 

Member | Primary ownership | Key decisions | Required individual evidence
Haaniah Ismail | Multi-source event platform and reliability | Event envelope, adapter semantics, idempotency, ordering, checkpoints, webhook renewal, reconciliation and outage recovery | Three live adapters; duplicate/out-of-order/outage results; processing/vendor latency and recovery evidence
Mishal Fatima | Artifact graph, link recovery and provenance | Typed entities/relations, exact/manual/suggested links, confidence, eligibility, identity mapping and relationship lifecycle | Labelled linking benchmark; link precision/recall/F1; provenance and ambiguity cases
Abdullah Amin | Temporal policy engine, role routing and evaluation | Policy schema/versioning, state maps, incremental dispatch, recipient resolution, explanations and evaluation harness | Policy benchmark; full-scan comparison; recipient metrics; manual-workflow evaluation design/results

If this ownership disappeared... | Meaningful evidence lost
Event/reliability ownership | No credible guarantee that graph state represents vendor state
Graph/link ownership | No defensible relationship truth or uncertainty/provenance evaluation
Policy/routing ownership | No consistency contribution or measured human-facing outcome

STUDENT ENTRY - Final ownership adjustments
Record changes after the POC and requirements baseline, with reasons and affected milestones.
 
 
 
 

FAST stage | Minimum product state | Evidence/documentation
Proposal defense - August 2026 | Stakeholder evidence obtained; one real end-to-end POC; revised core and fallback decisions | Problem/gap evidence, POC logs/results, contribution, scope, ownership, initial RAID and milestone plan
Mid-1 - FYP-I | API access secured; requirements/state maps baselined; architecture and benchmark design approved | SRS/SDS, interface contracts, threat model, labelled development set, clickable workflow and traceability matrix
Final-1 - December 2026 | Deployed end-to-end core: three sources, exact/manual links, P1/P2, role routing, dashboard/Slack and reconciliation | Measured baselines, first deployment, integration tests, initial evaluation and revised RAID
Mid-2 - FYP-II | All committed policies, policy lifecycle, reliability/security tests and evaluation running | System test report, defect register, frozen test set, release/rollback rehearsal and acceptance plan
Final-2 - April 2027 | Deployable documented product operated by a non-author; completed evaluation and acceptance | Complete report, acceptance record, failure/limitations analysis, handover and individual defense evidence

Type | Item | Early control | Owner / status
Risk | Figma/Jira permissions or plan restrictions | Secure POC accounts and scopes before defense; reduce committed integration if unavailable | 
Risk | Gap already covered by existing product | Official documentation/trial plus stakeholder comparison; narrow or reject claim | 
Risk | Generic rules create false alerts | Negative cases, state maps, grace periods, confidence gate and policy preview | 
Risk | Missed/duplicate/out-of-order events corrupt state | Idempotency, checkpoints, reconciliation and controlled failure testing | 
Risk | Sensitive source/design content is exposed | Metadata minimization, least privilege, encryption and no-opt-in/no-LLM boundary | 
Assumption | Teams use explicit cross-tool references often enough | Measure exact-reference coverage during stakeholder study and POC | 
Dependency | Stable vendor APIs and developer accounts | Version adapter contracts; schema monitoring; documented fallbacks | 
Issue | Stakeholder/acceptance participants not yet confirmed | Recruit now; record real versus proxy roles | 

Expected outcome
If the stakeholder evidence and POC are credible, this revised idea is defensible for three CS students over two semesters. If either evidence stream contradicts the idea, the group should revise or narrow it before approval rather than defend an unsupported version.

Participant code / role / team / date / consent
Do not place private contact details in the proposal version shared publicly.
 
 

Concrete incident(s)
Record sequence, tools, affected roles, discovery point and consequences.
 
 
 
 
 

Current controls and remaining gap
Document integrations, automations, manual checks and why they succeeded or failed.
 
 
 
 
 

Workflow semantics
State maps, grace periods, meaningful Figma events, overlap rules and responsible roles.
 
 
 
 
 

Design implications
Requirements confirmed/rejected, access/privacy constraints, acceptance criteria and changes to the idea.
 
 
 
 
 

Field | Student entry
POC date / version | 
Participants / owners | 
Environment and hardware | 
Figma/GitHub/Jira access and scopes | 
Code/repository reference | 
Data/event fixture version | 
Policy/configuration version | 

Scenario | Expected | Actual | Pass? | Evidence reference
T1 explicit chain |  |  |  | 
T2 P1 positive |  |  |  | 
T3 P1 negative |  |  |  | 
T4 P2 positive |  |  |  | 
T5 P2 negative |  |  |  | 
T6 overlap positive/negative |  |  |  | 
T7 duplicate/out-of-order |  |  |  | 
T8 outage/reconciliation |  |  |  | 
T9 role routing |  |  |  | 

Metric | Result | Method / denominator | Decision
Exact-link precision/recall/F1 |  |  | 
Suggested-link precision/recall/F1 |  |  | 
Policy precision/recall |  |  | 
Recipient precision/recall |  |  | 
Internal p50/p95 latency |  |  | 
Vendor observation delay |  |  | 
Duplicate conflict count |  |  | 
Reconciliation recovery result/time |  |  | 
Full rescan vs incremental |  |  | 

POC conclusion
State only the conclusion the evidence supports. Include limitations.
 
 
 
 
 

Resulting design/scope/plan changes
List each change with evidence and owner.
 
 
 
 
 
 

Supervisor review questions / decision
Leave blank for review.
 
 
 
 

Original weakness | Resolution in this pack
Generic/absolute novelty claim | Narrow documentation-bounded gap and stronger adjacent-product comparison
Simple timestamp/status rules | Temporal policy semantics with guards, state maps, grace periods, versions and resolution
Graph direction inconsistency | Typed semantic relations and named policy roles
Queue assumed to prevent loss | Adapter checkpoints, reconciliation, idempotency and missed-event testing
Precision defined incorrectly | Correct precision/recall/FPR definitions and separate technical baselines
No evaluation corpus | Versioned labelled link/event/routing benchmark with frozen final test set
Stakeholder evidence only promised | Ready-to-run recruitment, interview and decision protocol with blank evidence fields
POC only promised | Focused scenario, input, metric, success/fallback and result-record package
One member labelled core CCP owner | Three interdependent CCP-relevant ownership areas
Storage ambiguity | Plain PostgreSQL committed; extensions require evidence
Scope risk | Slack outbound only; AI/additional integrations remain optional
Missing milestones/RAID | Five-gate two-semester roadmap and initial risk register
