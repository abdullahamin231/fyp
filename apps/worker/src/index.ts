#!/usr/bin/env node
/**
 * UNIFY verification worker entry point.
 *
 * Polls the criterion queue forever: claim → packet → bounded verifier loop →
 * gate → verdict. Runs on the service-role key, so it can see every workspace
 * it serves; every table it writes is still append-only by trigger.
 *
 * Configuration lives in `src/config.ts`: the operational values are
 * hardcoded there (a recorded decision), and the environment holds only the
 * Supabase URL and service-role key. There is no built-in fallback from the
 * real model to the stub: if the configured provider is `opencode` and the CLI
 * is unreachable, jobs finish `failed` with `MODEL_UNAVAILABLE`, which is the
 * honest outcome.
 */
import { loadConfig } from "./config.js";
import { createServiceClient } from "./db.js";
import { createModelClient } from "./model/index.js";
import { GraphEvidenceProvider } from "./packet/providers/graph.js";
import { pollForever } from "./runner.js";

const config = loadConfig();
const client = createServiceClient(config);
const model = createModelClient(config, { fabricate: config.stubFabricate });
const provider = new GraphEvidenceProvider(client);

const logger = (message: string, fields: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ at: new Date().toISOString(), message, ...fields }));
};

await pollForever({ client, config, model, provider, logger });
