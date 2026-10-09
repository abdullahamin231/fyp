# UNIFY traceability matrix

Canonical, versioned mapping **requirement → design element → module → test case → demo step**
for UNIFY's own requirements — the artefact required by `TODO.md` §1.3 (last bullet),
`TODO.md` §5 (the traceability-matrix diagram row), proposal §22.5 ("traceability as a
process artifact") and worksheet §5 ("Requirement traceability"). It is also what makes
chapter 4's claim true:

> "The full matrix, including NFRs and evaluation scenarios, is maintained in the
> repository and regenerated at each gate."
> — `chapters/chapter4_requirements.tex`, §Requirements Traceability (since commit `33b00e7`)

Applied to UNIFY itself, it doubles as a worked example of the product capability the
project is building (requirement entities anchored to design and code, with provenance).

## Files

| File | What it is | Edited by |
|---|---|---|
| `traceability_matrix.csv` | **Canonical matrix.** One row per requirement: FR-01..FR-29 and NFR-01..NFR-14 (43 rows). This is the only file you edit by hand. | Abdullah maintains; Haaniah and Mishal feed their rows |
| `build_matrix.py` | Generator + validator. Reads the CSV, asserts the matrix is complete, and writes the two renderings below. | — |
| `traceability_matrix.md` | Generated readable rendering, grouped by requirement type, plus the worksheet §5 view and every row's notes. | generated — do not edit |
| `chapter4_table.tex` | Generated LaTeX `longtable` fragment with the same 43 rows, for `\input` from chapter 4. | generated — do not edit |

## Regenerating

```sh
python3 docs/traceability/build_matrix.py
```

Refresh **at every gate** — proposal §18.1 delivery gates and each evaluation-tag freeze
(`TODO.md` §7) — and commit the CSV **and** both generated files in the same commit, so
the CSV, the markdown and the LaTeX fragment can never disagree.

The script fails loudly (non-zero exit) if any of the following is true, so a dropped or
renumbered requirement cannot reach a gate unnoticed:

- the header is not exactly the 14 columns below;
- the file does not have exactly **43 data rows** (29 FR + 14 NFR);
- any `requirement_id` is duplicated, or the ID set differs from FR-01..FR-29 + NFR-01..NFR-14;
- any cell is empty (use `--` for a known gap, never an empty string);
- `status` is not one of `designed | implemented | partially_implemented | not_started`;
- `requirement_type` disagrees with the prefix (`FR-` = functional, `NFR-` = non_functional);
- a `test_case` token is not one of T1..T11 (the scenarios defined in `TODO.md` §3.4);
- `demo_step` is not one of the tokens listed below.

Compile check for the LaTeX fragment (the fragment itself is not yet wired into chapter 4):

```sh
mkdir -p /tmp/trace-tex
cat > /tmp/trace-tex/wrapper.tex <<EOF
\documentclass{article}
\usepackage{longtable}
\usepackage{array}
\begin{document}
\input{/work/docs/traceability/chapter4_table}
\end{document}
EOF
docker run --rm -v "$PWD":/work:ro -v /tmp/trace-tex:/t -w /t texlive/texlive:latest-medium \
  pdflatex -interaction=nonstopmode -halt-on-error wrapper.tex
```

Last verified 2026-10-09, both under `texlive/texlive:latest-medium`:

- standalone: compiles with `-halt-on-error`, no errors, no overfull boxes, 9 pages;
- in context: `\input{../traceability/chapter4_table}` swapped in for the existing
  `tab:traceability` block in a throwaway copy of the full report builds to the same
  error set as the unmodified report (the only errors are pre-existing: chapters 1 and 3
  use `\toprule`/`\midrule`/`\bottomrule` without `\usepackage{booktabs}`, 84 undefined
  control sequences), the label resolves as Table 4.9 on printed page 41, and both ends
  of the table render correctly. This fragment needs only `longtable` + `array`, both
  already in `main.tex`.

## Columns

| Column | Meaning |
|---|---|
| `requirement_id` | ID **owned by chapter 4**: `FR-01..FR-29`, `NFR-01..NFR-14`. No other IDs may appear. |
| `requirement_title` | Short title. The requirement *text* of record is chapter 4's FR/NFR tables (which restate proposal §15.1/§15.2). |
| `source_proposal_ref` | Where the requirement comes from in `UNIFY Final Proposal v2 (Post Defense).docx`. FR-01..FR-21 = proposal §15.1 (same IDs); FR-22..FR-29 = their Rev. 3 sections (§22, §26, §23); NFRs = proposal §15.2 quality-attribute rows, which are **unnumbered** (see discrepancy D1). |
| `requirement_type` | `functional` / `non_functional`. |
| `design_element` | The design artefact that realises the requirement (ch5 sections, use cases UC-01..UC-06, ERD/domain-model constructs, named decisions). |
| `design_figure` | The report figure label (`fig:…`) that draws it, or the diagram file path for diagrams not yet wired into a chapter, or `--`. |
| `module` | Planned package path from chapter 4's traceability table (`ingestion/`, `store/`, …) or a module name from ch1's module list for NFRs. **All of these are plans** — see discrepancy D11. |
| `code_artifact` | A real path in this repository, verified by inspection, or `--`. |
| `test_case` | T1..T11 from `TODO.md` §3.4 where the scenario applies, else `--`. A T-ID means "scenario defined", **not** "test passing" — none of them exists yet (D9). |
| `demo_step` | Provisional demo token, or `--` (D10). |
| `status` | See below. |
| `evidence_link` | A real path or commit hash backing the status (design artefact for `designed`, code path + commit for `partially_implemented`). Never invented. |
| `owner` | Full name; FR owners come from chapter 4's owner column (A/H/M), NFR owners are derived (D12). |
| `notes` | Why a cell is `--`, what is missing for `partially_implemented`, and every inherited/agreed mapping. |

### Status vocabulary (and what backs it)

| Value | Meaning |
|---|---|
| `implemented` | The acceptance check in ch4 §Acceptance Criteria passes on code in this repository. **Currently zero rows** — no row may use it until a command is run at the gate that demonstrates the check. |
| `partially_implemented` | Repository code exists covering the requirement's principal interaction **and** it was inspected; the acceptance check is not met. Currently 5 rows, all reviewer-UI screens rendering typed mock data: FR-04, FR-11, FR-17, FR-18, FR-19 (files named in `code_artifact`, all from commit `7b411b1`; verified by reading each file — they use `apps/web/src/lib/mock/` and local component state, there is no API client). |
| `designed` | Committed design exists (ch4/ch5 + a diagram or use case); no code implements it. 38 rows. |
| `not_started` | Neither design nor code. Currently zero rows — every requirement has at least its ch4 statement and acceptance check. |

Honesty rule: **an `implemented`/`partially_implemented` claim must be reproducible by a
command** (e.g. `git show 7b411b1 --stat`, `grep -rn fetch apps/web/src`,
`python3 -m pytest unify_poc`). The commands behind the current statuses:

```sh
ls apps                                   # → web only: no apps/api, apps/worker, packages/, db/, docker-compose.yml
test -f docker-compose.yml || echo absent # → absent (NFR-08 not implemented)
grep -rln "fetch(" apps/web/src           # → no matches: the frontend never talks to a backend
python3 -m pytest unify_poc               # → collection error: unify_poc/src/unify/ingestion/figma_api.py
                                          #   imports .adapter/.normalizer, which are absent from the repo
find apps/web/src -name '*.test.*'        # → no matches: no frontend tests
```

## Worksheet §5 mapping

`FYP1 Mid Pre-Evaluation Student Worksheet.docx` §5 asks for six columns. All six are in
this matrix; the extra columns carry what `TODO.md` §1.3/§5 and proposal §22.5 require
(proposal reference, type, evidence link, notes). The generated markdown contains a
ready-to-paste **"Worksheet §5 view"** table with exactly those six columns.

| Worksheet §5 column | Matrix column(s) |
|---|---|
| Requirement (ID) | `requirement_id` |
| Design element (diagram/component) | `design_element` + `design_figure` |
| Implementation (path/function/module) | `module` + `code_artifact` |
| Test or validation (test/result) | `test_case` + `status` (+ `evidence_link`) |
| Demo step | `demo_step` |
| Owner | `owner` |

## Discrepancy register (proposal ↔ chapter 4 ↔ TODO ↔ worksheet)

Recorded rather than silently resolved; rows needing a human decision are marked **[decide]**.

- **D1 — NFR numbering exists only in ch4.** Proposal §15.2 is an *unnumbered*
  "Quality attribute / Measurable target" table with 11 rows; chapter 4 numbers
  **NFR-01..NFR-14** (14). The matrix uses ch4's IDs (they are the canonical list) and
  records the proposal row per NFR in `source_proposal_ref`. Two ch4 NFRs have no §15.2
  row at all: NFR-04 (graceful degradation → proposal §14 + §24.1 fallbacks) and NFR-06
  (intervention/prompt metrics → proposal §23.2). **[decide]** whether the report should
  say the NFR numbering is the report's own.
- **D2 — chapter 4's traceability table omits five FRs.** Its `tab:traceability` covers
  FR-01..FR-18 and FR-22..FR-25, FR-28, FR-29 but **not FR-19, FR-20, FR-21, FR-26,
  FR-27**. This matrix includes them (43 rows, no gaps). Their `module` cells are derived:
  FR-19 → `conflicts/`, FR-26 and FR-27 → `analyser/` (from the group headings in ch4
  §Functional Requirements); FR-20 and FR-21 → `--` because no planned package exists for
  label/split handling or export. **[decide]**: backfill ch4's table, or swap in the
  generated fragment.
- **D3 — grouped rows vs one row per requirement.** ch4 groups FRs ("FR-07 to 11 → T10",
  "FR-01, 02 → T7, T8", …). This matrix inherits those exact T-mappings per row instead of
  re-deriving them; the inherited ones are called out in `notes` (e.g. FR-07's tie to T10
  is weak — T10 really exercises FR-10). **[decide]** whether to tighten them in ch4.
- **D4 — columns ch4's table does not have.** ch4's table has 4 columns (FR, design
  element, module, test scenario). The matrix adds proposal reference, figure, code
  artefact, demo step, status, evidence, owner and notes — required by worksheet §5 and
  TODO §5 ("→ demo step"). Not a contradiction, a superset.
- **D5 — FR-20 wording differs.** Proposal §15.1: "respecting the **project-level** data
  split"; ch4: "respecting the **repository-level** data split"; dataset README: "splits
  are by repository, never by example". The matrix follows ch4's wording (it matches the
  dataset protocol). **[decide]** whether the proposal text needs a correction note.
