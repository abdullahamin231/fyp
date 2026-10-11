import { z } from "zod";
import {
  edgeTypeSchema,
  findingKindSchema,
  nodeTypeSchema,
  notificationChannelSchema,
  personRoleSchema,
  severitySchema,
} from "./enums.js";
import { nonEmpty } from "./scalars.js";

/**
 * Declarative rule contract (ERD `rules`, §9.3, FR-12, FR-19, FR-24).
 *
 * Rules are versioned data, not code: a finding records the rule id *and* the
 * rule version that produced it, so a configuration change can never silently
 * rewrite the meaning of an existing finding (FR-12, FR-19).
 */

/** A delta kind the rule engine can subscribe to (§9.3 indexed dispatch). */
export const TRIGGER_KINDS = [
  "node.created",
  "node.updated",
  "edge.created",
  "edge.updated",
  "edge.revoked",
  "source.stale",
] as const;
export const triggerKindSchema = z.enum(TRIGGER_KINDS);
export type TriggerKind = z.infer<typeof triggerKindSchema>;

export const ruleTriggerSchema = z.strictObject({
  on: triggerKindSchema,
  /**
   * Optional narrowing: only fire for this entity class (e.g. Rules 1–3 care
   * about `PullRequest`, P4 cares about `Requirement`).
   */
  entityType: nodeTypeSchema.nullable().optional(),
});
export type RuleTrigger = z.infer<typeof ruleTriggerSchema>;

/**
 * One declarative guard. Guards are evaluated deterministically against the
 * delta before `condition` is considered; an unmet guard means "not applicable"
 * rather than "no finding", so a rule never fires outside its grace period.
 */
export const GUARD_OPS = [
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "changed",
  "unchanged_for",
] as const;
export const guardOpSchema = z.enum(GUARD_OPS);
export type GuardOp = z.infer<typeof guardOpSchema>;

export const guardSchema = z
  .strictObject({
    /** Dotted path into the delta, e.g. `payload.versionId`, `status`. */
    path: nonEmpty,
    op: guardOpSchema,
    /** Compared value; required for every op except `changed`/`unchanged_for`. */
    value: z.unknown().optional(),
    /** Window for `unchanged_for`, in hours. */
    hours: z.number().int().nonnegative().optional(),
    /** Human-readable restatement, kept so policy screens can explain a rule. */
    description: nonEmpty,
  })
  .refine((g) => g.op !== "unchanged_for" || g.hours !== undefined, {
    message: "op 'unchanged_for' requires hours",
    path: ["hours"],
  })
  .refine((g) => g.hours === undefined || g.op === "unchanged_for", {
    message: "hours is only valid for op 'unchanged_for'",
    path: ["hours"],
  });
export type Guard = z.infer<typeof guardSchema>;

/** Notification routing for a firing rule (FR-14, §9.4 role-edge resolution). */
export const ruleNotifySchema = z.strictObject({
  channels: z.array(notificationChannelSchema).min(1),
  /** Roles resolved over `OWNS` / `ASSIGNED_TO` / `WATCHES` edges. */
  roles: z.array(personRoleSchema).min(1),
  /** Bounded BFS depth over role edges — the committed bound is 1–2 hops. */
  hops: z.number().int().min(1).max(2),
  /** Template id, not rendered text — delivery formats live with the adapter. */
  template: nonEmpty,
});
export type RuleNotify = z.infer<typeof ruleNotifySchema>;

/** A versioned rule record (`rules`, FR-19: every change is versioned). */
export const ruleSchema = z.strictObject({
  id: nonEmpty,
  /** Monotonic version. A finding pins both `id` and `version`. */
  version: z.number().int().positive(),

  /** Human title, e.g. "Design drift after PR merge" — the reviewer surface reads it. */
  title: nonEmpty,
  /** One-sentence description of what the rule catches. */
  description: nonEmpty,

  /** Subscribed edge type; `null` when the rule subscribes by entity only. */
  edgeType: edgeTypeSchema.nullable(),
  trigger: ruleTriggerSchema,
  guards: z.array(guardSchema),
  /**
   * Deterministic condition expression over the delta and the guard results.
   * Evaluated by the rule engine, never by a model.
   */
  condition: nonEmpty,

  /** Grace period applied before the rule may fire (FR-24 uses it too). */
  gracePeriodHours: z.number().int().nonnegative(),

  /** The finding kind this rule produces. */
  produces: findingKindSchema,
  severity: severitySchema,
  notify: ruleNotifySchema,

  /** Resolution options offered on the finding (FR-18 vocabulary). */
  resolutionOptions: z.array(nonEmpty).min(1),
  active: z.boolean(),
});
export type Rule = z.infer<typeof ruleSchema>;
