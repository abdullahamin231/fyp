#!/usr/bin/env node
/**
 * Drain the criterion queue once and report what happened.
 *
 * `npm run once` — the operator's "process whatever is queued" command. Exits
 * non-zero if any job failed, so it is usable in scripts and CI.
 */
import { loadConfig } from "../config.js";
import { createServiceClient } from "../db.js";
import { createModelClient } from "../model/index.js";
import { GraphEvidenceProvider } from "../packet/providers/graph.js";
import { drainQueue } from "../runner.js";

const config = loadConfig();
const client = createServiceClient(config);
const model = createModelClient(config);
const provider = new GraphEvidenceProvider(client);

const logger = (message: string, fields: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ at: new Date().toISOString(), message, ...fields }));
};

const outcomes = await drainQueue({ client, config, model, provider, logger }, config.maxIdleClaims);

if (outcomes.length === 0) {
  console.log("queue empty — nothing to verify");
  process.exit(0);
}

const failed = outcomes.filter((outcome) => outcome.state === "failed");
for (const outcome of outcomes) {
  console.log(
    JSON.stringify({
      jobId: outcome.jobId,
      criterion: outcome.criterionNodeId,
      status: outcome.status,
      gateOutcome: outcome.gateOutcome,
      stopReason: outcome.stopReason,
      passes: outcome.passes,
      findingId: outcome.findingId,
      error: outcome.error,
    }),
  );
}
process.exit(failed.length > 0 ? 1 : 0);
