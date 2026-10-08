# UNIFY diagrams — all twelve, one folder

Plain TikZ sources for the mid report, all three owners together. No tikz-uml
is needed; they compile in any TeX Live and sit fine next to
`\usepackage{tikz-uml}` in `main.tex`.

| File | Diagram | Owner | Report chapter | Proposal sections |
|---|---|---|---|---|
| `usecase.tex` | Use-case diagram, four roles + GitHub/Jira/Figma/Slack | Mishal | ch4 | §1.1, §15.1, §7.3, §23.1, §26.2 |
| `domain-model.tex` | Domain/class model of graph entities and edge types | Mishal | ch5 | §9.1, §9.2, §22.1, §22.4, §26.1 |
| `erd.tex` | ERD of the PostgreSQL schema (13 tables) | Mishal | ch5 | §8.3, §8.4, §9.3, §9.9, §11.5–11.8, §22 |
| `anchor-reanchoring.tex` | Requirement→code anchor, re-anchoring order, broken state | Mishal | ch5 | §22.1–22.4 |
| `layered-arch.tex` | Layered architecture + trust boundary | Abdullah | ch5 §System Architecture | §8.1 |
| `components.tex` | Component/interface view (API, worker, queue, DB, model server) | Abdullah | ch5 §Architectural Components | §8.2, §8.3 |
| `dfd.tex` | Data-flow diagram of the full pipeline | Abdullah | ch5 §Process / Behavior Design | §8.2 |
| `verifier-loop.tex` | Activity: bounded verifier loop into the verdict gate | Abdullah | ch5 §Process / Behavior Design | §11.4, §11.8 |
| `autonomy-ladder.tex` | LLM autonomy ladder / usage register (L0–L4) | Abdullah | ch5 §Architecture Decisions and Rationale | §24 |
| `05_ingestion_sequence.tex` | Sequence: duplicate, out-of-order, missed-event handling | Haaniah | *not yet wired into a chapter* | §8.3, §8.4 |
| `06_state_machines.tex` | State machines: event processing, source freshness, finding lifecycle | Haaniah | *not yet wired into a chapter* | §8.4, §11.7, FR-16, FR-18 |
| `11_deployment.tex` | Deployment / single-host Docker footprint incl. model server | Haaniah | *not yet wired into a chapter* | §14, §11.1, §25.5 |

## Two kinds of source (this matters for editing)

- **Fragments** (Mishal's four, Abdullah's five): no `\documentclass`; they are
  wrapped by `build.sh` in a standalone preamble that loads
  `unify-diagram-styles.tex` — the shared style, also `\input` once in the
  report preamble. Rendered at 110 dpi.
- **Self-contained** (Haaniah's `05_`/`06_`/`11_`): each carries its own
  `\documentclass{standalone}` and `\input{unifystyle}` — `unifystyle.tex` is
  the matching style file (palette sampled from her committed renders), and
  `build.sh` detects and compiles them as-is at 200 dpi. Edit her files by
  editing the `.tex` itself; edit `unifystyle.tex` only if a shared token must
  change, then re-render and eyeball the diff.

## Use in the report

1. This folder is already `<report root>/diagrams/` — nothing to copy.
2. In `main.tex` preamble, after `\usepackage{tikz-uml}`:
   ```latex
   \usepackage{graphicx}
   \usepackage{pdflscape}
   \input{diagrams/unify-diagram-styles}
   ```
3. Figure blocks: paste from `figures-mishal.tex` / `figures-abdullah.tex`
   into the chapters (both already wired for their diagrams), then `\ref` them.
   Haaniah's three are standalone documents, so wire them with
   `\includegraphics{diagrams/rendered/05_ingestion_sequence}` (etc.), not
   `\input`.

Font sizes inside the fragment diagrams are fixed, so they lay out the same in
a 10, 11 or 12pt document class.

## Build

`./build.sh` builds **all twelve** to `rendered/<name>.pdf` (+ `.png`);
`./build.sh erd` builds one. Inside the repo the reliable invocation is the
TeX Live container, since `pdflatex` may not be installed locally:

```bash
docker run --rm -v "$PWD/../..:/work" \
  -w "/work/docs/F26 FYP1 Mid Report LaTeX/diagrams" \
  texlive/texlive:latest-medium bash -c \
  "tlmgr update --self >/dev/null 2>&1; tlmgr install standalone >/dev/null 2>&1; bash build.sh"
```

Commit the `.tex` sources; regenerate the PDFs at the evaluation tag and stamp
the tag in the captions (open follow-up in `TODO.md` §5).

## Design decisions to be able to defend

- **Requirement, Criterion, Ticket, … are rows of `nodes`**, not separate
  tables. This follows the type-discriminator + `payload jsonb` design
  committed to in proposal §9.9.
- **`code_anchors` is its own table**, one row per commit-pinned anchor.
  `prev_anchor_id` links the history. Re-anchoring history and
  `anchor_survival_rate` both need it.
- **`findings` are idempotent** via a unique `idempotency_key` (FR-15).
  `finding_evidence` pins every finding to the immutable snapshots it cited
  (FR-03).
- **The anchor figure is an illustrative example.** The file names and line
  numbers are invented, and the caption says so.
