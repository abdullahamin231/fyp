# Parity — Environment Fidelity Platform

*Early-Stage Project Proposal — V2 (reframed from "SaaS config drift" to "environment fidelity" after feature-vs-product review)*

## The Premise

**"It worked in staging" is the most famous lie in software.** Every team maintains pre-production environments whose entire purpose is to predict production behavior — and nothing measures whether they actually do. Staging silently diverges from prod along many axes at once, and each divergence quietly invalidates every test that passes there. Teams discover the divergence the only way currently possible: a production incident.

Parity is a service that continuously answers one question: ***"How much can I trust that passing in staging means passing in prod?"*** — as a measurable, per-axis fidelity report, a browsable environment diff, a timeline of when and why fidelity degraded, and a deploy gate.

## Problem

Environments diverge along independent axes, each owned by nobody:

1. **SaaS/dashboard config** — Stripe webhooks, Auth0 callback URLs and token settings, Vercel domains/redirects: configured by clicking, in one environment but not the other, with no history or review. ("Payments work in test mode; the live-mode webhook was never added.")
2. **Environment variables & secrets** — present in staging, missing or stale in prod (or vice versa); nobody can diff them because values are sensitive.
3. **Database schema & migrations** — staging is three migrations ahead of prod, or behind it after a hotfix; tests exercise a schema production doesn't have.
4. **Service versions** — staging runs `main`, prod runs last week's release; in multi-service setups, staging runs a combination of versions that has never existed in production.
5. **Data realism** — staging has 40 test rows from 2024; prod has 10M rows with the edge cases that actually break queries. *(Future axis.)*
6. **Third-party mode mapping** — sandbox and live modes of the same vendor behave differently in ways no one tracks. *(Future axis.)*

Existing tools each see one sliver: IaC drift tools see declared infrastructure, CI sees test results, observability sees production. **No product owns the question "does my staging tell the truth?"**

**Framing:** Product teams struggle with silently diverging environments in the context of multi-environment deployment workflows. Existing solutions cover IaC drift, single-vendor config export, or security benchmarks — none measure environment fidelity across config, secrets, schema, and versions as a first-class, continuously monitored, deploy-gating property. Parity contributes exactly that layer.

### Problem Breakdown
Sub-problem → Feature mapping

**SP1 — Environment state is scattered across sources that don't emit it anywhere common.**

Problem: Fidelity spans vendor dashboards (Stripe, Auth0), deploy platforms (Vercel), databases, and git — each behind its own API.
Feature: **Connector & Snapshot Ingestion Layer.** Read-only connectors per source: SaaS config APIs + audit logs, env-var listings, schema introspection (migration state + information_schema), deployed version metadata. Foundation, not IP.

**SP2 — Every source represents state differently.**

Problem: No common shape means no cross-source reasoning.
Feature: **Normalization + Versioned Store.** All state maps into a common schema `(source, environment, axis, object-type, logical-identity, attributes, timestamp)`; snapshots stored content-addressed, git-style. Every environment gets a browsable history.

**SP3 — The same logical entity has a different identity in every environment.**

Problem: A Stripe test-mode webhook and its live twin share no ID; an Auth0 dev-tenant action matches its prod twin only by name/structure; secrets can only be compared by name and shape, never value.
Feature: **Cross-Environment Entity Resolution (the backbone).** Deterministic keys where they exist, structural/fuzzy matching where they don't, hash-only comparison for secrets, manual pairing as fallback. Everything downstream depends on this layer.

**SP4 — Raw diffs are noise.**

