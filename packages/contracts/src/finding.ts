import { z } from "zod";
import {
  findingKindSchema,
  findingOriginSchema,
  findingStateSchema,
  severitySchema,
} from "./enums.js";
import { isoDateTime, nonEmpty, uuid } from "./scalars.js";

/**
 * Finding contract (ERD `findings`, FR-12, FR-15, FR-18).
 *
 * Exactly one of `ruleId`/`verdictId` is set, enforced in the contract as well
 * as by the DB `CHECK` — the schema-level constraint is what stops a worker bug
 * from writing a finding with two origins or none (ch5).
 */

export const findingSchema = z
  .strictObject({
    id: uuid,
    /** The node this finding is about. */
    subjectNodeId: uuid,

    /** Whether a rule or a verdict produced it (ERD `findings.kind`). */
    origin: findingOriginSchema,
    /** Set when `origin === "rule"`, together with the rule version. */
    ruleId: nonEmpty.nullable(),
    ruleVersion: z.number().int().positive().nullable(),
    /** Set when `origin === "verdict"`. */
    verdictId: uuid.nullable(),

    /** `rules.produces` — which of the committed findings this is. */
    kind: findingKindSchema,

    /**
     * Idempotency key (FR-15): identical evidence state and rule/criterion must
     * yield exactly one finding however many times the trigger arrives.
     */
    idempotencyKey: nonEmpty,

    /** Short human-readable statement shown in inboxes and notifications. */
    annotation: nonEmpty,
    severity: severitySchema,
    state: findingStateSchema,
    createdAt: isoDateTime,

    /**
     * The finding that replaced this one (ERD self-reference). Set exactly when
     * `state === "superseded"` — the DB CHECK enforces the same biconditional.
     * Superseding appends rather than overwrites, so the superseded row stays
     * readable against the artifact versions it cited (FR-03 / FR-18).
     */
    supersededById: uuid.nullable(),
  })
  .refine(
    (f) =>
      (f.origin === "rule" && f.ruleId !== null && f.ruleVersion !== null && f.verdictId === null) ||
      (f.origin === "verdict" && f.verdictId !== null && f.ruleId === null && f.ruleVersion === null),
    {
      message: "a finding must carry exactly one origin: rule+version or verdict",
      path: ["origin"],
    },
  )
  .refine((f) => (f.state === "superseded") === (f.supersededById !== null), {
    message: "a finding is superseded exactly when it names its replacement",
    path: ["state"],
  });
export type Finding = z.infer<typeof findingSchema>;

/**
 * Transitions allowed by FR-18. Each is recorded with a reason and audited.
 *
 * Superseding is reachable from every non-terminal state: re-verification on a
 * newer commit can replace a finding wherever it currently stands, and the
 * lifecycle diagram draws the arrow from `resolved` only as the common case.
 * `superseded` is terminal — the finding was replaced, so there is nothing
 * further for a reviewer to act on.
 */
export const FINDING_TRANSITIONS: Record<FindingStateKey, readonly FindingStateKey[]> = {
  open: ["acknowledged", "resolved", "disputed", "suppressed", "superseded"],
  acknowledged: ["resolved", "disputed", "suppressed", "open", "superseded"],
  resolved: ["open", "superseded"],
  disputed: ["open", "resolved", "superseded"],
  suppressed: ["open", "superseded"],
  superseded: [],
};

type FindingStateKey = z.infer<typeof findingStateSchema>;

/** Whether a reviewer action is legal from the current state (FR-18). */
export function canTransitionFinding(
  from: FindingStateKey,
  to: FindingStateKey,
): boolean {
  return FINDING_TRANSITIONS[from].includes(to);
}

/** Reason required on every reviewer transition (FR-18: each with a reason). */
export const findingResolutionSchema = z.strictObject({
  findingId: uuid,
  from: findingStateSchema,
  to: findingStateSchema,
  /** Actor handle; the audit row references the `Person` node. */
  actorId: uuid,
  reason: nonEmpty,
  at: isoDateTime,
});
export type FindingResolution = z.infer<typeof findingResolutionSchema>;
