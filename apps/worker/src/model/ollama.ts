import {
  ModelUnavailableError,
  type ModelCall,
  type ModelClient,
  type ModelDescriptor,
  type ModelResult,
} from "./types.js";

export interface OllamaOptions {
  model: string;
  baseUrl?: string;
  temperature?: number;
  timeoutMs?: number;
}

export class OllamaModelClient implements ModelClient {
  readonly provider = "ollama" as const;
  private readonly baseUrl: string;

  constructor(private readonly opts: OllamaOptions) {
    if (!opts.model) throw new Error("OllamaModelClient requires a model tag");
    this.baseUrl = (opts.baseUrl ?? "http://127.0.0.1:11434").replace(/\/+$/, "");
  }

  describe(): ModelDescriptor {
    return {
      modelId: `ollama:${this.opts.model}`,
      modelVersion: this.opts.model,
      quantisation: "model-tag-defined",
      tokenizer: "model-defined",
      settings: { temperature: this.opts.temperature ?? 0 },
    };
  }

  async complete(call: ModelCall): Promise<ModelResult> {
    const started = Date.now();
    const controller = new AbortController();
    const timeoutMs = call.timeoutMs || this.opts.timeoutMs || 180_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.opts.model,
          messages: [{ role: "user", content: call.prompt }],
          stream: false,
          format: "json",
          options: { temperature: this.opts.temperature ?? 0 },
        }),
        signal: controller.signal,
      });

      const body = await response.text();
      if (!response.ok) {
        throw new ModelUnavailableError(
          `ollama returned HTTP ${response.status}${body ? `: ${body.slice(-400)}` : ""}`,
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch (error) {
        throw new ModelUnavailableError("ollama returned invalid JSON", { cause: error });
      }

      const record = isRecord(parsed) ? parsed : undefined;
      const message = record && isRecord(record.message) ? record.message : undefined;
      const content = message?.content;
      if (typeof content !== "string" || content.trim() === "") {
        const detail = typeof record?.error === "string" ? `: ${record.error}` : "";
        throw new ModelUnavailableError(`ollama returned no message content${detail}`);
      }

      return { text: content, durationMs: Date.now() - started };
    } catch (error) {
      if (error instanceof ModelUnavailableError) throw error;
      if (controller.signal.aborted) {
        throw new ModelUnavailableError(`ollama timed out after ${timeoutMs}ms`, { cause: error });
      }
      throw new ModelUnavailableError(
        `ollama request failed: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }
  }

}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
