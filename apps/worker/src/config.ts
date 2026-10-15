import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { PACKET_SLOTS, type PacketSlot } from "@unify/contracts";

/**
 * Worker configuration.
 *
 * **Operational values are hardcoded in this file, not read from `.env`.** A
 * verification run's inputs must be a recorded decision, not something a shell
 * export can flip between restarts — which is what made the mid-evaluation
 * story ("the same packet always gives the same answer") fragile. Change a
 * number here, commit it, and the change is in the repository history.
 *
 * The environment holds exactly the three things that must never be committed:
 * the Supabase URL, the service-role key, and (only for private repositories)
 * a read-only git token.
 */

/**
 * Fixed operational settings. Everything here is a deliberate, recorded
 * decision — see `docs/` and the report's configuration section for the
 * rationale of each value.
 */
export const WORKER_SETTINGS = {
  /**
   * `stub` = deterministic offline model; `opencode` = the real CLI runner.
   * There is deliberately no silent fallback between the two: if this says
   * `opencode` and the CLI is unreachable, jobs finish with MODEL_UNAVAILABLE
   * rather than quietly downgrading to the stub.
   */
  modelProvider: "stub" as "stub" | "opencode",
  /** `provider/model` as the OpenCode CLI expects (`-m`); only used above. */
  model: "opencode/ling-3.1-flash-free",
  /** One model call, end to end (the bound the loop enforces per pass). */
  modelTimeoutMs: 180_000,
  /** Queue poll cadence. */
  pollIntervalMs: 3_000,

  /** Total packet budget; per-slot budgets below must sum under it. */
  tokenBudget: 8_000,
  /**
   * Per-slot budgets (TODO §1.7). Sum = 7200, deliberately under the 8000
   * total so the global eviction pass is a safety net rather than the normal
   * path.
   */
  slotBudgets: {
    REQUIREMENT_TEXT: 600,
    DESIGN_CONSTRAINTS: 400,
    TEST_EVIDENCE: 1200,
    SYMBOL_CARDS: 1800,
    DIFF_HUNKS: 2400,
    GRAPH_NEIGHBOURHOOD: 400,
    POLICY_DEFINITION: 400,
  } as Record<PacketSlot, number>,
  /** A decisive verdict citing this few spans triggers the pass-3 critic. */
  weakCitationThreshold: 1,
  /** Stop polling after this many consecutive empty claims (used by `once`). */
  maxIdleClaims: 1,

  // ---- evidence enrichment (analyser on claim) ------------------------------
  /**
   * A claimed job with no code/test evidence in the graph triggers the
   * analyser for the job's (repo, base, head): the worker clones the
   * repository, fetches both commits, analyses, and publishes nodes.
   */
  analysisEnabled: true,
  /** Where repositories are cloned/cached for analysis. */
  repoCacheDir: join(homedir(), ".cache", "unify", "repos"),
  /** Timeout for the analysis target's test command at head. */
  analysisTestTimeoutMs: 600_000,
} as const;

/** Secrets only. `.env` (gitignored) holds the values; nothing else does. */
const secretSchema = z.object({
  supabaseUrl: z.string().url(),
  serviceRoleKey: z.string().min(1),
  gitToken: z.string().optional(),
});

export const configSchema = z.object({
  ...secretSchema.shape,
  modelProvider: z.enum(["stub", "opencode"]),
  model: z.string().min(1),
  modelTimeoutMs: z.number().int().positive(),
  pollIntervalMs: z.number().int().positive(),
  tokenBudget: z.number().int().positive(),
  slotBudgets: z.record(z.enum(PACKET_SLOTS), z.number().int().positive()),
  weakCitationThreshold: z.number().int().min(0),
  maxIdleClaims: z.number().int().positive(),
  analysisEnabled: z.boolean(),
  repoCacheDir: z.string().min(1),
  analysisTestTimeoutMs: z.number().int().positive(),
});

export type Config = z.infer<typeof configSchema>;

/** Kept for the tests and report: the fixed per-slot budgets, verbatim. */
export const DEFAULT_SLOT_BUDGETS = WORKER_SETTINGS.slotBudgets;

/**
 * Read `.env` from the working directory, if one exists.
 *
 * Node ≥ 20.12 ships this — no dependency needed. Values already exported in
 * the shell win over the file, so a one-off override still works. Without this
 * the entry points ran with an empty environment unless every variable was
 * exported by hand, which is exactly the failure mode `.env.example` invites.
 */
function loadDotEnv(): void {
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env (or unreadable): the three secrets must come from the real
    // environment — that is the case under systemd, where they live in the
    // unit's EnvironmentFile.
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  loadDotEnv();
  return configSchema.parse({
    supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY,
    gitToken: env.ANALYSIS_GIT_TOKEN?.trim() || undefined,
    ...WORKER_SETTINGS,
  });
}
