# Switchboard — Observability for Citizen Automation

*Early-Stage Project Proposal*

## Problem

Business logic is migrating out of engineering-controlled codebases and into no-code automations: Zapier zaps, Make scenarios, Power Automate flows, n8n workflows. They route leads, issue invoices, onboard employees, and sync customer records — built by non-engineers, invisible to IT, and accumulating for years. Research on ungoverned environments finds 200–400 orphaned workflows with unclear ownership is typical, and shadow automation accounts for 40–60% of workflow instances. Unlike code, these automations have no repository, no code review, no CI, no on-call. They fail silently (a zap that "succeeds" while doing the wrong thing, or simply stops firing), they conflict (two flows racing over the same CRM field), and they outlive their owners (the marketing hire who built the lead-routing zap left last year; it still runs under her account). Each platform now offers governance *for its own silo* — but companies use several platforms at once, and nobody can answer: **what automations do we have, what do they touch, what breaks if this changes, and which ones are already broken?**

### Problem Breakdown
Sub-problem → Feature mapping

**SP1 — Automations live in per-platform silos with no common inventory**

Problem: Each platform holds its workflows behind its own API and definition format (Zapier zap steps, Make blueprints, Power Automate flow definitions). Nothing else is possible until definitions and run history leave the silos in a normalized shape.
Feature: **Connector & Normalization Layer.** Per-platform connectors (API polling + webhooks where available) mapping every automation into a common internal schema: trigger, steps, apps/resources touched, owner, run history. The "Automation Catalog" users see is just the view of this layer — it is the foundation, not the contribution.

**SP2 — The same external resource has a different identity in every platform**

Problem: A Zapier zap writes to "Google Sheets: Leads Q3 (sheet ID 1x8f…)"; a Make scenario reads "Sheets → Leads Q3"; a Power Automate flow patches the Dataverse table it syncs from. Without resolving that these references denote the same real-world resource, no cross-platform reasoning is possible.
Feature: **Resource Entity Resolution + Cross-Platform Dependency Graph (the core IP).** Resolve platform-specific step configurations to canonical resource identities (spreadsheet, CRM object, mailbox, table, channel), then build the graph *automation → resource → automation*. This graph is what powers impact analysis ("what breaks if we rename this column?"), and everything below.

**SP3 — Platforms only report hard errors; semantic failures are silent**

Problem: Every platform's native monitoring answers "did the run error?" It cannot see that a zap which fired 50×/day has gone quiet since Tuesday, that a scenario's output volume halved after an upstream form changed, or that a "successful" flow has been writing empty fields for a month. This is where the real losses happen — silently.
Feature: **Semantic Failure Detection.** Per-automation baselines learned from run telemetry (frequency, volume, payload shape), with anomaly detection for rate drops, volume drift, and downstream-resource staleness. Detection quality is measurable (precision/recall against seeded faults), which gives the project its evaluation story.

**SP4 — Automations interfere with each other across platforms**

