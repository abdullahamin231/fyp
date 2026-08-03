# Switchboard V2 — The Self-Healing Layer for Citizen Automation

*Rethought Project Proposal — supersedes `DevIdea-Switchboard-V1.md`*

## What Changed From V1, and Why

V1 stopped at presenting information: a catalog, a graph, alerts, warnings, reports. Everything ended at a screen, which makes it a **dashboard — a tool, not a product**. The user was left holding the actual work: opening Make, reading the scenario, figuring out the fix, editing it by hand, and hoping the edit didn't break something else.

V2 closes the loop. Every problem Switchboard detects, Switchboard also **fixes** — by generating a concrete, previewable change to the automation itself and applying it through the platform's own API once approved (or automatically, under policy). The web platform remains the UI, but it is not the deliverable. The deliverable is a **service**: automations that keep working. The mental model shifts from "monitoring dashboard" to **Dependabot for citizen automation** — Dependabot doesn't tell you a dependency is outdated; it opens a PR with the fix. Switchboard doesn't tell you two flows are fighting over a CRM field; it hands you the one-click edit that ends the fight, applies it, verifies recovery, and can undo it.

Detection (V1's graph, baselines, conflict analysis) is demoted from *the contribution* to *the sensing layer* that makes remediation possible.

## Problem (Recap)

Business logic now lives in Zapier zaps, Make scenarios, and Power Automate flows — built by non-engineers, spread across platforms, with no repository, no review, no on-call. They fail silently, conflict with each other across platform boundaries, and outlive their owners. V1 established that no one can even *see* this estate. But visibility was never the end goal — nobody wants a map of their broken automations; they want the automations **not broken**. Today, every fix is manual: find the right platform, find the right flow, reverse-engineer someone else's logic, edit it live in production with no diff, no test, and no undo. That repair workflow — not the missing dashboard — is the real gap.

## Stakeholders

V1 never asked who acts on the output. V2 is designed around four:

1. **IT / Ops / RevOps lead (buyer, primary user).** Accountable for an estate they didn't build. They approve fix plans, set auto-remediation policy (what Switchboard may fix on its own vs. must ask), and consume the estate health report. Their success metric: incidents resolved, not alerts received.
2. **Citizen builders (automation owners).** Their artifacts are the thing being modified. Every fix plan notifies the owner with a plain-language diff ("we're adding a condition to step 3 so it stops overwriting the field the Make scenario owns"); they can approve, veto, or take over. This consent workflow is a feature, not friction — it's what makes machine edits to someone else's logic socially acceptable.
3. **Business process owners (marketing / finance / HR leads).** Don't care about automations; care that leads route and invoices go out. They receive outcome reports: "lead routing broke Tuesday 09:14, auto-repaired 09:31, 4 leads replayed."
4. **Security / compliance.** Consume the audit trail: every machine-applied change is snapshotted, attributed, reversible, and logged — which is *more* governance than human edits get today.

## Solution

A platform that connects to the organization's automation platforms with **read and write** access and runs a continuous four-stage loop over the estate:

```
DETECT ──▶ DIAGNOSE ──▶ FIX ──▶ VERIFY
 (V1's graph,      (root-cause:      (generate a definition   (watch run telemetry
  baselines,        which step,       diff / rollback /        against baseline;
  conflict          which resource,   ownership transfer;      confirm recovery;
  analysis)         which change)     apply via platform API)  auto-undo if worse)
```

The write path is the heart of V2. Every automation definition Switchboard ingests (Make blueprint JSON, Power Automate `clientdata`, n8n workflow JSON) is also the format it can **write back** — so a fix is literally a diff on the definition, previewed like a pull request, applied like a merge, revertible like `git revert`.

## Core Features (each = detection + remediation, never detection alone)

### 1. Fix Plans (the product's unit of work)
Every finding ships as a fix plan: the evidence, the root cause, and a machine-executable change with a human-readable diff. States: proposed → approved → applied → verified (or rolled back). Nothing in the product is ever just "an alert."

### 2. Conflict Resolution (from V1's conflict *warnings*)
When two automations fight over a resource (write-write on a CRM field, create-delete race, trigger cycle A→B→A), Switchboard synthesizes resolution options as definition diffs: add a guard condition to one flow, scope the writers to disjoint fields, break the cycle by de-triggering one edge, or disable the loser. The user picks; Switchboard applies it to the actual automation. **Pre-flight mode:** the moment a *new or edited* automation appears on any poll, it is analyzed against the estate graph before it can do damage — conflicts caught at "merge time," like CI, with the fix (or quarantine: switch the flow off pending review) offered immediately.

### 3. Repair of Silent Failures (from V1's silent-failure *alerts*)
Most gone-quiet / wrong-output automations trace to a broken resource reference (a renamed sheet or column, a moved record, a changed form field) or an expired credential. Because Switchboard's entity-resolution layer knows the resource's *identity* — not just its old name — it can find where the resource went and **patch the step configuration to re-point at it**, then replay or re-trigger missed runs where the platform supports it. Credential failures route a re-auth request directly to the owner.

### 4. Rollback & Version Control (from V1's change *timeline*)
V1 snapshotted every definition version to show a diff history. V2 makes those snapshots **restorable**: one-click revert of any automation to any prior version, cross-platform — git for citizen automations, including the `revert`. "Invoices stopped syncing after Sara's Thursday edit" becomes a 30-second fix, and the pre-fix snapshot taken before *every* Switchboard write means every machine fix is itself undoable.

### 5. Orphan Re-Homing (from V1's orphan *report*)
When an owner leaves, Switchboard doesn't list the orphan — it executes the succession: transfer the automation to the designated successor or a service account, re-bind its connections, and confirm the next runs succeed, via API where the platform supports transfer and as a generated step-by-step runbook where it doesn't.

### 6. Verification Loop & Estate Health Report
After any fix, Switchboard watches run telemetry against the learned baseline to confirm recovery — and auto-rolls back if the fix regressed anything. The weekly report to stakeholders reads as a service ledger: *N issues detected, M fixed automatically, K fixed on approval, 0 fixes rolled back* — outcomes, not information.

### Guardrails (what makes writing to production automations safe)
- **Snapshot-first:** no write ever happens without a restorable pre-image.
- **Clone-testing:** where the platform supports it (Make scenario clone), fixes are validated on a cloned copy before touching the live automation.
- **Policy ladder per fix class:** advise-only → apply-on-approval → auto-apply. Reference re-pointing might be auto; logic changes always ask.
- **Owner consent workflow** (stakeholder #2) and a full audit trail (stakeholder #4).

## Novelty Delta vs. V1's Assessment

V1's sweep stands (Zenity/Nokod = security posture; platform vendors = single-silo; Torii/Zluri/NHI = credentials not logic). One material update: **Zenity does ship automated remediation playbooks** — users can "apply ad-hoc fixes through Zenity or establish automatic playbooks" ([Zenity](https://zenity.io/resources/white-papers/security-governance-framework-for-low-code-no-code-development), [Cyber Defense Magazine](https://www.cyberdefensemagazine.com/innovator-spotlight-zenity/)). So "we remediate, they only report" is **not** a safe claim. The defensible distinction is *what* gets remediated: Zenity's playbooks enforce security policy — revoke a risky connector, quarantine a non-compliant app, block a DLP violation. It does not synthesize **definition-level edits that repair operational defects**: no conflict-resolving diffs, no re-pointing of broken resource references, no cross-platform version restore, no telemetry-verified recovery. The correct related-work framing borrows its mechanics from engineering tools that have never been applied to this artifact class: **Dependabot/Renovate** (fix-as-reviewable-change for dependencies), **Argo CD auto-sync / AWS Config remediation** (drift detected → reconciled automatically), and automated program repair literature — all operating on engineer-controlled artifacts, none on citizen automation estates. That combination — *cross-platform operational repair of no-code automations, delivered as verified, reversible definition diffs* — remains unshipped.

## Feasibility: the Write Path (verified August 2026)

This is now the project's load-bearing technical assumption, and it checks out for the PoC platforms:

- **Make:** `PATCH /scenarios/{scenarioId}` updates a scenario including its blueprint; blueprints round-trip via `GET /scenarios/{id}/blueprint` ([Make API — Scenarios](https://developers.make.com/api-documentation/api-reference/scenarios), [Blueprints](https://developers.make.com/api-documentation/api-reference/scenarios-greater-than-blueprints)).
- **Power Automate:** cloud flows live in the Dataverse `workflow` entity; the `clientdata` property (connection references + full definition) supports standard create/read/**update** via the Web API ([Microsoft Learn](https://learn.microsoft.com/en-us/power-automate/manage-flows-with-code), [worked example](https://www.c-sharpcorner.com/article/programmatically-manage-power-automate-flows-how-to-create-modify-and-remove/)).
- **n8n:** full workflow CRUD via the public REST API (`PUT /workflows/{id}`) — the easiest write target; promote it into the essential set.
- **Zapier:** no public write API for zap definitions → **demote Zapier to a monitor-only tier**, where fixes ship as generated step-by-step instructions instead of applied diffs. This is an honest product tier, not a failure.

**Week-one spike (updated):** prove the full round-trip on Make and Power Automate — export definition → apply a programmatic edit (e.g., add a filter condition, re-point a sheet reference) → write back → confirm the automation still runs and the edit took effect → restore the snapshot. This spike replaces V1's read-depth spike and must precede the proposal defense.

## Proof of Concept (December)

Seeded estate on Make + Power Automate (+ n8n stretch) over shared Google Sheets/HubSpot resources, with faults injected live during the demo:

1. **Rename a column** a Make scenario writes to → Switchboard detects the silent failure, diagnoses the broken reference, proposes the re-pointing diff → one click → scenario runs green again. *(repair)*
2. **Deploy a new Power Automate flow** that writes a field a Make scenario owns → pre-flight catches the conflict before damage, proposes a guard-condition diff → applied via API. *(prevention)*
3. **Make a bad edit** to a flow → runs degrade vs. baseline → one-click **rollback** to yesterday's version. *(version control)*
4. **Verification screen:** post-fix telemetry vs. baseline confirming recovery, plus the estate health ledger (detected / auto-fixed / approved-fixed / rolled back).

## Evaluation (now measures outcomes, not detection)

- **Fix success rate:** % of seeded faults where the applied fix returns the automation to baseline behavior (primary metric).
- **MTTR:** time from fault injection to verified recovery, vs. a manual-repair baseline performed by a human on the same faults.
- **Zero-damage property:** % of applied fixes that never regressed anything without triggering auto-rollback (target: 100%).
- **Rollback fidelity:** restored definitions semantically equivalent to their snapshots.
- Detection precision/recall and entity-resolution accuracy remain as *supporting* metrics (the sensing layer must be good enough to aim the fixes).

## Project Analysis (updated answers only)

**1. Whose workflow are we improving?** The IT/ops lead's *repair* workflow — today: open each platform, reverse-engineer a stranger's flow, live-edit production logic with no diff or undo. Switchboard replaces that with review-and-approve.

**4. Which part genuinely requires computing intelligence?** Everything from V1 (entity resolution, baseline anomaly detection, interference analysis) **plus the new core: fix synthesis** — generating a minimal, correct definition edit from a diagnosis (guard-condition insertion, reference re-binding, cycle breaking), validating it on a clone, and verifying recovery from telemetry. This is automated program repair on a dataflow-program artifact class the literature hasn't touched — a stronger CS contribution than detection alone.

**6. Who supervises, verifies, or acts on its output?** Inverted from V1: Switchboard acts; the humans (ops lead + automation owner) supervise through the approval ladder, and the telemetry verifier is the machine check on the machine's own fixes.

**10. Essential vs. excluded.**
*Essential:* connectors with read+write (Make, Power Automate, n8n), dependency graph + entity resolution (sensing), fix plans with diff preview and apply, rollback/version restore, pre-flight conflict gate, verification loop, snapshot-first guardrails.
*Future:* Zapier monitor-only tier, orphan re-homing automation, auto-apply policy engine, clone-testing harness, LLM-assisted fix explanation and NL queries, replay of missed runs.
