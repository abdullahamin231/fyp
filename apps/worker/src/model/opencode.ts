import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ModelUnavailableError,
  type ModelCall,
  type ModelClient,
  type ModelDescriptor,
  type ModelResult,
} from "./types.js";

/**
 * OpenCode CLI model client — the real half of the model seam.
 *
 * Runs `opencode run --standalone --format json --model <provider/model>` in a
 * scratch directory, attaching the rendered packet as a file. The CLI streams
 * newline-delimited JSON events; we keep only the `text` parts and concatenate
 * them, then let the verifier extract and strictly parse the JSON answer.
 *
 * Three properties this client has to guarantee:
 *
 * 1. **Sampling is pinned and recorded.** The CLI has no `--temperature` flag,
 *    but OpenCode's config schema supports per-agent `temperature`/`top_p`, so
 *    the client writes a scratch `opencode.json` that pins it. The value in
 *    `modelAndRun.settings` is therefore something we set, not something we
 *    guessed — which is what makes hard gate 2 (same packet ×3 at temperature
 *    0) a meaningful measurement.
 * 2. **The model cannot act.** `"permission": {"*": "deny"}` plus
 *    `"snapshot": false` leaves it a pure text completion: no tools, no file
 *    writes, no server. Verifying is a reading task.
 * 3. **Failure is loud.** A missing binary, a non-zero exit, a timeout, or an
 *    empty reply all throw `ModelUnavailableError`, which the loop reports as
 *    `MODEL_UNAVAILABLE` — never as a clean verdict (ch5).
 */
export interface OpenCodeOptions {
  /** `provider/model`, exactly as `-m` expects. */
  model: string;
  /** Binary name or path. Defaults to `opencode` on PATH. */
  bin?: string;
  /** Pinned sampling temperature; recorded verbatim in every run's metadata. */
  temperature?: number;
  /** Per-call wall clock budget. */
  timeoutMs?: number;
  /** Parent directory for scratch workspaces. */
  workDir?: string;
  /** CLI version string, if the caller already discovered it. */
  cliVersion?: string;
}

interface NdjsonEvent {
  type?: unknown;
  part?: { type?: unknown; text?: unknown };
}

/** Tolerant NDJSON parse: unknown lines are skipped, never fatal. */
export function parseNdjson(text: string): NdjsonEvent[] {
  const events: NdjsonEvent[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") events.push(parsed as NdjsonEvent);
    } catch {
      // A partial line from a killed process is not an answer; ignore it.
    }
  }
  return events;
}

/** Concatenate the `text` parts of a stream, in arrival order. */
export function textFromEvents(events: readonly NdjsonEvent[]): string {
  return events
    .filter((event) => event.part?.type === "text" && typeof event.part.text === "string")
    .map((event) => event.part?.text as string)
    .join("");
}

export class OpenCodeModelClient implements ModelClient {
  readonly provider = "opencode" as const;
  private cliVersion: string | undefined;

  constructor(private readonly opts: OpenCodeOptions) {
    if (!opts.model) throw new Error("OpenCodeModelClient requires a model (provider/model)");
    this.cliVersion = opts.cliVersion;
  }

  describe(): ModelDescriptor {
    return {
      modelId: `opencode:${this.opts.model}`,
      modelVersion: this.cliVersion ?? "undiscovered",
      quantisation: "provider-managed",
      tokenizer: "provider",
      settings: { temperature: this.opts.temperature ?? 0 },
    };
  }

  async complete(call: ModelCall): Promise<ModelResult> {
    const started = Date.now();
    const bin = this.opts.bin ?? "opencode";
    const dir = await mkdtemp(join(this.opts.workDir ?? tmpdir(), "unify-verify-"));

    try {
      await writeFile(
        join(dir, "opencode.json"),
        `${JSON.stringify(
          {
            $schema: "https://opencode.ai/config.json",
            model: this.opts.model,
            agent: { build: { temperature: this.opts.temperature ?? 0 } },
            // A verifier reads; it does not act on the repository.
            permission: { "*": "deny" },
            snapshot: false,
            share: "disabled",
            autoupdate: false,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await writeFile(join(dir, "packet.txt"), call.prompt, "utf8");

      const { stdout, stderr, code } = await this.spawnOnce(bin, dir, call.timeoutMs);

      if (code !== 0) {
        throw new ModelUnavailableError(
          `opencode exited ${code}${stderr ? `: ${tail(stderr, 400)}` : ""}`,
        );
      }
      if (!this.cliVersion) {
        this.cliVersion = await this.discoverVersion(bin);
      }

      const text = textFromEvents(parseNdjson(stdout));
      if (text.trim() === "") {
        throw new ModelUnavailableError(
          `opencode produced no text output${stderr ? ` (stderr: ${tail(stderr, 200)})` : ""}`,
        );
      }
      return { text, durationMs: Date.now() - started };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  private spawnOnce(
    bin: string,
    cwd: string,
    timeoutMs: number,
  ): Promise<{ stdout: string; stderr: string; code: number | null }> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        bin,
        [
          "run",
          "--standalone",
          "--format",
          "json",
          "--model",
          this.opts.model,
          "--file",
          "packet.txt",
          "Reply with only the JSON object described in the attached evidence packet.",
        ],
        { cwd, stdio: ["ignore", "pipe", "pipe"], timeout: timeoutMs, killSignal: "SIGKILL" },
      );

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      child.on("error", (error: NodeJS.ErrnoException) => {
        reject(
          new ModelUnavailableError(
            error.code === "ENOENT"
              ? `opencode binary ${JSON.stringify(bin)} not found on PATH`
              : `opencode failed to start: ${error.message}`,
            { cause: error },
          ),
        );
      });
      child.on("close", (code, signal) => {
        if (signal === "SIGKILL") {
          reject(new ModelUnavailableError(`opencode timed out after ${timeoutMs}ms`));
          return;
        }
        resolve({ stdout, stderr, code });
      });
    });
  }

  private async discoverVersion(bin: string): Promise<string> {
    return new Promise((resolve) => {
      const child = spawn(bin, ["--version"], { stdio: ["ignore", "pipe", "ignore"] });
      let out = "";
      child.stdout.on("data", (chunk: Buffer) => {
        out += chunk.toString("utf8");
      });
      child.on("error", () => resolve("unknown"));
      child.on("close", () => resolve(out.trim() || "unknown"));
    });
  }
}

function tail(text: string, chars: number): string {
  const trimmed = text.trim();
  return trimmed.length <= chars ? trimmed : `…${trimmed.slice(-chars)}`;
}
