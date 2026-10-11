import { existsSync } from "node:fs";
import { z } from "zod";
import { PACKET_SLOTS, type PacketSlot } from "@unify/contracts";

/**
 * Worker configuration.
 *
 * Everything the pipeline treats as a fixed, recorded decision lives here so a
 * run's inputs are reproducible: budgets, model identity and the pass
 * behaviour. Env vars are the source of truth; this file is where they become
 * typed, defaulted and validated rather than read ad hoc at call sites.
 */

/**
 * Default per-slot budgets (TODO §1.7). Sum = 7200, deliberately under the
 * 8000 default total so the global eviction pass is a safety net rather than
 * the normal path.
 */
export const DEFAULT_SLOT_BUDGETS: Record<PacketSlot, number> = {
  REQUIREMENT_TEXT: 600,
  DESIGN_CONSTRAINTS: 400,
  TEST_EVIDENCE: 1200,
  SYMBOL_CARDS: 1800,
  DIFF_HUNKS: 2400,
  GRAPH_NEIGHBOURHOOD: 400,
  POLICY_DEFINITION: 400,
};

export const configSchema = z.object({
  supabaseUrl: z.string().url(),
  serviceRoleKey: z.string().min(1),
  /** `stub` = deterministic, offline, CI/demo; `opencode` = the local runner. */
  modelProvider: z.enum(["stub", "opencode"]).default("stub"),
  /** `provider/model` as the OpenCode CLI expects (`-m`). */
  model: z.string().min(1).default("opencode/gpt-5-nano"),
  modelTimeoutMs: z.number().int().positive().default(180_000),
  pollIntervalMs: z.number().int().positive().default(3_000),
  tokenBudget: z.number().int().positive().default(8000),
  slotBudgets: z.record(
    z.enum(PACKET_SLOTS),
    z.number().int().positive(),
  ),
  /** A decisive verdict citing this few spans triggers the pass-3 critic. */
  weakCitationThreshold: z.number().int().min(0).default(1),
  /** Stop polling after this many consecutive empty claims (used by `once`). */
  maxIdleClaims: z.number().int().positive().default(1),
});

export type Config = z.infer<typeof configSchema>;

function intOr(env: NodeJS.ProcessEnv, key: string, fallback: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer, got ${JSON.stringify(raw)}`);
  }
  return parsed;
}

/**
 * Read `.env` from the working directory, if one exists.
 *
 * Node ≥ 20.12 ships this — no dependency needed. Values already exported in
 * the shell win over the file, so a one-off override still works. Without this
 * the entry points ran with an empty environment unless every variable was
 * exported by hand, which is exactly the failure mode `.env.example` invites.
 */
function loadDotEnv(): void {
  if (existsSync(".env")) process.loadEnvFile(".env");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  loadDotEnv();
  const rawBudgets = env.SLOT_BUDGETS_JSON;
  let slotBudgets: Record<PacketSlot, number> = { ...DEFAULT_SLOT_BUDGETS };
  if (rawBudgets) {
    const parsed = z.record(z.enum(PACKET_SLOTS), z.number().int().positive()).safeParse(
      JSON.parse(rawBudgets),
    );
    if (!parsed.success) {
      throw new Error(`SLOT_BUDGETS_JSON must map every packet slot to a positive integer`);
    }
    slotBudgets = parsed.data;
  }

  return configSchema.parse({
    supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    modelProvider: env.MODEL_PROVIDER ?? "stub",
    model: env.UNIFY_MODEL ?? undefined,
    modelTimeoutMs: intOr(env, "MODEL_TIMEOUT_MS", 180_000),
    pollIntervalMs: intOr(env, "POLL_INTERVAL_MS", 3_000),
    tokenBudget: intOr(env, "PACKET_TOKEN_BUDGET", 8000),
    slotBudgets,
    weakCitationThreshold: Number(env.WEAK_CITATION_THRESHOLD ?? 1),
    maxIdleClaims: intOr(env, "MAX_IDLE_CLAIMS", 1),
  });
}
