# 0. Executive Summary

Development teams work across separate tools for design, code, project management and communication. A design change, a merged pull request and a ticket status are disconnected pieces of information that someone must manually reconcile. Small inconsistencies — a stale ticket, an outdated design, an undocumented change — surface late, during code review, QA, deployment or standup, as bugs, rework or miscommunication.

**Unify is a locally deployable cross-tool change-assurance system.** It maintains a versioned evidence graph linking Jira acceptance criteria, approved Figma design intent, GitHub code changes and tests. For each proposed change, it uses deterministic event and policy logic plus a bounded local evidence-verification loop to report what the available evidence **supports, contradicts or leaves unresolved**, with every decisive finding tied to its source.

Unify is not “a website that integrates developer tools”, and it is not another dashboard or chatbot. The integrations (Figma, GitHub, Jira, and Slack for delivery only) are the environment in which the project’s genuine computing problem is solved: reliably reconciling versioned artifacts across heterogeneous tools whose events arrive late, twice or out of order, and then deciding — with cited evidence and explicit abstention — whether one proposed change is adequately supported by its linked intent.

This revision responds directly to faculty review. Three changes define it:

1.  **One central workflow.** Everything in the system is explained through one proposed code change being verified against its linked Jira criteria, Figma design version, changed code and tests. Project-wide “consistency” is no longer the framing.
2.  **One AI story.** All model inference in the committed system is **local**. The hosted-LLM assist layer from the previous revision has been removed. Parameter-efficient fine-tuning (LoRA/QLoRA) is a measured experiment with a go/no-go rule, not a promised gain.
3.  **Depth instead of breadth.** No new integrations are added. Depth is added inside the core: base/head diff, symbol and test-evidence extraction for one declared language, bounded criterion-specific context construction, fixed verification passes, and a provenance gate that rejects uncited decisive output.

The proposal defines the problem with a stakeholder-evidence plan, concedes overlap with contemporary products rather than claiming none exists, states one contribution, freezes a five-tier scope hierarchy, and sets out a concrete PoC (interactive skeleton plus local technical spike), dataset plan, evaluation protocol, deployment plan and three-student ownership split.

# 1. Problem Statement

Development teams use Figma, GitHub and Jira separately. Each tool holds its own record of the same real-world unit of work — a design version, a pull request, a ticket, a discussion — with no shared identifier connecting them, and each tool versions that record on its own clock. When one changes, nothing propagates the implication of that change to the others.

The concrete decision that fails is a **code review**. A reviewer opening a pull request must decide whether this change still matches the intent it claims to implement. To do that they must open Jira for the acceptance criteria, open Figma for the approved design and check whether it has moved since the branch was cut, read the diff, and guess whether the tests actually cover the criterion. There is no artifact that records what evidence supported that decision, so the reasoning is lost the moment the PR is merged. The mismatch is then discovered late — during QA, at deployment, or at standup — after the cost of rework has been incurred.

## 1.1 Users and stakeholders

- **Primary user — code reviewer / technical lead.** Decides whether one proposed change is adequately supported by its linked intent and evidence, and owns the final call.
- **Developer** — needs to know when the design or requirement being implemented against has changed, and what evidence is missing from their own change.
- **Designer** — needs to know when an implementation has diverged from an approved design constraint, and needs their design treated as versioned intent rather than a screenshot.
- **Product owner / PM** — owns acceptance criteria and workflow state; needs project-level visibility into unresolved evidence without commit-level noise.

The central decision is **not** whether an entire project is “consistent”. It is whether **one proposed change** is adequately supported by its linked intent and evidence.

## 1.2 Evidence plan

The problem is described here from direct observation of common multi-tool team workflows; it is being substantiated with primary evidence before requirements are baselined:

- Structured interviews or a workflow-observation session with 6–10 developers, reviewers, designers and PMs — target group: FAST senior-year project teams or a partner student/industry team already using Figma + GitHub + Jira together.
- A short survey (10–15 questions) capturing: frequency of late-discovered design/code/ticket mismatches, how they were discovered, time lost, whether existing sync or AI-review tools were used and why they did not prevent the incident, and whether repository/design data is permitted to leave the organisation.
- A measured or estimated baseline — mismatches per sprint/week and time cost per incident — used later as the evaluation comparator (Section 12).

### Questions asked

- Describe the last time a ticket, design and implementation disagreed. How was it detected and what did it cost?
- Which artifact is treated as authoritative, and what happens when it changes during an open PR?
- What evidence do reviewers currently inspect to decide whether an acceptance criterion is implemented?
- Which false alert would make you stop using a tool like this?
- Must repository/design data remain local, and what hardware could reasonably host inference?
- Would a provenance-backed REVIEW / INSUFFICIENT_EVIDENCE result be useful, or only an automatic pass/fail?

## 1.3 Stakeholder recruitment, ethics and decision gates

| Role                           | Minimum representation    | Useful eligibility                                                        |
|--------------------------------|---------------------------|---------------------------------------------------------------------------|
| Developer / reviewer           | At least 2                | Reviews PRs and consumes design/requirements.                             |
| Designer                       | At least 2                | Uses Figma and hands designs to implementation teams.                     |
| PM / product owner / team lead | At least 2                | Owns acceptance criteria and workflow status.                             |
| Total                          | 6–10 initial participants | Prefer more than one team; record proxies separately from industry users. |

**Ethical and practical boundaries:** obtain informed permission before taking notes; do not request source code, private design files, OAuth tokens, secrets, or customer-identifying information; anonymise incidents unless the participant authorises attribution; separate observed facts, participant claims, and student interpretations; do not pressure participants to validate the idea.

| Finding                                              | Required response                                                                                                 |
|------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| No repeated/material incidents found                 | Do not manufacture importance; narrow to the validated failure or reconsider the idea.                            |
| An existing product already solves the full workflow | Reposition around a verified constraint (local execution, provenance, reproducibility) or reject the claimed gap. |
| Figma is not part of the target workflow             | Replace it only if the actual design source provides comparable versioned constraints and the CCP remains intact. |
| Users reject broad OAuth/data access                 | Reduce scope, use metadata-only processing, or revise the deployment model.                                       |
| PR merge does not map uniformly to completion        | Adopt stakeholder-specific canonical state maps and grace periods.                                                |
| Alert fatigue dominates perceived value              | Make precision, abstention and suppression core rather than minor features.                                       |
| Reviewers want pass/fail only, not evidence states   | Re-test the output vocabulary; keep abstention but simplify its presentation.                                     |

## 1.4 Validation status and schedule

Stakeholder need is currently **planned rather than demonstrated**. This is stated openly rather than dressed up.

| When           | Minimum activity                                                                                                                                   | Evidence reported                                                                                                                                 |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Before defence | 3–5 respondents across developer/reviewer and product/design roles, preferably from at least two teams; collect three concrete mismatch incidents. | Current tools, time spent, missed evidence, alert tolerance, privacy constraints, and whether the proposed evidence case would change a decision. |
| After defence  | 6–10 task-based sessions using realistic change cases against the same manual baseline.                                                            | Decision accuracy, time, missed/false alerts, evidence sufficiency, adoption conditions, role-specific objections.                                |

> **Student evidence still required.** Named stakeholder contacts, interview dates, consent notes, summarised findings, and at least three concrete mismatch incidents with material cost.

# 2. Related Work and Evidence-Based Gap

## 2.1 Comparable commercial and research systems

**The overlap is conceded, not denied.** CodeRabbit already uses Jira context and can validate a PR against linked issue requirements; Atlassian Rovo can compare PR code with linked Jira work-item requirements; GitHub natively links pull requests to issues; and Figma exposes files, nodes, versions and webhooks through its REST API. Neither cross-tool integration nor Jira-aware AI review is, by itself, sufficient novelty. The previous revision’s claim that “no product identified performs this at all” is withdrawn.

| Product / approach                              | Core approach                                                                                      | Constraints / deployment                                          | Overlap with Unify                                          | What Unify must add and prove                                                                                                                           |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| CodeRabbit (Jira integration, issue validation) | AI PR review with linked-issue context; validates changes against issue requirements.              | Hosted SaaS; code and ticket context leave the customer boundary. | **High** — this is the closest single competitor to Rule 5. | Local execution; deterministic context construction; reproducible, versioned evidence; explicit abstention; provenance validation of every citation.    |
| Atlassian Rovo (acceptance-criteria check)      | Compares PR code against linked Jira work-item requirements inside the Atlassian ecosystem.        | Ecosystem-locked; hosted.                                         | **High** on criterion checking.                             | Cross-vendor version identity including Figma; asynchronous-event reconciliation; auditable evidence case rather than an assistant answer.              |
| GitHub native issue\<-\>PR linking              | First-class relationship between a PR and an issue.                                                | Same-vendor only.                                                 | Medium.                                                     | Cross-tool version identity, missing/conflicting links, evidence preserved across Figma, Jira, code and tests.                                          |
| Unito / Exalate                                 | Two-way field sync across 20+ tools.                                                               | SaaS, per-seat, per-field mapping.                                | Low.                                                        | Typed semantic relations and criterion-level change assurance rather than field synchronisation.                                                        |
| Zapier / Make                                   | One-way trigger -\> action automation.                                                             | SaaS, rule-per-automation.                                        | Low.                                                        | Event plumbing alone has no relationship model or evidence semantics.                                                                                   |
| Unblocked                                       | Cross-tool knowledge graph over code, PRs, Slack, Jira, Confluence, Notion; NL Q&A with citations. | Commercial SaaS, broad coverage.                                  | Medium–high on the graph itself.                            | The graph idea exists commercially; Unify’s claim sits in versioned provenance, deterministic gating and evaluated abstention, not in “having a graph”. |
| Potpie                                          | Cross-tool knowledge graph for AI coding agents.                                                   | Funded startup, code-centric.                                     | Medium.                                                     | Different consumer (agents vs. a human reviewer’s audit record).                                                                                        |
| Applitools / Uiprobe                            | Visual/pixel divergence between a Figma design and the live site.                                  | Plugin/CI-integrated.                                             | Low.                                                        | Visual comparison is not claimed as invented; Unify links structured design evidence to the criterion, code and tests.                                  |
| Figma for Jira                                  | Notifies on design changes within a linked Figma–Jira pair.                                        | Marketplace plugin.                                               | Low.                                                        | Pairwise only; no code or test evidence.                                                                                                                |
| General LLM assistants                          | Answer questions about a hand-assembled context bundle.                                            | Hosted; non-reproducible between runs.                            | Medium.                                                     | See Section 2.3.                                                                                                                                        |
| Manual review workflow                          | Human judgement across four browser tabs.                                                          | None.                                                             | —                                                           | Primary evaluation baseline; must be measured directly (Section 12).                                                                                    |

> **Student evidence still required.** For each product above, record the official page or trial date, the capability actually observed, the limitation actually observed, and the exact resulting design decision. Do not claim empirical superiority over a commercial system without running a controlled comparison.

## 2.2 Positioning within the FAST FYP repository (2019–2025)

Unify was checked against a normalised analysis of the FAST School of Computing FYP repository covering Spring 2019 through Fall 2025 (~990 projects) and a focused pattern analysis of the 2024–2025 cohorts (483 projects).

- No project in the analysed repository targets cross-tool evidence reconciliation or criterion-level change assurance across software-engineering tools. “Workplace and enterprise systems” is the closest domain at 86 projects (8.7%), but covers institutional administration, document tracking and record management — not internal developer-tool workflows.
- The closest architectural analogues are Pattern D (“workflow-automation platforms”) and the Fall 2025 “AI-as-orchestrator” pattern.

| Prior FYP                   | Closest overlap                                                                          | Structural difference to defend                                                  |
|-----------------------------|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| F25-291-D-GHOST             | Multi-tool orchestration across Google services via master-agent/sub-agent architecture. | Executes instructed workflows; maintains no versioned artifact-evidence model.   |
| F25-162 / F25-305-D-FYPilot | Multi-stage institutional workflow automation.                                           | Institutional FYP process, not evolving design–code–ticket evidence.             |
| F25-062-D-Allure-AI         | Traceability, versioning, model QA, Jira/Trello/Slack integration.                       | MBSE model context; Unify targets live code/test evidence and event reliability. |
| F25-099-D-MARS              | Requirements traceability and conflict detection.                                        | Requirements-engineering platform; no code/test evidence or local verifier.      |
| S22-11-D-SoftReq            | Requirements validation and traceability.                                                | Single requirements domain, not heterogeneous live tool events.                  |
| S25-016-D-TaskWise          | Project-management automation and integrations.                                          | Task allocation/productivity, not change assurance.                              |
| F23-088-D-FigForge          | Figma-to-code workflow.                                                                  | Code generation, not evidence verification of an existing change.                |

Unify does not overlap with the repository’s saturated categories — generic chatbots, RAG document Q&A, recommenders, disease/phishing/deepfake classifiers, e-commerce marketplaces, attendance/LMS systems, lecture summarisation, admission assistants, sign-language translation, mental-health chatbots, traffic/parking alerts, or blockchain record systems.

## 2.3 Defensible novelty claim

> **Unify’s contribution is a locally reproducible, provenance-preserving change-evidence process that reconciles asynchronous cross-tool artifacts, constructs bounded criterion-specific context, verifies implementation evidence in a fixed number of passes, rejects uncited confident outputs, and records what remains unresolved.**

**Could a general LLM do this if handed the data?** A general model can summarise a hand-picked context bundle. It does not by itself guarantee that the bundle is complete, current, correctly linked, versioned, privacy-preserving or reproducible. Unify’s engineered value lies before and after inference: reliable ingestion, entity and version resolution, code/test indexing, deterministic bounded retrieval, evidence provenance, output validation, abstention, event replay and human audit. This argument is not relied on rhetorically — Section 12 compares Unify against a fixed general/base-model prompt baseline with identical inputs.

# 3. Fit with University FYP Expectations

