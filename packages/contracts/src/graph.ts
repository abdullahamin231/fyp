import { z } from "zod";
import {
  LINK_STATES,
  NODE_TYPES,
  SOURCE_CLASSES,
  anchorMethodSchema,
  anchorStatusSchema,
  edgeTypeSchema,
  linkStateSchema,
  nodeTypeSchema,
  sourceClassSchema,
} from "./enums.js";
import { confidence, isoDateTime, jsonb, nonEmpty, sha256Hex, uuid } from "./scalars.js";

/**
 * Evidence-graph contracts (ERD `nodes`, `edges`, `artifact_snapshots`,
 * `code_anchors`; domain model §9.1).
 *
 * All entity types are rows of one `nodes` table with a type discriminator and
 * a `jsonb` payload — adding an entity type is a contract change, not a
 * migration in every query path (ch5).
 */

/** Rows of `nodes`. */
export const nodeSchema = z.strictObject({
  id: uuid,
  workspaceId: uuid,
  type: nodeTypeSchema,
  /** Vendor-local id (Jira key, Figma node id, PR number, symbol fqn, …). */
  externalId: nonEmpty,
  /** Vendor-declared version; `null` for entities that are not versioned. */
  version: z.string().min(1).nullable(),
  /** Free-text status (`open`, `in_review`, `merged`, …) as the vendor reports. */
  status: z.string().nullable().optional(),
  /** Owner/assignee handle, or `null` when the vendor reports none. */
  owner: z.string().nullable().optional(),
  lastModified: isoDateTime,
  validFrom: isoDateTime,
  /** `null` while this version is the current one. */
  validTo: isoDateTime.nullable(),
  /** Type-specific fields (see the domain model for each subclass). */
  payload: jsonb,
});
export type Node = z.infer<typeof nodeSchema>;

/** Rows of `edges`. Every association in the domain model is one of these. */
export const edgeSchema = z.strictObject({
  id: uuid,
  fromId: uuid,
  toId: uuid,
  type: edgeTypeSchema,

  /**
   * How the endpoints were established (§9.1). Combined with `linkState` and
   * `confidence` this decides whether the edge may support a decisive finding.
   */
  sourceClass: sourceClassSchema,
  confidence,

  /**
   * Who or what resolved the link. Conventions used across the system:
   * `explicit-reference` (deterministic), `manual:<actor>`,
   * `system:threshold` (FR-28 auto-confirmation), `model:<run-id>` (candidate).
   */
  resolver: nonEmpty,

  linkState: linkStateSchema,
  createdAt: isoDateTime,
  validFrom: isoDateTime,
  validTo: isoDateTime.nullable(),
  metadata: jsonb,
});
export type Edge = z.infer<typeof edgeSchema>;

/**
 * May this edge contribute to a decisive finding? (FR-05 / §9.2.)
 *
 * Unconfirmed or inferred edges may exist — they simply can never be decisive
 * on their own. Auto-confirmed links (FR-28) become decisive by recording
 * `system:threshold` as the resolver, which keeps the decision auditable and
 * reversible rather than implicit.
 */
export function isDecisiveEligibleEdge(edge: Pick<Edge, "sourceClass" | "linkState" | "resolver">): boolean {
  if (edge.linkState !== "active") return false;
  if (edge.sourceClass === "unresolved") return false;
  if (edge.sourceClass === "model_candidate") {
    return edge.resolver === "system:threshold" || edge.resolver.startsWith("manual:");
  }
  return true;
}

/** Association class on `SATISFIES`: one commit-pinned code location (§22.1). */
export const codeAnchorSchema = z
  .strictObject({
    id: uuid,
    /** The `SATISFIES` edge this anchor pins. */
    edgeId: uuid,
    /** Previous anchor in the re-anchoring chain; `null` for the first one. */
    prevAnchorId: uuid.nullable(),

    repo: nonEmpty,
    filePath: nonEmpty,
    symbolFqn: nonEmpty,

    /**
     * Line range of the anchored symbol. `null` for NFR anchors, which link to
     * an enforcement point and a verifying test instead of a line range
     * (§22.4) — that is why both are nullable here.
     */
    startLine: z.number().int().positive().nullable(),
    endLine: z.number().int().positive().nullable(),

    blobHash: nonEmpty,
    commitSha: nonEmpty,
    method: anchorMethodSchema,
    status: anchorStatusSchema,
    confidence,
    /** How the anchor was derived and by what, for the provenance record. */
    provenance: jsonb,
  })
  .refine((a) => a.startLine === null || a.endLine === null || a.startLine <= a.endLine, {
    message: "startLine must be <= endLine",
    path: ["endLine"],
  });
export type CodeAnchor = z.infer<typeof codeAnchorSchema>;

/**
 * Immutable capture of an artefact's content at a point in time
 * (ERD `artifact_snapshots`, FR-03). `UNIQUE (node_id, version)` — a newer
 * version creates a new snapshot; nothing is ever overwritten, which is what
 * keeps a historical finding re-readable against what it actually cited.
 */
export const artifactSnapshotSchema = z.strictObject({
  id: uuid,
  nodeId: uuid,
  /** The event whose processing produced this snapshot. */
  sourceEventId: nonEmpty,
  version: nonEmpty,
  contentHash: sha256Hex,
  capturedAt: isoDateTime,
  /** Content exactly as the source produced it — untrusted, never executed. */
  content: jsonb,
});
export type ArtifactSnapshot = z.infer<typeof artifactSnapshotSchema>;

/** Enum arrays re-exported for consumers that build pickers/DB migrations. */
export const nodeTypes = NODE_TYPES;
export const sourceClasses = SOURCE_CLASSES;
export const linkStates = LINK_STATES;
