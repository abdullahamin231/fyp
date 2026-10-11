import type { Config } from "../config.js";
import { OpenCodeModelClient } from "./opencode.js";
import { StubModelClient, type StubOptions } from "./stub.js";
import type { ModelClient } from "./types.js";

/**
 * Model factory: the configured provider, or a hard stop if it is not one of
 * the two this project supports. There is no silent fallback to the stub — a
 * worker that *thinks* it is running the real model and quietly isn't would be
 * the worst possible failure mode for an evidence pipeline.
 */
export function createModelClient(config: Config, stubOptions: StubOptions = {}): ModelClient {
  switch (config.modelProvider) {
    case "stub":
      return new StubModelClient(stubOptions);
    case "opencode":
      return new OpenCodeModelClient({
        model: config.model,
        timeoutMs: config.modelTimeoutMs,
        temperature: 0,
      });
    default: {
      const never: never = config.modelProvider;
      throw new Error(`unsupported MODEL_PROVIDER ${JSON.stringify(never)}`);
    }
  }
}