| University expectation                                | How Unify satisfies it                                                                                                                                                                                                                                                    |
|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A concrete stakeholder (not “everyone”)               | One primary user — the code reviewer — plus three named secondary roles (Section 1.1).                                                                                                                                                                                    |
| A specific operational pain point                     | A reviewer cannot cheaply establish whether one proposed change still matches its linked intent, and no record of that evidence survives the merge.                                                                                                                       |
| A complete service workflow, not an isolated function | Ingest -\> version -\> link -\> extract code/test evidence -\> build bounded context -\> verify per criterion -\> gate -\> report -\> human resolution and audit (Section 6).                                                                                             |
| A meaningful, necessary technical component           | Versioned cross-tool evidence reconciliation under unreliable events, plus a bounded, provenance-gated local verifier — the CCP (Section 4). Not an AI feature added for its own sake.                                                                                    |
| Multiple system components                            | Adapters, artifact/version store, code analyser, evidence graph, context builder, local verifier, verdict gate, rule/report layer, reviewer UI (Section 8).                                                                                                               |
| Measurable success criteria                           | Link precision/recall, criterion-evidence Recall@k, verdict macro-F1, unsupported-assertion rate, provenance completeness, abstention correctness, event convergence, latency (Section 12).                                                                               |
| A defensible data strategy                            | First-party data from connected tools via read-only OAuth; public component corpora for training; a custom, manually adjudicated gold oracle (Section 12.3).                                                                                                              |
| An SDG or social/industrial-impact connection         | SDG 9 (Industry, Innovation and Infrastructure): improves the reliability of software-development infrastructure. Secondary SDG 8 via reduced rework. Local-only inference also addresses data-sovereignty constraints for teams that cannot ship code to a hosted model. |

## 3.1 Weaknesses this proposal deliberately avoids

- **Technology-first thinking** — the CCP (Section 4) is a reasoning and reliability problem, not “use an LLM for X”.
- **An “AI veneer” over a CRUD app** — the model has one precise, bounded job (criterion-level evidence verification) and cannot produce a decisive finding without validated citations.
- **Two incompatible AI stories** — the hosted-LLM assist layer has been removed; there is one local inference path (Section 11).
- **A feature list presented as a problem statement** — Section 1 states one decision; Section 5 states one contribution.
- **Excessive scope** — no new integrations; depth is added inside the existing three tools, and one implementation language is frozen (Section 7).
- **Unfalsifiable claims** — every central claim has a baseline, a metric and a stated result that would falsify it (Section 12).
- **Promised model gains** — fine-tuning is an experiment with a published go/no-go rule, and a negative result is an acceptable, reportable outcome.

# 4. Complex Computing Problem (CCP)

> **How can Unify incrementally maintain provenance-preserving relationships among design, requirement, code and test artifacts across asynchronous development tools, and determine whether a proposed change remains consistent with its linked intent using a locally executed, iteratively grounded verifier — while minimising false links and unsupported conflict alerts when evidence is incomplete, delayed, duplicated, out of order or contradictory?**

This is a minimal revision of the original CCP, not a replacement. It retains heterogeneous-tool integration, entity resolution, the relationship graph, change-triggered analysis, the deterministic drift rules, and the original focus on false alerts under delayed, duplicated, out-of-order and partially linked events. It adds the faculty-requested codebase depth as a **bounded verifier** rather than turning Unify into a coding agent, and gives the local model a precise role: criterion-level evidence verification, not unrestricted project understanding.

## 4.1 Trade-offs created by this CCP

- **Evidence coverage vs. false-alert control** — raising sensitivity increases recall but also increases unsupported findings and dismissal.
- **Analysis depth vs. PR latency and local hardware** — deeper code/test analysis and more verification passes cost time on a fixed, self-hosted inference budget.
- **Freshness vs. API limits** — GitHub, Jira and Figma expose different webhook guarantees and rate limits; polling fallback trades freshness for reliability.
- **Automation vs. review accountability** — a probabilistic verifier may propose, but a human reviewer must retain the decision, so decisive states require deterministic gating.
- **Heterogeneous schemas and identities** — a “change” means something different in each tool and must be normalised across versions without losing meaning.
- **Incomplete information** — the system reasons over an incomplete graph and must be able to say so rather than guessing.

## 4.2 CCP characteristic evidence

| Characteristic                 | Defensible evidence in Unify                                                                                                                                                     |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Conflicting requirements       | Evidence coverage vs. false-alert control; deep local analysis vs. PR latency and limited hardware; automation vs. review accountability.                                        |
| No obvious solution            | Figma nodes, Jira criteria, Git commits, symbols and tests share no standard identity and no universal definition of “consistent”.                                               |
| Depth of knowledge             | Event-driven systems, entity resolution, repository mining, static analysis, graph modelling, information retrieval, local LLM adaptation, calibration and provenance.           |
| Infrequent / unfamiliar issues | Cross-version identities, renamed artifacts, missing links, stale webhooks, contradictory tool states, insufficient code context, ungrounded model output.                       |
| Beyond standard practice       | Event-relay tools cannot answer “is this change still supported by its linked criterion and design version”; that needs versioned stateful reasoning plus grounded verification. |
| Diverse stakeholders           | Reviewer, developer, designer and product owner have different risk tolerance, evidence needs and authority to resolve.                                                          |
| Interdependence                | Bad links corrupt context retrieval; incomplete code graphs distort verification; stale events change rule eligibility; model errors change notifications.                       |
| Ill-defined requirements       | “Implements”, “matches design”, “affected code”, “sufficient evidence” and “acceptable uncertainty” must be operationally defined and evaluated.                                 |
| Significant consequences       | A false confident alert wastes review effort and gets the tool disabled; a missed contradiction lets a requirement or design deviation reach the product.                        |

## 4.3 Central trade-offs to defend

| Trade-off                                       | Design response                                                                                                                       | Evaluation evidence                                                                           |
|-------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Recall vs. alert noise                          | Confidence gate on inferred links, grace periods, severity levels, suppression, and mandatory abstention states (Sections 9.2, 11.7). | Verdict precision/recall per class, unsupported-assertion rate, alerts per user (Section 12). |
| Freshness vs. API limits                        | Webhooks plus bounded reconciliation polling per adapter (Section 8.4).                                                               | Vendor delay, internal latency, API call volume, missed-event recovery.                       |
| Automation vs. review accountability            | Deterministic verdict gate; model output cannot become a decisive finding without valid citations (Section 11.8).                     | Invalid-citation rate; provenance completeness; correct abstention rate.                      |
| Depth vs. latency                               | Fixed two-pass verification with a conditional third critic pass, bounded context packets, asynchronous queueing (Section 11.4).      | p50/p95 local analysis latency, memory, pass-count distribution.                              |
| Generic rules vs. team fit                      | Configurable status maps and rule parameters, versioned over time (Section 9.3).                                                      | Correctness re-checked across at least two workflow configurations.                           |
| Graph expressiveness vs. operational complexity | Plain PostgreSQL adjacency/event tables for the MVP (Section 9.9).                                                                    | PoC query/latency evidence gathered before any dedicated graph database is considered.        |
| Model gain vs. honesty                          | LoRA/QLoRA is an evidence-gated experiment with a published go/no-go rule (Section 12.4).                                             | Base vs. adapted held-out comparison under identical retrieval.                               |

# 5. Contribution Statement

1.  **A versioned cross-tool evidence graph** that resolves identity for a single real-world unit of work across Figma, GitHub and Jira — including *which version* of each artifact a finding was based on — using deterministic linking from explicit references plus manual linking for unresolved cases, with immutable provenance on every edge.
2.  **A reliability layer for asynchronous tool events** — normalised envelopes, idempotency, checkpointing and reconciliation — such that duplicate and out-of-order delivery converge to the same final state and a vendor’s undelivered event is recovered rather than silently missed.
3.  **A criterion-level change-assurance method**: for each atomic acceptance criterion or approved structured design constraint, deterministic retrieval builds a bounded evidence packet from the graph and repository, and a bounded local verifier returns a structured, cited verdict — SUPPORTED, CONTRADICTED, PARTIAL or INSUFFICIENT_EVIDENCE.
4.  **A deterministic provenance gate** that resolves every citation against the immutable evidence packet and refuses to let an uncited or invalid-cited model output become a decisive finding, converting it instead to review or insufficient evidence.
5.  **Deterministic temporal drift rules** (Rules 1–3) that capture design-version, workflow-state and coordination drift that code-semantic analysis alone does not.
6.  **An evaluation framework**: a manually adjudicated gold oracle plus multi-baseline protocol covering linking, retrieval, verdict quality, grounding, abstention, event convergence, latency and reviewer task performance — including a fixed general/base-model baseline and a published go/no-go rule for the fine-tuning experiment.

**What is and is not novel.** Cross-tool linking, traceability-link recovery, static analysis and LLM-assisted review are all existing work, and Jira-aware AI review already ships commercially (Section 2.1). The contribution is architecture-, method- and evaluation-level: the *reproducible, local, provenance-gated* process that produces an auditable evidence case for one proposed change. Contributions 1–2 and 4–6 require no new algorithm or model. Contribution 3 involves adapting an existing open-weight model to a narrow task; that adaptation is an **evidence-gated experiment** (Section 12.4), and its retention in the product depends on measured held-out gain, not on assumption.

## 5.1 Contribution types under the FAST guide

- **System/architecture contribution** — dependable cross-vendor event, version and provenance handling under real API constraints, deployed entirely on team-owned infrastructure.
- **Method contribution** — bounded, deterministic criterion-specific context construction with fixed verification passes and grounded output validation.
- **Human/workflow contribution** — explainable evidence cases routed to accountable roles, with resolution, override and audit history.
- **Evaluation contribution** — a manually adjudicated cross-tool change-intent oracle and a multi-baseline protocol covering correctness, grounding, abstention, reliability and workflow usefulness.

## 5.2 What Unify must not claim

- It does not prove that arbitrary software is correct.
- It does not replace the reviewer, designer or product owner.
- It does not guarantee semantic equivalence between a Figma design and an implementation.
- It is not novel merely because it connects Jira, Figma, GitHub and Slack.
- It is not a general coding agent, autonomous fixer or cross-tool chatbot.
- A model probability is not evidence; a decisive finding requires valid cited evidence and deterministic gating.

# 6. Proposed System

Unify is a locally deployed web application. Every technical component is explained through **one proposed-change workflow**.

| Stage                  | Required behaviour                                                                                                                              | Role                                |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| 1\. Linked intent      | The PR links a Jira item (with atomic acceptance criteria) and the relevant approved Figma node/version or structured design constraints.       | Core — contribution (1).            |
| 2\. Actual change      | Unify extracts base/head diffs, affected symbols, dependencies and test evidence for one declared language.                                     | Core — contribution (3).            |
| 3\. Versioned graph    | Artifacts and relationships retain source, version, timestamp, resolver and evidence state; events are reconciled for duplication and ordering. | Core — contributions (1)(2).        |
| 4\. Local verification | A bounded local loop retrieves and checks evidence criterion by criterion; it cannot invent graph edges or source facts.                        | Core — contribution (3).            |
| 5\. Evidence case      | The reviewer sees supported, contradicted, partial and insufficient-evidence findings with citations, plus temporal drift rule findings.        | Core — contributions (4)(5).        |
| 6\. Human resolution   | The reviewer resolves or overrides disputed findings; the decision, user, time and evidence snapshot are audited.                               | Core — human/workflow contribution. |

Supporting presentation (dashboard, activity feed, Slack delivery) sits **over** this reasoning and is not itself claimed as a contribution.

# 7. Scope Definition

## 7.1 Scope hierarchy

| Level                                      | Components                                                                                                                                                                                                                                                                                                                                                                                                                           | Defence position                                                                                                                   |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| **Committed core**                         | Read-only GitHub, Jira and Figma ingestion; explicit/manual links; versioned evidence graph with provenance; event reliability (idempotency, checkpointing, reconciliation); one-language diff/symbol/test analysis; structured atomic criteria; deterministic context-packet builder; two-pass local verifier with conditional critic pass; verdict/provenance gate; Rules 1–2; reviewer evidence report with resolution and audit. | These implement and evaluate the revised CCP.                                                                                      |
| **Committed supporting**                   | Rule 3; role-aware notification routing; dashboard and activity feed; local model-serving container; basic Slack delivery adapter; authentication; deployment pipeline; evaluation harness.                                                                                                                                                                                                                                          | Useful product infrastructure, not separate novelty claims.                                                                        |
| **Evidence-gated experiment**              | LoRA/QLoRA adaptation of the selected local model for criterion–evidence verdicting.                                                                                                                                                                                                                                                                                                                                                 | The *experiment* is committed; deploying the adapted weights depends on held-out gain and grounding/latency safety (Section 12.4). |
| **Stretch (not promised for the defence)** | Automatic semantic (embedding/LLM-inferred) link suggestion; visual screenshot/DOM checks; natural-language querying over the graph; standup summaries; GitLab/Linear/Notion/Vercel; general design-to-code vision-language comparison; always-on third verification pass; cascading multi-hop staleness analytics.                                                                                                                  | Documented for forward compatibility only.                                                                                         |
| **Explicitly excluded**                    | Autonomous code generation or fixes; universal correctness proof; all languages/frameworks; unrestricted chat; two-way write-back sync; **any hosted production LLM**; pixel-perfect Figma certification; replacing any existing tool.                                                                                                                                                                                               | Stated explicitly to control scope and liability.                                                                                  |

## 7.2 Frozen implementation language

The committed code analyser supports **exactly one language and repository class: TypeScript/React front-end repositories.** This is the stronger default because the test application is Figma-centred and front-end heavy, so components, DOM structure, styles and screenshots are available as evidence, and structured design constraints map onto component props and tokens. Python is not committed. The proposal does not claim multi-language support; “we support every codebase” is an explicitly avoided claim.

## 7.3 Design-evidence boundary

> **Figma is not a requirements oracle.** A visual layer name or timestamp cannot prove intended behaviour. For the committed system, a designer or product owner must confirm **structured constraints** — component identity, text content, required state, design token, spacing range, or interaction — before they can produce a decisive verdict. Unstructured visual similarity never produces a blocking verdict. Screenshot/DOM comparison and any vision-language model are stretch work, evaluated separately if attempted.

# 8. Technical Architecture

## 8.1 Layered reference architecture

The architecture is defined by the **role** each layer plays, not by the products that happen to occupy it. A source system is characterised by what it contributes — versioned intent, work-item state, code change, test evidence or delivery — so replacing one vendor with another changes a single adapter and one binding row, and leaves every layer above it untouched. This is what makes the vendor-swap decision gate in Section 1.3 executable rather than aspirational.

### Source roles

| Source role          | Contributes                                                        | Adapter obligations                                                       |
|----------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| Design-intent source | Versioned design artifacts and approved structured constraints.    | Version identity, change events, constraint export.                       |
| Work-item source     | Tickets, acceptance criteria, workflow state transitions.          | Criterion text, state map, transition events.                             |
| Change source        | Repositories, branches, base/head commits, diffs, review metadata. | Commit identity, diff access, change events.                              |
| Test-evidence source | Test files, runs, results and coverage where executable.           | Result identity, linkage to changed symbols.                              |
| Delivery channel     | Outbound notification of findings.                                 | Delivery receipt and failure reporting only; never an input to reasoning. |

### Layers and trust boundaries

