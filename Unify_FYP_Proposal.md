# **UNIFY** 

**Cross-Tool Consistency & Drift Detection for Product Teams** _Final Year Project Proposal_ 

Stream: B — Application-derived Group members: Abdullah Amin· Haaniah Ismail · Mishal Fatima Supervisor: Dr. Ali Zeeshan Ijaz FAST School of Computing · August 2026 

## **Table of Contents** 

|Table of Contents................................................................................................................................................... 1|
|---|
|0. Executive Summary..........................................................................................................................................1|
|1. Problem Statement............................................................................................................................................1|
|1.1 Stakeholders................................................................................................................................................. 1|
|1.2 Evidence plan...............................................................................................................................................1|
|2. Related Work and Evidence-Based Gap......................................................................................................1|
|2.1 Comparable commercial and research systems.................................................................................1|
|2.2 Positioning within the FAST FYP repository (2019–2025)................................................................1|
|3. Fit with University FYP Expectations...........................................................................................................1|
|3.1 Weaknesses this proposal deliberately avoids...................................................................................1|
|4. Complex Computing Problem (CCP).............................................................................................................1|
|4.1 Trade-ofs created by this CCP.................................................................................................................1|
|4.2 CCP characteristic evidence.....................................................................................................................1|
|5. Contribution Statement...................................................................................................................................1|
|6. Proposed System................................................................................................................................................1|
|7. Scope Defnition.................................................................................................................................................1|
|8. Technical Architecture.....................................................................................................................................1|
|8.1 Major components...................................................................................................................................... 1|
|8.2 Interfaces, data fow and boundaries....................................................................................................1|
|9. Technical Alternatives Considered...............................................................................................................1|
|10. AI Layer and External-Component Boundaries......................................................................................1|
|11. Testing, Evaluation and User Acceptance.................................................................................................1|
|11.1 Evaluation plan.........................................................................................................................................1|
|11.2 User acceptance plan............................................................................................................................... 1|
|12. Proof of Concept (POC) Plan......................................................................................................................... 1|
|13. Deployment Plan............................................................................................................................................. 1|
|14. Requirements Snapshot.................................................................................................................................1|
|14.1 Functional requirements........................................................................................................................1|
|14.2 Non-functional requirements................................................................................................................1|
|15. Team Technical Ownership..........................................................................................................................1|
|16. Immediate Next Steps.................................................................................................................................... 1|



## **0. Executive Summary** 

Development teams work across separate tools for design, code, project management and communication. A design change, a merged pull request and a ticket status are disconnected pieces of information that someone must manually reconcile. Small inconsistencies like a stale ticket, an outdated design, an undocumented change surface late, during QA, deployment or standup, as bugs, rework or miscommunication. 

**Unify is a system for maintaining and reasoning over cross-tool relationships and detecting downstream inconsistencies when development artifacts change. It is not “a website that integrates developer tools”: the integrations (Figma, GitHub, Jira, Slack) are the environment in which the project's genuine computing problem is solved, reliably linking and reasoning over rapidly changing entities across heterogeneous tools while minimizing false alerts.** 

This proposal defines the problem with a stakeholder-evidence plan, positions Unify against the closest commercial products and against the FAST FYP repository (2019–2025, ~990 projects), states one precise contribution, narrows scope to a defensible, committed core, and sets out a concrete POC, evaluation, deployment and team-ownership plan. 

## **1. Problem Statement** 

Development teams use Figma, GitHub, Jira and Slack separately. Each tool holds its own record of the same real-world unit of work — a design, a pull request, a ticket, a discussion — with no shared identifier connecting them. When one changes, nothing propagates the implication of that change to the others. The mismatch is discovered late: during QA, at deployment, or at standup, after the cost of rework has already been incurred. 

### **1.1 Stakeholders** 

- Developers — need to know when a design or requirement they are implementing against has changed. 

- Designers — need to know when an implementation has diverged from the latest design. 

- Project managers — need project-level visibility into which linked items are inconsistent, without commit-level noise. 

### **1.2 Evidence plan** 

The problem is described here from direct observation of common multi-tool team workflows; it will be substantiated with primary evidence before requirements are baselined: 

