import { afterEach, describe, expect, it, vi } from "vitest";
import { WORKER_SETTINGS } from "../src/config.js";
import { OllamaModelClient } from "../src/model/ollama.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OllamaModelClient", () => {
  it("pins the worker to the chosen local Inkling 2 Mini model", () => {
    expect(WORKER_SETTINGS.modelProvider).toBe("ollama");
    expect(WORKER_SETTINGS.model).toBe("inkling-2-mini:26b-a5b");
  });

  it("sends a deterministic JSON-mode request to the local Ollama API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { content: '{"verdict":"pass"}' } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new OllamaModelClient({ model: "test-model", temperature: 0 });

    const result = await client.complete({ prompt: "verify this", timeoutMs: 1_000 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          model: "test-model",
          messages: [{ role: "user", content: "verify this" }],
          stream: false,
          format: "json",
          options: { temperature: 0 },
        }),
      }),
    );
    expect(result.text).toBe('{"verdict":"pass"}');
    expect(client.describe().modelId).toBe("ollama:test-model");
    expect(client.describe().modelVersion).toBe("test-model");
  });

  it("reports an unavailable local server instead of returning a fallback result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));
    const client = new OllamaModelClient({ model: "test-model" });

    await expect(client.complete({ prompt: "verify this", timeoutMs: 1_000 })).rejects.toThrow(
      "ollama request failed: connection refused",
    );
  });

  it("reports Ollama API errors explicitly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("model not found", { status: 404 })),
    );
    const client = new OllamaModelClient({ model: "missing-model" });

    await expect(client.complete({ prompt: "verify this", timeoutMs: 1_000 })).rejects.toThrow(
      "ollama returned HTTP 404",
    );
  });

  it("rejects malformed or empty model responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 200 })));
    const client = new OllamaModelClient({ model: "test-model" });

    await expect(client.complete({ prompt: "verify this", timeoutMs: 1_000 })).rejects.toThrow(
      "ollama returned invalid JSON",
    );
  });

  it("rejects a valid API response without message content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    const client = new OllamaModelClient({ model: "test-model" });

    await expect(client.complete({ prompt: "verify this", timeoutMs: 1_000 })).rejects.toThrow(
      "ollama returned no message content",
    );
  });
});
