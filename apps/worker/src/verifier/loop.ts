import { randomUUID } from "node:crypto";
import { verifierOutputSchema, type StopReason, type VerifierOutput } from "@unify/contracts";
import { extractJson } from "../model/extract.js";
import type { ModelClient, ModelDescriptor } from "../model/types.js";
import type { BuiltPacket } from "../packet/builder.js";
import { passPrompt, passPromptHash } from "./prompts.js";
import { modelOutputSchema, scopeOutputSchema, type ModelOutput } from "./schemas.js";

/**
 * The bounded verifier loop (FR-09, §11.4–§11.6) — at most three passes, each
 * with a logged reason to stop:
 *
 *   pass 1 · scope      does the packet contain applicable evidence at all?
 *                       No → stop `NO_APPLICABLE_EVIDENCE`, abstain.
 *   pass 2 · verify     the verdict, with citations resolved to packet spans.
 *   pass 3 · critic     only when something is off — the finding is disputed,
 *                       the verdict is PARTIAL, it is decisive but weakly
 *                       cited, or it admits missing evidence. The critic may
 *                       only lower a status, and its answer is the final one.
 *
 * Three failure modes are treated as *failures*, never as answers:
 *
 *   • the model cannot be reached → `MODEL_UNAVAILABLE`, abstention (ch5)
 *   • the reply is not the JSON schema → `MALFORMED_OUTPUT`, handed to the
 *     gate raw so check 1 rejects it (§11.8) — nothing is repaired
 *   • the loop exceeds its pass cap → `PASS_CAP_REACHED`
 *
 * Everything the loop hands to the gate is recorded per pass in
 * `PassRecord`, which the runner writes to `verifier_passes`.
 */
export interface PassRecord {
  passNo: number;
  promptHash: string;
  inputRefs: Record<string, unknown>;
  rawOutput: unknown | null;
  parsedOk: boolean;
  stopReason: StopReason | null;
  modelAndRun: VerifierOutput["modelAndRun"] | null;
  durationMs: number;
}

export interface LoopResult {
  /**
   * What the gate must parse. A valid `VerifierOutput` when the loop had one;
   * otherwise the malformed value itself, so check 1 rejects it verbatim.
   */
  gateInput: unknown;
  /** Parsed output when the loop produced one; `null` means the gate will reject. */
  output: VerifierOutput | null;
  stopReason: StopReason;
  passCount: number;
  passes: PassRecord[];
  unavailable: boolean;
}

export interface LoopOptions {
  model: ModelClient;
  packet: BuiltPacket;
  criterionId: string;
  timeoutMs: number;
  /** A decisive verdict citing ≤ this many spans triggers the critic. */
  weakCitationThreshold: number;
  /** The finding is disputed → always run the critic. */
  disputed?: boolean;
  /** Injectable for deterministic tests. */
  now?: () => number;
  uuid?: () => string;
}

function runMeta(
  descriptor: ModelDescriptor,
  runId: string,
  startedAt: string,
  durationMs: number,
): VerifierOutput["modelAndRun"] {
  return {
    runId,
    modelId: descriptor.modelId,
    modelVersion: descriptor.modelVersion,
    quantisation: descriptor.quantisation,
    tokenizer: descriptor.tokenizer,
    settings: { temperature: descriptor.settings.temperature },
    startedAt,
    durationMs,
  };
}

/** Abstention used when there is no model answer to grade at all. */
function abstention(
  criterionId: string,
  reason: string,
  missingEvidence: string,
  meta: VerifierOutput["modelAndRun"],
): VerifierOutput {
  return verifierOutputSchema.parse({
    criterionId,
    status: "INSUFFICIENT_EVIDENCE",
    evidence: [],
    reason,
    missingEvidence,
    divergenceTag: null,
    modelAndRun: meta,
  });
}

type Extracted = { ok: true; value: unknown } | { ok: false; error: Error };

