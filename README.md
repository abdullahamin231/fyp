# UNIFY — Cross-Tool Change Assurance for Product Teams

Final Year Project · FAST School of Computing

**Team:** Abdullah Amin · Haaniah Ismail · Mishal Fatima
**Supervisor:** Dr. Ali Zeeshan Ijaz

## What this project is

UNIFY is a locally deployable cross-tool change-assurance system. It maintains
a versioned evidence graph linking Jira acceptance criteria, approved Figma
design intent, GitHub code changes and tests. For each proposed change (one
pull request), it reconciles asynchronous tool events and uses deterministic
rule logic plus a bounded, local evidence-verification loop to report what the
available evidence supports, contradicts or leaves unresolved — with every
decisive finding tied to its cited source.

Key commitments (from the post-defence proposal):

- **One workflow:** every feature is explained through verifying one proposed
  code change against its linked Jira criteria, Figma design version, changed
  code and tests.
- **Local AI only:** all model inference runs locally (pinned open-weight
  model; Qwen/Llama candidates selected by measurement). Hosted models are
  offline comparison baselines only.
- **Provenance gate:** verdicts are `SUPPORTED`, `CONTRADICTED`, `PARTIAL` or
  `INSUFFICIENT_EVIDENCE`; a decisive finding requires valid citations resolved
  against an immutable evidence packet, or it is downgraded / abstained.
- **Integrations:** Figma, GitHub and Jira (read-only OAuth) + Slack for
  notification delivery only.
- **Storage:** PostgreSQL modelled as a versioned property graph (no dedicated
  graph DB for the committed core).
- **Languages:** TypeScript/React is the committed analyser target; Python and
  JavaScript/TS are supported for indexing/scaling (proposal Rev. 3 §27.3
  governs where earlier sections differ).

Technical ownership (proposal §16):

| Member | Primary ownership |
|---|---|
| Haaniah Ismail | GitHub/Jira/Figma adapters, normalised events, idempotency/replay/reconciliation, immutable artifact/version store |
| Mishal Fatima | Code/symbol/test analysis, evidence graph & provenance, linking, deterministic drift/policy rules, incremental dispatch |
| Abdullah Amin | Context-packet builder, local model serving & selection, bounded verifier loop, LoRA/QLoRA experiment, verdict/provenance gate, reviewer UI |

## Repository contents

```
apps/web           Reviewer web app — Next.js 16 + TypeScript + Tailwind (see its README)
docs/              Project documents (see below)
opencode.json      OpenCode config — official Stitch MCP server
.env               Local secrets (gitignored) — STITCH_API_KEY
```

### Frontend

`apps/web` implements the reviewer surface screen-for-screen against the Stitch
project **Unified Dev Collaboration Hub**. Every design was exported locally to
`docs/stitch-reference/screens/` (Tailwind HTML + PNG per screen) and the app's
Tailwind theme is a 1:1 port of the token block inside those exports, so the
screens stay checkable against their source. Screens currently render typed mock
data (`apps/web/src/lib/mock/`); the contracts/API layer lands next.

```sh
npm install        # npm workspaces, from the repo root
npm run dev        # → http://localhost:3000
npm run build
```

### Documents

| File | What it is |
|---|---|
| `UNIFY Final Proposal v2 (Post Defense).docx` | Full FYP proposal (Rev. 2 + Rev. 3 panel-feedback additions): problem statement, complex computing problem, related work & novelty positioning, system architecture, frozen scope hierarchy, local AI architecture, evaluation plan with metrics/thresholds, dataset plan, PoC plan, deployment/privacy, FR/NFR snapshots, team ownership, two-semester roadmap and risk register. |
| `FYP1 Mid Presentation Demo and Evidence Protocol.docx` | Common 35-minute mid-evaluation session structure for all supervised FYP groups (Form 2): 7-slide presentation → live core-module demo incl. edge/failure case → repository/evidence walkthrough → individual technical verification. |
| `FYP1 Mid Pre-Evaluation Student Worksheet.docx` | Group worksheet to complete and submit ≥48 h before the mid evaluation, mapping evidence to the Form 2 (demo, 100 marks) and Form 3 (report, 100 marks) rubrics, incl. GenAI L1–L4 registers and per-member individual evidence. |
| `UNIFY Dataset Construction and Validation Action Plan.pdf` | Student-facing guide converting the proposal's dataset plan into a reproducible evaluation asset: frozen label taxonomy, repository eligibility gate, case construction, annotation/adjudication process (Cohen's κ ≥ 0.70), leakage/integrity controls, 7-phase implementation plan and the final dataset-package checklist. |

## FYP 1 mid evaluation — what matters

Session structure (35 min; all three members participate and defend their own
work):

1. **Presentation (7 min, max 7 slides)** — evidence-led progress since
   proposal approval.
