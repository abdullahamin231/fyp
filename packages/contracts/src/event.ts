import { z } from "zod";
import { sourceToolSchema } from "./enums.js";
import { commitSha, isoDateTime, jsonb, nonEmpty, sha256Hex, uuid } from "./scalars.js";

/**
 * Normalised event envelope (ERD `events`, proposal §8.3 / FR-01).
 *
 * Every GitHub / Jira / Figma notification and every reconciliation-synthesised
 * gap event is normalised into this one shape before it touches anything else,
 * which is what lets idempotency, versioning and replay be reasoned about in
 * one place instead of per vendor.
 *
 * The table is append-only, and `UNIQUE (source_tool, vendor_delivery_id)`
 * makes duplicate delivery a database-level no-op (ch5).
 */

/** Version of this envelope format; bump when the shape changes incompatibly. */
export const EVENT_SCHEMA_VERSION = 1;

/**
 * A pointer from one event to the artefacts it names (ticket keys in a PR
 * title, a Figma URL in a comment, …). Explicit references are what
 * deterministic linking consumes (FR-04).
 */
export const eventReferenceSchema = z.strictObject({
  sourceTool: sourceToolSchema,
  entityType: nonEmpty,
  entityId: nonEmpty,
  /** Present when the reference carries a resolvable deep link. */
  url: z.url().optional(),
});
export type EventReference = z.infer<typeof eventReferenceSchema>;

export const normalisedEventSchema = z.strictObject({
  /** Envelope format version (`events.schema_version`). */
  schemaVersion: z.number().int().positive().default(EVENT_SCHEMA_VERSION),

  /** Primary key of the append-only `events` table. */
  eventId: nonEmpty,

  /**
   * Delivery id as sent by the vendor (`events.vendor_delivery_id`). Together
   * with `sourceTool` this is unique, so a redelivered webhook cannot insert a
   * second row (FR-02).
   */
  vendorDeliveryId: nonEmpty,

  workspaceId: uuid,

  sourceTool: sourceToolSchema,

  /** Normalised entity class, e.g. `PullRequest`, `Ticket`, `DesignArtifact`. */
  entityType: nonEmpty,
  /** Vendor-local identifier of that entity (key, node id, sha, …). */
  entityId: nonEmpty,

  /**
   * Vendor-declared version of the entity after this event. `null` when the
   * event does not carry one (e.g. a pure comment).
   */
  version: z.string().min(1).nullable(),

  /** Normalised action, e.g. `opened`, `merged`, `commented`, `state_changed`. */
  action: nonEmpty,

  /** State strings before/after the transition; omitted when not a transition. */
  stateBefore: z.string().nullable().optional(),
  stateAfter: z.string().nullable().optional(),

  /** Actor handle as reported by the source tool, or `system` when synthesised. */
  actor: nonEmpty,

  /** When the change happened at the vendor. */
  occurredAt: isoDateTime,
  /** When the envelope was produced by UNIFY — never back-dated. */
  receivedAt: isoDateTime,

  /** Explicit cross-tool references extracted during normalisation. */
  references: z.array(eventReferenceSchema),

  /**
   * SHA-256 of the raw vendor payload as received. The raw payload itself is
   * stored in `artifact_snapshots`, not here — the event row stays small and
   * the content stays immutable.
   */
  rawHash: sha256Hex,
});
export type NormalisedEvent = z.infer<typeof normalisedEventSchema>;

/**
 * Idempotency key implied by `UNIQUE (source_tool, vendor_delivery_id)`.
 *
 * Two deliveries are the same event exactly when their dedupe keys match;
 * ingestion uses this to turn a duplicate into a no-op (FR-02).
 */
export function eventDedupeKey(event: Pick<NormalisedEvent, "sourceTool" | "vendorDeliveryId">): string {
  return `${event.sourceTool}:${event.vendorDeliveryId}`;
}

/** Reference to a commit; kept here because both envelopes and packets use it. */
export const commitReferenceSchema = z.strictObject({
  sha: commitSha,
  message: nonEmpty.optional(),
  authoredAt: isoDateTime.optional(),
});
export type CommitReference = z.infer<typeof commitReferenceSchema>;

/** Free-form `jsonb` helper re-exported for adapter authors. */
export const eventPayloadHint = jsonb;
