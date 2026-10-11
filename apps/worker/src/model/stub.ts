import type { BuiltPacket } from "../packet/builder.js";
import {
  ModelUnavailableError,
  type ModelCall,
  type ModelClient,
  type ModelDescriptor,
  type ModelResult,
} from "./types.js";

/**
 * Deterministic stub model — the offline half of the model seam.
 *
 * It reads the same rendered packet a real model would and answers from the
 * evidence itself: a passing test makes the change SUPPORTED, a failing one
 * CONTRADICTED, code with no test PARTIAL, and an empty packet is never
 * applicable. Same packet in → same answer out, which is what makes the
 * pipeline (packet → loop → gate → verdict) testable end to end without a
 * serving stack, and what keeps CI honest when no GPU is available.
 *
 * It also lets a demo *pretend* to be a badly-behaved model — `fabricate`
 * invents a citation the packet never contained (T10), and `forceStatus`
 * claims a verdict the evidence does not support — so the gate's enforcement
 * can be demonstrated rather than asserted.
 */
export interface StubOptions {
  /** T10: inject citations the packet never contained. */
  fabricate?: "none" | "extra" | "only";
  /** Claim a status regardless of the evidence (demo of a confident-but-wrong model). */
  forceStatus?: "SUPPORTED" | "CONTRADICTED" | "PARTIAL" | "INSUFFICIENT_EVIDENCE";
  /** Run this many times identically before succeeding — exercises pass counting. */
  modelId?: string;
  /** Simulate an unreachable model server. */
  unavailable?: boolean;
}

interface AdmittedItem {
  id: string;
  slot: string;
  tokens: number;
  content: string;
  file?: string;
  symbol?: string;
  startLine?: number;
  endLine?: number;
  contentSha256?: string;
}

function admitted(packet: BuiltPacket): AdmittedItem[] {
  const out: AdmittedItem[] = [];
  for (const slot of packet.packet.manifest.slots) {
    for (const item of slot.included) {
      const content = packet.contentById.get(item.id) ?? "";
      out.push({
        id: item.id,
        slot: slot.slot,
        tokens: item.tokens,
        content,
        ...(item.cite?.file ? { file: item.cite.file } : {}),
        ...(item.cite?.symbol ? { symbol: item.cite.symbol } : {}),
        ...(item.cite?.startLine ? { startLine: item.cite.startLine } : {}),
        ...(item.cite?.endLine ? { endLine: item.cite.endLine } : {}),
        ...(item.contentSha256 ? { contentSha256: item.contentSha256 } : {}),
      });
    }
  }
  return out;
}

/** Exactly the `evidenceSpanSchema` shape — no more fields than the contract. */
function spanFor(item: AdmittedItem): Record<string, unknown> {
  return {
    spanId: item.id,
    slot: item.slot,
    file: item.file ?? "(unknown)",
    ...(item.symbol ? { symbol: item.symbol } : {}),
    startLine: item.startLine ?? 1,
    endLine: item.endLine ?? item.startLine ?? 1,
    contentSha256: item.contentSha256 ?? "a".repeat(64),
  };
}

/** T10's citation into thin air: an id, file and hash the packet never held. */
function fabricatedSpan(index: number): Record<string, unknown> {
  return {
    spanId: `ghost-span-${index}`,
    slot: "DIFF_HUNKS",
    file: "src/nowhere.ts",
    startLine: 999,
    endLine: 1001,
    contentSha256: "e".repeat(64),
  };
}

/** Pure decision function — exported so tests can assert the stub's behaviour. */
export function stubAnswer(
  packet: BuiltPacket,
  criterionId: string,
  opts: StubOptions,
): Record<string, unknown> {
  const items = admitted(packet);
  const code = items.filter((i) => i.slot === "DIFF_HUNKS" || i.slot === "SYMBOL_CARDS");
  const tests = items.filter((i) => i.slot === "TEST_EVIDENCE");
  const testPassed = tests.some((i) => i.content.includes("\nPASS\n"));
  const testFailed = tests.some((i) => i.content.includes("\nFAIL\n"));

  let status: string;
  let reason: string;
  let missing: string | null = null;
  let evidence: Record<string, unknown>[] = [];

  if (code.length === 0 && tests.length === 0) {
    status = "INSUFFICIENT_EVIDENCE";
    reason = "The packet contains no changed code or test evidence for this criterion.";
    missing = "no diff hunks or symbol cards in the packet";
  } else if (testFailed) {
    status = "CONTRADICTED";
    reason = "The change breaks an existing test: the test-run evidence records a FAIL.";
    evidence = [...tests, ...code.slice(0, 2)].map(spanFor);
  } else if (testPassed && code.length > 0) {
    status = "SUPPORTED";
    reason = "Changed code is covered by a passing test run recorded in the packet.";
    evidence = [...code.slice(0, 2), ...tests.slice(0, 1)].map(spanFor);
  } else if (code.length > 0) {
    status = "PARTIAL";
    reason = "Changed code is present but no test evidence covers it.";
    missing = "no test exercises the changed symbols";
    evidence = code.slice(0, 2).map(spanFor);
  } else {
    status = "INSUFFICIENT_EVIDENCE";
    reason = "Test evidence exists but the packet carries no code to verify it against.";
    missing = "no diff hunks or symbol cards in the packet";
  }

  if (opts.forceStatus) status = opts.forceStatus;

  const fabricate = opts.fabricate ?? "none";
  if (fabricate === "only") evidence = [fabricatedSpan(1)];
  else if (fabricate === "extra") evidence = [...evidence, fabricatedSpan(404)];

  // Hard gate 2 works because this client is bit-for-bit deterministic: no
  // clock, no randomness, no provider quirks in the answer itself.

  return {
    criterionId,
    status,
    evidence,
    reason,
    missingEvidence: missing,
    divergenceTag: null,
  };
}

export class StubModelClient implements ModelClient {
  readonly provider = "stub" as const;

  constructor(private readonly opts: StubOptions = {}) {}

  describe(): ModelDescriptor {
    return {
      modelId: this.opts.modelId ?? "stub:deterministic",
      modelVersion: "1",
      quantisation: "n/a",
      tokenizer: "chars_div_4_v1",
      settings: { temperature: 0 },
    };
  }

  async complete(call: ModelCall): Promise<ModelResult> {
    const started = Date.now();
    if (this.opts.unavailable) {
      throw new ModelUnavailableError("stub model configured to be unavailable");
    }
    if (!call.packet) {
      // Not a serving failure — a wiring bug. Say so plainly instead of
      // reporting MODEL_UNAVAILABLE and hiding the cause.
      throw new Error("StubModelClient requires the rendered packet on every call");
    }

    const isScope = call.prompt.includes("pass: scope");
    const answer: Record<string, unknown> = isScope
      ? scopeAnswer(call.packet)
      : stubAnswer(call.packet, call.packet.packet.criterionNodeId, this.opts);

    return {
      text: JSON.stringify(answer),
      durationMs: Math.max(0, Date.now() - started),
    };
  }
}

function scopeAnswer(packet: BuiltPacket): Record<string, unknown> {
  const items = admitted(packet);
  const applicable = items.some(
    (i) => i.slot === "DIFF_HUNKS" || i.slot === "SYMBOL_CARDS" || i.slot === "TEST_EVIDENCE",
  );
  return {
    applicable,
    reason: applicable
      ? "The packet contains code and/or test evidence for this criterion."
      : "The packet has no code or test evidence to verify against.",
    missingEvidence: applicable ? null : "packet carried no DIFF_HUNKS, SYMBOL_CARDS or TEST_EVIDENCE",
  };
}
