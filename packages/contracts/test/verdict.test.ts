import { describe, expect, it } from "vitest";
import {
  gatedVerdictSchema,
  isAbstention,
  unresolvedCitations,
  verifierOutputSchema,
} from "../src/index.js";
import { baseGatedVerdict, basePacket, baseSpan, baseVerifierOutput } from "./fixtures.js";

describe("verifier output (strict parsing, §11.8)", () => {
  it("parses a well-formed output", () => {
    const output = verifierOutputSchema.parse(baseVerifierOutput());
    expect(output.status).toBe("SUPPORTED");
    expect(output.evidence).toHaveLength(1);
  });

  it("rejects a malformed output rather than leniently coercing it", () => {
    const { reason: _dropped, ...withoutReason } = baseVerifierOutput();
    expect(verifierOutputSchema.safeParse(withoutReason).success).toBe(false);
  });

  it("rejects an unknown field such as a smuggled citation", () => {
    const result = verifierOutputSchema.safeParse({
      ...baseVerifierOutput(),
      evidenceSpan: { spanId: "fabricated", file: "src/nowhere.ts" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown verdict status", () => {
    const result = verifierOutputSchema.safeParse(baseVerifierOutput({ status: "MAYBE" as never }));
    expect(result.success).toBe(false);
  });

  it("records the temperature verbatim so runs stay comparable (hard gate 2)", () => {
    const output = baseVerifierOutput();
    const settings = { ...output.modelAndRun.settings, temperature: 1.5 };
    const result = verifierOutputSchema.safeParse({
      ...output,
      modelAndRun: { ...output.modelAndRun, settings },
    });
    // A temperature of 1.5 is representable, but must be recorded verbatim —
    // hard gate 2 measures repeat agreement at temperature 0, so the recorded
    // value is what makes a run comparable.
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.modelAndRun.settings.temperature).toBe(1.5);
  });
});

describe("hard gate 1 — a decisive status needs evidence", () => {
  it("treats a decisive verdict with no citations as an abstention", () => {
    expect(isAbstention(baseVerifierOutput({ evidence: [] }))).toBe(true);
  });

  it("does not treat INSUFFICIENT_EVIDENCE as an abstention", () => {
    expect(isAbstention(baseVerifierOutput({ status: "INSUFFICIENT_EVIDENCE", evidence: [] }))).toBe(false);
  });

  it("accepts a decisive verdict that cites at least one span", () => {
    expect(isAbstention(baseVerifierOutput({ status: "CONTRADICTED" }))).toBe(false);
  });
});

describe("citation resolution against the immutable packet (FR-10)", () => {
  it("reports no unresolved citations when every span is in the manifest", () => {
    const packet = basePacket();
    const ids = new Set(packet.manifest.slots.flatMap((slot) => slot.included.map((item) => item.id)));
    expect(unresolvedCitations(baseVerifierOutput(), ids)).toEqual([]);
  });

  it("reports a fabricated citation as unresolved", () => {
    const packet = basePacket();
    const ids = new Set(packet.manifest.slots.flatMap((slot) => slot.included.map((item) => item.id)));
    const fabricated = { ...baseSpan, spanId: "span-that-was-never-shown", contentSha256: "e".repeat(64) };
    const unresolved = unresolvedCitations(baseVerifierOutput({ evidence: [fabricated] }), ids);
    expect(unresolved).toEqual(["span-that-was-never-shown"]);
  });
});

describe("stored gated verdict", () => {
  it("parses a post-gate verdict with separate taxonomy fields", () => {
    const verdict = gatedVerdictSchema.parse(baseGatedVerdict());
    expect(verdict.freshnessState).toBe("CURRENT");
    expect(verdict.reasonCode).toBeNull();
    expect(verdict.passCount).toBeLessThanOrEqual(3);
  });

  it("rejects a pass count beyond the loop's pass cap (FR-09)", () => {
    const result = gatedVerdictSchema.safeParse(baseGatedVerdict({ passCount: 4 }));
    expect(result.success).toBe(false);
  });

  it("records a downgrade with its reason code rather than hiding it", () => {
    const verdict = gatedVerdictSchema.parse(
      baseGatedVerdict({
        status: "INSUFFICIENT_EVIDENCE",
        gateOutcome: "DOWNGRADED",
        reasonCode: "INVALID_CITATION",
        reviewRequired: true,
      }),
    );
    expect(verdict.reasonCode).toBe("INVALID_CITATION");
    expect(verdict.reviewRequired).toBe(true);
  });

  it("rejects a reason code outside the frozen taxonomy", () => {
    const result = gatedVerdictSchema.safeParse(baseGatedVerdict({ reasonCode: "MISC" as never }));
    expect(result.success).toBe(false);
  });
});
