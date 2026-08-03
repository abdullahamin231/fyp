## Idea: Headless SKU/BOM Management Platform

### 1. Tentative Title
**Corex** *(working title)* — A Headless, API-First BOM & Change-Governance Engine for Small-to-Mid Hardware Teams

### 2. Problem Statement
Engineering, procurement, and manufacturing teams at small-to-mid hardware companies (roughly 5–200 engineers) manage part masters, Bills of Materials (BOMs), Engineering Change Orders (ECOs), Approved Manufacturer Lists (AMLs), and Make-Buy sourcing decisions through a fragmented mix of spreadsheets, CAD-native PDM tools that treat commercial/sourcing data as an afterthought, and enterprise PLM suites that are too expensive and too slow to implement for this segment. The result: part identity, revision state, sourcing status, and make/buy classification live in disconnected systems with no single authoritative, machine-readable source of truth. Change orders become email threads instead of governed workflows, and downstream systems (ERP, CPQ, supplier portals) either re-key this data manually or silently drift from it.

### 3. Target Users / Stakeholders
- **Primary:** engineering, procurement, and manufacturing teams at small-to-mid hardware/electronics companies (5–200 engineers) who already have a CAD tool and an ERP and are missing the governance layer in between.
- **Secondary:** downstream systems and their owners — ERP administrators, CPQ/quoting teams, supplier portals — who currently consume this data through brittle manual re-entry or custom integrations.

### 4. Existing Related Systems / Products
| System | What it does well | Limitation / gap | Our contribution |
|---|---|---|---|
| Enterprise PLM (Teamcenter, Windchill, Aras, Oracle Fusion PLM) | Full BOM authority, change governance, deep compliance/audit depth | 6–18 month implementations, CAD-vendor-locked, built for 50+ engineer programs — too expensive and slow for smaller teams | Same governance rigor, adoptable in weeks by a 5–200 engineer team |
| Cloud mid-market PLM (Arena, Propel, Duro) | Faster to deploy; Duro is API-leaning; Propel adds AML scorecards | Still UI-first with the API as secondary; Propel requires a Salesforce dependency | True API-first design — the UI is a client of the API, not the product |
| BOM-first point tools (OpenBOM) | Real-time BOM editing, vendor price roll-ups, simple REST API | Deliberately narrow — no change-control or sourcing-governance loop | Extends BOM authority into full change governance and structured make-buy data |
| CAD-integrated PDM (Onshape, SolidWorks PDM) | Owns geometry, decent API access | System of record is geometry-centric; commercial data (AML, cost, make-buy) is a secondary citizen | Treats commercial/sourcing data as first-class, not an afterthought |

### 5. Why Existing Systems Are Not Enough
Every category above solves part of the problem but leaves a specific piece unaddressed: enterprise PLM solves governance but is too slow and costly for this segment; mid-market tools are faster but still ship a primary UI with the API bolted on; point tools stop at BOM structuring; CAD-native PDM treats sourcing data as secondary. Across the entire market, **Make-Buy classification is barely modeled as structured data anywhere** — it is typically a free-text field or a spreadsheet exercise conducted outside whichever system is otherwise in use. No mainstream tool treats it as a versioned, auditable, API-queryable decision with a cost/capacity/risk basis and a decision trail.

### 6. Identified Gap
There is no system that (a) is genuinely API-first rather than UI-first-with-an-API, (b) is fast enough to adopt for a 5–200 engineer team without a 6–18 month rollout, and (c) treats Make-Buy determination as a governed, versioned decision object the way ECOs are already governed. This combination — composable "Authority + Updates" infrastructure, sized for the underserved mid-segment, with Make-Buy as first-class structured data — does not currently exist.

### 7. Proposed Contribution
*Our contribution is a headless, API-first BOM and change-governance engine that treats SKU, BOM, ECO, AML, and Make-Buy decisions as first-class, versioned, auditable objects exposed through a clean API — with Make-Buy modeled as structured, evidence-linked data for the first time in this market segment — sized for hardware teams too small for enterprise PLM and underserved by existing point tools.*

### 8. Why the Idea Is Novel
- Not novelty-by-AI-claim: the contribution is a **data model and governance architecture** (versioned relational objects, audit trails, event-driven API), not an LLM wrapper.
- Not a copy of an existing tool: no competitor combines true headless/API-first architecture, mid-market sizing, and structured Make-Buy governance in one product — each existing player is strong in at most one of these dimensions.
- The Make-Buy module specifically addresses a documented, cited whitespace in the current market (Section 4 of the design document) rather than a cosmetic feature gap.

### 9. Why the Idea Has Sufficient Scope for 3 Students
The two-semester plan splits naturally into distinct technical ownership areas:
1. **Core data model & Authority layer** — entity design (Part/BOM/Revision/ECO/Audit Log), multi-level BOM structuring with effectivity dates, versioning logic.
2. **Change governance & AML** — ECR→ECN→Released state machine, approval routing, webhook/event emission, AML data model and live query endpoints.
3. **Make-Buy module & integrations** — the core differentiator: structured decision records (cost basis, capacity, dual-source risk, IP sensitivity, lead-time exposure), plus a reference ERP/CPQ integration and a second independent front-end proving true headlessness.

### 10. What Could Realistically Be Ready by December
By the Month 3 checkpoint (per the attached plan) and continuing through Semester 1: a working SKU/part master with versioning, a multi-level BOM with effectivity-dated revisions, a functioning Change Order state machine with approval routing and audit trail, a documented REST/GraphQL API, and a thin reference UI that is demonstrably just one client of the API. AML and Make-Buy are deliberately deferred to Semester 2 as the differentiating module, per the design document's own sequencing.

---

### Notes carried over from the design document (worth keeping visible for the supervisor conversation)
- **Scope discipline is the biggest risk** — the temptation to grow this into a full PLM (CAD viewers, quality/CAPA, supplier portals) instead of staying disciplined to the Authority + Updates layers.
- **Multi-level BOM performance** (BOM explosion at depth) is a known real-world bottleneck — the data-model choice (adjacency list vs. closure table vs. graph DB) should be validated early, not in Semester 2.
- **Data availability for validation/demo:** real BOM/ECO/AML data is proprietary to individual companies and won't be publicly available — the plan already accounts for this by pitching a pilot with a real or simulated 5–20 engineer hardware team rather than relying on an open dataset. Worth stating explicitly in the proposal so it isn't flagged as a feasibility gap later.
- **Audience note for defense:** this is a B2B infrastructure product for hardware/engineering teams, not a consumer-facing product — be ready to justify novelty and contribution on technical grounds (data model, governance architecture, Make-Buy structuring) rather than a mass-market pitch, since the target user base is inherently a specialized professional audience.
