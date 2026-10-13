import { describe, expect, it } from "vitest";
import { gate, type GateContext } from "@unify/contracts";
import { fixtureBundleSources } from "../src/fixture/bundle.js";
import { StubModelClient, type StubOptions } from "../src/model/stub.js";
import type { ModelClient } from "../src/model/types.js";
import { gateInputsFrom } from "../src/verifier/gateInputs.js";
import { runVerifierLoop } from "../src/verifier/loop.js";
import { findingAnnotation, shouldCreateFinding } from "../src/verifier/persist.js";
import { caseBundle, CRITERION_ID, demoPacket, fixedRun, scriptedModel } from "./helpers.js";

/**
 * End-to-end verification: stub model → bounded loop → gate → verdict.
 *
 * These are the cases the slice exists for. T10 (fabricated citation) must
 * never reach a reviewer as decisive; hard gate 1 must reject a decisive
 * answer that cites nothing; a stale source must show no verdict at all
 * (UC-01); and the model being down must read as "not verified", never as
 * "verified as fine" (ch5).
 */
const base = { criterionId: CRITERION_ID, timeoutMs: 5000, weakCitationThreshold: 1 };
const policy = { upper: 0.85, lower: 0.55 };
const bundle = caseBundle;

async function verify(opts: {
  model?: ModelClient;
  stub?: StubOptions;
  freshness?: "CURRENT" | "STALE" | "UNKNOWN";
  edges?: typeof bundle.edges;
} = {}) {
  const packet = await demoPacket();
  const { summary } = fixtureBundleSources({
    ...bundle,
    ...(opts.freshness ? { freshness: opts.freshness } : {}),
    ...(opts.edges ? { edges: opts.edges } : {}),
  });
  const loop = await runVerifierLoop({
    ...base,
    ...fixedRun,
    model: opts.model ?? new StubModelClient(opts.stub ?? {}),
    packet,
  });
  const inputs = gateInputsFrom(summary, policy);
  const gateContext: GateContext = {
    verdictId: "00000000-0000-4000-8000-00000000e001",
    packetId: packet.packet.id,
    manifestItemIds: packet.itemIds,
    manifestContentShas: packet.contentHashes,
    ...inputs,
    passCount: loop.passCount,
    stopReason: loop.stopReason,
  };
  return { loop, inputs, result: gate(loop.gateInput, gateContext), packet };
}

const decisiveScope = '{"applicable":true,"reason":"code and tests present","missingEvidence":null}';

