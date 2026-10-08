# GenAI Use Register and Prompt Journal

## Declaration of Responsible GenAI Use
We have disclosed significant GenAI assistance by artefact and member. We have reviewed and verified the submitted outputs, identified the student contribution beyond generated material, and understand that each member may be evaluated individually on the work attributed to them.

## GenAI Use Register

The following table records the significant use of Generative AI tools during the project, as required by the responsible GenAI use guidelines.

| Date & Member | Tool / Model | Purpose | Affected Artefact | Output Used | Student Contribution | Verification | Rejected / Corrected Output | Evidence Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Oct 8, 2026<br>Mishal | Gemini 3.1 Pro | Formatting and integrating diagrams into LaTeX report | `chapter4_requirements.tex`<br>`chapter5_design.tex` | LaTeX commands to embed TikZ diagrams | Reviewed LaTeX syntax, verified PDF output, instructed agent on diagram placement | Manual compilation and visual inspection of the generated PDF | N/A | Commit `0a381fa` |
| Oct 7, 2026<br>Mishal | Claude (Opus 5.5) | Generate four SE diagrams from the proposal (use-case, domain model, ERD, requirement→code anchor) — **L3** | `diagrams/usecase.tex`<br>`diagrams/domain-model.tex`<br>`diagrams/erd.tex`<br>`diagrams/anchor-reanchoring.tex`<br>`diagrams/unify-diagram-styles.tex` | TikZ source for all four diagrams, shared style file, build script | Chose which diagrams to make (own four from TODO §5) and the format (TikZ); had the AI explain each diagram until able to explain it unaided | AI compiled each diagram and checked renders; diagrams cross-checked against proposal §1.1, §9.1, §9.9, §22 | Layout fixed over several iterations (overlapping labels, wrapping in 12pt class). Anchor figure uses an invented example, stated in its caption | Commit: _add after commit_ |
| Oct 8, 2026<br>Mishal | Claude (Opus 5.5) | Explain own and teammates' diagrams and the code-semantics changes for defence preparation — **L1** | None (learning only) | Explanations only | Used to prepare own explanation of the diagrams | Explanations checked against proposal §8.4, §14, §26 | AI flagged inconsistencies: `superseded` missing from ERD; model server writing directly to PostgreSQL in the deployment diagram (both added to the team checklist) | — |
| Oct 8, 2026<br>Mishal | Claude (Opus 5.5) | Condense the long TODO.md into a short team checklist — **L2** | Google Doc "UNIFY — Mid Eval Checklist" | Checklist structure and wording | Asked for a short strike-off format like the pre-defence doc; to confirm owner assignments with team | Content traced back to TODO.md items | Detailed specs from TODO.md deliberately left out of the checklist | Google Doc link |
| Oct 8, 2026<br>Mishal | Claude (Opus 5.5) | Draft Chapter 4 (Software Requirements) from proposal §1.1, §7, §14, §15, §22, §23, §26, §27.3 — **L3 (draft)** | `chapters/chapter4_requirements.tex`<br>`main.tex` (added `longtable`, `array`) | Full chapter draft: roles, 6 detailed use cases, FR-01–FR-29, NFR-01–NFR-14, acceptance checks, traceability table | _Pending:_ Mishal to rewrite in own words and agree new FR IDs (FR-22–FR-29) with Abdullah's traceability matrix | AI compiled the chapter inside the report and checked page layout. _Pending:_ Mishal to check every FR/NFR against proposal §15 and §22 | New FR-22–FR-29 numbering proposed by AI, not yet agreed by team | Commit: _add after commit_ |
| | | | | | | | | |


## Prompt Journal
*This section logs significant interactions that materially affected the project, particularly cases where the group challenged, rejected, or corrected a GenAI suggestion.*

- **Date**: Oct 8, 2026
- **Topic**: LaTeX diagram integration
- **Interaction Summary**: We used an AI coding assistant to quickly inject packages and `\input` statements for four diagrams into the LaTeX chapters. We manually moved the diagram folder to the correct path after the AI placed it in an incorrect nested folder, demonstrating verification and correction.

- **Date**: Oct 7–8, 2026
- **Topic**: SE diagrams and Chapter 4 draft (Claude, Opus 5.5)
- **Interaction Summary**: Mishal first asked for help starting the mid report, then redirected the AI to produce the four SE diagrams first and chose TikZ over Mermaid/draw.io. The AI generated the diagrams and Chapter 4 from the proposal. Early on, the AI pointed out that the proposal contradicts itself on language scope (§7.2 TS/React only vs §27.3 Python + TS/JS); the chapter follows the README's resolution (§27.3 governs). The AI also flagged two cross-diagram inconsistencies in teammates' diagrams. **Still to do by Mishal:** review and rewrite the chapter in her own words, confirm FR-22–FR-29 with the team, and update this entry with what was changed.
