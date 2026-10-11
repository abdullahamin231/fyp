import { describe, expect, it } from "vitest";
import { verifierOutputSchema } from "@unify/contracts";
import { StubModelClient } from "../src/model/stub.js";
import { runVerifierLoop } from "../src/verifier/loop.js";
import { passPromptHash } from "../src/verifier/prompts.js";
import { CRITERION_ID, demoPacket, fixedRun, scriptedModel } from "./helpers.js";

const base = { criterionId: CRITERION_ID, timeoutMs: 5000, weakCitationThreshold: 1 };

describe("bounded verifier loop (FR-09)", () => {
  it("runs scope then verify and stops VERIFIED on a clean decisive answer", async () => {
    const packet = await demoPacket();
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: new StubModelClient(),
      packet,
    });

    expect(result.stopReason).toBe("VERIFIED");
    expect(result.passCount).toBe(2);
    expect(result.output?.status).toBe("SUPPORTED");
    expect(result.output?.evidence.length).toBeGreaterThan(1);
    expect(result.passes.map((pass) => pass.passNo)).toEqual([1, 2]);
    expect(result.passes.every((pass) => pass.parsedOk)).toBe(true);
  });

  it("stops after pass 1 when the packet holds no applicable evidence", async () => {
    const packet = await demoPacket({ omitSlots: ["DIFF_HUNKS", "SYMBOL_CARDS", "TEST_EVIDENCE"] });
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: new StubModelClient(),
      packet,
    });

    expect(result.stopReason).toBe("NO_APPLICABLE_EVIDENCE");
    expect(result.passCount).toBe(1);
    expect(result.output?.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.passes[0]?.stopReason).toBe("NO_APPLICABLE_EVIDENCE");
    expect(verifierOutputSchema.safeParse(result.gateInput).success).toBe(true);
  });

  it("runs the critic for a PARTIAL verdict and records why", async () => {
    const packet = await demoPacket({ omitSlots: ["TEST_EVIDENCE"] });
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: new StubModelClient(),
      packet,
    });

    expect(result.output?.status).toBe("PARTIAL");
    expect(result.stopReason).toBe("CRITIC_REVIEWED");
    expect(result.passCount).toBe(3);
    expect(result.passes[2]?.stopReason).toBe("CRITIC_REVIEWED");
  });

  it("runs the critic when the finding is disputed, and stops there", async () => {
    const packet = await demoPacket();
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      disputed: true,
      model: new StubModelClient(),
      packet,
    });
    expect(result.passCount).toBe(3);
    expect(result.stopReason).toBe("CRITIC_REVIEWED");
  });

  it("hands a malformed reply to the gate raw instead of repairing it", async () => {
    const packet = await demoPacket();
    const model = scriptedModel([
      '{"applicable":true,"reason":"code and tests present","missingEvidence":null}',
      "the change looks correct to me, all tests pass",
    ]);
    const result = await runVerifierLoop({ ...base, ...fixedRun, model, packet });

    expect(result.stopReason).toBe("MALFORMED_OUTPUT");
    expect(result.output).toBeNull();
    expect(result.gateInput).toBe("the change looks correct to me, all tests pass");
    expect(result.passes[1]?.parsedOk).toBe(false);
    expect(verifierOutputSchema.safeParse(result.gateInput).success).toBe(false);
  });

  it("reports an unreachable model as MODEL_UNAVAILABLE with an abstention, never a verdict", async () => {
    const packet = await demoPacket();
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: new StubModelClient({ unavailable: true }),
      packet,
    });

    expect(result.unavailable).toBe(true);
    expect(result.stopReason).toBe("MODEL_UNAVAILABLE");
    const parsed = verifierOutputSchema.parse(result.gateInput);
    expect(parsed.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(parsed.evidence).toEqual([]);
    expect(parsed.modelAndRun.modelId).toBe("stub:deterministic");
  });

  it("keeps the verified pass-2 answer when only the critic is unreachable", async () => {
    const packet = await demoPacket({ omitSlots: ["TEST_EVIDENCE"] });
    const firstItem = [...packet.itemIds][0]!;
    const span = {
      spanId: firstItem,
      slot: "DIFF_HUNKS",
      file: "src/cart/total.ts",
      symbol: null,
      startLine: 8,
      endLine: 10,
      contentSha256: packet.contentHashes.get(firstItem)!,
    };
    const model = scriptedModel([
      '{"applicable":true,"reason":"code present","missingEvidence":null}',
      JSON.stringify({
        criterionId: CRITERION_ID,
        status: "PARTIAL",
        evidence: [span],
        reason: "code without test coverage",
        missingEvidence: "no test",
        divergenceTag: null,
      }),
      new Error("opencode timed out after 5000ms"),
    ]);
    const result = await runVerifierLoop({ ...base, ...fixedRun, model, packet });

    expect(result.stopReason).toBe("VERIFIED");
    expect(result.output?.status).toBe("PARTIAL");
    expect(result.passes[2]?.parsedOk).toBe(false);
    expect(result.passes[2]?.stopReason).toBe("MODEL_UNAVAILABLE");
  });

  it("never lets the critic raise a status (downgrade-only, §11.6)", async () => {
    const packet = await demoPacket();
    const itemIds = [...packet.itemIds];
    const span = {
      spanId: itemIds[0]!,
      slot: "DIFF_HUNKS",
      file: "src/cart/total.ts",
      symbol: null,
      startLine: 8,
      endLine: 10,
      contentSha256: packet.contentHashes.get(itemIds[0]!)!,
    };
    const partial = JSON.stringify({
      criterionId: CRITERION_ID,
      status: "PARTIAL",
      evidence: [span],
      reason: "only part of the criterion is evidenced",
      missingEvidence: "no test",
      divergenceTag: null,
    });
    const supported = JSON.stringify({
      criterionId: CRITERION_ID,
      status: "SUPPORTED",
      evidence: [span],
      reason: "everything is fine",
      missingEvidence: null,
      divergenceTag: null,
    });

    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: scriptedModel([
        '{"applicable":true,"reason":"code and tests present","missingEvidence":null}',
        partial,
        supported,
      ]),
      packet,
    });

    expect(result.output?.status).toBe("PARTIAL");
    expect(result.passes[2]?.inputRefs.lowered).toBe(true);
  });

  it("records per-pass prompt hashes that differ by pass and match the template", async () => {
    const packet = await demoPacket();
    const result = await runVerifierLoop({
      ...base,
      ...fixedRun,
      model: new StubModelClient(),
      packet,
    });
    expect(result.passes[0]?.promptHash).toBe(passPromptHash("scope"));
    expect(result.passes[1]?.promptHash).toBe(passPromptHash("verify"));
    expect(result.passes[0]?.promptHash).not.toBe(result.passes[1]?.promptHash);
    expect(result.passes[1]?.promptHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic: identical packets produce identical run metadata", async () => {
    const packet = await demoPacket();
    const run = async () =>
      runVerifierLoop({ ...base, ...fixedRun, model: new StubModelClient(), packet });
    const first = await run();
    const second = await run();
    expect(JSON.stringify(first.output)).toBe(JSON.stringify(second.output));
    expect(JSON.stringify(first.passes)).toBe(JSON.stringify(second.passes));
  });
});