| Layer                              | Responsibility                                                                                                                | Trust boundary                                                                                         |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Adapter layer                      | One connector contract per source role: read-only ingestion, event receipt plus polling reconciliation, normalised envelope.  | Deterministic; preserves raw source ID, version and timestamp. Vendor-specific logic exists only here. |
| Event reliability layer            | Idempotency by stable event key, per-resource checkpoints, reconciliation of undelivered events, ordering and version guards. | Duplicate and out-of-order delivery must converge to the same final state.                             |
| Artifact and version store         | Immutable snapshots of criteria, design nodes/versions, commits, diffs and test runs.                                         | Never overwrites evidence cited by an earlier finding.                                                 |
| Analysis layer                     | Change/symbol/dependency extraction, test-evidence linkage, criterion decomposition, structured design-constraint extraction. | Marks unresolved relations rather than inventing them.                                                 |
| Evidence graph                     | Typed cross-tool relationships with provenance, source class, confidence and validity interval.                               | Every edge is observed, deterministically derived, retrieval candidate or unresolved.                  |
| Policy and rule engine             | Deterministic temporal and coordination rules; criterion invalidation and queueing on each delta.                             | Versioned, declarative rules; no vendor semantics leak upward.                                         |
| Context builder                    | Criterion-specific bounded evidence packet assembled from graph and repository.                                               | Deterministic retrieval with a recorded truncation manifest.                                           |
| Local verifier                     | Structured criterion-level judgement over the packet, in a fixed number of passes, on team-owned inference.                   | Cannot create source facts, graph edges or findings by itself.                                         |
| Verdict and provenance gate        | Schema validation, citation resolution, rule applicability, thresholds, downgrade and abstention.                             | Rejects unsupported decisive output; converts it to review or insufficient evidence.                   |
| Evidence case and reviewer surface | Findings, role routing, resolution, override and audit history.                                                               | The human reviewer owns the final decision.                                                            |

Three concerns cut across every layer: **provenance and audit** (what evidence, which version, which resolver, which run), **policy versioning** (state maps, thresholds, grace periods and rule versions), and **access control** (read-only least-privilege scopes and encrypted secrets). Everything from the adapter layer downward sits inside the local deployment boundary; no layer transmits artifact content outside it.

### Binding for the committed core

| Source role          | Bound to (committed core)                                        | Substitution condition                                                                  |
|----------------------|------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| Design-intent source | Figma                                                            | Replacement must expose versioned nodes and machine-readable constraints (Section 1.3). |
| Work-item source     | Jira                                                             | Replacement must expose atomic criteria and a configurable state map.                   |
| Change source        | GitHub                                                           | Replacement must expose base/head commits, diffs and change events.                     |
| Test-evidence source | The repository’s own test suite (declared language, Section 7.2) | Replacement must link results to changed symbols.                                       |
| Delivery channel     | Slack                                                            | Freely substitutable; not a technical contribution.                                     |

## 8.2 Interfaces, data flow and boundaries

- **Data flow:** vendor webhook/poll -\> normalisation -\> version store -\> evidence-graph update -\> (a) deterministic rule evaluation and (b) criterion queue -\> context packet -\> bounded local verification -\> verdict gate -\> evidence case -\> notification routing -\> reviewer UI / audit.
- **External dependencies:** GitHub REST/GraphQL + webhooks, Jira REST + webhooks, Figma REST + webhooks/polling, Slack Web API for delivery only. **No hosted model API is a dependency of the committed system.**
- **Security/privacy boundaries:** read-only, least-privilege OAuth scopes; tokens encrypted at rest; per-workspace isolation; **repository, ticket and design content never leaves the deployment boundary** — all inference is local.
- **Most uncertain parts likely to change:** Figma’s event/webhook coverage compared with GitHub/Jira (may require heavier polling); local inference latency and memory on available hardware; and criterion-to-code retrieval recall. All three are tested directly in the PoC and technical spike (Section 13).

## 8.3 Normalised event envelope

| Field                               | Purpose                                                                                          |
|-------------------------------------|--------------------------------------------------------------------------------------------------|
| event_id / vendor_delivery_id       | Idempotency and audit — checked before any duplicate event is processed.                         |
| workspace_id / source_tool          | Tenant isolation and adapter routing.                                                            |
| entity_type / entity_id / version   | Canonical artifact identity and ordering.                                                        |
| action / state_before / state_after | Policy trigger and temporal comparison.                                                          |
| actor / occurred_at / received_at   | Ownership, vendor delay and internal latency measurement.                                        |
| references                          | Explicit Jira keys, Figma file/node/version resources, PR/commit URLs and other link candidates. |
| raw_hash / schema_version           | Provenance, content integrity and vendor-schema change detection.                                |

## 8.4 Reliability, checkpointing and idempotency

An incoming queue alone does not prevent event loss, since a vendor does not guarantee automatic redelivery of a failed webhook. Reliability rests on three linked mechanisms:

- **Idempotency** — every event carries a stable event_id; before processing, the system checks whether that exact ID has already been committed and discards it as a no-op if so. This protects against duplicate delivery, not missed delivery.
- **Checkpointing** — each adapter persists a marker per connected resource (repo, project, file) recording the last successfully processed event/state and when. This is what makes it possible to later ask “did I miss anything since then”.
- **Reconciliation** — periodically, and after any detected outage, each adapter polls the vendor API and compares current state against its checkpoint; any gap is synthesised into a reconciliation event and run through the normal pipeline.

**Reliability state machine:** (1) receive and authenticate webhook or poll response; (2) persist the raw/normalised event before evaluation; (3) reject or merge duplicates by stable vendor/event key; (4) apply only if the entity version/time is newer or explicitly reconciled; (5) update artifact and relationship state transactionally; (6) evaluate only indexed rules affected by the delta and queue affected criteria for re-verification; (7) write finding/recipient/audit records idempotently; (8) advance the adapter checkpoint after successful commit.

If a tool cannot be reached beyond a configurable threshold, its linked artifacts are marked **SOURCE_STALE** and any dependent finding is downgraded rather than silently computed from old data.

# 9. Evidence Graph and Rule Engine — Detailed Design

Deterministic rules and criterion-level verification are not two separate engines. Both read off one typed, versioned property graph; findings and notifications are two consumers of the same evaluations.

| Stage                         | What happens                                                                                                 |
|-------------------------------|--------------------------------------------------------------------------------------------------------------|
| 1\. Ingestion + normaliser    | Tool events are mapped into graph mutations, gated by the checkpoint/idempotency layer (Section 8.4).        |
| 2\. Version store + graph     | Immutable artifact snapshots are written; nodes and edges are created/updated with provenance (Section 9.1). |
| 3\. Deterministic rule engine | Rules attached to the changed edge type are evaluated (Sections 9.3–9.4).                                    |
| 4\. Criterion queue           | Affected atomic criteria are queued for bounded local verification (Section 11).                             |
| 5a. Findings                  | A fired rule or a gated verdict produces a derived, versioned annotation with its evidence.                  |
| 5b. Notifications             | The same firing resolves who cares via role-edge traversal, filtered by per-user config (Section 9.7).       |

## 9.1 Graph data model

Edge direction uses semantic role names — *design*, *implementation*, *ticket*, *criterion*, *test* — tied to named entity types rather than ambiguous “source”/“target”.

| Node types                                                                                                                 | Status                                                                                |
|----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| DesignArtifact (file/node/version), DesignConstraint, Ticket, Criterion, PullRequest, Commit, CodeSymbol, TestCase, Person | MVP — committed core.                                                                 |
| Message (Slack)                                                                                                            | MVP — notification delivery and role/watch signal only; not a rule-evaluation target. |
| Doc, Deploy                                                                                                                | Deferred — schema reserves the fields; no ingestion adapter is built.                 |

Each node carries canonical fields (status, owner, last_modified, **version**, validity interval) plus a raw metadata blob from the source tool (jsonb), so nothing from the source is lost even when a field is not yet modelled canonically. **Artifact snapshots are immutable**: a new version creates a new snapshot rather than overwriting the evidence a previous finding cited.

Edge types carry the payload:

- **IMPLEMENTS**(implementation, design version) — the PR implements the identified design version/node.
- **TRACKS**(implementation, ticket) — the PR is part of the work represented by the ticket.
- **SATISFIES_CANDIDATE**(implementation/symbol, criterion) — retrieval-derived candidate evidence for one atomic criterion; never decisive by itself.
- **COVERS**(test, symbol/criterion) — test evidence relation derived by the code analyser.
- **TOUCHES_COMPONENT**(implementation, implementation) — shared component between two open PRs.
- **CONSTRAINS**(design constraint, criterion/component) — an approved structured design constraint.
- Role edges: **OWNS**, **ASSIGNED_TO**, **WATCHES** (Person -\> any entity).
- **DISCUSSED_IN**, **BLOCKS**, **DUPLICATES**, **PART_OF**, **REFERENCES** — modelled; REFERENCES depends on the deferred Doc node type and is not evaluated by any MVP rule.

Every edge additionally carries: **source class** (observed / deterministically derived / model candidate / unresolved), a **confidence** value where applicable, the **resolver** that created it, **created_at**, and a **validity interval** so a finding can be re-read against the graph as it stood at the time.

## 9.2 Confidence and firing policy

A rule or verdict may only become decisive on a deterministic or manually confirmed edge, or on an inferred edge whose confidence is at or above a validated threshold and which has not been dismissed by a reviewer. An unconfirmed low-confidence edge may exist in the graph as a suggestion, but cannot by itself produce a decisive finding or notification. This enforces the AI boundary (Section 11) structurally rather than by convention.

| Link type                                 | Creation                                                                       | May produce a decisive finding?                                              |
|-------------------------------------------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Deterministic                             | Explicit Jira key, PR URL, Figma dev resource, or exact configured identifier. | Yes, subject to validation and rule configuration.                           |
| Manual confirmed                          | Authorised user links two known artifacts.                                     | Yes; provenance records the confirmer.                                       |
| Retrieval candidate (SATISFIES_CANDIDATE) | Deterministic retrieval proposes code/test evidence for a criterion.           | Only as *cited evidence inside* a gated verdict — never as a link of record. |
| Inferred suggestion (stretch)             | Embedding/similarity proposes a relationship.                                  | No, until confirmed or promoted under a separately validated threshold.      |
| Dismissed / revoked                       | User rejects a suggestion or invalidates an old link.                          | No; history remains auditable.                                               |

## 9.3 Rule schema

A rule is a declarative, versioned record rather than code buried in a handler.

    { "id": "design_version_after_implementation_baseline",
      "version": 1,
      "edge_type": "IMPLEMENTS",
      "trigger": { "on": "design.version_created",
                   "condition": "design.version_created_at > implementation.evaluated_baseline_at" },
      "guards": ["link.confirmed_or_deterministic", "design.change_is_meaningful"],
      "grace_period_hours": 24,
      "produces": { "annotation": "DESIGN_VERSION_DRIFT", "severity": "medium" },
      "notify": { "roles": ["assignee_of_implementation", "owner_of_design"],
                  "reason_template": "{design.name} v{design.version} post-dates the evaluated baseline of {implementation.name}" },
      "resolution_options": ["acknowledge_no_impact", "re_verify_against_new_version",
                             "relink_to_correct_version", "suppress_with_reason"] }

- **Trigger** — always “a node this edge touches changed state”, indexed by edge type rather than by source tool.
- **Guards** — eligibility checks that must all pass before the condition is evaluated: is the link confirmed/deterministic, is the source fresh, and is the change meaningful rather than cosmetic.
- **Condition** — a small expression language over the connected nodes’ fields (timestamps, status enums, version numbers). A general rules DSL is deliberately not built up front.
- **Grace period** — a configured delay before an eligible violation is raised.
- **Produces** — a versioned annotation carrying the exact artifact versions it was computed from.
- **Notify** — role lookup (Section 9.7) plus a message template; per-user config is applied generically afterwards.
- **Resolution options** — named actions that close the loop back into the audit trail.

## 9.4 Rule set

The deterministic rules are retained, but presented as **supporting governance checks around the stronger criterion-level evidence workflow**.

| Rule                                                                  | Status                | Defence-safe meaning                                                                                                                                          |
|-----------------------------------------------------------------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Rule 1 — Design-version drift *(renamed from “stale implementation”)* | Committed core        | A linked Figma version post-dates the PR’s evaluated implementation baseline. This is temporal drift **evidence**, not proof that the code is visually wrong. |
| Rule 2 — Workflow-state inconsistency                                 | Committed core        | A merged or closed code change conflicts with the stakeholder-configured Jira state map after reconciliation and grace rules.                                 |
| Rule 3 — Overlapping change scope                                     | Committed supporting  | Two open changes affect overlapping configured components with no observed coordination link. Reports **review risk**, not a guaranteed conflict.             |
| Rule 4 — Spec drift                                                   | Deferred              | Requires a Doc node type and Notion ingestion; both are stretch.                                                                                              |
| Rule 5 — Criterion-level implementation evidence                      | **Redefined as core** | For each atomic criterion, analyse linked code and tests through the bounded local verifier and return provenance-gated evidence states.                      |

### Rule 1 — Design-version drift

| Element    | Definition                                                                                                                          |
|------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Trigger    | DEV_MODE_STATUS_UPDATE or FILE_VERSION_UPDATE — not the generic, noisier FILE_UPDATE event.                                         |
| Evidence   | IMPLEMENTS relation, design version identifiers, evaluated implementation baseline, rule version, grace window.                     |
| Guards     | Link confirmed/eligible; relevant node/version; excludes comment-only or cosmetic edits without workflow meaning; source not stale. |
| Outputs    | Temporal drift finding, severity, affected chain, owner/assignee recipients, explanation citing both versions.                      |
| Resolution | Acknowledge no impact, re-verify against the new version, relink to correct version, or suppress with reason.                       |

### Rule 2 — Workflow-state inconsistency

| Element  | Definition                                                                                                                                                              |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Trigger  | GitHub PR merged, or a Jira transition event.                                                                                                                           |
| Evidence | TRACKS relation, PR merge time, stakeholder-validated canonical state map, grace window.                                                                                |
| Guards   | Do not assume every state other than Done is inconsistent; QA, verification, release and documentation states may be explicitly mapped as acceptable post-merge states. |
| Outputs  | Workflow mismatch with expected vs. observed state, accountable roles, resolution actions.                                                                              |

### Rule 3 — Overlapping change scope (supporting)

| Element  | Definition                                                                                                    |
|----------|---------------------------------------------------------------------------------------------------------------|
| Trigger  | PR opened, synchronised, updated, or its changed-file set modified.                                           |
| Evidence | TOUCHES_COMPONENT relations, overlap measure, critical-component configuration, reviewer/dependency evidence. |
| Guards   | Ignore generated/vendor files; allow known parallel work; overlap threshold validated with stakeholders.      |
| Outputs  | Coordination **risk**, severity reflecting overlap size and branch age.                                       |