- **D6 — TODO text is stale.** TODO §1.3 and TODO §5 both say ch4's traceability section
  is "still a placeholder line" and "no matrix file exists yet". Since `33b00e7` chapter 4
  contains a real `longtable`, and this directory is the missing matrix file. The TODO rows
  should be ticked/rewritten by their owner — **not edited by this subagent**.
- **D7 — worksheet columns.** Worksheet §5 specifies 6 columns; the task schema specifies
  14. The 14 are a strict superset (mapping above), so both are satisfied; if the group
  prefers the worksheet's exact 6, the markdown's "Worksheet §5 view" is the paste-in.
- **D8 — figure label collision.** TODO §5 records that `fig:anchor` still carries an
  invented illustrative **FR-07** label that collides with the real FR-07. This matrix
  never references labels inside figures, only `fig:anchor`; the follow-up stays open for
  Mishal.
- **D9 — T1..T11 are defined but nothing runs them.** They exist only in TODO §3.4 and
  ch4's table. `chapter8_testing.tex` is a section stub and `appendix_test_cases.tex` is a
  placeholder, so every `test_case` cell means "scenario specified", never "test passing".
- **D10 — demo steps are provisional.** No demo script exists (TODO §7 open) and the
  worksheet's §4 "Live demonstration plan" is an empty template, so there are no numbered
  demo steps to cite. The matrix uses three descriptive tokens derived from TODO §7's
  run-through and the demo protocol §2 phases — `demo-normal`, `demo-failure` (plus
  `demo-edge`/`demo-evidence`/`demo-boundaries` accepted by the validator) — on 7 rows:
  FR-04, FR-06, FR-11, FR-17 (normal chain) and FR-02, FR-10, FR-15 (the two failure cases
  TODO §7 names: fabricated citation downgraded; duplicate event → no duplicate finding).
  **[decide]**: when the demo script numbers its steps, replace the tokens here.