1. Structured interviews or a workflow-observation session with 6–10 developers, designers and PMs — target group: FAST senior-year project teams or a partner student/industry team already using Figma + GitHub + Jira together. 

2. A short survey (10–15 questions) capturing: frequency of late-discovered design/code/ticket mismatches, how they were discovered, time lost, and whether existing sync tools were used and why they did not prevent the incident. 

3. A measured or estimated baseline — mismatches per sprint/week and time cost per incident — used later as the evaluation comparator (Section 11). 

## **2. Related Work and Evidence-Based Gap** 

### **2.1 Comparable commercial and research systems** 

Why can't existing tools already solve this? The table below compares Unify against the closest alternatives by structural approach, not by feature count. 

|**Product /**<br>**approach**|**Core approach**|**Constraints /**<br>**deployment**|**Evidence-based**<br>**limitation**|**Implication for**<br>**Unify**|
|---|---|---|---|---|
|Unito / Exalate|Two-way feld sync<br>between Jira, GitHub,<br>Slack, Notion and 20+<br>tools.|SaaS, per-seat<br>pricing,<br>confgured per<br>feld mapping.|Synchronizes feld<br>values; does not reason<br>about whether linked<br>items are now<br>inconsistent with each<br>other.|Sync is a solved<br>commodity — Unify<br>does not lead with<br>sync or a<br>dashboard.|
|Zapier / Make|One-way trigger<br>→<br>action automation.|SaaS, rule-per-<br>automation.|Event plumbing only; no<br>relationship model, no<br>confict semantics.|Confrms<br>ingestion/plumbing<br>alone is not a<br>defensible core<br>contribution.|
|Unblocked|Cross-tool knowledge<br>graph over code, PRs,<br>Slack, Jira, Confuence,<br>Notion (25+ tools); NL<br>Q&A with citations.|Commercial SaaS,<br>broad tool<br>coverage.|Answers “what is<br>related” and “what<br>happened”; does not<br>detect workfow-state<br>staleness (e.g., ticket still<br>In Progress after PR<br>merge) as a frst-class<br>alert.|The relationship-<br>graph idea already<br>exists commercially<br>— Unify's<br>contribution sits on<br>top of linking, in<br>confict/drift<br>detection.|
|Potpie|Cross-tool knowledge<br>graph aimed at AI<br>coding agents.|Funded startup,<br>code-centric.|Optimized for AI-agent<br>context retrieval, not<br>workfow-confict<br>alerting to human roles.|Diferent consumer<br>(agents vs.<br>PM/designer/develo<br>per) — reinforces<br>that role-aware<br>confict alerting is<br>the open niche.|



|**Product /**<br>**approach**|**Core approach**|**Constraints /**<br>**deployment**|**Evidence-based**<br>**limitation**|**Implication for**<br>**Unify**|
|---|---|---|---|---|
|Atlassian Rovo|AI assistant/search<br>native to the Atlassian<br>ecosystem.|Locked to<br>Atlassian<br>products.|No frst-class cross-<br>vendor (Figma<br>GitHub<br>↔<br>Jira) confict detection;<br>↔<br>ecosystem-locked.|Unify's cross-<br>vendor scope is a<br>real diferentiator,<br>not just a feature<br>count.|
|Applitools /<br>Uiprobe|Detects visual/pixel<br>divergence between a<br>Figma design and the<br>live site.|Plugin/CI-<br>integrated.|Detects visual drift, not<br>workfow-state drift (e.g.,<br>ticket status vs. PR<br>status).|Confrms workfow-<br>state drift is not yet<br>claimed elsewhere<br>— this is where<br>Unify's gap sits.|
|Figma for Jira|Notifes on design<br>changes within a<br>linked Figma–Jira pair.|Marketplace<br>plugin.|Pairwise only; no graph,<br>no GitHub, no reasoning<br>across more than two<br>tools.|Unify difers by<br>reasoning over a<br>multi-tool graph,<br>not a single<br>pairwise link.|



_No product identified performs rule-based conflict detection over a heterogeneous work-item graph — combined with role-aware routing measured by a precision/dismissal-rate metric. Existing tools sync data, answer questions, or compare pixels; none model staleness/inconsistency between linked entities across tools as a first-class detection problem. This is the gap Unify is scoped to fill._ 

### **2.2 Positioning within the FAST FYP repository (2019–2025)** 

To confirm local novelty, Unify was checked against a normalized analysis of the FAST School of Computing FYP repository covering Spring 2019 through Fall 2025 (~990 projects) and a focused pattern analysis of the 2024–2025 cohorts (483 projects). 

- No project in the analyzed repository targets cross-tool relationship reasoning or conflict/drift detection across software-engineering tools (Figma, GitHub, Jira, Slack). “Workplace and enterprise systems” is the closest problem domain in the repository at 86 projects (8.7% of the corpus), but this bucket covers institutional administration, document tracking and record management — not internal developer-tool workflows. 

- The closest architectural analogues found are Pattern D (“workflow-automation platforms,” which digitize an institutional process and add automation) and the Fall 2025 “AI-asorchestrator” pattern. Two named repository projects are structurally closest: GHOST, which orchestrates Gmail, Calendar, Drive, Docs and Sheets through a master-agent/subagent architecture from a single instruction; and FYPilot, which automates a multi-stage institutional workflow (idea comparison, uniqueness checking, report generation, supervisor review). Both orchestrate actions across multiple external tools, but neither 

builds a persistent cross-tool relationship graph or detects staleness between linked entities over time — they execute a workflow on request rather than continuously reasoning about consistency. 

- Unify therefore does not overlap with any of the repository's identified saturated categories — generic chatbots, RAG document Q&A, recommenders, disease/phishing/deepfake classifiers, e-commerce marketplaces, attendance/LMS systems, lecture summarization, admission assistants, sign-language translation, mental-health chatbots, traffic/parking alerts, or blockchain record systems. 

_This closes the previously open item in this comparison table: the repository search found no directly overlapping prior FAST FYP, which is itself evidence of local novelty and should be stated as such at defense, alongside the global commercial comparison in Section 2.1._ 

## **3. Fit with University FYP Expectations** 

The repository analysis identifies a consistent institutional pattern: an accepted FYP is a complete, evaluable service built around a real stakeholder and workflow, not an isolated model or a feature list. Unify is checked against that pattern directly: 

|**University expectation**|**How Unify satisfes it**|
|---|---|
|A concrete stakeholder (not<br>“everyone”)|Developers, designers and PMs — three named, distinct roles<br>with diferent needs (Section 1.1).|
|A specifc operational pain point|Downstream inconsistencies between linked artifacts that<br>surface late as bugs, rework or miscommunication (Section<br>1).|
|A complete service workfow,<br>not an isolated function|Ingest<br>link<br>detect confict<br>route notifcation<br>present<br>→<br>→<br>→<br>→<br>in a unifed feed (Section 6), not merely “upload<br>→<br>classifcation.”|
|A meaningful, necessary<br>intelligent/technical component|Entity resolution and rule-based drift reasoning over an<br>incomplete, asynchronous, heterogeneous graph — the CCP<br>(Section 4) — not an AI feature added for its own sake.|
|Multiple system components|Integration adapters, relationship store, confict engine,<br>notifcation engine, dashboard/feed, and an explicitly<br>bounded AI-assist layer (Section 6).|
|Measurable success criteria|Notifcation precision, missed-confict rate, time-to-<br>downstream-awareness, linking accuracy, event latency<br>(Section 11).|
|A defensible data strategy|Data comes directly from connected tools via<br>OAuth/webhooks/polling — no scraping, no inaccessible<br>institutional dataset dependency (Section 8).|
|An SDG or social/industrial-|SDG 9 — Industry, Innovation and Infrastructure: Unify|



|**University expectation**|**How Unify satisfes it**|
|---|---|
|impact connection|strengthens the reliability and efciency of software-<br>development infrastructure and tooling for product teams. A<br>secondary link to SDG 8 (Decent Work and Economic Growth)<br>follows from reduced rework and late-stage frefghting.|



### **3.1 Weaknesses this proposal deliberately avoids** 

The repository analysis lists recurring weaknesses across recent cohorts. Unify's scope (Section 7) and framing were shaped specifically to avoid each one: 

- Technology-first thinking — the CCP (Section 4) is stated as a reasoning/trade-off problem, not “use AI/LLMs for X.” 

- An “AI veneer” over a CRUD app — the AI layer is explicitly non-core (Section 10); the contribution is the relationship model and conflict engine. 

- A feature list presented as a problem statement — Section 1 states one problem and Section 5 states one contribution before any feature is listed. 

- Excessive scope (ten or more independent modules) — the committed core is deliberately three tools plus one notification channel (Section 7). 

- No clear data source — all data is first-party, from the connected tools' own APIs (Section 8). 

- Weak or absent evaluation planning — a baseline, metrics and acceptance plan are defined at proposal stage, not deferred (Section 11). 

## **4. Complex Computing Problem (CCP)** 

**_How can a system reliably maintain and reason over relationships between rapidly changing entities across heterogeneous development tools, while minimizing false conflict/notification alerts?_** 

### **4.1 Trade-offs created by this CCP** 

- Accuracy vs. false positives — raising conflict-detection sensitivity increases recall but also increases notification noise and dismissal. 

- Real-time detection vs. latency/API limits — GitHub, Jira and Figma expose different webhook guarantees and rate limits; polling fallback trades freshness for reliability. 

- Automation vs. human verification — ambiguous auto-links (no explicit textual reference) are queued for manual confirmation rather than silently assumed. 

- Heterogeneous schemas — a “change” means something different in each tool (Figma version, PR merge, ticket transition) and must be normalized without losing meaning. 

- Incomplete information — entities may be partially or late-linked; the system reasons over an incomplete graph, not a complete one. 

- Notification coverage vs. noise — the precision target (Section 11) directly trades off against how many real conflicts are caught. 

### **4.2 CCP characteristic evidence** 

|**Characteristic**|**Evidence Unify can defend**|
|---|---|
|Conficting requirements|Real-time detection vs. API rate limits; precision vs. recall; automation vs.<br>human confrmation for ambiguous links.|
|No obvious solution /<br>depth|Entity resolution with no shared cross-tool identifer is a known-hard problem<br>(traceability-link recovery); confict rules must reason over asynchronous,<br>partial state.|
|Depth of knowledge|Event-driven ingestion, relationship/graph modeling, staleness reasoning over<br>time, precision/recall-tuned alerting, traceability-link-recovery literature.|
|Unfamiliar issues|Webhook delivery semantics difer per vendor (at-least-once vs. best-efort);<br>rate limits; inconsistent identifers; partial mid-chain failures.|
|Beyond standard practice|Standard event-relay tools (Zapier, Unito) cannot answer “is this PR now<br>inconsistent with its linked Figma frame” — that needs stateful graph<br>reasoning over time.|
|Diverse stakeholders|Designers, developers and PMs have diferent risk tolerance, notifcation needs<br>and authority to resolve a given confict type.|
|Signifcant consequences|False negatives<br>late-surfacing bugs/rework; false positives<br>notifcation<br>→<br>→<br>fatigue and disabled alerts.|
|Interdependence|Ingestion, entity resolution, confict rules and notifcation routing are coupled:<br>linking confdence changes which conficts can be trusted, which changes<br>notifcation precision.|
|Ill-defned requirements|What counts as “linked,” “stale,” or “the same real-world unit of work” across<br>tools is not given and must be operationally defned and tested.|



## **5. Contribution Statement** 

4. A cross-tool entity relationship model that resolves identity for a single real-world unit of work across Figma, GitHub and Jira, using automatic linking from textual references (a PR mentions a Jira key, a ticket contains a Figma URL) plus manual linking for unresolved cases. 

5. A rule-based conflict/drift detection engine operating over that relationship graph, which detects workflow-state staleness between linked entities — distinct from the visual/pixel drift detected by existing design-diff tools. 

6. A role-aware notification routing mechanism tuned for precision, with a measurable lowdismissal-rate target. 

7. An evaluation framework comparing manual cross-tool impact discovery against Unifyassisted discovery, using a defined baseline and metrics (Section 11). 

_This does not require a new algorithm or model. The contribution is architecture-, method- and evaluation-level, built on top of the traceability-link-recovery literature rather than claiming entity linking itself is novel._ 

## **6. Proposed System** 

Unify is a web application that connects existing development tools into a relationship layer that understands how entities across platforms relate, and reasons over that graph to detect and route conflicts. The unified dashboard and activity feed are supporting presentation over that reasoning, not the contribution itself. 

|**Sub-problem**|**Component**|**Role**|
|---|---|---|
|Tool events are siloed in<br>vendor-specifc formats.|Event Ingestion & Normalization<br>Layer (webhooks + polling<br>fallback).|Foundation — supporting.|
|The same real-world item<br>has a diferent identity per<br>tool.|Entity Resolution & Cross-Tool<br>Relationship Layer.|Core — contribution (1).|
|Linked items silently drift<br>out of sync.|Confict / Drift Detection Engine.|Core — contribution (2); this is<br>the CCP.|
|Alerts reach the wrong<br>person or food everyone.|Role-Aware Notifcation Engine.|Core — contribution (3).|
|Nobody can see the<br>connected picture.|Unifed Dashboard & Shared<br>Activity Feed.|Supporting presentation over the<br>graph.|
|Understanding a chain still<br>requires manual reading.|AI Layer (summarization, link<br>suggestion, NL query).|Supporting / core-assist (Section<br>10).|



## **7. Scope Definition** 

|**Category**|**Contents**|
|---|---|
|Committed core|Figma + GitHub + Jira integrations; entity resolution & relationship layer;<br>confict/drift detection engine; role-aware notifcation engine with a Slack<br>delivery channel.|
|Supporting work|Event ingestion/normalization, OAuth integration, unifed dashboard and<br>activity feed, authentication, manual-linking UI, deployment pipeline.|



|**Category**|**Contents**|
|---|---|
|Optional extensions (only<br>if core is secure)|Additional integrations (GitLab, Linear, Notion, Vercel); AI-powered<br>natural-language query over the graph; standup-summary generation;<br>advanced analytics dashboards.|
|Explicit exclusions|Replacing any existing tool; two-way write-back sync (Unify reads and<br>links, it does not become the system of record); support for design tools<br>beyond Figma; a general-purpose automation/rules builder for end users.|



## **8. Technical Architecture** 

### **8.1 Major components** 

- Integration adapters (GitHub, Jira, Figma, Slack): webhook receivers + scheduled polling fallback per tool. 

- Normalization layer: maps every vendor event into a common schema (actor, entity, action, timestamp, references). 

- Relationship store: entities, links (auto/manual, with a confidence score), and link provenance. 

- Conflict/drift detection engine: rule evaluator over the relationship graph and event timeline. 

- Notification engine: role-based routing, channel, frequency and noise-threshold configuration. 

- API + dashboard front end: unified feed, entity detail view, link management, notification settings. 

- AI layer (supporting): summarization and link-suggestion calls to a hosted LLM, kept within the core-assist boundary (Section 10). 

### **8.2 Interfaces, data flow and boundaries** 

- Data flow: vendor webhook/poll → normalization → relationship store update → conflict rule evaluation → notification routing → dashboard/feed read model. 

- External dependencies: GitHub REST/GraphQL + webhooks, Jira REST + webhooks, Figma REST + webhooks/polling, Slack Web API, one hosted LLM API for the AI layer. 

- Security/privacy boundaries: OAuth tokens encrypted at rest and scoped to least privilege per tool; design/code content is not sent to the AI layer unless a user opts in; per-workspace data isolation. 

- Most uncertain parts likely to change: Figma's event/webhook coverage compared to GitHub/Jira (may require heavier polling), and the confidence threshold at which an auto- 

link is trusted without manual confirmation — both are tested directly in the POC (Section 12). 

## **9. Technical Alternatives Considered** 

|**Approach**|**Relationship**<br>**modeling**|**Query ft**|**Scalability**|**Complexity**|**Failure**<br>**behavior**|
|---|---|---|---|---|---|
|Pure relational<br>(Postgres)|Foreign keys / join<br>tables for links.|Weak for multi-hop<br>traversal<br>(Figma<br>PR<br>Ticket<br>Thr<br>→<br>→<br>→<br>ead needs recursive<br>joins).|Fine at FYP<br>scale.|Low — team<br>already knows<br>SQL.|Well underst<br>ACID.|
|Dedicated graph<br>database (e.g.,<br>Neo4j)|Native, ideal for<br>multi-hop traversal<br>and pattern rules.|Best ft for relationship<br>queries and confict-rule<br>pattern matching.|Good, but<br>adds an<br>operational<br>service.|Higher — new<br>query language,<br>new ops surface.|Separate failu<br>domain to<br>manage.|
|Event-sourcing<br>architecture|Append-only event<br>log is the source of<br>truth; relationships<br>derived by replay.|Strong audit trail and<br>time-travel for staleness<br>reasoning.|Good, but<br>replay cost<br>grows with<br>history.|Highest — new<br>architectural<br>pattern for the<br>whole team.|Recoverable<br>replay, but<br>harder to rea<br>about under<br>partial failure|
|Hybrid: relational<br>event/entity store +<br>graph-query layer<br>(selected)|Entities/events in<br>Postgres;<br>relationship<br>traversal via<br>recursive CTEs or a<br>graph extension<br>(e.g., Apache AGE)<br>inside the same<br>database.|Sufcient for the<br>committed scope's<br>traversal depth (typically<br>2–4 hops).|Sufcient for<br>FYP scope and<br>demo scale.|Moderate — one<br>database<br>technology,<br>added query<br>patterns only<br>where needed.|Single well-<br>understood<br>failure domai<br>(Postgres).|



_Selected approach: the hybrid relational + graph-query model. It supports the relationship depth the committed scope needs, keeps the team inside one database technology, and matches the deployment plan, without the operational cost of a separate graph database or a full event-sourcing rebuild for a onesemester core._ 

## **10. AI Layer and External-Component Boundaries** 

AI features (cross-tool summarization, link suggestions, standup summaries, natural-language queries) remain supporting, core-assist capabilities. The core contribution is the relationship model and the conflict/drift detection engine — not “calling an LLM API.” 

|**Category**|**Meaning**|**Where it applies in Unify**|
|---|---|---|
|Support|Infrastructure/tooling that does not<br>touch the contribution.|Standard libraries, UI kit, build/CI tooling,<br>container orchestration.|
|Core-assist|Touches CCP-relevant work but does<br>not itself supply the contribution;<br>justifed, limited, validated, with a<br>fallback.|Hosted LLM for link-suggestion and<br>summarization: suggestions are always<br>shown as unconfrmed and require<br>manual-link confrmation before<br>afecting confict detection; if the LLM<br>API is unavailable, the system degrades to<br>rule-based/manual linking only.|
|Core-replacement<br>(not used)|External component would supply<br>the contribution itself.|Not used: the confict/drift detection rules<br>and relationship graph are built and<br>owned by the team.|



## **11. Testing, Evaluation and User Acceptance** 

|**Activity**|**Question answered**|**Typical evidence**|
|---|---|---|
|Testing|Does the implemented system behave<br>as specifed, including edge/failure<br>conditions?|Unit/integration/system tests on<br>ingestion, linking and confict rules;<br>documented failure cases.|
|Evaluation|Is Unify actually better than the<br>current manual workfow?|Baseline comparison, the metrics<br>below, failure analysis, stated limits<br>of the conclusion.|
|User acceptance|Will designers/developers/PMs accept it<br>for a realistic task?|Task-based acceptance test with real<br>or proxy users.|



### **11.1 Evaluation plan** 

- Baseline/comparator: the current manual workflow — a participant is given the same simulated change and must find downstream-affected items without Unify. 

- − 

- Technical metrics: notification precision (1 false-positive rate), missed-conflict rate, event-processing latency (webhook receipt → alert emitted), entity-linking accuracy against a labeled sample. 

- Service/workflow metrics: time from a change to downstream awareness, percentage of relevant changes detected, linking/adoption rate. 

- Measurable non-functional target (finalized after the POC baseline measurement): alerts generated within a target latency window, notification precision above a target percentage. 

- Failure cases that matter most: an auto-link connecting the wrong entities; a real conflict producing no alert (false negative); a benign change producing an alert (false positive) and its effect on dismissal rate. 

### **11.2 User acceptance plan** 

- Participants: 5–8 people covering developer, designer and PM roles — real users if available from the Section 1.2 evidence-gathering contacts, otherwise a declared proxy (e.g., senior FAST students briefed into one role). 

- Task: given a simulated design/code/ticket change, identify affected downstream items first manually, then with Unify. 

- Outcomes recorded: completion time, missed relationships, incorrect relationships, number of dismissed/ignored alerts, satisfaction rating. 

- Acceptance decision: Unify is accepted for the tested scenario if it reduces time-to-identifyaffected-items versus the manual baseline and keeps the false-positive/dismissal rate within the target set in Section 11.1. 

## **12. Proof of Concept (POC) Plan** 

|**Question**|**Planned answer**|
|---|---|
|1. What risky assumption is tested?|That auto-linking from textual references, combined with rule-<br>based confict detection, can identify a downstream confict<br>across Figma<br>GitHub<br>Jira with usable precision.<br>→<br>→|
|2. What input/setup will be used?|A small live workspace: one Figma fle, one GitHub repo, one Jira<br>project, cross-linked by normal team conventions (PR title<br>contains the Jira key; ticket description contains the Figma URL).|
|3. What result is expected/obtained?|A simulated design change in Figma is ingested, the linked PR<br>and ticket are identifed via the relationship layer, a confict rule<br>fres (e.g., “design changed after frst commit referencing it”),<br>and a role-routed alert is produced and logged.|
|4. What will be learned or<br>disproved?|Whether reference-based auto-linking fnds the correct entities<br>reliably enough (measured against a hand-labeled set), and<br>whether the confict rule fres with an acceptable false-positive<br>rate.|
|5. How will this change the<br>design/scope/plan?|If precision is too low, scope narrows to manual-linking-frst<br>with auto-link as a suggestion only (Section 10's core-assist<br>boundary), and the notifcation threshold is retuned.|



- Risk category: System / integration feasibility — a minimal end-to-end path across three real APIs, with a latency measurement and a failure/fallback experiment (simulate one API being unreachable and confirm the queue/fallback behavior from Section 13). 

- Fallback POC if API access/permissions block the primary plan: run the same pipeline against exported/sample GitHub and Jira data plus a manually-created Figma reference set. 

## **13. Deployment Plan** 

- Target: a Dockerized web application (frontend, backend API, Postgres, background worker, Redis-backed job queue) deployed to a single cloud VM/container environment with OAuth connections to GitHub, Jira, Figma and Slack. 

- Background worker handles webhook ingestion and the polling fallback; a job queue processes conflict-detection work asynchronously so ingestion is never blocked by rule evaluation. 

- External-outage fallback: incoming events are queued and replayed on reconnect; if a tool is unreachable beyond a configurable threshold, its linked entities are marked “stale/unverified” rather than silently treated as up to date. 

- Model/API outage fallback: summarization/link-suggestion features are disabled gracefully; core linking and conflict detection continue on rules alone. 

## **14. Requirements Snapshot** 

### **14.1 Functional requirements** 

|**ID**|**The system shall…**|**Actor**|**Acceptance**<br>**evidence**|
|---|---|---|---|
|FR-01|Ingest events from GitHub, Jira and Figma via<br>webhook, with polling fallback, and<br>normalize them into a common schema.|Integration layer|Live test webhook<br>produces a<br>normalized record<br>in the event log.|
|FR-02|Auto-link entities across tools from textual<br>references and support manual linking for<br>unresolved cases.|Developer /<br>Designer / PM|On the labeled POC<br>sample, auto-<br>linking reaches the<br>target accuracy<br>defned after the<br>POC.|
|FR-03|Detect defned confict conditions over the<br>relationship graph and generate an alert.|System /<br>relationship graph|POC test cases<br>produce the<br>expected alerts,<br>logged with<br>timestamps.|
|FR-04|Route each alert to the relevant role via<br>confgurable rules and channel.|Notifcation<br>engine|Alert reaches the<br>correct role in a<br>controlled test<br>scenario, with<br>delivery logged.|
|FR-05|Present a unifed activity feed of linked cross-<br>tool events for a given entity.|Any authenticated<br>user|Feed loads and<br>correctly displays a<br>known linked<br>chain for a test|



|**ID**|**The system shall…**|**Actor**|**Acceptance**<br>**evidence**|
|---|---|---|---|
||||entity.|



### **14.2 Non-functional requirements** 

|**Quality attribute**|**Measurable target**|**Why it matters**|
|---|---|---|
|Performance /<br>latency|Alert generated within a target time<br>window of the triggering event (window set<br>from POC latency measurement).|A confict caught too late<br>loses its value against the<br>manual baseline.|
|Reliability /<br>availability|Ingestion survives a defned period of<br>external API downtime via the fallback<br>queue without event loss.|Vendor APIs and webhooks<br>are not guaranteed<br>continuously available.|
|Accuracy / quality|Notifcation precision above the target set<br>in Section 11.1.|Precision determines trust<br>and adoption — low<br>precision leads to disabled<br>alerts.|
|Security / privacy|OAuth tokens encrypted at rest, least-<br>privilege scopes; no design/code content<br>sent to the AI layer without explicit opt-in.|Unify handles real third-<br>party workspace credentials<br>and content.|
|Accessibility /<br>usability|A PM-role participant completes the<br>acceptance task without developer<br>assistance.|PMs are a named, non-<br>technical stakeholder role.|
|Deployment /<br>resource|Runs within the single-VM Dockerized<br>footprint defned in Section 13.|Matches the committed scope<br>and the team's realistic<br>infrastructure budget.|



## **15. Team Technical Ownership** 

Divided by CCP-relevant technical responsibility, not by layer (UI/backend/testing): would removing this member remove a meaningful technical responsibility and its evidence? 

|**Member**|**Primary technical**<br>**responsibility**|**Key design decisions owned**|**Evidence expected**|
|---|---|---|---|
|Member 1|Ingestion & integration<br>architecture.|Webhook vs. polling strategy<br>per vendor; normalization<br>schema design; OAuth/API<br>integration; failure/fallback<br>handling.|Working adapters for<br>GitHub, Jira, Figma,<br>Slack; fallback-queue<br>demonstration;<br>latency<br>measurements.|
|Member 2|Relationship graph &<br>confict/drift detection|Entity-resolution approach<br>(auto + manual linking,|Labeled linking-<br>accuracy results;|



|**Member**|**Primary technical**<br>**responsibility**|**Key design decisions owned**|**Evidence expected**|
|---|---|---|---|
||engine (core CCP owner).|confdence scoring);<br>relationship storage/query<br>design (Section 9); confict<br>rule design and thresholds.|confict-rule test<br>cases; precision/recall<br>numbers from the<br>POC and evaluation.|
|Member 3|Notifcation engine,<br>evaluation & deployment<br>infrastructure.|Role-routing rules and<br>channel/frequency/threshold<br>design; evaluation harness<br>and metric collection;<br>Docker/cloud deployment<br>and fallback confguration.|Notifcation-routing<br>test log; evaluation<br>report against the<br>manual baseline;<br>deployed, running<br>instance.|



_If the group has a fourth member, add a Member 4 row owning the dashboard/activity feed UI and the AI core-assist layer (link-suggestion/summarization), scoped as supporting work per Section 10 — not as an independent contribution._ 

## **16. Immediate Next Steps** 

8. Conduct and document the stakeholder/workflow evidence plan (Section 1.2). 

9. Run the POC (Section 12) and record actual, not projected, precision/recall and latency numbers. 

10. Use the POC's real numbers to finalize the measurable targets left open in Sections 11.1 

and 14.2. 

11. Confirm each member's ownership rows (Section 15) with named individuals and sign- 

off. 

12. Rehearse the CCP trade-offs (Section 4.1) and the alternatives table (Section 9), since these 

are the areas most likely to be challenged by the panel. 