### Rule 5 — Criterion-level implementation evidence (core)

Rules 1–3 compare structured fields — timestamps, status enums, file overlap. None of them establishes whether the change actually implements the criterion it claims. Rule 5 does that, and it is now the **central** rule rather than an addendum.

The previous revision framed this as a “faithfulness classifier” producing an ordinal fidelity score. That framing was too broad: it mixed design fidelity, requirement satisfaction, program behaviour, status consistency and visual similarity under one label with no single operational definition, and it implied the model determines correctness. It is replaced by **criterion-level evidence verification** with an explicit, closed output vocabulary.

| Element           | Definition                                                                                                                                                                                                                |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Unit of judgement | One **atomic** acceptance criterion, or one approved structured design constraint — never a whole PR at once.                                                                                                             |
| Trigger           | PR opened/updated/merged with an IMPLEMENTS and/or TRACKS edge; a criterion edited; a linked design version created; or a ticket transitioning to a closed state.                                                         |
| Evidence          | Immutable evidence packet (Section 11.5): criterion text, design constraint and version, base/head commits, diff hunks, symbols, dependency neighbourhood, candidate tests, deterministic rule findings, freshness state. |
| Process           | Fixed bounded passes (Section 11.4): pass 1 retrieval and scope, pass 2 verification, conditional pass 3 critic.                                                                                                          |
| Output            | Structured record per criterion (Section 11.6) with status, cited evidence spans, reason, missing evidence and model/run metadata.                                                                                        |
| Gate              | The deterministic verdict gate (Section 11.8) resolves every citation against the packet; unresolvable or missing citations downgrade the result to review or INSUFFICIENT_EVIDENCE.                                      |
| Outputs           | Evidence case entries; a CONTRADICTED or PARTIAL finding routes by the same role resolution as Rules 1–3 (Section 9.7).                                                                                                   |
| Resolution        | Acknowledge, fix implementation, dispute the verdict (logged and fed back into the labelled dataset as a correction), or suppress with reason.                                                                            |

**Divergence tags.** When a verdict is CONTRADICTED or PARTIAL, a secondary tag records *why*: missing functionality; incorrect behaviour/logic; structured design-constraint deviation; scope creep (unrequested changed entity); left incomplete (stub/TODO/placeholder); or documentation-only mismatch. Tags are reported with the citation that motivated them, never on their own.

## 9.4a Code analyser (committed core)

For the frozen language/repository class (Section 7.2), the analyser produces, deterministically and before any model runs:

- Base and head commit resolution; changed files and diff hunks with exact line ranges.
- Changed and affected **symbols** (functions, components, hooks, exported constants) via parsing, plus a bounded import/call neighbourhood.
- **Test evidence**: changed test files, tests referencing changed symbols, and — where the fixture project can be executed — dynamic coverage linking a test to a changed symbol.
- Structured UI evidence where available: component props, design-token usage and text content that a structured Figma constraint can be checked against.
- Explicit **unresolved markers** for dynamic relations (runtime dispatch, dynamic imports, reflection) rather than guessed edges.

## 9.5 Pipeline (event-driven, not polling)

Every node/edge mutation emits a graph delta. The deterministic rule engine subscribes to deltas filtered by edge type and does not rescan the whole graph: a node update triggers lookup of edges touching that node, and only rules attached to each edge type run. The same delta enqueues **only the affected criteria** for re-verification, so an unrelated commit does not re-run the verifier over an entire ticket. Incremental and full-rescan equivalence is an explicit evaluation metric (Section 12).

## 9.6 Linking (feeds the graph, does not replace it)

- **Deterministic** — explicit IDs extracted from text (a ticket key in a PR title or commit message, a Figma URL or dev resource on a ticket) produce a high-confidence edge, auto-created and immediately eligible.
- **Manual** — a reviewer confirms or rejects a proposed link; provenance records who confirmed it and when.
- **Inferred (stretch)** — embedding similarity over node text may propose a relationship, surfaced for confirmation. Per Section 9.2 it cannot produce a decisive finding until confirmed. Automatic semantic linking is **not** a prerequisite for the committed core.

## 9.7 Notification resolution and role-edge provenance

Role edges (OWNS, ASSIGNED_TO, WATCHES) define who is connected to a node. A bounded-depth breadth-first search (1–2 hops) from the changed node/edge finds the candidate notify set, which per-user configuration (channel, real-time vs. digest, noise threshold) then filters — applied generically after resolution, regardless of which rule or verdict produced the finding.

ASSIGNED_TO and OWNS edges are derived directly from each tool’s native assignee/owner field at ingestion time, since those fields already exist and manual re-entry would itself be a source of drift. WATCHES edges are opt-in and manually configured, because “who wants to be notified beyond their assigned role” has no reliable source-tool equivalent.

## 9.8 Algorithms by component

| Component                  | Problem                                            | Algorithm(s)                                                                                                                                                                                                |
|----------------------------|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Rule matching              | Avoid re-scanning the whole graph on every change. | Indexed rule dispatch by trigger pattern (edge type + condition) — RETE’s core insight of re-evaluating only rules whose pattern touches the changed node/edge, without building a full alpha/beta network. |
| Criterion invalidation     | Re-verify only what a delta actually affects.      | Reverse index from changed symbols/files/versions to affected criteria; dirty-flag propagation with a bounded hop count.                                                                                    |
| Criterion-\>code retrieval | Find candidate evidence for one atomic criterion.  | Deterministic filters (changed files, symbol neighbourhood, test references) plus lexical BM25 and optional embedding rerank over symbol/test text; evaluated by Recall@k and MRR.                          |
| Notification resolution    | Find who is connected to a changed node.           | Bounded-depth BFS over role edges, 1–2 hops.                                                                                                                                                                |
| Propagation correctness    | Ensure cascades terminate.                         | Cycle detection (DFS + recursion stack) on dependency-type edges; a BLOCKS cycle usually signals a real linking bug.                                                                                        |
| Chain reconstruction       | “Figma version -\> PR -\> criterion -\> test”.     | Shortest path (BFS); Dijkstra if weighting by confidence/recency.                                                                                                                                           |
| Analytics (stretch)        | Bottleneck detection, clustering, heatmaps.        | Centrality, connected components, community detection — explicitly deferred past MVP.                                                                                                                       |

**Propagation risk.** Cascading staleness can get expensive or noisy fast. It is bounded by a maximum hop count and confidence decay per hop; multi-hop cascade analytics are stretch work, not committed.

## 9.9 Storage decision and scope discipline

A dedicated graph database is not necessary on day one. With a bounded set of edge types, a property graph is modelled directly in PostgreSQL: a `nodes` table (id, type, version, valid_from/valid_to, payload jsonb), an `edges` table (from_id, to_id, type, source_class, confidence, resolver, metadata jsonb), an immutable `artifact_snapshots` table, and indexes on (from_id, type) and (to_id, type). This is the sole committed storage decision. Migration to Neo4j/Memgraph is deferred until multi-hop pattern queries at scale are actually needed, not built speculatively.

Algorithm investment matches the committed core: indexed rule dispatch, reverse-index invalidation and bounded BFS are built. Centrality, community detection and connected-components analytics are deferred.

# 10. Technical Alternatives Considered

| Approach                                         | Relationship modelling                                              | Query fit                                                                         | Scalability                            | Complexity                                              | Failure behaviour                                    |
|--------------------------------------------------|---------------------------------------------------------------------|-----------------------------------------------------------------------------------|----------------------------------------|---------------------------------------------------------|------------------------------------------------------|
| **Pure relational (PostgreSQL) — selected**      | Node/edge tables with immutable snapshots.                          | Sufficient for the committed traversal depth (1–3 hops) and version-scoped reads. | Fine at FYP and demo scale.            | Low — one database technology the team knows.           | Well understood, ACID, single failure domain.        |
| Dedicated graph database (Neo4j)                 | Native multi-hop traversal and pattern rules.                       | Best fit for deep relationship queries.                                           | Good, but adds an operational service. | Higher — new query language and ops surface.            | Separate failure domain to manage.                   |
| Event-sourcing architecture                      | Append-only log is the source of truth; state derived by replay.    | Strong audit and time-travel.                                                     | Replay cost grows with history.        | Highest — new architectural pattern for the whole team. | Recoverable by replay, harder under partial failure. |
| Hybrid relational + graph extension (Apache AGE) | Entities in Postgres, traversal via recursive CTEs or an extension. | Sufficient for 2–4 hops.                                                          | Sufficient for FYP scope.              | Moderate.                                               | Single Postgres failure domain.                      |

**Selected approach:** plain PostgreSQL modelled as a versioned property graph. It supports the required depth, keeps the team inside one database technology, and matches the local single-host deployment plan without the operational cost of a separate graph service or a full event-sourcing rebuild. Immutable snapshot tables give the audit benefit that motivated event sourcing without adopting the whole pattern. The other rows remain documented as evidence-gated future options, not committed dependencies. \# 11. Local AI Architecture and External-Component Boundaries

## 11.1 Architectural freeze

> **No repository code, ticket content or design data is sent to a hosted model in the committed system. All model inference is local.** A hosted model may be used only as an offline research baseline on non-sensitive evaluation data, and only where the team explicitly labels it as a comparison rather than part of Unify.

This removes the previous revision’s contradiction, in which a hosted LLM performed link suggestion and summarisation while a separate local model performed detection. Those hosted-assist features are withdrawn from the committed system: summarisation and natural-language querying move to stretch, and link suggestion is either deterministic (Section 9.6) or handled by the same local stack.

| Category                    | Meaning                                                                                                  | Where it applies in Unify                                                                                                                                          |
|-----------------------------|----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Support                     | Infrastructure that does not touch the contribution.                                                     | Standard libraries, UI kit, build/CI tooling, container orchestration, PostgreSQL, Redis.                                                                          |
| Core, team-operated         | Supplies part of the contribution, but is selected, adapted, evaluated and hosted entirely by the team.  | The local open-weight verifier (Sections 11.3–11.9): pinned version, deterministic retrieval, provenance-gated output, evaluated against a held-out gold test set. |
| Core-replacement (not used) | An external component would supply the contribution itself, uninspectable and unretrainable by the team. | **Not used.** No hosted third-party model decides what counts as a finding.                                                                                        |
| Offline baseline only       | Used to measure, not to ship.                                                                            | A fixed general/base-model prompt baseline run on non-sensitive benchmark data for comparison (Section 12).                                                        |

## 11.2 Why the model is bounded rather than central

The model has exactly one job: given an immutable evidence packet for **one atomic criterion**, return a structured verdict with citations into that packet. It does not choose what evidence to look at (deterministic retrieval does), it does not create graph edges, it does not decide whether to alert (the verdict gate and rule layer do), and it cannot express a decisive status without valid citations. This is what keeps Unify from being “an LLM wrapper”: the engineered value is in what happens before and after inference.

## 11.3 Model selection position

The proposal names candidates without declaring a winner before measurement. The team records model version, licence, quantisation, prompt/template, context length, hardware and inference settings for every run.

| Candidate                           | Why test it                                                                      | Decision evidence                                             |
|-------------------------------------|----------------------------------------------------------------------------------|---------------------------------------------------------------|
| Qwen2.5-Coder, 3B / 7B class        | Coder-oriented sizes with base checkpoints intended for adaptation.              | Held-out verdict quality, citation validity, latency, memory. |
| Llama 3.1 8B or Code Llama 7B class | Widely supported open-weight ecosystem and mature local adaptation tooling.      | Same evaluation protocol plus licensing/deployment review.    |
| Smaller embedding / reranker model  | Retrieves candidate code more cheaply than passing large context to a generator. | Recall@k, MRR, index latency, ablation impact.                |

Selection happens **after** the technical spike, from held-out quality, grounding, latency, memory and licence evidence — not from brand preference.

## 11.4 Bounded verification loop

The faculty’s iterative-analysis request is implemented as a small, reproducible verifier with a fixed pass limit, not an open-ended autonomous agent. High-level mapping happens first, low-level implementation checking second.

| Pass                              | Purpose                                                                  | Inputs                                                                                       | Output and stop rule                                                                                                  |
|-----------------------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Pass 1 — scope**                | Decompose or confirm atomic criteria; retrieve candidate code and tests. | Jira criterion, structured Figma constraint, diff summary, symbol/test index.                | Ranked evidence candidates. **Stop** and return INSUFFICIENT_EVIDENCE if nothing applicable exists.                   |
| **Pass 2 — verify**               | Inspect the relevant implementation details and test evidence.           | Atomic criterion plus top candidate diff hunks, symbols, dependency neighbourhood and tests. | Structured verdict with citations and missing evidence. **Stop** if citations pass validation and no conflict exists. |
| **Pass 3 — critic (conditional)** | Audit a disputed, contradictory or weakly cited result.                  | Previous verdict, cited sources, deterministic rule findings, unresolved items.              | Confirm, downgrade or abstain. **Never exceeds the fixed pass limit.**                                                |

Every pass, its inputs, its outputs and its stop reason are logged. The loop is reproducible: same packet, same pinned model and settings, same passes.

## 11.5 Required context packet

The packet is assembled deterministically and is immutable for the run that cites it:

- Artifact identities **and versions**: Jira issue/criterion, Figma file/node/version, repository, base commit, head commit.
- Exactly one atomic acceptance criterion or approved structured design constraint.
- Changed files, functions/classes/components, diff hunks and the relevant dependency neighbourhood.
- Candidate test files, changed tests, and dynamic coverage where the project can be executed.
- Deterministic drift/rule findings and tool-data freshness state.
- **Token budget, omitted sources and truncation reason**, so missing context is visible rather than silent.

## 11.6 Required output schema

| Field            | Meaning                                                                                 |
|------------------|-----------------------------------------------------------------------------------------|
| criterion_id     | The exact atomic requirement or design constraint being assessed.                       |
| status           | SUPPORTED, CONTRADICTED, PARTIAL or INSUFFICIENT_EVIDENCE.                              |
| evidence         | Source IDs plus file/line, diff hunk, test or artifact-version references.              |
| reason           | Short explanation restricted to the cited evidence.                                     |
| missing_evidence | What would be required to strengthen or resolve the conclusion.                         |
| divergence_tag   | Present only for CONTRADICTED/PARTIAL (Section 9.4).                                    |
| model_and_run    | Model/version, adapter, quantisation, pass number, retrieval version and configuration. |

## 11.7 Verdict semantics

