# UNIFY

Cross-tool change assurance: a versioned evidence graph links Jira criteria, Figma
design intent, GitHub changes and tests, and a deterministic gate reports what the
evidence supports, contradicts or leaves unresolved.

## Language

**Source tool**:
Where evidence *originates* — `github`, `jira`, `figma`, or `system` (synthesised
by reconciliation when a source failed to deliver a state change).
_Avoid_: display tool, tool icon

**Display tool**:
The icon/identity a reviewer sees — `github`, `jira`, `figma`, `git`, `test`, or
`slack`. `git` and `test` are display identities for commits and test cases (which
originate from github/jira); `slack` is delivery-only and never a source.
_Avoid_: source tool

**Link eligibility**:
The four-way classification of an edge — `confirmed`, `system-confirmed`,
`inferred`, `unconfirmed`. `confirmed`/`system-confirmed` are decisive; the
distinction is *who* established the link (a human `user:<id>` or the system).
A human or threshold confirmation overrides the source class.
_Avoid_: link state, edge status

**Rule metadata**:
The presentation view over a committed rule record — its title, description,
human-readable guards, grace period and notify template. Derived from the rule
record, never re-typed by the reviewer surface.
_Avoid_: policy config, rule copy
