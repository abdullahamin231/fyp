/**
 * @unify/contracts — the single source of truth for UNIFY's shared data shapes.
 *
 * Everything the DB schema, the adapters, the rule engine, the verifier, the
 * API and the reviewer UI exchange is defined here, so the three implementation
 * streams compile against the same definitions rather than against prose in a
 * document (ch5).
 *
 * Contents
 * - `scalars`    shared primitives (uuid, hashes, timestamps, jsonb)
 * - `enums`      every shared enumeration, each value traceable to a frozen doc
 * - `event`      normalised event envelope + dedupe key (§8.3, FR-01/FR-02)
 * - `graph`      nodes, edges, code anchors, artefact snapshots (§9.1, §22)
 * - `rule`       declarative, versioned rule records (§9.3, FR-12/FR-19/FR-24)
 * - `packet`     context packets and their manifests (FR-08, §1.7, §27.1)
 * - `verdict`    verifier output, abstention rule, gated verdict (§11.4–§11.8)
 * - `finding`    findings and the FR-18 lifecycle
 *
 * Validation stance: every object schema is strict. A malformed payload is
 * rejected at the boundary — it is never silently coerced, because a leniently
 * parsed verdict is indistinguishable from a correct one (§11.8 hard gate).
 */

export * from "./scalars.js";
export * from "./enums.js";
export * from "./event.js";
export * from "./graph.js";
export * from "./rule.js";
export * from "./rules.js";
export * from "./packet.js";
export * from "./verdict.js";
export * from "./finding.js";
export * from "./ingestion.js";

/** Version of the contract package; mirror this in DB migration notes. */
export const CONTRACTS_VERSION = "0.1.0";