| State                 | When it is allowed                                                                                | Reviewer interpretation                                             |
|-----------------------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| SUPPORTED             | Required evidence exists and no material contradiction was found **within the declared scope**.   | Evidence supports the criterion. Not a universal correctness proof. |
| CONTRADICTED          | A cited implementation or test fact conflicts with an explicit criterion or deterministic policy. | A specific discrepancy requires review.                             |
| PARTIAL               | Some subparts are supported, others missing or contradicted.                                      | Review the decomposed subcriteria.                                  |
| INSUFFICIENT_EVIDENCE | Required artifacts are absent, stale, ambiguous, unsupported or outside analyser capability.      | Request evidence or perform manual review.                          |
| SOURCE_STALE          | A tool snapshot or event stream cannot establish current state.                                   | Reconcile data before interpreting the finding.                     |

Abstention is a **first-class correct answer**, not a failure mode, and correct abstention on labelled ambiguous cases is measured explicitly (Section 12).

## 11.8 Verdict / provenance gate

Between the verifier and the reviewer sits a deterministic gate that:

1.  Validates the output against the schema (Section 11.6); malformed output is rejected, not parsed leniently.
2.  Resolves **every** citation against the immutable evidence packet — file, line range, diff hunk, test ID, artifact version. A citation to a file, line or version that does not exist invalidates the decisive status.
3.  Checks rule applicability, link eligibility (Section 9.2), freshness and configured thresholds.
4.  Downgrades any decisive status that fails the above to REVIEW or INSUFFICIENT_EVIDENCE, and logs the reason.
5.  Records provenance: which packet, which model/adapter/settings, which pass, which citations.

**Provenance completeness for every SUPPORTED or CONTRADICTED finding is a hard target of 100%** (Section 12).

## 11.9 Fine-tuning decision rule

- Use parameter-efficient **LoRA or QLoRA**; no full pre-training or unrestricted model training.
- Fine-tune a **narrow** task: map one atomic criterion plus a bounded evidence packet to a structured verdict with cited evidence spans.
- Compare the adapted model against the **same base model** using a fixed prompt and identical retrieval.
- Use **project-level** train/validation/test separation so near-duplicate code cannot leak across splits.
- Keep an untouched, manually adjudicated gold test set. Synthetic mutations may expand training but must not dominate final testing.
- Retain adapted weights in the product **only if** they improve held-out performance without worsening unsupported confident assertions, latency or calibration (Section 12.4).

# 12. Testing, Evaluation and User Acceptance

| Activity        | Question answered                                                                               | Typical evidence                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Testing         | Does the implemented system behave as specified, including edge and failure conditions?         | Unit/integration/system tests on ingestion, linking, analyser, gate and rules; documented failure cases. |
| Evaluation      | Is Unify actually better than the current manual workflow and than simpler automated baselines? | Baseline comparisons, metrics below, failure analysis, stated limits of the conclusion.                  |
| User acceptance | Will reviewers, developers, designers and PMs accept it for a realistic task?                   | Task-based acceptance test with real or declared proxy users.                                            |

## 12.1 Evaluation plan

### Required baselines

| Component                         | Baselines                                                                                                                        |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Cross-tool linking                | Exact/manual IDs; lexical BM25; embedding retrieval; Unify resolver.                                                             |
| Criterion–code evidence retrieval | Changed-files-only; lexical retrieval; retrieval + base local model; retrieval + adapted model.                                  |
| Verdicting                        | Deterministic rules only; base local model with fixed prompt and no engineered retrieval; LoRA/QLoRA variant; human gold labels. |
| Processing                        | Full graph/rule rescan vs. incremental indexed analysis.                                                                         |
| Workflow                          | Manual Jira + Figma + GitHub inspection vs. the Unify evidence case.                                                             |

### Metrics

| Area            | Measures                                                                                                                            |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Linking         | Precision, recall and F1 for exact and suggested links; unresolved rate.                                                            |
| Retrieval       | Criterion-to-evidence Recall@k, MRR, missing-relevant-evidence rate.                                                                |
| Verdicts        | Macro-F1; per-class precision/recall; confusion matrix; correct abstention rate.                                                    |
| Grounding       | Unsupported confident assertion rate; invalid citation rate; provenance completeness.                                               |
| Model behaviour | Calibration (reliability curve / Brier or ECE) where probabilities are exposed; base-vs-adapted gain; error categories.             |
| Systems         | Duplicate suppression, out-of-order convergence, incremental/full equivalence, p50/p95 latency, memory, local inference throughput. |
| User benefit    | Correct review decisions, evidence-location time, missed contradictions, unnecessary alerts, perceived evidence sufficiency.        |

### Provisional success thresholds

These are **defensible starting targets, not results**. They are frozen after the technical spike and before final evaluation.

| Measure                                                    | Provisional target                                                          |
|------------------------------------------------------------|-----------------------------------------------------------------------------|
| Exact/deterministic link precision                         | ≥ 0.95                                                                      |
| Suggested-link precision (if the stretch feature is built) | ≥ 0.85 at the selected review threshold                                     |
| Criterion-evidence Recall@5                                | ≥ 0.90 on the declared repository class                                     |
| CONTRADICTED-finding precision                             | ≥ 0.90                                                                      |
| Unsupported confident assertion rate                       | ≤ 2% on the gold test set                                                   |
| Provenance completeness for SUPPORTED / CONTRADICTED       | 100%                                                                        |
| Correct abstention on labelled ambiguous cases             | ≥ 80%                                                                       |
| Duplicate / out-of-order final-state convergence           | 100% on controlled event tests                                              |
| Incremental vs. full finding equivalence                   | ≥ 99%                                                                       |
| Local PR-analysis latency                                  | Declare hardware and repository class; target p95 under 60 s where feasible |

### Failure cases that matter most

A link connecting the wrong entities; a decisive verdict citing a file or line that does not exist; a real contradiction returned as SUPPORTED (false negative); a benign change returned as CONTRADICTED (false positive) and its effect on dismissal rate; an ambiguous case forced into a decisive class instead of abstaining.

## 12.2 User acceptance plan

- **Participants:** 5–8 people covering reviewer/developer, designer and PM roles — real users where available from the Section 1.3 contacts, otherwise a declared proxy (senior FAST students briefed into one role).
- **Task:** given a real pull request against a fixture repository with linked Jira criteria and a Figma design version, decide whether the change is adequately supported — first manually, then with Unify’s evidence case.
- **Outcomes recorded:** decision correctness against the gold label, completion time, missed contradictions, incorrect findings accepted, number of dismissed alerts, perceived evidence sufficiency, satisfaction.
- **Acceptance decision:** Unify is accepted for the tested scenario if it improves decision correctness or reduces evidence-location time versus the manual baseline while keeping unsupported confident assertions and dismissal rate within the targets above.

## 12.3 Datasets: public corpora and the Unify Change-Intent Oracle

> **Data reality.** No public dataset provides Figma versions, Jira criteria, GitHub diffs, code symbols, tests and gold implementation-evidence verdicts together. Public corpora can validate **parts** of the pipeline; the integrated claim requires a small custom gold oracle. Fine-tuning additionally needs a larger training pool than the gold evaluation suite. A train/validation/test sentence is not a dataset plan, so the plan is stated concretely below.

### Public component datasets

| Source                    | Use                                                                                                                                                                 | What it cannot establish                                                                                                                                     |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SWE-bench Verified        | 500 engineer-confirmed tasks with issue descriptions, repositories, reference patches and tests; useful for criterion–code–test experiments and as a training pool. | Figma links, Jira workflow state, cross-tool event reliability, or Unify’s verdict semantics; used as a historical trace corpus, not as the whole benchmark. |
| SWE-bench Multimodal      | Visual software-domain issues and code changes; supplementary given the front-end repository class.                                                                 | Direct Figma-node ground truth.                                                                                                                              |
| PyBugHive                 | 149 manually validated bugs from 11 projects with reproducible pre/post states and tests; useful for issue–patch–test structure.                                    | Figma intent, Jira workflow, cross-tool reliability; also Python-based, so it informs schema design rather than the frozen TypeScript analyser.              |
| Team fixture repositories | Exact event order, Figma/Jira links, structured constraints, ambiguous cases, expected evidence paths.                                                              | Large-scale real-world diversity by themselves.                                                                                                              |

### Mandatory Unify Change-Intent Oracle

A controlled evaluation fixture suite, not a large research dataset. It exists because the claimed contribution is the integration of relations that no public corpus labels together.

| Stage                    | Recommended size                     | Contents                                                                                                                                                        |
|--------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Proposal technical spike | 8–12 cases                           | One repository; Jira-style atomic criteria; Figma snapshot/constraints; base/head commits; tests; expected status and cited evidence.                           |
| Final gold evaluation    | 30–50 cases                          | Multiple repositories or applications; supported, contradicted, partial, ambiguous, stale-source and event-order cases; independently labelled and adjudicated. |
| PEFT training pool       | ~200–500 criterion–evidence examples | Public issue/patch/test cases plus controlled transformations; manually audited subset; no examples from held-out projects.                                     |

### Gold labels per case

- Base and head commit; selected implementation language and environment.
- The atomic Jira criterion and applicable Figma node/version or structured design constraint.
- Expected changed files, symbols, dependencies and relevant tests.
- Expected SUPPORTED / CONTRADICTED / PARTIAL / INSUFFICIENT_EVIDENCE / SOURCE_STALE result.
- Exact evidence spans and a written reason why the label is correct.
- Whether the example is real, manually modified, or synthetically generated.

### Label quality and leakage controls

- Two students label each gold case independently; the third adjudicates disagreements and preserves the decision record.
- Inter-rater agreement is reported, together with the **categories** of disagreement.
- Splits are by repository/project, never random by example, so near-duplicate code cannot appear in both training and testing.
- Model-generated labels are never used as gold without human verification.
- Ambiguous cases stay in the test set; the correct behaviour there is usually abstention, not forced classification.
- Disputed verdicts from production/acceptance use are added as new labelled examples for the next adaptation round, always respecting the split discipline.

## 12.4 Go/no-go rule for fine-tuning

> **Retain the adapted model only if** it improves held-out macro-F1 or CONTRADICTED precision over retrieval plus the same base model, does not materially increase unsupported confident assertions, and fits the declared local hardware and latency budget. **Otherwise, report the negative result and deploy the stronger base-model pipeline.** The experiment still satisfies the faculty request and is academically valuable either way. This is stated in advance so the result cannot be rationalised after the fact.

# 13. Proof of Concept (PoC) Plan

Two artefacts share one scenario and answer different questions: an interactive skeleton showing the workflow, and a technical spike proving the local verifier actually runs.

| Question                                        | Planned answer                                                                                                                                                                                                                                                                                                              |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1\. What risky assumption is tested?            | That deterministic linking plus deterministic criterion-to-code retrieval can build a bounded evidence packet from which a **locally hosted** open-weight model returns a schema-valid, correctly cited verdict — and that invalid citations are caught by the gate rather than shown to a reviewer.                        |
| 2\. What input/setup is used?                   | One TypeScript/React fixture repository, one Jira project with atomic acceptance criteria, one Figma file with an approved structured constraint set, cross-linked by normal team conventions; plus 8–12 hand-labelled oracle cases.                                                                                        |
| 3\. What result is expected?                    | For each labelled case, the expected status and cited evidence; for the event cases, identical final state after duplicate and out-of-order delivery; measured local latency and memory.                                                                                                                                    |
| 4\. What will be learned or disproved?          | Whether retrieval recall is adequate at the declared budget; whether the model can produce valid citations at a usable rate; whether the gate catches fabricated citations; whether local inference latency is tolerable on available hardware.                                                                             |
| 5\. How does this change the design/scope/plan? | If citation validity or retrieval recall is too low, the committed core ships with a narrower criterion class and a more conservative gate, and the verifier’s decisive states are restricted until measured. If local latency is infeasible, analysis becomes an asynchronous batch report rather than an in-review check. |

## 13.1 Interactive PoC

> **Primary scenario.** A pull request claims to implement a Jira story linked to an approved Figma component. The reviewer opens Unify, sees exact artifact versions, reviews criterion-level code/test evidence, sees one temporal drift finding and one insufficient-evidence case, and records a resolution.

| Screen             | Required interaction                                                                                                      |
|--------------------|---------------------------------------------------------------------------------------------------------------------------|
| Change selection   | Select repository, base/head commit and linked Jira/Figma artifacts.                                                      |
| Relationship view  | Show exact and unresolved links with source and version; allow the reviewer to confirm or reject a suggested link.        |
| Criterion view     | Display atomic criteria and mapped changed files, functions and tests.                                                    |
| Local verification | Show pass 1 retrieval, pass 2 evidence verdict and the optional critic outcome, without exposing hidden chain-of-thought. |
| Evidence case      | Show cited SUPPORTED, CONTRADICTED, PARTIAL and INSUFFICIENT_EVIDENCE examples.                                           |
| Drift/rule view    | Show a design-version or workflow-state inconsistency with rule and grace-period evidence.                                |
| Resolution / audit | Reviewer resolves or overrides the finding; decision, user, time and evidence snapshot are retained.                      |

## 13.2 Technical spike

- Run one small Qwen/Llama-family checkpoint **locally** and record hardware, quantisation, context size, cold/warm latency and memory.
- Build one complete context packet programmatically from a real or fixture repository — not by pasting a repository into a prompt.
- Produce a schema-valid verdict with source citations for at least one SUPPORTED, one CONTRADICTED and one INSUFFICIENT_EVIDENCE case.
- Demonstrate the gate rejecting or downgrading an output whose cited file, line or artifact version does not exist.
- Replay a duplicate and an out-of-order event and show that the final relevant graph/rule state is unchanged after reconciliation.
- If LoRA training cannot be completed before the defence, present the labelled data schema and the training experiment plan honestly. **Do not present a fabricated adapted-model result.**

## 13.3 Spike case set (10 cases)

| Case                                  | Expected behaviour                                                         |
|---------------------------------------|----------------------------------------------------------------------------|
| 1\. Fully implemented criterion       | SUPPORTED with code and test evidence.                                     |
| 2\. Missing sub-feature               | PARTIAL with the absent subcriterion named.                                |
| 3\. Incorrect branch/condition        | CONTRADICTED with exact diff/symbol evidence.                              |
| 4\. Scope creep                       | Review finding tied to an unexplained changed entity.                      |
| 5\. Structured UI constraint mismatch | CONTRADICTED **only if** a machine-checkable constraint exists.            |
| 6\. No relevant test evidence         | INSUFFICIENT_EVIDENCE — not “untested code”.                               |
| 7\. Ambiguous dynamic behaviour       | INSUFFICIENT_EVIDENCE and manual review.                                   |
| 8\. Figma version newer than baseline | Temporal drift warning (Rule 1), not an automatic design-fidelity failure. |
| 9\. Duplicate webhook                 | Idempotent processing; no duplicate finding.                               |
| 10\. Out-of-order update              | Reconciliation restores the same final state as ordered processing.        |

