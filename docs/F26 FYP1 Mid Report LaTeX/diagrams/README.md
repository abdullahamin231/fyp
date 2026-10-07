# UNIFY diagrams (Mishal)

Plain TikZ sources, so no tikz-uml is needed. They compile in any TeX Live and sit fine next to `\usepackage{tikz-uml}` in `main.tex`.

| File | Diagram | Report chapter | Proposal sections |
|---|---|---|---|
| `usecase.tex` | Use-case diagram, four roles + GitHub/Jira/Figma/Slack | ch4 | §1.1, §15.1, §7.3, §23.1, §26.2 |
| `domain-model.tex` | Domain/class model of graph entities and edge types | ch5 | §9.1, §9.2, §22.1, §22.4, §26.1 |
| `erd.tex` | ERD of the PostgreSQL schema (13 tables) | ch5 | §8.3, §8.4, §9.3, §9.9, §11.5–11.8, §22 |
| `anchor-reanchoring.tex` | Requirement→code anchor, re-anchoring order, broken state | ch5 | §22.1–22.4 |

## Use in the report

1. Copy this folder to `<report root>/diagrams/`.
2. In `main.tex` preamble, after `\usepackage{tikz-uml}`:
   ```latex
   \usepackage{graphicx}
   \usepackage{pdflscape}
   \input{diagrams/unify-diagram-styles}
   ```
3. Paste the figure blocks from `figures-mishal.tex` into the chapters. Refer to them with `\ref{fig:usecase}`, `\ref{fig:domain-model}`, `\ref{fig:erd}` and `\ref{fig:anchor}`.

Font sizes inside the diagrams are fixed, so they lay out the same in a 10, 11 or 12pt document class.

## Preview / rebuild

`./build.sh` (or `./build.sh erd`) writes `rendered/<name>.pdf` and `.png`. Commit the `.tex` sources, and regenerate the PDFs at the evaluation tag.

## Design decisions to be able to defend

- **Requirement, Criterion, Ticket, … are rows of `nodes`**, not separate tables. This follows the type-discriminator + `payload jsonb` design committed to in §9.9.
- **`code_anchors` is its own table**, one row per commit-pinned anchor. `prev_anchor_id` links the history. Re-anchoring history and `anchor_survival_rate` both need it.
- **`findings` are idempotent** via a unique `idempotency_key` (FR-15). `finding_evidence` pins every finding to the immutable snapshots it cited (FR-03).
- **The anchor figure is an illustrative example.** The file names and line numbers are invented, and the caption says so.
