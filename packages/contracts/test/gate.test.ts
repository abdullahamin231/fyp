import { describe, expect, it } from "vitest";
import type { GateContext, VerifierOutput } from "../src/index.js";
import { gate, isRejected, repeatAgreement } from "../src/index.js";
import { basePacket, baseSpan, baseVerifierOutput, PACKET_ID, VERDICT_ID } from "./fixtures.js";

/** Every citation handle the fixture packet actually contains. */
function manifestIds(): Set<string> {
  const packet = basePacket();
  return new Set(packet.manifest.slots.flatMap((slot) => slot.included.map((item) => item.id)));
}

function gateCtx(overrides: Partial<GateContext> = {}): GateContext {
  return {
    verdictId: VERDICT_ID,
    packetId: PACKET_ID,
    manifestItemIds: manifestIds(),
    ruleApplicable: true,
    linksEligible: true,
    thresholdsOk: true,
    freshnessState: "CURRENT",
    passCount: 2,
    stopReason: "VERIFIED",
    ...overrides,
  };
}

describe("gate · check 1 — schema validation (§11.8)", () => {
  it("accepts well-formed verifier output", () => {
    const result = gate(baseVerifierOutput(), gateCtx());
    expect(result.outcome).toBe("PASSED");
    expect(result.verdict.status).toBe("SUPPORTED");
    expect(result.reasons).toEqual([]);
    expect(result.checks.map((c) => c.name)).toEqual([
      "schema_validation",
      "citation_resolution",
      "rule_applicability",
      "link_eligibility",
      "freshness",
      "threshold",
      "hard_gate_1",
      "provenance",
    ]);
  });

  it("rejects malformed output outright instead of coercing it", () => {
    const { reason: _dropped, ...broken } = baseVerifierOutput();
    const result = gate(broken, gateCtx());
    expect(result.outcome).toBe("REJECTED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.gateOutcome).toBe("REJECTED");
    expect(result.verdict.reason).toMatch(/schema validation/i);
    expect(result.checks[0]).toMatchObject({ name: "schema_validation", ok: false });
  });

  it("rejects output carrying an unknown field (smuggled citation)", () => {
    const result = gate(
      { ...baseVerifierOutput(), evidenceSpan: { spanId: "nope" } },
      gateCtx(),
    );
    expect(result.outcome).toBe("REJECTED");
  });

  it("never stores an unparseable run as decisive", () => {
    const result = gate({ nonsense: true }, gateCtx());
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.evidence).toEqual([]);
    expect(isRejected(result)).toBe(true);
  });
});

describe("gate · check 2 — citation resolution against the packet (FR-10)", () => {
  it("passes when every citation resolves", () => {
    const result = gate(baseVerifierOutput(), gateCtx());
    const citationCheck = result.checks.find((c) => c.name === "citation_resolution");
    expect(citationCheck?.ok).toBe(true);
    expect(result.verdict.evidence).toHaveLength(1);
  });

  it("downgrades a fabricated citation and drops it from the stored evidence", () => {
    const fabricated = {
      ...baseSpan,
      spanId: "span-that-was-never-shown",
      contentSha256: "e".repeat(64),
    };
    const result = gate(baseVerifierOutput({ evidence: [fabricated] }), gateCtx());

    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("INVALID_CITATION");
    expect(result.verdict.reviewRequired).toBe(true);
    expect(result.verdict.evidence).toEqual([]);
    expect(result.verdict.gateOutcome).toBe("DOWNGRADED");
  });

  it("downgrades when the cited text does not match the packet's content hash", () => {
    const shas = new Map([[baseSpan.spanId, "f".repeat(64)]]);
    const result = gate(
      baseVerifierOutput(),
      gateCtx({ manifestContentShas: shas }),
    );
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.reasonCode).toBe("INVALID_CITATION");
    expect(result.verdict.evidence).toEqual([]);
  });

  it("keeps valid spans when only some citations are fabricated (T10)", () => {
    const valid = baseSpan;
    const fabricated = { ...baseSpan, spanId: "ghost-span", contentSha256: "e".repeat(64) };
    const result = gate(
      baseVerifierOutput({ evidence: [valid, fabricated] }),
      gateCtx(),
    );
    expect(result.verdict.evidence.map((s) => s.spanId)).toEqual([valid.spanId]);
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("INVALID_CITATION");
  });
});

describe("gate · check 3 — applicability, eligibility, freshness, thresholds", () => {
  it("downgrades when the governing rule does not apply", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ ruleApplicable: false }));
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("OTHER");
  });

  it("downgrades when the supporting link is not decisive-eligible (FR-05)", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ linksEligible: false }));
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.reasonCode).toBe("AMBIGUOUS_LINK");
    expect(result.checks.find((c) => c.name === "link_eligibility")?.ok).toBe(false);
  });

  it("downgrades a stale source to INSUFFICIENT_EVIDENCE with SOURCE_STALE (UC-01)", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ freshnessState: "STALE" }));
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("SOURCE_STALE");
    expect(result.verdict.freshnessState).toBe("STALE");
    expect(result.verdict.reviewRequired).toBe(true);
  });

  it("holds a below-threshold verdict as AMBIGUOUS_LINK", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ thresholdsOk: false }));
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.reasonCode).toBe("AMBIGUOUS_LINK");
  });

  it("keeps UNKNOWN freshness decisive but forces a human review", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ freshnessState: "UNKNOWN" }));
    expect(result.outcome).toBe("PASSED");
    expect(result.verdict.status).toBe("SUPPORTED");
    expect(result.verdict.reviewRequired).toBe(true);
    expect(result.verdict.freshnessState).toBe("UNKNOWN");
  });
});