## 13.4 System scenario matrix

| ID  | Scenario                                                                                           |
|-----|----------------------------------------------------------------------------------------------------|
| T1  | Explicit-reference link chain (Figma version -\> PR -\> Ticket -\> Criterion) resolves end-to-end. |
| T2  | Rule 1 (design-version drift) — positive case.                                                     |
| T3  | Rule 1 — negative case (cosmetic edit; should not fire).                                           |
| T4  | Rule 2 (workflow-state inconsistency) — positive case.                                             |
| T5  | Rule 2 — negative case (mapped acceptable post-merge state; should not fire).                      |
| T6  | Rule 3 (overlapping change scope) — positive and negative case.                                    |
| T7  | Duplicate / out-of-order event delivery — idempotency and convergence.                             |
| T8  | Simulated outage, SOURCE_STALE marking and reconciliation recovery.                                |
| T9  | Role-routing correctness for a labelled recipient scenario.                                        |
| T10 | Fabricated-citation injection — the gate downgrades the verdict instead of displaying it.          |
| T11 | Incremental vs. full rescan equivalence on the same fixture state.                                 |

**Fallback** if live API access or permissions block the primary plan: run the same pipeline against exported/sample GitHub and Jira data plus a manually created Figma reference set.

> **Student evidence still required.** Actual API/access feasibility, spike results **including failures**, measured baselines and any resulting design/scope changes must be recorded honestly — not projected — before the requirements baseline is finalised.

# 14. Deployment, Privacy and Failure Behaviour

- **Target:** a Dockerised application (frontend, backend API, PostgreSQL, background worker, Redis-backed job queue, local model-serving container) deployed to a single self-hosted machine or VM with read-only OAuth connections to GitHub, Jira and Figma, and optional Slack delivery.
- **Local inference:** the verifier runs in a team-owned serving container sized for the committed repository class. Verification is queued asynchronously so model latency never blocks ingestion.

| Concern                            | Required commitment                                                                                                                                                                                  |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data privacy                       | Local inference by default; repository and design content do not leave the deployment boundary.                                                                                                      |
| Permissions                        | Read-only, least-privilege GitHub/Jira/Figma access; encrypted secrets; documented revocation procedure.                                                                                             |
| Artifact integrity                 | Store source IDs, content hashes, versions and timestamps used for each finding; snapshots are immutable.                                                                                            |
| Model reproducibility              | Pin model, adapter, tokenizer, quantisation, prompt schema, retrieval version and inference settings; record them in every finding.                                                                  |
| Unavailable tool                   | Mark SOURCE_STALE or INSUFFICIENT_EVIDENCE; never silently reuse old data as current.                                                                                                                |
| Local model failure                | Degrade to deterministic Rules 1–3 plus unresolved-evidence reporting; mark verification unavailable rather than skipping it silently; never fabricate a verdict.                                    |
| Prompt injection / hostile content | Treat issue, design and code text as **untrusted evidence**; enforce the output schema and a source allowlist; never execute model-generated commands or follow instructions found inside artifacts. |
| Event outage                       | Queue and replay on reconnect; reconcile against the persisted checkpoint, since a queue cannot recover an event the vendor never delivered.                                                         |
| Audit                              | Preserve who confirmed a link, resolved a finding or overrode a recommendation, and why.                                                                                                             |

# 15. Requirements Snapshot

## 15.1 Functional requirements

| ID    | The system shall…                                                                                                           | Actor                                | Acceptance evidence                                                                        |
|-------|-----------------------------------------------------------------------------------------------------------------------------|--------------------------------------|--------------------------------------------------------------------------------------------|
| FR-01 | Ingest events from GitHub, Jira and Figma via webhook with polling fallback, and normalise them into a common envelope.     | Integration layer                    | A live test webhook produces a normalised record in the event log.                         |
| FR-02 | Deduplicate repeated events and reconcile a detected source/checkpoint gap.                                                 | Integration layer                    | Duplicate and simulated-outage tests produce one correct final state.                      |
| FR-03 | Store immutable, versioned artifact snapshots and never overwrite evidence cited by an existing finding.                    | Version store                        | A finding re-opened after a new version still resolves to the version it cited.            |
| FR-04 | Link entities across tools from explicit references and support manual linking, recording resolver and provenance.          | Reviewer / Developer / PM            | On the labelled oracle sample, deterministic linking meets the target precision.           |
| FR-05 | Prevent unconfirmed inferred links from producing a decisive finding.                                                       | Evidence graph                       | A low-confidence/unconfirmed case produces no decisive finding.                            |
| FR-06 | Extract base/head diffs, changed symbols, dependency neighbourhood and candidate test evidence for the declared language.   | Code analyser                        | For a labelled PR, extracted files/symbols/tests match the gold expectation.               |
| FR-07 | Decompose or accept atomic acceptance criteria and structured design constraints as the unit of verification.               | PM / Designer / System               | A ticket with three criteria produces three independently verifiable units.                |
| FR-08 | Assemble a deterministic, bounded context packet per criterion, including a truncation manifest of omitted sources.         | Context builder                      | Same inputs produce a byte-identical packet; omissions are listed.                         |
| FR-09 | Execute the bounded local verification loop within the fixed pass limit and log each pass, input and stop reason.           | Local verifier                       | Pass logs exist for every finding; no run exceeds the pass limit.                          |
| FR-10 | Validate every citation against the immutable packet and downgrade any decisive status with an invalid or missing citation. | Verdict gate                         | An injected fabricated citation never reaches the reviewer as decisive.                    |
| FR-11 | Produce a per-criterion evidence case with status, citations, reason and missing evidence.                                  | System                               | The evidence case for a labelled PR matches the gold expectation.                          |
| FR-12 | Evaluate deterministic Rules 1–3 over the evidence graph and generate findings with rule version and grace-period evidence. | Rule engine                          | Scenario-matrix cases produce the expected findings, logged with timestamps.               |
| FR-13 | Evaluate only the rules and criteria affected by a delta.                                                                   | Rule engine / criterion queue        | Incremental and full-rescan outputs match on the benchmark.                                |
| FR-14 | Route each finding to the relevant role via configurable rules and channel.                                                 | Notification engine                  | The finding reaches the correct role in a controlled test, with delivery logged.           |
| FR-15 | Create one idempotent, explainable finding record per rule/criterion and evidence state.                                    | System                               | A repeated event does not duplicate the finding.                                           |
| FR-16 | Mark artifacts SOURCE_STALE when a tool cannot establish current state, and downgrade dependent findings.                   | Integration layer / gate             | Simulated outage produces SOURCE_STALE rather than a stale decisive finding.               |
| FR-17 | Present a unified view of the change: versions, links, criteria, evidence and drift findings.                               | Any authenticated user               | The view loads and correctly displays a known linked chain for a test change.              |
| FR-18 | Support acknowledge, resolve, dispute, suppress and reopen actions with reason and audit history.                           | Reviewer / Developer / Designer / PM | Lifecycle transition and audit test passes.                                                |
| FR-19 | Allow an authorised user to configure state maps, grace periods, thresholds and rule activation, versioned.                 | PM / admin                           | Configuration changes create a rule version and preview.                                   |
| FR-20 | Capture disputed verdicts as labelled corrections for the next adaptation round, respecting the project-level split.        | Reviewer / Developer                 | A disputed verdict is logged with its correction and excluded from the current test split. |
| FR-21 | Export non-secret benchmark/audit evidence for evaluation.                                                                  | System                               | The export contains required evidence and excludes tokens and private raw content.         |

## 15.2 Non-functional requirements

| Quality attribute          | Measurable target                                                                                                           | Why it matters                                                                     |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| Privacy / locality         | No repository, ticket or design content leaves the deployment boundary; verified by egress inspection during testing.       | This is the primary architectural commitment and a stakeholder constraint.         |
| Grounding                  | 100% provenance completeness for SUPPORTED/CONTRADICTED; unsupported confident assertion rate ≤ 2% on the gold test set.    | A decisive finding without valid evidence is worse than no finding.                |
| Performance / latency      | p95 local PR analysis under 60 s for the declared hardware and repository class (target frozen after the spike).            | Analysis that arrives after the merge loses its value against the manual baseline. |
| Reliability / availability | Ingestion survives a defined period of external API downtime via queue and checkpoint reconciliation without event loss.    | Vendor webhooks are not guaranteed continuously available or auto-redelivered.     |
| Idempotency / convergence  | 0 duplicate findings from duplicate delivery; 100% final-state convergence under out-of-order delivery on controlled tests. | Repeated and reordered delivery is expected vendor behaviour, not an edge case.    |
| Incremental correctness    | ≥ 99% equivalence between incremental and full-rescan findings.                                                             | Incremental evaluation must not silently lose findings.                            |
| Abstention quality         | ≥ 80% correct abstention on labelled ambiguous cases.                                                                       | Forced classification on ambiguous evidence is the main route to lost trust.       |
| Model reproducibility      | Same packet, pinned model and settings reproduce the same verdict class across runs.                                        | A conversational answer that changes between runs is not an audit record.          |
| Security                   | Read-only least-privilege scopes; OAuth tokens encrypted at rest; artifact text treated as untrusted input.                 | Unify handles real third-party workspace credentials and content.                  |
| Usability                  | A PM-role participant completes the acceptance task without developer assistance.                                           | PMs are a named non-technical stakeholder role.                                    |
| Deployment / resource      | Runs within the single-host Dockerised footprint including the local model-serving container, on declared hardware.         | Matches the committed scope and the team’s realistic infrastructure budget.        |

# 16. Team Technical Ownership

Divided by CCP-relevant technical responsibility, not by layer. The test applied to each row: would removing this member remove a meaningful technical responsibility **and its independent evaluation evidence**? The previous revision’s hypothetical fourth-member paragraph has been deleted; this is a complete, balanced plan for the actual three-person team.

| Student            | Primary ownership                                                                                                                                                                             | Independent evaluation owned                                                                                          |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Haaniah Ismail** | GitHub/Jira/Figma adapters; normalised events; idempotency, replay, reconciliation, SOURCE_STALE handling; immutable artifact/version store.                                                  | Duplicate and out-of-order convergence, freshness, ingestion latency, permission and failure tests.                   |
| **Mishal Fatima**  | One-language code/symbol/test analysis; evidence graph and provenance model; exact and manual linking; deterministic drift and policy rules; criterion invalidation and incremental dispatch. | Link precision/recall, graph correctness, incremental vs. full equivalence, rule precision/recall.                    |
| **Abdullah Amin**  | Context-packet builder; local model serving and selection; bounded verifier loop; LoRA/QLoRA experiment; verdict/provenance gate; reviewer evidence report and notification/CI integration.   | Retrieval, verdict and grounding metrics; base-vs-adapted ablation; local latency/memory; task-based user evaluation. |

**Shared responsibilities:** scope, architecture and one consistent terminology set; gold-oracle construction and adjudication; end-to-end PoC and integration tests; stakeholder validation, privacy and ethics documentation; contemporary-system comparison, final benchmark and mock defence.

# 17. Immediate Next Steps

1.  Conduct and document the pre-defence stakeholder validation (Sections 1.2–1.4): 3–5 respondents, three concrete incidents.
2.  Directly trial the comparable products in Section 2.1 — especially CodeRabbit and Rovo — and record observed capabilities and limitations with dates, replacing marketing-based assumptions.
3.  Build the 8–12-case Change-Intent Oracle fixture set with independent labelling and adjudication.
4.  Run the technical spike (Section 13.2): local inference on a real context packet, schema-valid cited verdicts, gate rejection of a fabricated citation, duplicate/out-of-order replay; record hardware, latency and memory.
5.  Finish the interactive PoC covering the full change-assurance journey through human resolution.
6.  Freeze the provisional thresholds in Section 12.1 using measured spike numbers.
7.  Confirm ownership rows (Section 16) with named sign-off, and rehearse the CCP trade-offs (Sections 4.1/4.3), the alternatives table (Section 10) and the novelty concession (Section 2.1) — the areas most likely to be challenged.

# 18. Two-Semester Roadmap and Risk Register

## 18.1 Delivery gates

- **Gate 1 — Evidence baseline:** stakeholder validation complete (Sections 1.3–1.4); overlap verified against direct product trials (Section 2.1); baseline mismatch/time-cost measurement recorded.
- **Gate 2 — PoC and spike:** interactive PoC demonstrates the change-assurance journey; local verifier returns schema-valid cited verdicts on the 8–12-case oracle; duplicate/out-of-order convergence demonstrated; oracle v1 frozen; scope changes recorded.
- **Gate 3 — Core build:** adapters, version store, code analyser, evidence graph, context builder, verifier, gate and Rules 1–2 functionally complete against FR-01–FR-19; evaluation harness operational.
- **Gate 4 — Evaluation:** full benchmark against all baselines (exact-link, lexical/embedding retrieval, base model, deterministic-rules-only, full rescan, manual workflow); fine-tuning go/no-go decision executed and reported either way; provisional NFR targets finalised or revised with evidence.
- **Gate 5 — Acceptance and handover:** user acceptance test completed (Section 12.2); deployment reproducible by a non-author on declared hardware; final documentation and audit-export check complete.

## 18.2 Risk register

| Risk                                                                                      | Likelihood | Impact | Mitigation                                                                                                                                                                                                                 |
|-------------------------------------------------------------------------------------------|------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Stakeholder validation finds the problem is not material.                                 | Medium     | High   | Run Gate 1 early; narrow or reposition per Section 1.3’s decision gates.                                                                                                                                                   |
| A contemporary product (CodeRabbit / Rovo) is judged to already cover the workflow.       | Medium     | High   | The conceded differentiator is local execution, versioned provenance, deterministic gating and abstention — all measurable (Section 12); if a controlled comparison shows no gap, report it honestly and narrow the claim. |
| Figma/Jira/GitHub API or OAuth access is blocked or rate-limited.                         | Medium     | Medium | Fallback PoC on exported/sample data plus a manually created Figma reference set (Section 13.4).                                                                                                                           |
| Criterion-to-code retrieval recall is too low for useful verification.                    | Medium     | High   | Restrict to the declared repository class and changed-symbol neighbourhood; report Recall@k honestly; narrow decisive states until the threshold is met.                                                                   |
| The verifier produces fluent but ungrounded verdicts.                                     | Medium     | High   | The verdict gate invalidates uncited/mis-cited decisive output by construction; unsupported-assertion rate is a measured NFR with a ≤ 2% target.                                                                           |
| Local inference latency or memory exceeds available hardware.                             | Medium     | Medium | Smaller/quantised checkpoint; asynchronous batch analysis instead of in-review; declare hardware and repository class rather than claiming general performance.                                                            |
| Gold oracle is too small or too narrow for reliable fine-tuning.                          | Medium     | High   | Public component corpora plus controlled transformations for the training pool; the gold suite is for evaluation only; if the pool is insufficient by Gate 3, ship the base-model pipeline and report the limitation.      |
| LoRA/QLoRA yields no held-out improvement.                                                | Medium     | Low    | Pre-committed go/no-go rule (Section 12.4): report the negative result and deploy the base pipeline. This is an acceptable outcome, not a project failure.                                                                 |
| Team underestimates reliability engineering (checkpointing, reconciliation, idempotency). | Medium     | Medium | Time-boxed at Gate 3; degrade to a smaller committed rule set (Rule 1 only) rather than skipping reliability work.                                                                                                         |
| Scope creep back toward extra integrations or visual fidelity.                            | Medium     | Medium | Section 7 hierarchy is frozen; stretch items are not defended at the panel and are not added during questioning.                                                                                                           |

