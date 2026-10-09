# UNIFY Dataset Package: pilot-0.1

Pilot for the mid-evaluation (Action Plan, Phase 3): **15 cases from 3 TypeScript/React repositories, with same-module hard negatives in every case.**

| File | What it is |
|---|---|
| `01_repository_catalogue.csv` | 8 repositories screened: 3 accepted, 4 rejected, 1 deferred, with reasons |
| `02_case_schema.json` | Packet schema and the frozen label taxonomy |
| `03_annotation_manual.md` | Rules and worked examples for annotators (pilot v0.1) |
| `04_cases/` | 15 annotator-facing packets, head patches, test logs |
| `05_raw_annotations/` | One blank sheet per annotator. **Fill in your own only.** |
| `06_adjudication_log.csv` | Empty template for disagreements |
| `07_split_manifest.csv` | Proposed repository-level split (not frozen) |
| `08_integrity_report.md` | Automated check output (138 checks, 0 failures) |
| `09_dataset_card_draft.md` | Provenance, construction, limitations |
| `tools/` | `build_cases.py`, `check_integrity.py`, `agreement.py` |
| `_constructor_only/` | **Not in git** (see `.gitignore`). The constructor's key and case specs stay with the constructor and supervisor until annotation is finished. |

## Workflow
1. **Annotators (Abdullah, Haaniah):** read `03_annotation_manual.md`, then label all 15 cases alone in your own sheet. Don't discuss them until both sheets are submitted.
2. **Agreement:** `python tools/agreement.py 05_raw_annotations/annotator_A_abdullah.csv 05_raw_annotations/annotator_B_haaniah.csv`. This gives raw agreement, Cohen's κ and span IoU, and lists disagreements.
3. **Adjudication (Mishal):** resolve each disagreement in `06_adjudication_log.csv`. Never edit the original sheets.
4. If verdict κ < 0.70: revise the manual from the disagreements and re-pilot. That is expected, not a failure.

## Reproducing
Clone the three repositories, then `python tools/build_cases.py <repos> <work> .` and `python tools/check_integrity.py . <repos>`. The work folder must hold the mutation patches and test logs referenced in `_constructor_only/cases_spec.py` (held by the constructor).
