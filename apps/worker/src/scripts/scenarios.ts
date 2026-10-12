#!/usr/bin/env node
/**
 * Run every demo scenario through the verifier, offline.
 *
 * Same path as a live job (packet → bounded loop → gate → finding decision),
 * but the evidence comes from the frozen bundles in `fixtures/scenarios/` and
 * nothing is written anywhere. Use it to rehearse the demo and to see, in one
 * table, which inputs the core module treats as conflicts.
 *
 *   npm run scenarios
 */
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { gate, type GateContext } from "@unify/contracts";
import { DEFAULT_SLOT_BUDGETS, loadConfig } from "../config.js";
import { fixtureBundleSources } from "../fixture/bundle.js";
import { DEFAULT_LINK_POLICY } from "../graph/nodes.js";
import { createModelClient } from "../model/index.js";
import { StubModelClient, type StubOptions } from "../model/stub.js";
import { ModelUnavailableError, type ModelClient } from "../model/types.js";
import { buildPacket } from "../packet/builder.js";
import { loadFixtureBundle } from "../packet/providers/fixture.js";
import { gateInputsFrom } from "../verifier/gateInputs.js";
import { runVerifierLoop } from "../verifier/loop.js";
import { shouldCreateFinding } from "../verifier/persist.js";

const fixture = (name: string) => fileURLToPath(new URL(`../../fixtures/${name}`, import.meta.url));

interface Scenario {
  label: string;
  bundle: string;
  description: string;
  stub?: StubOptions;
  modelDown?: boolean;
}

const SCENARIOS: Scenario[] = [
  {
    label: "DEMO-01 baseline",
    bundle: fixture("demo_case.json"),
    description: "passing test covers the changed code",
  },
  {
    label: "DEMO-02 failing test",
    bundle: fixture("scenarios/02-contradicted.json"),
    description: "the change breaks an existing test",
  },
  {
    label: "DEMO-03 no test",
    bundle: fixture("scenarios/03-partial.json"),
    description: "changed code with no test covering it",
  },
  {
    label: "DEMO-04 stale source",
    bundle: fixture("scenarios/04-stale.json"),
    description: "an ingestion checkpoint is stale, so no decisive verdict",
  },
  {
    label: "DEMO-05 unconfirmed link",
    bundle: fixture("scenarios/05-unlinked.json"),
    description: "PR-to-criterion link is only inferred, never confirmed",
  },
  {
    label: "DEMO-01 fabricated citation",
    bundle: fixture("demo_case.json"),
    description: "model cites a span that is not in the packet (T10)",
    stub: { fabricate: "extra" },
  },
  {
    label: "DEMO-01 model down",
    bundle: fixture("demo_case.json"),
    description: "model binary unavailable",
    modelDown: true,
  },
];

class DownModelClient implements ModelClient {
  readonly provider = "opencode" as const;

  describe() {
    return {
      modelId: "opencode:unavailable",
      modelVersion: "n/a",
      quantisation: "n/a",
      tokenizer: "n/a",
      settings: { temperature: 0 },
    };
  }

  async complete(): Promise<never> {
    throw new ModelUnavailableError("opencode binary not found (scenario: model down)");
  }
}

async function run(scenario: Scenario) {
  const bundle = await loadFixtureBundle(scenario.bundle);
  const { sources, summary } = fixtureBundleSources(bundle);
  const criterionId = randomUUID();
  const built = buildPacket({
    packetId: randomUUID(),
    criterion: {
      id: criterionId,
      text: bundle.criterion.text,
      requirementRef: bundle.criterion.requirementRef,
    },
    baseCommit: bundle.baseCommit,
    headCommit: bundle.headCommit,
    tokenBudget: 8000,
    slotBudgets: DEFAULT_SLOT_BUDGETS,
    sources,
  });

  const config = loadConfig();
  const model = scenario.modelDown
    ? new DownModelClient()
    : scenario.stub
      ? new StubModelClient(scenario.stub)
      : createModelClient(config);
  const loop = await runVerifierLoop({
    model,
    packet: built,
    criterionId,
    timeoutMs: config.modelTimeoutMs,
    weakCitationThreshold: 1,
  });

  const inputs = gateInputsFrom(summary, DEFAULT_LINK_POLICY);
  const context: GateContext = {
    verdictId: randomUUID(),
    packetId: built.packet.id,
    manifestItemIds: built.itemIds,
    manifestContentShas: built.contentHashes,
    ...inputs,
    passCount: loop.passCount,
    stopReason: loop.stopReason,
  };
  const result = gate(loop.gateInput, context);
  return { scenario, verdict: result.verdict, outcome: result.outcome };
}

const rows: string[] = [];
for (const scenario of SCENARIOS) {
  const { verdict, outcome } = await run(scenario);
  const finding = shouldCreateFinding(verdict) ? "yes" : "no";
  rows.push(
    [
      scenario.label.padEnd(28),
      verdict.status.padEnd(23),
      outcome.padEnd(11),
      String(verdict.stopReason).padEnd(20),
      finding.padEnd(8),
      scenario.description,
    ].join(" "),
  );
}

console.log(
  [
    "scenario".padEnd(28),
    "verdict".padEnd(23),
    "gate".padEnd(11),
    "stop reason".padEnd(20),
    "finding".padEnd(8),
    "what it models",
  ].join(" "),
);
console.log("-".repeat(130));
console.log(rows.join("\n"));