# 19. Faculty-Feedback Closure Matrix

## 19.1 Sir Owais

| Comment                                                                         | Response in this revision                                                                                                                                                                                                                                                                                 |
|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The core is too narrow; deepen it rather than adding tools.                     | Broad “faithfulness” is replaced by criterion-level code/test verification, now the central workflow (Sections 6, 9.4, 11). No integrations added; Section 7 explicitly excludes them.                                                                                                                    |
| Verify the actual codebase, not only ticket status, merge state and timestamps. | A committed code analyser extracts base/head diffs, symbols, dependencies and test evidence for one declared language (Sections 7.2, 9.4a), and is exercised in both the PoC and the evaluation. Rules 1–3 are retained as supporting temporal evidence.                                                  |
| Clarify whether AI is a hosted service or part of the system.                   | The hosted LLM is removed from Sections 8, 11 and 14. One local open-weight inference and PEFT architecture is stated (Section 11.1). Hosted models appear only as an offline comparison baseline.                                                                                                        |
| Could a general AI reproduce the same value if given the data?                  | Section 2.3 states the engineered advantage — reliable ingestion, versioned graph, deterministic context selection, immutable provenance, bounded loops, validation gates, local privacy — and Section 12.1 commits to measuring it against a fixed general/base-model baseline rather than asserting it. |

## 19.2 Sir Irfan Ullah

| Comment                                                                          | Response in this revision                                                                                                                                                                |
|----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The AI layer should be local, not a hosted third-party API.                      | All committed inference is local (Section 11.1); the technical spike demonstrates local execution with recorded hardware, quantisation, latency and memory (Section 13.2).               |
| The local model should be fine-tuned on project-relevant data.                   | A narrow LoRA/QLoRA experiment over criterion–evidence examples is committed (Sections 11.9, 12.4); deployment of adapted weights is conditional on held-out improvement.                |
| Consider Llama and Qwen model families.                                          | A candidate shortlist with an explicit decision protocol is given (Section 11.3); the winner is chosen after measurement, not promised in advance.                                       |
| Research fine-tuning methods and dataset construction.                           | Section 12.3 specifies the label schema, public component datasets, the custom gold oracle, project-level splitting, synthetic-data limits, untuned baselines and calibration reporting. |
| Use loop/context engineering to inspect the codebase in two or three iterations. | Section 11.4 defines a fixed retrieval–verification–critic process with a pass limit, stop conditions, immutable context packets and logged intermediate outputs.                        |
| First check high-level features, then low-level implementation/correctness.      | Pass 1 maps atomic criteria to candidate code/tests; pass 2 inspects the relevant diff, symbol neighbourhood and test evidence; pass 3 audits citations only when needed (Section 11.4). |

# 20. Defence Positioning

## 20.1 Opening statement

Product teams already have Jira, Figma, GitHub and AI code-review tools, so Unify is not proposing another dashboard or chatbot. The unresolved problem is that a reviewer must decide whether one proposed change still matches its linked intent even when artifacts have different identities and versions and their events arrive late, twice or out of order. Unify maintains a provenance-preserving evidence graph, extracts the relevant code and tests, and runs a bounded local verifier criterion by criterion. It reports what is supported, contradicted, partial or unresolved, and rejects decisive model outputs that lack valid evidence. The contribution is the reproducible reconciliation and verification process — not the integrations by themselves.

## 20.2 Anticipated questions

| Question                                       | Answer                                                                                                                                                                                                                                                                       |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| What exactly is new?                           | Not tool integration or Jira-aware AI review. The locally reproducible evidence process: asynchronous event reconciliation, versioned cross-tool relations, criterion-specific code/test context, bounded local verification, provenance validation and explicit abstention. |
| Can a general LLM do this?                     | It can analyse a manually selected prompt. It does not ensure the evidence is current, completely linked, versioned, locally private or replayable. We also compare against a fixed base-model prompt baseline with identical inputs.                                        |
| Is your AI hosted?                             | No production repository, ticket or design content leaves the local deployment. We use a pinned local open-weight model; hosted models are limited to offline comparison on non-sensitive benchmark data.                                                                    |
| Which model will you use?                      | We benchmark a small Qwen Coder model and a Llama-family alternative on the available hardware and select from held-out quality, grounding, latency, memory and licence evidence.                                                                                            |
| Why fine-tune?                                 | It is a narrow PEFT experiment for criterion–evidence verdicting, retained only if it improves held-out performance over the same untuned model with identical retrieval, without worsening unsupported assertions or latency.                                               |
| Where does training data come from?            | Public issue–patch–test corpora provide component examples; controlled transformations expand the training pool; a separate, manually adjudicated Unify oracle supplies gold test cases. Projects are separated across splits.                                               |
| Can a text model compare Figma with code?      | Not safely at pixel level. The core uses approved structured Figma constraints and version metadata plus code/test evidence. Screenshot, DOM or vision-language comparison is stretch and separately evaluated.                                                              |
| Are you verifying correctness?                 | We verify evidence against explicit criteria within a declared scope. SUPPORTED does not mean the program is universally correct; missing or ambiguous evidence produces INSUFFICIENT_EVIDENCE.                                                                              |
| What are the iterations?                       | Pass 1 retrieves candidate code and tests for one atomic criterion; pass 2 verifies implementation evidence; pass 3 audits citations only when evidence conflicts or is incomplete. Pass count and stopping rules are fixed and logged.                                      |
| Why keep Rules 1–3?                            | They capture temporal and coordination drift that code-semantic analysis alone does not, and they are deterministic, so they anchor the evidence case.                                                                                                                       |
| What if the model hallucinates a file or line? | The verdict gate resolves every citation against the immutable packet. Invalid or missing citations prevent a decisive status and downgrade the result.                                                                                                                      |
| How do you measure success?                    | Link accuracy, evidence retrieval, class-wise verdict quality, abstention, unsupported assertions, provenance completeness, event convergence, latency and reviewer task performance, each against an explicit baseline.                                                     |
| Why three students?                            | Three independently evaluated technical streams: reliable cross-tool version ingestion; code/test evidence graph and deterministic rules; local model, context engineering, adaptation, validation and product integration.                                                  |
| What if LoRA does not improve results?         | That is a valid experimental result. We report it and deploy the stronger base pipeline; the contribution remains the verified, local, provenance-preserving change-assurance system.                                                                                        |

## 20.3 Terminology discipline

| Avoid                                           | Use instead                                                                                                                |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| “Our model checks whether the code is correct.” | “The system assesses cited implementation and test evidence against explicit criteria within a declared scope.”            |
| “The Figma design is faithfully implemented.”   | “The available structured design and implementation evidence supports/contradicts the specified constraint.”               |
| “The AI decides whether to alert.”              | “A deterministic gate validates evidence and rule eligibility; uncertain model output is escalated or abstained.”          |
| “Fine-tuning will improve accuracy.”            | “We test whether PEFT improves held-out performance over the same untuned local model.”                                    |
| “No existing product does this.”                | “Existing systems overlap; Unify’s evaluated distinction is local, versioned, provenance-gated cross-tool reconciliation.” |
| “We support every codebase.”                    | “The committed analyser supports one declared language and repository class.”                                              |

# 21. Panel-Feedback Additions (Revision 3)

This part records the technical commitments made in response to the proposal-defence panel comments. It is appended rather than merged, so Sections 0–20 remain as presented. Where a statement here is more specific than an earlier section, this part governs.

Disposition classes used throughout: **Accept** — enters committed scope as written. **Accept with stated limit** — enters committed scope with an explicit, published boundary, because the comment as phrased is unbounded. **Defer** — deliberately held for FYP-II, contingent on the committed core being stable at Mid-2.

## 21.1 Summary of the response

Six comments enter committed scope as written, four enter with an explicit stated limit, and one is deferred to FYP-II. To pay for the additions — chiefly traceability — two items leave committed scope. The LoRA adaptation stays in committed scope as a measured experiment. No additional time is requested.

| Addition                                             | Disposition              | Where it lands |
|------------------------------------------------------|--------------------------|----------------|
| Traceability entity, anchoring and policy P4         | Accept                   | 22             |
| FR and NFR anchoring granularity                     | Accept with stated limit | 22.4           |
| Reduced project-manager involvement                  | Accept                   | 23             |
| LLM usage register and autonomy ladder               | Accept                   | 24             |
| Model selection as a measured study                  | Accept                   | 25             |
| Comments as semantics; repository eligibility gate   | Accept with stated limit | 26             |
| Context management and large-codebase scaling        | Accept with stated limit | 27             |
| Dataset validation process                           | Accept                   | 28             |
| Five-layer validation plan, ablations and hard gates | Accept                   | 29             |
| Learned or adaptive confirmation thresholds          | Defer                    | 23.3           |

# 22. Traceability

## 22.1 Fourth entity and new relation

The evidence graph gains one entity and one relation beyond those defined in Section 9.1.

4.  **Requirement** — a functional or non-functional requirement, sourced either from a work-item issue or from an uploaded requirements document, carrying a stable identifier and a version.
5.  **SATISFIES(CodeUnit, Requirement)** — carrying a **CodeAnchor**: repository, file path, fully-qualified symbol name, start and end line, blob hash and commit SHA, together with confidence and provenance.

## 22.2 Commit-pinned anchoring and re-anchoring

The anchor is commit-pinned, because line numbers drift on every edit. Re-anchoring after each commit resolves in order by fully-qualified symbol name, then content hash, then diff-hunk mapping. When all three fail, the anchor is marked **broken** rather than left silently wrong.

**Anchor survival rate across commits is a reported metric**, on the principle that an anchoring system which degrades invisibly is worse than none at all.

## 22.3 Policy P4 — requirement/implementation divergence

A fourth policy joins Rules 1–3 of Section 9.4.

| Element | Definition                                                                                                                                                                                                                                          |
|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Trigger | A requirement’s text or acceptance criteria change materially while every code unit anchored to it remains unchanged beyond the grace period; or an anchored code unit changes materially while no linked requirement or ticket records the change. |
| Guards  | Ignore formatting-only and generated-file edits; require a confirmed or auto-confirmed anchor; exclude requirements explicitly marked descriptive.                                                                                                  |
| Outputs | Divergence finding with both sides of the anchor, severity, and the evidence path.                                                                                                                                                                  |

## 22.4 FR and NFR anchoring granularity

Functional requirements anchor to lines. Non-functional requirements anchor by a different mechanism, and the distinction is stated explicitly because it is the honest answer.

|                    | Functional requirements                                                                           | Non-functional requirements                                                                                                                         |
|--------------------|---------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Anchor granularity | Symbol plus line range, commit-pinned                                                             | Enforcement point plus its verifying test                                                                                                           |
| Why                | A functional requirement maps to behaviour implemented in identifiable units                      | “The system shall respond within two seconds” is not located at a line; it is enforced by a timeout constant, a queue configuration and a load test |
| What is displayed  | File, symbol, highlighted span, commit, confidence and evidence                                   | The mechanism that enforces it, the configuration that parameterises it, and the test that demonstrates it                                          |
| Metric             | Precision, recall and F1; span overlap against the labelled range; anchor survival across commits | Coverage — the proportion of NFRs with at least one enforcement point and one passing verifying test                                                |

Claiming universal NFR-to-line traceability would be easy to write and impossible to defend. Anchoring NFRs to mechanisms and tests is defensible and is a clean differentiator from a text matcher.

## 22.5 Traceability as a process artifact

The team maintains its own traceability matrix — FR to design element to module to test case to evaluation scenario — versioned in the repository and regenerated at each gate. It doubles as a worked example of the product capability applied to our own work.

## 22.6 Position relative to the literature

Requirements-to-code traceability link recovery is an established field with recent retrieval-augmented and LLM-based work, including LiSSA (ICSE 2025), RAG-based recovery by Hey and colleagues, HGNNLink, and self-reflective frameworks such as R2Code. Reported error patterns in that literature — naming bias and phantom links in particular — directly justify the confirmation gate (Section 9.2) and the hard-negative sampling strategy (Section 28). This body of work is cited rather than re-claimed: the contribution is live, commit-pinned, provenance-gated anchoring inside a running consistency engine, not a better matcher.

# 23. Reducing Human-in-the-Loop Cost

## 23.1 Three loops, separated

The design places a human in three structurally different positions. Separating them is what makes the reduction tractable.

| Loop          | What the human does today                                                    | Response                                                                                                                                                                                                                                                                                          |
|---------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Configuration | Defines workflow state maps, grace periods, critical components and severity | **Automate and demote to approval.** Derive the canonical state map from the project’s own observed transitions; set the default grace period at the 90th percentile of observed merge-to-done delay. The PM approves a pre-filled proposal instead of authoring one.                             |
| Confirmation  | Confirms every inferred link before it may fire a policy                     | **Narrow rather than remove.** Above the upper confidence threshold, auto-confirm with provenance recorded as system-confirmed and reversible; inside the band, ask; below, hold silently as a suggestion. Only the band reaches a person, and it reaches the code owner or assignee, not the PM. |
| Resolution    | Acknowledges, resolves or suppresses a finding                               | **Keep.** This is a judgement about the team’s own work and should not be automated. Cost is reduced through grouping and bulk actions.                                                                                                                                                           |

The research framing is active learning: query the human where the system is least certain, so each question buys the most information.

## 23.2 New measurable targets

- Human interventions per 100 ingested events, reported against an all-manual baseline.
- PM-directed prompts per finding, reported separately from developer-directed and designer-directed prompts.
- Auto-confirmation precision at the upper threshold, which must remain at or above manual-confirmation precision, or the threshold moves.

## 23.3 Deferred