Problem: Naive diffing drowns users — volatile fields, server-generated values, IDs that legitimately differ, fields that *should* differ between environments (e.g., URLs).
Feature: **Semantic Diff Engine (core contribution #1).** Per-source noise models plus expected-difference allowlists, so a surfaced diff means *a divergence that threatens fidelity*. Its precision is the headline evaluation metric.

**SP5 — Divergence is invisible and unquantified until it causes an incident.**

Problem: The actual pain. Even teams who suspect staging is stale have no way to say how stale, where, or since when.
Feature: **Fidelity Engine (headline value).** Per-axis detectors over the normalized graph, rolled into an **Environment Fidelity Report**: parity violations ("prod has 2 webhooks staging lacks"), intent drift ("this token lifetime changed 9 days ago, unreviewed"), schema skew ("staging is ahead by migration 0043"), version skew ("staging runs a service combination never deployed to prod"), and cross-source invariants ("Auth0 callback URLs ⊆ Vercel domains"). A per-axis fidelity score makes degradation visible over time — the number a team lead checks before trusting a release.

**SP6 — No accountability: nobody knows who changed what, when, or why.**

Problem: Divergence enters through invisible manual actions.
Feature: **Change Timeline + Review Workflow.** Every detected change becomes an attributed diff (vendor audit logs, migration authors, deploy metadata) — a "git log for everything that isn't in git." Production-affecting changes require owner acknowledgment: lightweight PR-style review for un-reviewable change.

**SP7 — Alerting everyone about every divergence is a mute-button factory.**

Problem: Detection is worthless if alerts are noise. Precision is the product here.
Feature: **Ownership-Routed Notifications.** Axes and objects map to owning teams (payments config → payments team, schema → backend team), with digest/threshold controls. Success metric: low dismissal rate.

**SP8 — Fidelity is discovered after deployment, when it's an outage.**

Problem: The failure moment is the deploy that trusted a lying staging.
Feature: **Fidelity Gate (the product moment).** A GitHub Action queries Parity before a production deploy and fails the pipeline on unacknowledged fidelity violations: *"Deploy blocked: staging fidelity degraded — schema diverged yesterday; 2 unreviewed prod config changes."*

## Solution

A continuously running service that connects (rather than replaces) the sources that define an environment — SaaS config APIs, env-var stores, database schemas, deploy metadata — versions all of it, pairs entities across environments, and reports fidelity per axis: report, diff, timeline, routed alerts, deploy gate.

### Axes & Scope

| Axis | Sources (initial) | FYP scope |
|---|---|---|
| SaaS/dashboard config | Stripe, Auth0 | **Essential** |
| Env vars & secrets (presence/shape) | Vercel | **Essential** |
| DB schema & migration state | Postgres | **Essential** |
| Service/deploy versions | Vercel/GitHub metadata | Stretch |
| Data realism | — | Future |
| Third-party mode mapping | — | Future |

## Core Features

### Environment Fidelity Report & Score
Per-axis, per-environment-pair report: what diverges, since when, how badly — rolled into a fidelity score tracked over time. The artifact a team checks before trusting a green test run.

### Versioned Environment History
Git-style, content-addressed snapshots of every axis. Browse any setting, schema, or variable's history; reconstruct the full environment state at any point in time.

### Cross-Environment Entity Resolution
Pairs "the same logical thing" across test/staging/prod despite differing IDs; hash-only comparison for secrets.

### Semantic Diff with Noise Suppression
Per-source noise models and expected-difference allowlists. A surfaced diff is trustworthy by design.

### Fidelity Detection
- Environment parity violations (with allowlists)
- Intent drift against last-reviewed state
- Schema/migration skew
- Cross-source invariants ("Auth0 callback URLs ⊆ Vercel domains"; "every Stripe webhook resolves to a deployed route")

### Change Timeline & Review
Attributed, chronological feed of every environment-affecting change across all sources; production changes require owner acknowledgment.

### Ownership-Routed Notifications
Only the owning team hears about a divergence. Measured by dismissal rate.

### Fidelity Gate
GitHub Action blocking production deploys while unacknowledged fidelity violations exist. Overridable with an audit trail.

## Novelty Assessment

**Status: config-axis competitors verified (August 2026); fidelity-category sweep still pending — run before proposal submission.**

### Verified (config axis)

- **IaC drift detection** — [Firefly](https://www.firefly.ai/blog/managing-clickops-and-configuration-drift-in-aws-using-fireflys-event-center), [driftctl](https://github.com/snyk/driftctl), [ControlMonkey](https://controlmonkey.io/resource/what-is-clickops/): drift between cloud infra and Terraform state. Requires IaC as source of truth; doesn't touch Stripe/Auth0-class SaaS; compares declared-vs-actual, not environment-vs-environment.
- **Per-vendor export tools** — [auth0-deploy-cli](https://github.com/auth0/auth0-deploy-cli), Firebase CLI: single-silo, point-in-time, for teams already doing config-as-code. Cite as evidence vendors acknowledge the problem per-silo.
- **SSPM security products** — [Obsidian](https://www.obsidiansecurity.com/prevent-saas-configuration-drift), [DoControl](https://finance.yahoo.com/news/docontrol-introduces-ai-powered-configuration-120000521.html), [Nudge](https://www.nudgesecurity.com/saas-security-glossary/configuration-drift): enterprise IT SaaS against *security benchmarks*. They ask "is this setting risky?"; Parity asks "do your environments agree, and does state match your intent?"
- **[Salto](https://www.salto.io/)** — config versioning for business apps (Salesforce, NetSuite, Zendesk). Commercial validation of the model; doesn't cover the developer stack, environment parity, or CI gating.

### To Verify (fidelity category — pending sweep)

- **Ephemeral-environment platforms** (Shipyard, Qovery, Vercel previews, Neon branching): they *create* environments; check whether any *measure* fidelity of long-lived ones.
- **Data seeding/anonymization** (Snaplet-class): adjacent to the data-realism axis (future scope) — confirm none do config/schema parity.
- **Datadog** (change tracking, CCM) and **Kosli** (change compliance/evidence): the "isn't this a Datadog feature?" threat — verify neither does cross-vendor SaaS config nor environment-pair fidelity.
- **Schema-diff tooling** (migra, Atlas, pgquarrel): single-axis *tools*; confirm none are continuous cross-axis services. Cite as components, not competitors.

### Gap Hypothesis

No shipped product measures **environment fidelity** — cross-source, cross-environment divergence across config, secrets, schema, and versions — as a continuous, reviewable, deploy-gating property. Existing tools create environments, observe production, or diff one axis on demand. None answer "does staging tell the truth?"

### Framing Recommendations

1. **Lead with the fidelity question and the gate**, not "we track your settings." The demo is a prevented outage: staging green, Parity blocks the deploy, the blocked divergence is exactly what would have broken prod.
2. **Name the related work explicitly** in the proposal with the gap statement — evaluators will find Firefly/Salto/Datadog in five minutes, so beat them to it.
3. **Have the Terraform answer ready:** Terraform covers what teams migrated into it, compares declared-vs-actual, and doesn't know environments; Parity is agentless, adoption-free, and compares environment-vs-environment.

## Project Analysis

**1. Whose workflow are we improving?**

Small-to-mid product teams running dev/staging/prod, whose stack mixes their own services with SaaS vendors — specifically the *test-then-ship* workflow.

**2. What exactly is difficult in the current workflow?**

Teams cannot know whether a green staging run predicts production. Divergence enters invisibly through dashboard clicks, missed migrations, and stale variables; verifying parity means manually eyeballing half a dozen dashboards, so nobody does it.

**3. What happens before, during, and after the difficult step?**

- **Before:** features are built and configured against dev/staging.
- **During:** replicating every environment-affecting change to prod is a manual, unchecked human step — skipped, forgotten, or done differently.
- **After:** the divergence surfaces as a production incident, followed by a cross-dashboard hunt for what differs.

**4. Which part genuinely requires computing intelligence?**

- Semantic diffing: meaningful divergence vs. noise vs. expected difference, per source
- Entity resolution: pairing logical entities across environments with differing identities
- Fidelity modeling: aggregating heterogeneous divergences into a per-axis score that correlates with real risk
- Invariant checking across the cross-source graph
- Precision routing to owners

(No LLM in the core loop — by design.)

**5. What services must surround that intelligent component?**

Reliable per-source connectors; versioned store; report/timeline/review surfaces; notification delivery; CI gate integration.

**6. Who supervises, verifies, or acts on its output?**

Developers and team leads. Parity flags, scores, and blocks; humans acknowledge, review, or fix. The gate is overridable with an audit trail.

**7. What conditions make the solution different per team?**

Every team has a different source mix, environment topology, expected-difference set, and ownership structure — handled via connector selection, environment mapping, allowlists, and declared invariants rather than an assumed stack.

**8. Where will the data come from?**

Read-only vendor APIs and audit logs, env-var listings (hashed for secrets), database schema introspection, deploy metadata. No agents, no code changes.

**9. How will success be measured?**

- Detection precision/recall on seeded-divergence experiments (~50 injected changes across axes)
- Noise rate vs. naive diffing (the semantic-diff claim)
- Auto-pairing rate for cross-environment entities (the resolution claim)
- Alert dismissal rate in real deployments (the routing claim)
- Case-study evidence: seeded "staging passes / prod would fail" scenarios caught by the gate

**10. Which features are essential, and which should be excluded?**

*Essential*
- Three axes: SaaS config (Stripe, Auth0), env vars/secrets (Vercel), DB schema (Postgres)
- Versioned snapshot store
- Semantic diff engine with noise suppression
- Cross-environment entity resolution
- Fidelity report + score, parity + intent-drift detection
- Change timeline with attribution
- Fidelity gate (GitHub Action)

*Future Enhancements*
- Service-version axis; data-realism axis; third-party mode mapping
- Cross-source invariant DSL (ship hardcoded invariants first)
- Auto-remediation ("apply staging's value to prod")
- Config-as-code export (Terraform/Pulumi generation)

## Twelve-Month Plan (3 students)

**Semester 1 — the engine, on the config axis.**
Stripe + Auth0 connectors, normalized versioned store, semantic diff with noise models, cross-environment resolution v1, env-var axis (cheap, high-value), fidelity report v1.
**December PoC:** two live accounts connected; click a change in the Stripe dashboard mid-demo; watch it surface — attributed, diffed, fidelity score degraded.

**Semester 2 — breadth, the gate, and the proof.**
Schema axis (Postgres introspection + migration state), cross-source invariants, review/acknowledgment workflow, routed notifications, fidelity gate, then evaluation: seeded-divergence precision/recall, noise-rate benchmark, deployment on 2–3 real projects measuring dismissal rate, gate case studies.

**Work split:** one student owns connectors + store; one owns diff/resolution/fidelity engines; one owns workflow, UI, gate, and evaluation.

**Cut lines if behind:** drop the schema axis to spec-only, then notification routing. Never cut diff quality or entity resolution — they are the contribution.

## Risks

- **Scope fuzziness (the reframe's cost):** "fidelity" invites axis creep. Mitigation: the axis table is the contract — three essential axes, everything else explicitly future.
- **Fidelity-score validity:** a score nobody trusts is decoration. Mitigation: score = transparent roll-up of enumerated violations (never a black box), evaluated via seeded scenarios.
- **API coverage gaps:** some dashboard settings aren't API-readable. Mitigation: scope to API-exposed config (covers the high-incident settings: webhooks, callback URLs, env vars, tokens); document the boundary. **Verify Stripe/Auth0 API coverage in week 1 — the only risk that could force a scope change.**
- **Pending novelty sweep:** the fidelity-category verification (Datadog, Kosli, ephemeral-env platforms) must run before the proposal is submitted.
- **"Why not Terraform?":** answered in Framing Recommendations; goes in related work from day one.

## The Pitch

*"'It worked in staging' is the most famous lie in software — staging silently drifts from production through clicked settings, missed migrations, and stale variables, and nothing measures it. Parity continuously scores how faithful your staging is to prod, shows exactly what diverged and who changed it, and blocks the deploy when your environments disagree. Teams stop shipping on a lie."*