Problem: Two automations on different platforms write the same CRM field with different logic; a dedupe flow deletes records another flow just created; ordering is accidental. No platform can see the conflict because each sees only its own half.
Feature: **Conflict & Race Detection.** Static analysis over normalized definitions plus the SP2 graph: flag write-write conflicts on shared resources, create-delete races, and cyclic trigger chains (A's write triggers B, whose write re-triggers A).

**SP5 — Automations outlive their owners**

Problem: Automations run under personal accounts and API keys. When the owner leaves or changes teams, the logic keeps running with no accountable human — until the credential dies, which is an outage, or doesn't, which is a security hole.
Feature: **Ownership Lifecycle Tracking.** Map every automation to a person via directory integration (Google Workspace / Entra ID); continuously flag owner-departed, owner-moved, and credential-expiring automations; assign and track successor ownership.

**SP6 — Changes to automations are invisible and unreviewed**

Problem: Anyone can edit a production automation at any time. There is no diff, no review, no record tying "invoices stopped syncing Thursday" to "Sara edited step 3 on Thursday."
Feature: **Attributed Change Timeline + Review Workflow.** Snapshot definitions on every poll, diff them semantically, attribute changes to editors, and (future) gate changes to designated-critical automations behind lightweight approval.

**SP7 — Understanding an automation estate still requires human reading**

Problem: Summarizing what a flow does, explaining a detected conflict, or answering "what touches billing?" needs semantic understanding of messy step configurations.
Feature: **AI Layer (advisory, future).** LLM-assisted step-config interpretation to enrich SP2 resolution, plain-language summaries of automations and incidents, NL queries over the graph. It recommends; the graph and detectors remain the product. A smarter model improves this layer without replacing the platform (LLM-proof by construction).

## Solution

A web platform that connects to an organization's automation platforms (rather than replacing them), maintains a continuously updated cross-platform model of every automation and the resources it touches, and turns that model into operational outcomes: a live dependency graph, silent-failure alerts, conflict warnings, ownership hygiene, and an attributed change history.

### Integrations

- **Automation platforms (essential):** Zapier, Make, Power Automate
- **Automation platforms (future):** n8n, Workato, Slack Workflow Builder, HubSpot Workflows
- **Identity/directory:** Google Workspace or Microsoft Entra ID (for SP5)
- **Resource probes (for staleness checks):** Google Sheets/Drive, HubSpot/Salesforce CRM objects

## Core Features

### Automation Catalog
Single searchable inventory of every automation across platforms: owner, trigger, apps touched, run stats, health status. The entry-point view over SP1.

### Cross-Platform Dependency Graph (Core Backbone)
Interactive graph of automations and shared resources.

**Example chain:**

```
Typeform (form) → [Zapier: New Lead Router] → Google Sheet "Leads Q3"
                                                → [Make: Lead Enricher] → HubSpot Contact
                                                → [Power Automate: Weekly Digest] → Teams channel
```

**Responsibilities:**
- Resolves platform-specific references to canonical resources
- Answers impact queries: "what is downstream of this sheet?"
- Serves as the foundation for conflict detection, alerts, and analytics

### Silent-Failure Alerts
Baseline-deviation alerts: gone-quiet automations, volume drift, stale downstream resources — with the evidence (baseline vs. observed) attached.

### Conflict & Race Warnings
Write-write conflicts, create-delete races, and trigger cycles across platforms, reported with the exact automations and shared resource involved.

### Ownership & Orphan Report
Continuously updated list of automations whose owner has left, moved, or whose credentials are near expiry; assignment workflow for successors.

### Attributed Change Timeline
Chronological, per-automation diff history: who changed what, when — correlatable with failure alerts ("this alert began 2 hours after this edit").

## Novelty Assessment (Web Research, August 2026)

**Verdict:** The *category* (governing citizen automation) is validated and partially occupied — from inside each platform by the vendors, and from the security side by LCNC-security startups. The specific combination — **cross-platform dependency graph via resource entity resolution + operational (not security) failure semantics + cross-automation conflict detection** — was not found in any shipped product. Novelty depends on positioning against the two nearest neighbor classes, both of which must be named in the proposal.

### What Already Exists (Overlap by Sub-Problem)

**SP1 — cross-platform inventory: shipped, cannot be claimed as the contribution.**
- [Zenity](https://zenity.io/resources/white-papers/security-governance-framework-for-low-code-no-code-development) generates a "continuous cross-platform inventory of all no-code/low-code apps, automations, connectors, data objects, bots" — discovery, governance policies, risk mitigation. [Nokod Security](https://windowsforum.com/threads/nokod-adaptive-agent-security-runtime-protection-for-no-code-ai-agents.389057/) is a centralized security/governance/compliance platform for LCNC apps and RPA, now extending to runtime protection of citizen-built AI agents.
- **The distinction:** both are **security-posture products sold to CISOs** — misconfigurations, DLP violations, risky connectors, compliance benchmarks. Neither models operational reliability: they answer "is this automation *risky*?", not "is this automation *working*, what depends on it, and what breaks if it changes?" This is the same structural relationship Parity has to SSPM tools.

**SP1/SP6 within one platform: being absorbed by the vendors — the silo is the moat.**
- [Zapier Enterprise](https://zapier.com/enterprise) ships audit logs, RBAC, SIEM streaming, and auto-generated workflow documentation — for Zapier only.
- [Workato's Recipe Lifecycle Management](https://neosalpha.com/blogs/workato-recipe-lifecycle-management/) is genuine CI/CD-for-automations (controlled promotion pipelines) — for Workato recipes only.
- Microsoft's Power Platform CoE Starter Kit provides inventory and governance tooling — for Power Platform only, and as a self-hosted toolkit, not a product.
- No vendor will build the cross-platform version: Zapier auditing Power Automate is structurally against interest. This is the defensible wedge.

**SP3 — failure monitoring: hard-error level only.**
- Every platform reports run errors natively; [n8n notably lacks even centralized error management](https://www.celigo.com/blog/n8n-alternatives/). Third-party dashboards (e.g., [ProwessSoft's Workato monitoring dashboard](https://www.prowesssoft.com/workato-recipe-monitoring-dashboard/)) visualize per-platform run KPIs. None found that learn behavioral baselines or detect *semantically* failed-but-not-erroring automations, and none across platforms.

**SP5 — ownership/credential risk: partially covered from the identity side.**
- Non-human-identity security startups (Astrix, Entro) and SaaS-management platforms ([Torii](https://www.toriihq.com/articles/comparing-zapier-access-review-tools), Zluri) flag automation credentials and app access. They model *identities and licenses*, not workflow logic or dependencies. Ownership tied to the dependency graph ("this orphaned zap feeds your billing pipeline") is the differentiated form.

**Adjacent but different:**
- iPaaS embedded-observability ([Workato ops APIs](https://portal.gigaom.com/report/workato-vs-n8n-benchmark)) — single-platform, engineer-audience.
- Data observability (Monte Carlo, etc.) — watches warehouses/pipelines, blind to SaaS-level automations.
- [Governance consulting for Zapier estates](https://thinkbot.agency/blog/zapier-automation-for-enterprises-scalable-governance-roi) — the pain answered as services; strong evidence of a product-shaped hole.

### Where the Genuine Gap Is

No product was found that (a) **resolves resource identities across automation platforms** to build an automation↔resource dependency graph, (b) detects **semantic/silent failures** from learned run-telemetry baselines rather than hard errors, or (c) detects **cross-platform conflicts and races** between automations sharing a resource. Zenity/Nokod inventory and score risk but do not model dependencies, impact, or operational health; platform vendors do lifecycle and audit within their own walls; NHI/SaaS-management tools see credentials and licenses, not logic. The combination — an *operational fidelity* layer over a heterogeneous automation estate — is unshipped.

### Recommendations for Framing

1. **Lead with the dependency graph and silent-failure detection, not "governance" or "inventory."** "Governance" pattern-matches to Zenity/Nokod and invites "isn't this Zenity?"; the answer (security posture vs. operational reliability) should be stated preemptively in a related-work section naming Zenity, Nokod, Zapier Enterprise, Workato RLCM, and the CoE Starter Kit.
2. **Claim SP2/SP3/SP4 as the contribution; treat SP1 (connectors/catalog) and SP6 (audit timeline) explicitly as supporting engineering.** Entity resolution across heterogeneous configs, baseline anomaly detection, and static interference analysis are the defensible CS.
3. **Cite adjacent literature deliberately:** record-linkage/entity-resolution literature for SP2, time-series anomaly detection for SP3, and data-race/serializability concepts for SP4 — known techniques applied to an unstudied artifact class (citizen automations), which is a legitimate and defensible FYP posture.
4. **De-risk API depth in week one.** The single biggest feasibility risk is whether platform APIs expose step-level configuration richly enough for SP2 (Zapier's API is the most restrictive; Make and Power Automate expose full definitions). Mitigations if a gap appears: browser-extension collection, exported blueprints, or demoting Zapier to run-telemetry-only support. This spike should precede the proposal defense.

## Proof of Concept (December)

Demoable end-to-end slice on a seeded three-platform workspace (built on free tiers, faults injected deliberately):

1. Connectors for **two platforms minimum** (Make + Power Automate; Zapier as stretch) feeding the normalized catalog.
2. **Dependency graph** over shared Google Sheets/HubSpot resources, with at least automatic resolution of exact-ID references and assisted resolution of fuzzy ones.
3. **Findings report** on the seeded estate: N orphaned automations, M gone-quiet (seeded), K write-conflicts — each with evidence.
4. Evaluation: precision/recall of silent-failure detection against the seeded fault set; resolution accuracy against a hand-labeled resource mapping.

## Project Analysis

**1. Whose workflow are we improving?**

IT / RevOps / operations leads at SMB and mid-market companies responsible for systems they didn't build: estates of hundreds of citizen automations spread across multiple platforms.

**2. What exactly is difficult in the current workflow?**

There is no cross-platform view of what automations exist, what they touch, or whether they still work. Discovery is manual (asking around, spreadsheet audits), failures surface as downstream business damage ("why did no invoices go out this month?"), and changes are unreviewed and unattributed.

**3. What happens before, during, and after the difficult step?**

- **Before:** Employees across departments build automations independently on whichever platform they know; logic accumulates without registration.
- **During:** Automations run unobserved; a broken or conflicting automation produces wrong data silently — no error, no page, no owner.
- **After:** Damage is discovered downstream, days or weeks later; root-causing means manually opening every platform, reading flows one by one, and hunting for who owns what.

**4. Which part genuinely requires computing or AI intelligence?**

- Resolving heterogeneous step configurations to canonical resource identities (entity resolution)
- Learning per-automation behavioral baselines and detecting semantic anomalies
- Static interference analysis (write-write conflicts, races, trigger cycles) over the graph
- (Future) LLM interpretation of messy configs and NL queries over the estate

**5. What services must surround that intelligent component?**

- Reliable per-platform connectors with polling/webhook ingestion and rate-limit handling
- Definition snapshot store + semantic diffing
- Directory integration for ownership
- Alerting/report surfaces and the graph UI

**6. Who supervises, verifies, or acts on its output?**

The IT/ops owner of the workspace. Switchboard flags and evidences; humans confirm resolutions, acknowledge alerts, reassign owners, and approve changes. Assisted (human-confirmed) resolution is a feature, not a failure mode.

**7. What local conditions make the solution different?**

Every organization mixes different platforms, apps, and team structures; the system adapts through its connector set and per-workspace learned baselines rather than assuming any fixed stack.

**8. Where will the data come from?**

Entirely from existing platform APIs (definitions, run histories), directory APIs, and light probes of shared resources. No duplicate data entry; for development and evaluation, self-built multi-platform workspaces with synthetic estates and seeded faults.

**9. How will success be measured?**

- Entity-resolution accuracy vs. hand-labeled ground truth (% of cross-platform resource references correctly unified)
- Silent-failure detection precision/recall against seeded faults; alert dismissal rate
- Conflict-detection true-positive rate on seeded races
- Coverage: % of estate automations inventoried and owner-mapped

**10. Which features are essential, and which should be excluded?**

*Essential*

- Platform connectors + normalized catalog (2–3 platforms)
- Resource entity resolution + dependency graph
- Silent-failure detection
- Conflict & race detection
- Ownership/orphan tracking
- Attributed change timeline

*Future Enhancements*

- Change-review/approval gate for critical automations
- Additional platforms (n8n, Workato, Slack/HubSpot workflows)
- AI layer: config summarization, NL queries, resolution suggestions
- Cost/quota analytics per automation