describe("verifier → gate, end to end", () => {
  it("a passing, well-cited change lands SUPPORTED and needs no reviewer queue entry", async () => {
    const { result, loop } = await verify();
    expect(result.outcome).toBe("PASSED");
    expect(result.verdict.status).toBe("SUPPORTED");
    expect(result.verdict.reviewRequired).toBe(false);
    expect(result.verdict.stopReason).toBe("VERIFIED");
    expect(result.verdict.evidence.length).toBeGreaterThan(1);
    expect(loop.unavailable).toBe(false);
    expect(shouldCreateFinding(result.verdict)).toBe(false);
  });

  it("T10 · a fabricated citation downgrades the verdict and is dropped from evidence", async () => {
    const { result } = await verify({ stub: { fabricate: "extra" } });
    expect(result.outcome).toBe("DOWNGRADED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("INVALID_CITATION");
    expect(result.verdict.reviewRequired).toBe(true);
    expect(result.verdict.evidence.some((span) => span.spanId.startsWith("ghost-span"))).toBe(false);
    expect(shouldCreateFinding(result.verdict)).toBe(true);
  });

  it("T10 · a verdict whose only citations are fabricated still never lands decisive (FR-10)", async () => {
    const { result } = await verify({ stub: { fabricate: "only" } });
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.evidence).toEqual([]);
    expect(["DOWNGRADED", "REJECTED"]).toContain(result.outcome);
  });

  it("hard gate 1 · a decisive verdict citing nothing is rejected as an abstention", async () => {
    const model = scriptedModel([
      decisiveScope,
      JSON.stringify({
        criterionId: CRITERION_ID,
        status: "SUPPORTED",
        evidence: [],
        reason: "the change is obviously correct",
        missingEvidence: null,
        divergenceTag: null,
      }),
    ]);
    const { result } = await verify({ model });

    expect(result.outcome).toBe("REJECTED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.evidence).toEqual([]);
    expect(result.checks.find((check) => check.name === "hard_gate_1")?.ok).toBe(false);
  });

  it("UC-01 · a stale source downgrades the criterion to SOURCE_STALE", async () => {
    const { result } = await verify({ freshness: "STALE" });
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.reasonCode).toBe("SOURCE_STALE");
    expect(result.verdict.freshnessState).toBe("STALE");
    expect(result.verdict.reviewRequired).toBe(true);
  });

  it("an unseen freshness check keeps the verdict but forces a human look", async () => {
    const { result } = await verify({ freshness: "UNKNOWN" });
    expect(result.verdict.status).toBe("SUPPORTED");
    expect(result.verdict.freshnessState).toBe("UNKNOWN");
    expect(result.verdict.reviewRequired).toBe(true);
  });

  it("an ineligible supporting link downgrades the verdict (FR-05)", async () => {
    const ineligible = bundle.edges.map((edge) =>
      edge.to === bundle.criterion.externalId || edge.from === bundle.criterion.externalId
        ? { ...edge, sourceClass: "model_candidate" as const, resolver: "model:test-run" }
        : edge,
    );
    const { result, inputs } = await verify({ edges: ineligible });
    expect(inputs.linksEligible).toBe(false);
    expect(result.verdict.reasonCode).toBe("AMBIGUOUS_LINK");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("a link below the silent-suggestion band fails the threshold check (FR-28)", async () => {
    const { summary } = fixtureBundleSources({
      ...bundle,
      edges: bundle.edges.map((edge) => ({ ...edge, confidence: 0.4 })),
    });
    expect(gateInputsFrom(summary, policy).thresholdsOk).toBe(false);
    expect(gateInputsFrom(summary, { upper: 0.85, lower: 0.1 }).thresholdsOk).toBe(true);
  });

  it("model down · the run abstains with MODEL_UNAVAILABLE instead of a clean result", async () => {
    const { result, loop } = await verify({ stub: { unavailable: true } });
    expect(loop.unavailable).toBe(true);
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.stopReason).toBe("MODEL_UNAVAILABLE");
    expect(result.verdict.evidence).toEqual([]);
    expect(shouldCreateFinding(result.verdict)).toBe(true);
    expect(findingAnnotation(result.verdict, "C-01")).toContain("MODEL_UNAVAILABLE");
  });

  it("a malformed model reply is rejected by the gate, not repaired", async () => {
    const model = scriptedModel([decisiveScope, "looks good to me 👍"]);
    const { result } = await verify({ model });
    expect(result.outcome).toBe("REJECTED");
    expect(result.verdict.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.verdict.stopReason).toBe("MALFORMED_OUTPUT");
    expect(result.checks[0]).toMatchObject({ name: "schema_validation", ok: false });
  });

  it("cites only spans the packet actually contains, with matching content hashes", async () => {
    const { result, packet } = await verify();
    for (const span of result.verdict.evidence) {
      expect(packet.itemIds.has(span.spanId)).toBe(true);
      expect(packet.contentHashes.get(span.spanId)).toBe(span.contentSha256);
    }
  });

  it("is reproducible: the same packet twice yields the same stored verdict", async () => {
    const first = await verify();
    const second = await verify();
    expect(JSON.stringify(first.result.verdict)).toBe(JSON.stringify(second.result.verdict));
    expect(first.packet.packet.packetHash).toBe(second.packet.packet.packetHash);
  });
});
