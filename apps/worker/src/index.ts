#!/usr/bin/env node
/**
 * UNIFY verification worker entry point.
 *
 * Polls the criterion queue forever: claim → packet → bounded verifier loop →
 * gate → verdict. Runs on the service-role key, so it can see every workspace
 * it serves; every table it writes is still append-only by trigger.
 *
 * Configuration comes from the environment (`src/config.ts`). There is no
 * built-in fallback from the real model to the stub: if `MODEL_PROVIDER` says
 * `opencode` and the CLI is unreachable, jobs finish `failed` with
 * `MODEL_UNAVAILABLE`, which is the honest outcome.
 */
import { loadConfig } from "./config.js";
import { createServiceClient } from "./db.js";
import { createModelClient } from "./model/index.js";
import { GraphEvidenceProvider } from "./packet/providers/graph.js";
import { pollForever } from "./runner.js";

const config = loadConfig();
const client = createServiceClient(config);
const model = createModelClient(config);
const provider = new GraphEvidenceProvider(client);

const logger = (message: string, fields: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ at: new Date().toISOString(), message, ...fields }));
};

await pollForever({ client, config, model, provider, logger });
