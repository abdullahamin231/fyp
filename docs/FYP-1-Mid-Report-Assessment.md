# FYP-1 Mid Report Assessment

**Date:** 2026-10-12  
**Project:** UNIFY: Cross-Tool Change Assurance for Product Teams  
**Team:** Abdullah Amin (23i-0691), Haaniah Ismail, Mishal Fatima  
**Supervisor:** Dr. Ali Zeeshan Ijaz  

---

## Overall Score: **73 / 100** (Good range: 70–84%)

---

## Criterion Scores

| # | Criterion | Max | Score | Status |
|---|---|---|---|---|
| 1 | Report Format & Artefacts | 5 | 4.5 | Good |
| 2 | Problem Formulation, R&D & Gap Analysis | 15 | 14 | Exemplary |
| 3 | Project Vision, Scope & Success Criteria | 10 | 9 | Strong |
| 4 | Requirements & Acceptance Criteria | 15 | 11 | Good |
| 5 | Architecture & Component/Interface Design | 15 | 11 | Good |
| 6 | Data / Process / Behavior Design | 10 | 9 | Strong → Exemplary |
| 7 | Implementation Documentation | 15 | 11 | Good |
| 8 | Testing Plan & Tool / Risk Disclosure | 15 | 12 | Good |
| | **Total** | **100** | **~73** | **Good** |

---

## Key Strengths

- **Problem formulation** rigorously isolates the cross-tool drift gap with three concrete consequences (mismatches surface late, manual tracking, notifications disabled).
- **Scope** explicitly bounded: 7 "Included" + 6 "Excluded" categories; not vague.
- **112 FRs + 30 NFRs** all numbered with acceptance checks; traceability matrix links every requirement to design, module, test scenario, and demo step.
- **Architecture diagrams** are project-specific with interface contracts, URLs, and rationale (not template-generated).
- **ERD/DFD/domain models** are highly project-specific, with explicit design rules (shared nodes table, append‑only/immutable evidence tables, uniqueness constraints in schema).
- **Implementation docs** cover all three members' modules (Mishal: evidence graph/change analyser; Haaniah: source ingestion/event reliability; Abdullah: verification pipeline/reviewer surface) with technical decisions and trade‑offs stated.
- **Testing**: 138 integrity checks, 0 failures; 115/115 typecheck pass; Krippendorff's α = 0.90; full GenAI disclosure (Claude Opus, Copilot SDK by name, per‑artefact classification).
- **No red‑flag gates triggered**: all proposal actions addressed with evidence; GenAI tool-use gate satisfied; scope explicit so Scope Table gate does not trigger.

---

## Areas for Improvement (Pre‑FYP‑1 Final)

1. **Bibliography warnings** — 8 undefined citations in the `.bbl` (`delucia2007`, `lissa2025`, `coderabbitdocs`, `rovodocs`, `alor2025`, `figmawebhooks`, `forgy1982`, `desai2026`). Either add these entries to `references.bib` or remove/rewrite the corresponding `\cite` commands.

2. **Live OAuth/webhook provider rehearsal** — Pending per Ch3 iteration plan. Complete configuration of provider apps/secrets and run the documented live rehearsal before final evaluation.

3. **NFR thresholds "not yet measured"** — The acceptance table deliberately acknowledges this. If the supervisor expects all NFR measurements, plan and document the remaining measurements.

4. **No formal Scope Table** — Although scope is explicit (7 included + 6 excluded), adding a concise Scope Table would provide an extra safety margin per the rubric gate.

5. **Reproducibility verification** — The report states "A non-author has not yet reproduced the setup." Have another team member run `npm install` → `npm run build --workspace @unify/contracts` to verify.

---

## Red‑Flag Gate Check (All Clear)

| Gate | Status |
|---|---|
| Panel Action Register (C1) | All 7 proposal actions have status + owner + evidence links → **no cap** |
| SRS Cap (C4) | Traceability matrix exists; NFR measurements acknowledged as pending → **no cap** |
| Design Cap (C5) | Diagrams are project‑specific with rationale → **no cap** |
| Tool‑use = 0 (C8) | Full GenAI disclosure (Claude Opus, Copilot) → **gate satisfied** |
| Scope Table (C3) | Scope explicit (7+6 categories) → **gate does not trigger** |
| All red‑flag indicators | None observed → **no action required** |

---