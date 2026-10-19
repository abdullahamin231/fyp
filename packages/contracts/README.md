# @unify/contracts

The single source of truth for every data shape UNIFY components exchange —
the DB schema, the adapters, the rule engine, the bounded verifier, the API and
the reviewer UI all compile against these definitions instead of against prose
in a document (ch5, TODO §2).

```sh
cd packages/contracts
npm install
npm test          # 60 schema/behaviour tests
npm run typecheck
npm run build     # emits dist/ (ESM + .d.ts)
```

## What is in here

| Module | Contract | Grounding |
|---|---|---|
| `scalars` | uuid, sha256, commit sha, ISO-8601 timestamp, confidence, jsonb | dataset schema, ERD |
| `enums` | every shared enumeration (sources, node/edge types, verdicts, reason codes, slots, gate outcomes …) | ERD legend, domain model, frozen label taxonomy, ch4 |
| `event` | normalised event envelope + `eventDedupeKey` | ERD `events`, §8.3, FR-01/FR-02 |
| `graph` | `Node`, `Edge`, `isDecisiveEligibleEdge`, `CodeAnchor`, `ArtifactSnapshot` | ERD `nodes`/`edges`/`code_anchors`/`artifact_snapshots`, §9.1, §22, FR-03/FR-05/FR-23 |
| `rule` | declarative versioned rule records, guards, notification routing | ERD `rules`, §9.3, FR-12/FR-14/FR-19/FR-24 |
| `rules` | committed version 1 records for design drift, workflow inconsistency and overlapping scope | FR-12, TODO §3.4 |
| `packet` | `ContextPacket` + slot budgets and manifest (incl. omissions) | ERD `context_packets`, FR-08, §1.7, §27.1 |
| `verdict` | `verifierOutputSchema`, abstention rule, citation resolution, `gatedVerdictSchema` | ERD `verdicts`, §11.4–§11.8, FR-09/FR-10/FR-11 |
| `finding` | `Finding` (exactly-one-origin), FR-18 lifecycle transitions | ERD `findings`, FR-12/FR-15/FR-18 |
| `ingestion` | vendor delivery boundary, mock vendor, dedupe, ordering guards, checkpoints and reconciliation | ERD `events`/`checkpoints`, FR-01/FR-02/FR-16, proposal §8.4 |
| `jira-keys` | `extractJiraKeys`, `findKeysInText`: Jira issue keys in a PR's title, branch, body and commit messages, with provenance | FR-04 |

## Design stance

- **Strict objects everywhere.** Every object schema rejects unknown keys.
  A leniently parsed verdict is indistinguishable from a correct one, so
  malformed input must fail at the boundary (§11.8).
- **Enums are frozen vocabulary.** Adding a value is a cross-cutting change —
  DB enum, contracts, UI and report move together. Each value cites its source
  in `src/enums.ts`.
- **Derived-state helpers are pure and small.** `isDecisiveEligibleEdge`,
  `isAbstention`, `unresolvedCitations` and `canTransitionFinding` encode
  FR-05, hard gate 1, FR-10 and FR-18 as executable rules; everything else
  (packet building, rule evaluation, gate orchestration) belongs to
  `apps/worker`, not here.

## Notes for consumers

- The package is ESM (`"type": "module"`), NodeNext resolution, and emits
  declarations. Import from `@unify/contracts` once the workspace link exists;
  until then, `apps/*` can depend on it with a `file:` path.
- `context_packets.slot_budgets` must carry a budget for **every** slot in
  `PACKET_SLOTS` — the schema enforces it, so a new slot cannot be half-added.
- `packetManifestSchema.truncated` must be `true` exactly when some slot
  omitted an item. Truncation is recorded, never silent (§1.7).
- `IngestionEngine` persists an event before applying its resource state,
  suppresses duplicate `(sourceTool, vendorDeliveryId)` deliveries, ignores
  older versions, and emits `system` reconciliation events when polling finds
  a missed state. A failed poll marks existing source checkpoints stale after
  `staleAfterMs`; a successful poll clears that flag.

## Values still to be signed off

These are proposed here because the source documents name the field but not its
vocabulary; they need a team review before the DB enums are frozen:

| Field | Proposed values | Why it is open |
|---|---|---|
| `source_tool` member `system` | reconciliation-synthesised events need a source | §8.4 requires synthesised events but the ERD does not enumerate the enum |
| `PACKET_SLOTS` members `TEST_EVIDENCE`, `DESIGN_CONSTRAINTS` | §1.7 names five slots; FR-06/FR-07 imply these two | slot list should be confirmed with the packet builder |
| `STOP_REASONS` | `NO_APPLICABLE_EVIDENCE`, `VERIFIED`, `CRITIC_REVIEWED`, `PASS_CAP_REACHED`, `MODEL_UNAVAILABLE` | FR-09 requires a stop reason per pass but does not enumerate them |
| `GATE_OUTCOMES` | `PASSED`, `DOWNGRADED`, `REJECTED` | §11.8 describes downgrade/reject behaviour, not enum names |
| `notification_channel` | `slack`, `in_app` | only Slack is committed today; more channels would extend this |