2. **Live core-module demo (8 min)** — the implemented core module runs live,
   including an edge or failure condition; screenshots/prerecorded video are
   backup evidence only. **This is the highest-weight Form 2 criterion
   (25/100).**
3. **Repository & evidence walkthrough (5 min)** — evaluation tag/commit,
   history, task evidence, tests, member ownership (commit count alone is
   insufficient).
4. **Individual technical verification (~12 min)** — each member explains owned
   work, predicts behaviour under a changed condition, and performs a small
   technical task without AI assistance.
5. **Supervisor closure (3 min)** — record corrections and deadlines.

Rules that bite:

- Submit the completed worksheet + prescribed mid report **≥48 hours** before
  the meeting; demo the frozen evaluation commit/tag stated in the worksheet.
- All GenAI-assisted artefacts need an **L1–L4 classification** (L1 supportive
  → L4 substituted) with verification evidence; L4 work must not be presented
  as independently completed.
- Claims must be traceable to report, worksheet, repository, test results or
  design artefacts.
- Every member must be able to locate, explain and modify their claimed work
  live.

Rubric highlights:

- **Form 2 (presentation/demo, 100 marks):** live prototype with core module
  demo **25**, design artefacts & evolution 15, proposal actions 10, iteration
  plan 10, requirements & acceptance 10, repository/member evidence 10,
  testing & early validation 10, team dynamics & tool ownership 10.
- **Form 3 (report, 100 marks):** problem formulation/R&D 15, requirements &
  acceptance 15, architecture & component design 15, implementation
  documentation 15, testing/validation + tool/risk disclosure 15, vision/scope
  10, data/process/behaviour design 10, format 5.

## Dataset construction (panel requirement)

The panel required the project datasets to be *validated*, not just named.
The action plan (in `docs/`) turns the proposal's dataset plan into a versioned
**UNIFY Dataset Package v1**. Essentials:

- **Frozen label taxonomy:** exactly four verdicts — `SUPPORTED`,
  `CONTRADICTED`, `PARTIAL`, `INSUFFICIENT_EVIDENCE` — with separate fields
  for freshness (`CURRENT/STALE/UNKNOWN`), `review_required`, `reason_code`
  (e.g. `SOURCE_STALE`) and origin (`REAL/CONTROLLED_MUTATION/SYNTHETIC`).
- **Repository eligibility gate:** TypeScript/React repos with compatible
  licences, resolvable base/head commits, usable issue/PR history, extractable
  code/test evidence, data hygiene and full provenance. Public corpora
  (SWE-bench, PyBugHive) are Python-heavy — supplementary training only, never
  blended into the headline score.
- **Scale targets:** 12–20 candidate repositories → training pool 200–500
  examples → development set 20–30 labelled cases → frozen gold test oracle
  30–50 adjudicated cases → 20–30 event-reliability sequences → 6–10
  user-acceptance tasks.
- **Leakage control:** splits are **by repository, never by example**; forks
  and copied templates stay in one split; test labels open only after
  model/prompt/retrieval/thresholds are frozen.
- **Annotation quality:** two blind annotators + adjudicator; Cohen's κ ≥ 0.70
  target; supervisor audits 10–20% of the gold set plus all rare classes and
  defence-demonstration cases.
- **Minimum evidence for the mid evaluation:** frozen taxonomy, eligibility
  checklist with ≥3 accepted TypeScript/React repos, a 12–20-case pilot
  covering all four verdicts, same-module hard negatives, ≥3 deliberate
  abstention cases, written annotation manual, two independent annotation
  files with preliminary agreement stats, one fully documented adjudication,
  dataset-card draft + split plan + integrity-check output, and one end-to-end
  case from source artefacts to gold verdict.

## Setup

Clone the repo and open it in OpenCode. The project ships an `opencode.json`
that configures the official **Google Stitch MCP server**
(`https://stitch.googleapis.com/mcp`) so agents can generate and manage UI
screens. The design project kept in Stitch is **Unified Dev Collaboration Hub**
(`projects/14858991041797474900`).

### Stitch MCP API key

Each team member needs their own Stitch API key:

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com) and sign in.
2. Click your profile icon (top right) → **Stitch Settings** → **API Keys** →
   **Create Key**.
3. Export the key in your shell (add to `~/.bashrc` or `~/.zshrc` to keep it
   across sessions):

   ```sh
   export STITCH_API_KEY="your-key-here"
   ```

4. Restart OpenCode so it picks up the environment variable. The key stays out
   of git — it is read via `{env:STITCH_API_KEY}` from `opencode.json`.

Stitch MCP is free of charge. See the
[Stitch MCP setup docs](https://stitch.withgoogle.com/docs/mcp/setup/) for
details.