Learned or adaptive thresholds that move by themselves in response to acknowledgement history are deferred to FYP-II, and only if the fixed-threshold version is stable at Mid-2.

# 24. LLM Usage Register

An LLM Usage Register is added to the SRS and SDS. It declares, for every stage, the autonomy level and the deterministic fallback. One rule governs the whole table: **no LLM output writes to the graph of truth, and no LLM output fires a policy on its own.**

## 24.1 Autonomy ladder

| Level | Meaning                                                                  | Can it change system state?            |
|-------|--------------------------------------------------------------------------|----------------------------------------|
| L0    | No model. Deterministic parsing or rule evaluation                       | Yes — it is the ground truth           |
| L1    | Retrieve and rank only. Embeddings, no generation                        | No. Produces an ordered candidate list |
| L2    | Suggest. Generates a proposal requiring confirmation or a threshold pass | No, until confirmed                    |
| L3    | Explain or verify over already-confirmed facts, citing evidence spans    | No. Adds explanation, not facts        |
| L4    | Autonomous write or autonomous resolution                                | **Prohibited in this project**         |

## 24.2 The register

| Stage                | Task                                                       | Technique                                                                             | Level          | Fallback if the model is unavailable              |
|----------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------|----------------|---------------------------------------------------|
| Ingestion            | Extract symbols, signatures, docstrings, comments, imports | tree-sitter parsing                                                                   | L0             | None needed — deterministic                       |
| Candidate generation | Propose requirement-to-code candidates                     | Hybrid BM25 and code embeddings, fused by reciprocal rank                             | L1             | Lexical retrieval alone                           |
| Adjudication         | Decide whether a candidate is a real trace link            | Local instruct model over a context packet; constrained JSON verdict with cited spans | L2             | Similarity threshold only, reported as a baseline |
| Drift review         | Does this anchor still hold after this diff?               | Model reads the diff hunk and the anchored symbol                                     | L2             | Symbol-name and content-hash re-anchoring only    |
| Conflict explanation | Render why a policy fired                                  | Template filled from the evidence path; the model may rephrase, never add facts       | L3             | Raw template text                                 |
| Chain summarization  | Narrative summary of a change chain                        | —                                                                                     | —              | Removed from committed scope                      |
| Adaptation           | LoRA fine-tune for verdict format and domain vocabulary    | Parameter-efficient fine-tuning                                                       | L2 — committed | Base model with few-shot prompting                |

Because every row has a fallback, the system has a defined degraded mode, and it will be demonstrated: **one full benchmark pass with the model server switched off**, showing which capabilities survive and which numbers drop.

Adaptation is committed work, not a contingency. The fine-tune runs and the comparison against the same base model under identical retrieval is reported either way; the adapted weights ship only if they improve held-out performance without increasing unsupported assertions or breaking the latency budget. A negative result is a reportable finding, not a cancelled task.

# 25. Model Selection as a Measured Study

No model is named in this proposal and defended on reputation. A selection study is run against the frozen development split and the table is presented. **The selection is a deliverable, not a preference.**

## 25.1 Why the deployment constraint comes first

The privacy position in Section 14 already forbids sending private repository content to a third-party API without explicit opt-in. That makes a self-hosted open-weight model the default path and a hosted API an opt-in reference ceiling rather than a committed dependency. This narrows the candidate set before any benchmark is run.

## 25.2 Candidate classes

| Class                                                                                  | Role in the system                                     | Rough working point                                                                                                  | Why it is on the list                                                                                                |
|----------------------------------------------------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Small local instruct, roughly 4–8B, 4-bit                                              | Floor baseline; proves the pipeline runs without a GPU | ~6–8 GB VRAM; CPU-viable                                                                                             | Establishes how much of the result comes from retrieval and structure rather than model size                         |
| Mid local, 20–30B class, 4-bit                                                         | Expected working point for the verifier                | ~16–24 GB VRAM, single GPU                                                                                           | Current reviews place this class within reach of one consumer GPU at usable code performance                         |
| Sparse mixture-of-experts coder, large total and small active parameters, long context | Upper local bound for whole-repository reasoning       | Sources disagree — some report a single 24 GB GPU, others ~45 GB. Resolving this by measurement is part of the study | Long context and reliable tool use are the two properties the bounded verifier loop depends on                       |
| Hosted frontier API                                                                    | Reference ceiling, on sanitised data only              | Per-token cost, no local hardware                                                                                    | Shows how much headroom the local choice gives up; never a committed runtime dependency                              |
| Code embedding model                                                                   | Candidate generation for trace links                   | CPU or small GPU                                                                                                     | Open models currently lead code-retrieval benchmarks; a hybrid dense-and-sparse model is the alternative to evaluate |

## 25.3 Why no model is named here

Six open-weight coding models were released in a three-week window in August alone. Any name fixed in September is likely to be stale by the defence. The proposal therefore fixes the selection protocol and the acceptance thresholds; the chosen model is named in the Mid-1 report with its version and the date of selection recorded. Named candidates appear in an appendix marked for re-verification at selection time.

## 25.4 Selection protocol

- Freeze the development split and the verdict schema before any model is downloaded.
- Run every candidate with identical prompts, identical context packets, temperature 0 and constrained JSON decoding, so differences are attributable to the model.
- Record per candidate: verdict F1 on the development split, p50 and p95 latency per verdict, peak VRAM, tokens per verdict, context limit, licence and commercial terms, and schema-violation rate.
- Select on the stated weighting, freeze the choice, and record the fallback model and the conditions that would trigger a switch.
- Run the frozen test set once only, after selection.

## 25.5 Resource budget to present

GPU and VRAM available to the group; index storage per 100k LOC; one-off embedding time per repository; incremental re-index time per commit; tokens and wall-clock time per verdict; and the electricity or rental cost of one full benchmark pass. If the group has no GPU access, the mid-class candidate becomes the ceiling and the proposal says so rather than planning around hardware that does not exist.

# 26. Comments as Semantics, and Repository Eligibility

## 26.1 Symbol cards

Each indexed symbol produces a **symbol card**: fully-qualified name, signature, docstring, leading comment block, directory path tokens, file name, imports and callers, and the message of the commit that introduced it. The card, rather than the raw line range, is what is embedded and what enters the context packet, so natural-language evidence and code evidence sit in a single retrievable unit.

This yields a second capability almost free: a **comment–code consistency check**, where a docstring claims behaviour the signature or body contradicts. It is a genuine finding for the dashboard and uses the same verifier.

## 26.2 The eligibility gate

| Signal                                                                    | Measured by                                            |
|---------------------------------------------------------------------------|--------------------------------------------------------|
| Docstring and comment coverage of public symbols                          | Static analysis over the parsed abstract syntax tree   |
| Identifier informativeness — proportion of non-cryptic, multi-token names | Tokenisation and dictionary matching over symbol names |
| Directory structure conventionality                                       | Match against known layout conventions per language    |
| Presence of README, module documentation or architecture notes            | File presence and length thresholds                    |
| Test presence and naming                                                  | Test discovery per framework                           |

The threshold is published, the score is shown to the user at connection time, and a repository below the threshold is admitted only with an explicit warning that link quality is not guaranteed.

## 26.3 Low-documentation cohort

Three or four repositories deliberately below the threshold are evaluated and reported separately. This converts the scope restriction from an assumption asserted into a degradation curve measured, and a stratified result is what makes the restriction itself defensible.

# 27. Context Management and Large Codebases

## 27.1 Packet construction

Every verdict is produced from a context packet built deterministically under a fixed token budget.

- **Per-slot budgets** — requirement text, symbol cards, diff hunks, neighbouring graph edges, policy definition — with a fixed assembly order and a fixed eviction order, so the lowest-priority slot truncates first and truncation is recorded rather than silent.
- **AST-aligned chunking**, so a chunk is a function or a class rather than an arbitrary line window.
- **Hybrid retrieval** — sparse and dense fused, deduplicated, with diversity enforced so that ten near-identical chunks cannot crowd out the one that matters.
- **A packet manifest stored with every verdict**: which chunks, which commit, which budget, which model version, which prompt hash. This is what makes a verdict reproducible and auditable.

## 27.2 Scaling beyond the context window

Whole-repository prompting does not scale and no such claim is made. The approach is **map-then-zoom**: a repository map of directory and file-level summaries plus a symbol index, over which the model selects regions and then retrieves full detail only for the selected regions, within a bounded number of passes. The bounded verifier loop (Section 11.4) is the enforcement point — passes are capped, and an unresolved verdict after the cap is returned as uncertain rather than guessed.

Indexing is incremental: content-hash comparison means only changed symbols are re-parsed and re-embedded on a commit.

## 27.3 Scalability benchmark

Three repository sizes of roughly 10k, 100k and 500k lines of code. Reported: full index build time, incremental update time per commit, index storage, retrieval recall@k, p95 verdict latency and packet truncation rate.

**Stated limit:** two languages only — Python and TypeScript/JavaScript — and an upper bound of approximately 500k LOC. Anything beyond that is declared future work rather than attempted.

# 28. Dataset Validation

## 28.1 Construction

- Twelve to twenty repositories passing the eligibility gate, with permissive licences and usable issue or pull-request history.
- Ground-truth units: requirement-to-code-anchor pairs, policy event sequences, and recipient-routing cases.
- **Hard negatives drawn from the same repository and the same module** — similar names, similar vocabulary, no real relationship. This is the case that naming bias breaks, so it is deliberately over-represented relative to random negatives.
- Real and synthetic cases labelled as such and reported separately. No blended figure is published.

## 28.2 Validation of the labels

- Two students label independently and the third adjudicates. **Cohen’s kappa is reported per artifact class with a target of 0.70 or above**; below that the labelling guide is rewritten and the set relabelled rather than proceeding.
- Disagreements and their resolution rules are published, not silently overwritten.
- A written labelling guide with worked positive, negative and ambiguous examples, versioned alongside the dataset.

## 28.3 Validation of the dataset as an artifact

- Automated integrity checks: every commit SHA resolves, every anchor span lies within its file, no secrets or tokens in any retained payload.
- **Splits by repository and never by pair**, so no project appears on both sides. One repository is held out entirely as an unseen-project set and opened once.
- A dataset card recording provenance, licences, size, class balance, known limitations and the exact commit of the extraction script.

**Threat named up front:** split leakage is the most likely way a project of this kind produces an impressive and meaningless number. Splitting by pair rather than by repository would let the method learn a project’s naming conventions during development and then be scored on them at test time. Repository-level splits cost headline accuracy and that cost is accepted.

# 29. Validation Process and Hard Gates

## 29.1 Five layers

| Layer       | Question                                    | Method                                                                                                                               | Gate    |
|-------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|---------|
| Data        | Is the ground truth trustworthy?            | Agreement statistics, adjudication, integrity checks, dataset card                                                                   | Mid-2   |
| Component   | Does each stage work on its own?            | Retrieval recall@k; verdict F1; anchor survival; re-anchoring accuracy, each measured in isolation                                   | Final-1 |
| System      | Does the product meet its specification?    | Acceptance test per functional requirement; reliability tests for duplicate, out-of-order and outage conditions; security scan       | Mid-2   |
| Comparative | Is the method better than the alternatives? | Baselines: lexical retrieval only; embeddings without the verifier; verifier without structured context; exact-identifier links only | Final-2 |
| Human       | Would anyone use it?                        | Expert review of a sampled set of verdicts, plus the counterbalanced crossover workflow study                                        | Final-2 |

## 29.2 Ablations committed to

7.  Comments and docstrings stripped from symbol cards — isolates the documentation-quality hypothesis.
8.  Path and file-name tokens removed — isolates the directory-structure signal.
9.  Structural chunking replaced with fixed-size windows.
10. Verifier removed, threshold only.
11. Base model against the LoRA-adapted model, under identical retrieval and prompts.

## 29.3 Two hard validation gates

- **A verdict citing no evidence span is rejected automatically** and counted as an abstention rather than an answer. Target: 100 per cent enforcement.
- **Verdict stability:** the same packet run three times at temperature 0 must agree at least 95 per cent of the time, or the configuration is not fit to be measured.

# 30. Scope Changes in This Revision

Traceability, the eligibility gate, dataset validation and the scalability study are approximately six to seven weeks of new work. No additional time is requested.

Additional source integrations such as GitLab, Linear or Notion remain outside committed scope. The adapter layer is defined by source role rather than by product (Section 8.1), so any of them is one adapter written against an existing contract rather than new architecture, and none produces a new evaluable claim.

| Item                                              | Status | Reasoning                                                                                                                                 |
|---------------------------------------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------|
| AI chain summarization                            | Out    | Already a stretch item. It is a presentation feature that produces no evaluable claim, and the first thing a panel would call decorative. |
| Languages beyond Python and TypeScript/JavaScript | Out    | Each additional language multiplies grammar work, convention modelling and labelling effort without adding a new contribution.            |

**Note on Section 7.2.** Section 7.2 froze a single implementation language, TypeScript/React. This revision commits to **two** language families — Python and TypeScript/JavaScript — as stated in Section 27.3. Where the two differ, Section 27.3 governs.

# References

1.  CodeRabbit — Jira integration documentation. https://docs.coderabbit.ai/integrations/jira
2.  CodeRabbit — issue/PR validation documentation. https://docs.coderabbit.ai/issues/pr-validation
3.  Atlassian Rovo — check acceptance criteria in a code review. https://support.atlassian.com/rovo/docs/check-acceptance-criteria-in-a-code-review/
4.  GitHub — linking a pull request to an issue. https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue
5.  Figma REST API. https://developers.figma.com/docs/rest-api/
6.  Figma webhook events. https://developers.figma.com/docs/rest-api/webhooks-events/
7.  Figma Dev Resources. https://developers.figma.com/docs/rest-api/dev-resources/
8.  Hugging Face PEFT — LoRA. https://huggingface.co/docs/peft/package_reference/lora
9.  Hugging Face PEFT — quantisation and QLoRA. https://huggingface.co/docs/peft/developer_guides/quantization
10. Qwen2.5-Coder family. https://qwenlm.github.io/blog/qwen2.5-coder-family/
11. Meta Llama 3.1. https://ai.meta.com/blog/meta-llama-3-1/
12. Code Llama. https://ai.meta.com/research/publications/code-llama-open-foundation-models-for-code/
13. PyBugHive. https://github.com/pybughive/pybughive
14. SWE-bench repository. https://github.com/SWE-bench/SWE-bench
15. SWE-bench Verified. https://openai.com/index/introducing-swe-bench-verified/

*Source note: product and model capabilities change. Preserve the exact model cards, licences, versions, benchmark snapshots and dated official product pages used in the final submission. Do not claim empirical superiority over a commercial system without running a controlled comparison.*
