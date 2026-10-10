import { z } from "zod";

/**
 * Scalar primitives shared by every UNIFY contract.
 *
 * These are deliberately expressed as plain string patterns rather than
 * `z.string().datetime()` / `z.string().url()` so that the accepted grammar is
 * visible in one place and identical for every consumer (DB, worker, API, UI,
 * fixture builders).
 */

/** RFC 4122 UUID, lowercase or uppercase. */
export const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "expected a UUID",
  );

/** Lowercase hex SHA-256 digest (content hashes, prompt/packet hashes). */
export const sha256Hex = z
  .string()
  .regex(/^[0-9a-f]{64}$/, "expected a lowercase sha256 hex digest");

/**
 * Git object id. The frozen dataset schema (`docs/dataset/02_case_schema.json`)
 * fixes this at the SHA-1 form, so the contract matches it exactly.
 */
export const commitSha = z
  .string()
  .regex(/^[0-9a-f]{40}$/, "expected a 40-character git commit sha");

/**
 * ISO-8601 timestamp with timezone. Written to Postgres `tstz` columns, so a
 * timezone offset (or `Z`) is mandatory.
 */
export const isoDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/,
    "expected an ISO-8601 timestamp with a timezone offset",
  );

/** Link confidence in [0, 1]; see `source_class` for how it was obtained. */
export const confidence = z.number().min(0).max(1);

/** Non-empty, non-whitespace text (labels, keys, human-readable ids). */
export const nonEmpty = z.string().min(1, "expected a non-empty string");

/**
 * `jsonb` payload columns (`nodes.payload`, `edges.metadata`,
 * `artifact_snapshots.content`, `events.references` when free-form).
 *
 * Keyed by string because these are vendor-shaped records whose vocabulary is
 * owned by the adapter, not by this package.
 */
export const jsonb = z.record(z.string(), z.unknown());