function safeExtract(text: string): Extracted {
  try {
    return { ok: true, value: extractJson(text) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function runVerifierLoop(opts: LoopOptions): Promise<LoopResult> {
  const now = opts.now ?? Date.now;
  const uuid = opts.uuid ?? randomUUID;
  const descriptor = opts.model.describe();
  const runId = uuid();
  const passes: PassRecord[] = [];
  const promptHash = {
    scope: passPromptHash("scope"),
    verify: passPromptHash("verify"),
    critic: passPromptHash("critic"),
  };
  const baseRefs = {
    criterionId: opts.criterionId,
    packetId: opts.packet.packet.id,
    packetHash: opts.packet.packet.packetHash,
    slots: opts.packet.packet.manifest.slots.map((slot) => slot.slot),
    spans: [...opts.packet.itemIds],
  };

  const call = (kind: "scope" | "verify" | "critic", draft?: unknown) =>
    opts.model.complete({
      prompt: passPrompt(kind, opts.packet.promptText, draft),
      timeoutMs: opts.timeoutMs,
      packet: opts.packet,
    });

  // ---- pass 1 · scope --------------------------------------------------------
  const scopeStart = now();
  let scopeText: string;
  try {
    scopeText = (await call("scope")).text;
  } catch (error) {
    const durationMs = Math.max(0, now() - scopeStart);
    const meta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), durationMs);
    passes.push({
      passNo: 1,
      promptHash: promptHash.scope,
      inputRefs: baseRefs,
      rawOutput: null,
      parsedOk: false,
      stopReason: "MODEL_UNAVAILABLE",
      modelAndRun: meta,
      durationMs,
    });
    return {
      gateInput: abstention(
        opts.criterionId,
        `The model server was unreachable (${error instanceof Error ? error.message : String(error)}); no verification ran.`,
        "model unavailable",
        meta,
      ),
      output: null,
      stopReason: "MODEL_UNAVAILABLE",
      passCount: passes.length,
      passes,
      unavailable: true,
    };
  }

  const scopeDuration = Math.max(0, now() - scopeStart);
  const scopeMeta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), scopeDuration);
  const scopeExtracted = safeExtract(scopeText);
  const scopeParsed = scopeExtracted.ok
    ? scopeOutputSchema.safeParse(scopeExtracted.value)
    : null;

  if (!scopeParsed?.success) {
    passes.push({
      passNo: 1,
      promptHash: promptHash.scope,
      inputRefs: baseRefs,
      rawOutput: scopeExtracted.ok ? scopeExtracted.value : scopeText,
      parsedOk: false,
      stopReason: "MALFORMED_OUTPUT",
      modelAndRun: scopeMeta,
      durationMs: scopeDuration,
    });
    return malformedResult(passes, passes.length, "MALFORMED_OUTPUT", scopeExtracted.ok ? scopeExtracted.value : scopeText);
  }

  passes.push({
    passNo: 1,
    promptHash: promptHash.scope,
    inputRefs: baseRefs,
    rawOutput: scopeExtracted.ok ? scopeExtracted.value : null,
    parsedOk: true,
    stopReason: scopeParsed.data.applicable ? null : "NO_APPLICABLE_EVIDENCE",
    modelAndRun: scopeMeta,
    durationMs: scopeDuration,
  });

  if (!scopeParsed.data.applicable) {
    const meta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), scopeDuration);
    const output = abstention(
      opts.criterionId,
      scopeParsed.data.reason,
      scopeParsed.data.missingEvidence ?? "the packet holds no applicable evidence",
      meta,
    );
    return {
      gateInput: output,
      output,
      stopReason: "NO_APPLICABLE_EVIDENCE",
      passCount: passes.length,
      passes,
      unavailable: false,
    };
  }

  // ---- pass 2 · verify -------------------------------------------------------
  const verifyStart = now();
  let verifyText: string;
  try {
    verifyText = (await call("verify")).text;
  } catch (error) {
    const durationMs = Math.max(0, now() - verifyStart);
    const meta = runMeta(descriptor, runId, new Date(verifyStart).toISOString(), durationMs);
    passes.push({
      passNo: 2,
      promptHash: promptHash.verify,
      inputRefs: baseRefs,
      rawOutput: null,
      parsedOk: false,
      stopReason: "MODEL_UNAVAILABLE",
      modelAndRun: meta,
      durationMs,
    });
    return {
      gateInput: abstention(
        opts.criterionId,
        `The model server became unreachable during verification (${error instanceof Error ? error.message : String(error)}).`,
        "model unavailable",
        meta,
      ),
      output: null,
      stopReason: "MODEL_UNAVAILABLE",
      passCount: passes.length,
      passes,
      unavailable: true,
    };
  }

  const verifyDuration = Math.max(0, now() - verifyStart);
  const verifyMeta = runMeta(descriptor, runId, new Date(verifyStart).toISOString(), verifyDuration);
  const verifyExtracted = safeExtract(verifyText);
  const verifyParsed = verifyExtracted.ok
    ? modelOutputSchema.safeParse(verifyExtracted.value)
    : null;

  if (!verifyParsed?.success) {
    passes.push({
      passNo: 2,
      promptHash: promptHash.verify,
      inputRefs: baseRefs,
      rawOutput: verifyExtracted.ok ? verifyExtracted.value : verifyText,
      parsedOk: false,
      stopReason: "MALFORMED_OUTPUT",
      modelAndRun: verifyMeta,
      durationMs: verifyDuration,
    });
    return malformedResult(
      passes,
      passes.length,
      "MALFORMED_OUTPUT",
      verifyExtracted.ok ? verifyExtracted.value : verifyText,
    );
  }

  const draft: ModelOutput = verifyParsed.data;
  passes.push({
    passNo: 2,
    promptHash: promptHash.verify,
    inputRefs: baseRefs,
    rawOutput: draft,
    parsedOk: true,
    stopReason: null,
    modelAndRun: verifyMeta,
    durationMs: verifyDuration,
  });

  // ---- pass 3 · critic, only when something is off ---------------------------
  const decisive = draft.status !== "INSUFFICIENT_EVIDENCE";
  const needsCritic =
    Boolean(opts.disputed) ||
    draft.status === "PARTIAL" ||
    (decisive && draft.evidence.length <= opts.weakCitationThreshold) ||
    draft.missingEvidence !== null;

  if (!needsCritic) {
    const meta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), now() - scopeStart);
    const output = verifierOutputSchema.parse({ ...draft, modelAndRun: meta });
    return {
      gateInput: output,
      output,
      stopReason: "VERIFIED",
      passCount: passes.length,
      passes,
      unavailable: false,
    };
  }

  if (passes.length >= 3) {
    // Defensive: the loop never runs a fourth pass, but the stop reason must
    // exist if the cap is ever hit by a changed control flow.
    const meta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), now() - scopeStart);
    const output = verifierOutputSchema.parse({ ...draft, modelAndRun: meta });
    return {
      gateInput: output,
      output,
      stopReason: "PASS_CAP_REACHED",
      passCount: passes.length,
      passes,
      unavailable: false,
    };
  }

  const criticStart = now();
  let criticText: string;
  try {
    criticText = (await call("critic", draft)).text;
  } catch (error) {
    const durationMs = Math.max(0, now() - criticStart);
    const meta = runMeta(descriptor, runId, new Date(criticStart).toISOString(), durationMs);
    passes.push({
      passNo: 3,
      promptHash: promptHash.critic,
      inputRefs: { ...baseRefs, auditingPass: 2 },
      rawOutput: null,
      parsedOk: false,
      stopReason: "MODEL_UNAVAILABLE",
      modelAndRun: meta,
      durationMs,
    });
    // The draft is still a valid output — a critic outage must not throw away
    // the verified pass 2 answer. The job stops VERIFIED; the pass-3 row
    // records MODEL_UNAVAILABLE, so the reason the critic never ran is still
    // visible per pass.
    const fallback = verifierOutputSchema.parse({ ...draft, modelAndRun: verifyMeta });
    return {
      gateInput: fallback,
      output: fallback,
      stopReason: "VERIFIED",
      passCount: passes.length,
      passes,
      unavailable: false,
    };
  }

  const criticDuration = Math.max(0, now() - criticStart);
  const criticMeta = runMeta(descriptor, runId, new Date(criticStart).toISOString(), criticDuration);
  const criticExtracted = safeExtract(criticText);
  const criticParsed = criticExtracted.ok
    ? modelOutputSchema.safeParse(criticExtracted.value)
    : null;

  if (!criticParsed?.success) {
    passes.push({
      passNo: 3,
      promptHash: promptHash.critic,
      inputRefs: { ...baseRefs, auditingPass: 2 },
      rawOutput: criticExtracted.ok ? criticExtracted.value : criticText,
      parsedOk: false,
      stopReason: "MALFORMED_OUTPUT",
      modelAndRun: criticMeta,
      durationMs: criticDuration,
    });
    return malformedResult(
      passes,
      passes.length,
      "MALFORMED_OUTPUT",
      criticExtracted.ok ? criticExtracted.value : criticText,
    );
  }

  // The critic may only lower a status (§11.6). The gate enforces the same
  // invariant; enforcing it here too keeps `stopReason` honest.
  const finalDraft = lowerOnly(draft, criticParsed.data);
  passes.push({
    passNo: 3,
    promptHash: promptHash.critic,
    inputRefs: { ...baseRefs, auditingPass: 2, lowered: finalDraft.status !== criticParsed.data.status },
    rawOutput: finalDraft,
    parsedOk: true,
    stopReason: "CRITIC_REVIEWED",
    modelAndRun: criticMeta,
    durationMs: criticDuration,
  });

  const meta = runMeta(descriptor, runId, new Date(scopeStart).toISOString(), now() - scopeStart);
  const output = verifierOutputSchema.parse({ ...finalDraft, modelAndRun: meta });
  return {
    gateInput: output,
    output,
    stopReason: "CRITIC_REVIEWED",
    passCount: passes.length,
    passes,
    unavailable: false,
  };
}

const RANK: Record<ModelOutput["status"], number> = {
  INSUFFICIENT_EVIDENCE: 1,
  PARTIAL: 2,
  SUPPORTED: 3,
  CONTRADICTED: 3,
};

/** Keep whichever answer is weaker; equal rank keeps the critic's answer. */
function lowerOnly(draft: ModelOutput, critic: ModelOutput): ModelOutput {
  return RANK[critic.status] < RANK[draft.status] ? critic : draft;
}

function malformedResult(
  passes: PassRecord[],
  passCount: number,
  stopReason: StopReason,
  raw: unknown,
): LoopResult {
  return { gateInput: raw, output: null, stopReason, passCount, passes, unavailable: false };
}