describe("gate · check 4 — hard gate 1 (100% enforced)", () => {
  it("rejects a decisive status that cites nothing, counting it as an abstention", () => {
    const result = gate(baseVerifierOutput({ evidence: [] }), gateCtx());
    expect(result.outcome).toBe("REJECTED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.evidence).toEqual([]);
    expect(result.checks.find((c) => c.name === "hard_gate_1")?.ok).toBe(false);
  });

  it("downgrades a decisive status whose only citation is fabricated (FR-10, T10)", () => {
    const fabricated = { ...baseSpan, spanId: "ghost", contentSha256: "e".repeat(64) };
    const result = gate(baseVerifierOutput({ evidence: [fabricated] }), gateCtx());
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.gateOutcome).toBe("DOWNGRADED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("INVALID_CITATION");
    expect(result.verdict.evidence).toEqual([]);
  });

  it("lets a genuine abstention through — no evidence required", () => {
    const result = gate(
      baseVerifierOutput({ status: "INSUFFICIENT_EVIDENCE", evidence: [], missingEvidence: "no test covers this criterion" }),
      gateCtx(),
    );
    expect(result.outcome).toBe("PASSED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.gateOutcome).toBe("PASSED");
    expect(result.verdict.missingEvidence).toContain("no test");
  });
});

describe("gate · check 5 — provenance", () => {
  it("stamps the packet, model and pass count onto the stored verdict", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ passCount: 3, stopReason: "CRITIC_REVIEWED" }));
    expect(result.verdict.packetId).toBe(PACKET_ID);
    expect(result.verdict.id).toBe(VERDICT_ID);
    expect(result.verdict.passCount).toBe(3);
    expect(result.verdict.stopReason).toBe("CRITIC_REVIEWED");
    expect(result.verdict.modelAndRun.modelId).toBe("qwen2.5-coder-7b-instruct");
    const provenance = result.checks.find((c) => c.name === "provenance");
    expect(provenance?.detail).toContain(PACKET_ID);
  });

  it("records every check, passed or failed, in evaluation order", () => {
    const result = gate(baseVerifierOutput(), gateCtx({ linksEligible: false }));
    const failed = result.checks.filter((c) => !c.ok).map((c) => c.name);
    expect(failed).toEqual(["link_eligibility"]);
    expect(result.checks.at(-1)?.name).toBe("provenance");
  });
});

describe("gate · the gate may only lower a status", () => {
  const scenarios: [string, unknown, Partial<GateContext>][] = [
    ["clean", baseVerifierOutput(), {}],
    ["stale source", baseVerifierOutput(), { freshnessState: "STALE" }],
    ["ineligible link", baseVerifierOutput(), { linksEligible: false }],
    ["rule not applicable", baseVerifierOutput(), { ruleApplicable: false }],
    ["below threshold", baseVerifierOutput(), { thresholdsOk: false }],
    ["abstention", baseVerifierOutput({ status: "INSUFFICIENT_EVIDENCE", evidence: [] }), {}],
    ["malformed", { nope: 1 }, {}],
  ];

  const rank: Record<string, number> = {
    SUPPORTED: 3,
    CONTRADICTED: 3,
    PARTIAL: 3,
    INSUFFICIENT_EVIDENCE: 1,
  };

  for (const [name, output, ctxOverrides] of scenarios) {
    it(`never raises the status — ${name}`, () => {
      const asked =
        output && typeof output === "object" && "status" in output
          ? String((output as VerifierOutput).status)
          : "INSUFFICIENT_EVIDENCE";
      const result = gate(output, gateCtx(ctxOverrides));
      expect(rank[result.verdict.status] ?? 0).toBeLessThanOrEqual(rank[asked] ?? 1);
    });
  }
});

describe("hard gate 2 — repeat agreement", () => {
  it("reports full agreement for identical runs", () => {
    expect(repeatAgreement([baseVerifierOutput(), baseVerifierOutput(), baseVerifierOutput()])).toBe(1);
  });

  it("reports disagreement below the 95% fitness bar", () => {
    const other = baseVerifierOutput({
      status: "PARTIAL",
      evidence: [{ ...baseSpan, spanId: "other-span" }],
    });
    const agreement = repeatAgreement([baseVerifierOutput(), baseVerifierOutput(), other]);
    expect(agreement).toBeCloseTo(2 / 3, 5);
    expect(agreement).toBeLessThan(0.95);
  });

  it("treats an empty run set as vacuously agreed", () => {
    expect(repeatAgreement([])).toBe(1);
  });
});
