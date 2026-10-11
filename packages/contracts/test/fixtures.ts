import { randomUUID } from "node:crypto";
import type {
  ContextPacket,
  EvidenceSpan,
  GatedVerdict,
  NormalisedEvent,
  Rule,
  VerifierOutput,
} from "../src/index.js";
import { CONTRACTS_VERSION, EVENT_SCHEMA_VERSION } from "../src/index.js";

/** Deterministic ids so failures are reproducible and diffs stay readable. */
export const WS_ID = "00000000-0000-4000-8000-000000000001";
export const NODE_ID = "00000000-0000-4000-8000-000000000002";
export const CRITERION_ID = "00000000-0000-4000-8000-000000000003";
export const PACKET_ID = "00000000-0000-4000-8000-000000000004";
export const VERDICT_ID = "00000000-0000-4000-8000-000000000005";
export const RUN_ID = "00000000-0000-4000-8000-000000000006";
export const EDGE_ID = "00000000-0000-4000-8000-000000000007";
export const ACTOR_ID = "00000000-0000-4000-8000-000000000008";

export const SHA256 = "a".repeat(64);
export const OTHER_SHA256 = "b".repeat(64);
export const COMMIT = "c".repeat(40);
export const HEAD_COMMIT = "d".repeat(40);
export const T0 = "2026-10-09T10:00:00Z";
export const T1 = "2026-10-09T10:00:03Z";

export function baseEvent(overrides: Partial<NormalisedEvent> = {}): NormalisedEvent {
  return {
    schemaVersion: EVENT_SCHEMA_VERSION,
    eventId: "evt-0001",
    vendorDeliveryId: "delivery-0001",
    workspaceId: WS_ID,
    sourceTool: "github",
    entityType: "PullRequest",
    entityId: "244",
    version: "1",
    action: "opened",
    actor: "alex-rivera",
    occurredAt: T0,
    receivedAt: T1,
    references: [],
    rawHash: SHA256,
    ...overrides,
  };
}

export const baseSpan: EvidenceSpan = {
  spanId: "span-checkout-total",
  slot: "DIFF_HUNKS",
  file: "src/checkout/total.ts",
  symbol: "computeTotal",
  startLine: 12,
  endLine: 40,
  contentSha256: SHA256,
};

export function basePacket(overrides: Partial<ContextPacket> = {}): ContextPacket {
  return {
    id: PACKET_ID,
    criterionNodeId: CRITERION_ID,
    baseCommit: COMMIT,
    headCommit: HEAD_COMMIT,
    tokenBudget: 8000,
    slotBudgets: {
      REQUIREMENT_TEXT: 800,
      DESIGN_CONSTRAINTS: 600,
      TEST_EVIDENCE: 1500,
      SYMBOL_CARDS: 2000,
      DIFF_HUNKS: 2500,
      GRAPH_NEIGHBOURHOOD: 400,
      POLICY_DEFINITION: 200,
    },
    manifest: {
      truncated: false,
      assemblyOrder: ["REQUIREMENT_TEXT", "POLICY_DEFINITION", "SYMBOL_CARDS", "DIFF_HUNKS"],
      evictionOrder: ["GRAPH_NEIGHBOURHOOD", "SYMBOL_CARDS", "DIFF_HUNKS"],
      slots: [
        {
          slot: "DIFF_HUNKS",
          tokenBudget: 2500,
          tokensUsed: 900,
          included: [{ id: baseSpan.spanId, kind: "span", tokens: 900 }],
          omitted: [],
        },
        {
          slot: "SYMBOL_CARDS",
          tokenBudget: 2000,
          tokensUsed: 1200,
          included: [{ id: "symbol-computeTotal", kind: "symbol_card", tokens: 1200 }],
          omitted: [],
        },
      ],
    },
    promptHash: SHA256,
    packetHash: OTHER_SHA256,
    ...overrides,
  };
}

export function baseVerifierOutput(overrides: Partial<VerifierOutput> = {}): VerifierOutput {
  return {
    criterionId: "CRIT-1",
    status: "SUPPORTED",
    evidence: [baseSpan],
    reason: "The changed function computes the discounted total the criterion asks for.",
    missingEvidence: null,
    divergenceTag: null,
    modelAndRun: {
      runId: RUN_ID,
      modelId: "qwen2.5-coder-7b-instruct",
      modelVersion: "2.5.7",
      quantisation: "Q4_K_M",
      tokenizer: "qwen2.5-coder",
      settings: { temperature: 0, seed: 7 },
      startedAt: T0,
      durationMs: 1830,
    },
    ...overrides,
  };
}

export function baseGatedVerdict(overrides: Partial<GatedVerdict> = {}): GatedVerdict {
  const output = baseVerifierOutput();
  return {
    id: VERDICT_ID,
    packetId: PACKET_ID,
    status: output.status,
    evidence: output.evidence,
    reason: output.reason,
    missingEvidence: output.missingEvidence,
    divergenceTag: output.divergenceTag,
    freshnessState: "CURRENT",
    reviewRequired: false,
    reasonCode: null,
    passCount: 2,
    stopReason: "VERIFIED",
    gateOutcome: "PASSED",
    modelAndRun: output.modelAndRun,
    ...overrides,
  };
}

export function baseRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: "RULE_1",
    version: 3,
    title: "Design drift after PR merge",
    description: "A merged change left the linked design artefact behind.",
    edgeType: "IMPLEMENTS",
    trigger: { on: "edge.created", entityType: "PullRequest" },
    guards: [
      {
        path: "payload.versionId",
        op: "changed",
        description: "the implemented design version is no longer the current one",
      },
    ],
    condition: "guard.changed && target.version != edge.payload.versionId",
    gracePeriodHours: 24,
    produces: "design_version_drift",
    severity: "high",
    notify: {
      channels: ["slack"],
      roles: ["developer", "designer"],
      hops: 2,
      template: "rule_1_design_version_drift",
    },
    resolutionOptions: ["acknowledge", "resolve", "dispute"],
    active: true,
    ...overrides,
  };
}

/** Ids used only to make failures readable — never asserted on. */
export function uniqueId(): string {
  return randomUUID();
}

export const packageVersion = CONTRACTS_VERSION;
