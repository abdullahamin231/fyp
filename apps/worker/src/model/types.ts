import type { VerifierOutput } from "@unify/contracts";
import type { BuiltPacket } from "../packet/builder.js";

/**
 * Model seam.
 *
 * Two implementations exist from day one and neither may ever be allowed to
 * silently degrade into the other:
 *
 *   `StubModelClient`  deterministic, offline — tests, CI, and any run
 *                      without a serving stack
 *   `OpenCodeModelClient` wraps the OpenCode CLI (`opencode run --standalone
 *                      --format json`), which is the serving front-end this
 *                      project uses
 *
 * The contract both obey: **a failed call throws `ModelUnavailableError`** and
 * is reported as `MODEL_UNAVAILABLE`, never as a clean result (ch5). That is
 * the difference between "the model abstained" and "there was no model".
 */
export interface ModelDescriptor {
  modelId: string;
  modelVersion: string;
  quantisation: string;
  tokenizer: string;
  settings: { temperature: number; seed?: number };
}

export interface ModelCall {
  prompt: string;
  timeoutMs: number;
  /** The packet behind the prompt — the stub reasons over it; a real model sees the prompt. */
  packet?: BuiltPacket;
}

export interface ModelResult {
  text: string;
  durationMs: number;
}

export interface ModelClient {
  readonly provider: "stub" | "opencode";
  describe(): ModelDescriptor;
  complete(call: ModelCall): Promise<ModelResult>;
}

export class ModelUnavailableError extends Error {
  readonly code = "MODEL_UNAVAILABLE" as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ModelUnavailableError";
  }
}

export function isModelUnavailable(error: unknown): error is ModelUnavailableError {
  return error instanceof ModelUnavailableError;
}