- **D11 — every module path is a plan.** ch4 calls them "the planned packages for the
  mid-evaluation build"; the repository contains only `apps/web`. `ingestion/`, `store/`,
  `resolution/`, `analyser/`, `verify/`, `conflicts/`, `notify/`, `ui/`, `graph/` do not
  exist yet (verified with `ls apps`). The fragment's module column must not be read as
  implemented code.
- **D12 — NFR owners are derived.** ch4's owner column exists only for FRs. NFR owners
  come from proposal §16 (technical ownership), TODO §1.1 and TODO §4; each is flagged in
  `notes`. **[decide]**: have Mishal (ch4 owner) confirm or overwrite them.
- **D13 — unwired diagrams have no figure label.** Haaniah's three diagrams
  (`05_ingestion_sequence.tex`, `06_state_machines.tex`, `11_deployment.tex`) are not yet
  `\input` into any chapter (TODO §5), so those rows cite the file path with "(unwired)"
  instead of a `fig:` label.
- **D14 — statuses vs ch4's acceptance table.** No row is `implemented`, which is
  consistent with ch4 §Acceptance Criteria ("a requirement is accepted only when its check
  passes on the evaluation commit"): no check currently passes anywhere in the repository.

## Known gaps (`--` cells)

Every `--` is explained in that row's `notes`; the totals are printed by `build_matrix.py`
on each run. Current counts out of 43 rows:

| Column | `--` rows | Why |
|---|---|---|
| `design_figure` | 4 | FR-26 (comment–code contradiction), NFR-03 (dispatch equivalence), NFR-06 (metrics), NFR-07 (latency) — no diagram covers them. |
| `module` | 6 | FR-20, FR-21 (no planned package); NFR-06, NFR-07 (not a single module); NFR-08, NFR-11 (deployment/infrastructure, not code). |
| `code_artifact` | 38 | No code exists for those requirements — only the 5 reviewer-UI rows have inspected artefacts. |
| `test_case` | 26 | No T1..T11 scenario applies (17 rows have a scenario). |
| `demo_step` | 36 | Not in the normal/failure demo path described by TODO §7. |
| `evidence_link` | 0 | Every row points at a real design artefact, code path or dataset file. |

## Maintenance

Abdullah Amin maintains the matrix; Haaniah Ismail and Mishal Fatima feed their rows
(TODO §5: "*Abdullah maintains, all three feed*"). Changes go into the CSV only, then the
generator is re-run before the commit that closes a gate.
