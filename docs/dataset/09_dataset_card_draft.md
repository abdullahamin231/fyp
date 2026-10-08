# Dataset card (draft): UNIFY Change-Intent Oracle, pilot-0.1

**Purpose.** Pilot set used to test the annotation manual and measure label agreement before full construction (Action Plan, Phase 3). It is **not** a training, development or test set.

**Contents.** 15 cases from 3 MIT-licensed TypeScript/React repositories: react-hook-form (7), excalidraw (4), mantine (4). Each case contains one atomic criterion, one change under review pinned to base/head SHAs, the changed code and test hunks, 2–4 candidate code spans (relevant and same-module hard negatives), test-run results with logs, and an event list.

**Construction.** Constructor: Mishal Fatima, with GenAI assistance (Claude; see `docs/genai_register.md`). Cases are either REAL (an unmodified merged PR) or CONTROLLED (a documented patch on a real head, a deliberately re-linked change, or a stale-source event sequence). Per-case origin is withheld until annotation is complete. Origin and intended labels are held in `_constructor_only/` and are not shown to annotators.

**Criterion provenance.** Criteria are derived from the squash-merge commit message of each PR, which restates the issue title and sometimes explains the bug. Issue bodies were **not** retrieved at construction time. Annotators can open `issue_url`. This is a known limitation to fix before Phase 5.

**Design evidence.** None. These public repositories have no Figma files or structured design constraints, so every case records design evidence as NOT_APPLICABLE. The Figma side of UNIFY needs fixture repositories (Action Plan §4.3).

**Labelling.** Two blind annotators (planned: Abdullah Amin, Haaniah Ismail), neither the constructor. Disagreements are adjudicated (planned: Mishal Fatima) and recorded in `06_adjudication_log.csv`. Supervisor audit of the pilot is pending.

**Known biases and limitations.**
- Only controlled cases carry a head patch, so an annotator could infer "constructed" from its presence. The manual tells them not to; agreement on patched vs unpatched cases should be compared.
- The documentation-quality profile is a first heuristic (doc-comment share of exported symbols). Mantine scores 0% on doc comments but has very conventional structure.
- Test runs were executed in a sandbox (Node 22) on 8–9 Oct 2026. Some older commits needed their own dependency install.
- Same-module hard negatives were chosen by the constructor, not mined automatically.

**Integrity.** `08_integrity_report.md`: 138 automated checks, 0 failures (SHAs resolve, patches apply with recorded hashes, every span in bounds with unchanged content hash, logs present, no label leakage, secret scan).
