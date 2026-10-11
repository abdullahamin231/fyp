import { describe, expect, it } from "vitest";
import { canTransitionFinding, findingResolutionSchema, findingSchema } from "../src/index.js";
import { ACTOR_ID, NODE_ID, VERDICT_ID, uniqueId } from "./fixtures.js";

const baseFinding = {
  id: "00000000-0000-4000-8000-00000000000a",
  subjectNodeId: NODE_ID,
  origin: "rule",
  ruleId: "RULE_1",
  ruleVersion: 3,
  verdictId: null,
  kind: "design_version_drift",
  idempotencyKey: "RULE_1@3:nodes:00000000-0000-4000-8000-000000000002:payload.versionId:3",
  annotation: "PR #244 implements Design v4.1, but v4.2 is current.",
  severity: "high",
  state: "open",
  createdAt: "2026-10-09T10:05:00Z",
  supersededById: null,
} as const;

describe("findings (FR-12, FR-15, FR-18)", () => {
  it("parses a rule-origin finding", () => {
    expect(findingSchema.parse(baseFinding).origin).toBe("rule");
  });

  it("parses a verdict-origin finding", () => {
    const verdictFinding = {
      ...baseFinding,
      origin: "verdict",
      ruleId: null,
      ruleVersion: null,
      verdictId: VERDICT_ID,
      kind: "requirement_implementation_divergence",
    };
    expect(findingSchema.safeParse(verdictFinding).success).toBe(true);
  });

  it("rejects a finding with both a rule and a verdict as its origin", () => {
    const both = { ...baseFinding, verdictId: VERDICT_ID };
    expect(findingSchema.safeParse(both).success).toBe(false);
  });

  it("rejects a rule-origin finding without a rule version", () => {
    const noVersion = { ...baseFinding, ruleVersion: null };
    expect(findingSchema.safeParse(noVersion).success).toBe(false);
  });

  it("rejects a verdict-origin finding that still names a rule", () => {
    const mixed = { ...baseFinding, origin: "verdict", verdictId: VERDICT_ID };
    expect(findingSchema.safeParse(mixed).success).toBe(false);
  });

  it("keeps idempotencyKey required so repeated triggers converge (FR-15)", () => {
    const { idempotencyKey: _dropped, ...withoutKey } = baseFinding;
    expect(findingSchema.safeParse(withoutKey).success).toBe(false);
  });

  it("allows the five FR-18 transitions from open", () => {
    expect(canTransitionFinding("open", "acknowledged")).toBe(true);
    expect(canTransitionFinding("open", "resolved")).toBe(true);
    expect(canTransitionFinding("open", "disputed")).toBe(true);
    expect(canTransitionFinding("open", "suppressed")).toBe(true);
  });

  it("refuses a transition the lifecycle does not define", () => {
    expect(canTransitionFinding("suppressed", "resolved")).toBe(false);
    expect(canTransitionFinding("resolved", "suppressed")).toBe(false);
  });

  it("treats superseded as reachable from any non-terminal state and terminal itself", () => {
    for (const from of ["open", "acknowledged", "resolved", "disputed", "suppressed"] as const) {
      expect(canTransitionFinding(from, "superseded")).toBe(true);
    }
    expect(canTransitionFinding("superseded", "open")).toBe(false);
    expect(canTransitionFinding("superseded", "resolved")).toBe(false);
  });

  it("pairs state = superseded with supersededById in both directions (ERD CHECK)", () => {
    const superseded = { ...baseFinding, state: "superseded", supersededById: uniqueId() };
    expect(findingSchema.safeParse(superseded).success).toBe(true);

    // named a replacement but not marked superseded
    const namedOnly = { ...baseFinding, supersededById: uniqueId() };
    expect(findingSchema.safeParse(namedOnly).success).toBe(false);

    // marked superseded but naming nothing
    const stateOnly = { ...baseFinding, state: "superseded" };
    expect(findingSchema.safeParse(stateOnly).success).toBe(false);
  });

  it("requires a reason on every resolution record (FR-18)", () => {
    const record = {
      findingId: baseFinding.id,
      from: "open",
      to: "resolved",
      actorId: ACTOR_ID,
      reason: "Anchor re-pinned to the new commit; no divergence remains.",
      at: "2026-10-09T11:00:00Z",
    };
    expect(findingResolutionSchema.safeParse(record).success).toBe(true);

    const { reason: _dropped, ...withoutReason } = record;
    expect(findingResolutionSchema.safeParse(withoutReason).success).toBe(false);
  });
});
