import { describe, expect, it } from "vitest";
import {
  codeAnchorSchema,
  edgeIdentityKey,
  eligibilityFor,
  isDecisiveEligibleEdge,
  nodeSchema,
} from "../src/index.js";
import { NODE_ID, SHA256, T0, WS_ID } from "./fixtures.js";

const baseNode = {
  id: NODE_ID,
  workspaceId: WS_ID,
  type: "PullRequest",
  externalId: "244",
  version: "3",
  status: "open",
  owner: "alex-rivera",
  lastModified: T0,
  validFrom: T0,
  validTo: null,
  payload: { baseSha: "c".repeat(40), headSha: "d".repeat(40) },
} as const;

describe("graph nodes", () => {
  it("parses a typed node with a jsonb payload", () => {
    const parsed = nodeSchema.parse(baseNode);
    expect(parsed.type).toBe("PullRequest");
    expect(parsed.payload.baseSha).toBe("c".repeat(40));
  });

  it("rejects an unknown node type", () => {
    expect(nodeSchema.safeParse({ ...baseNode, type: "Epic" }).success).toBe(false);
  });
});

describe("link eligibility (FR-05)", () => {
  const cases: Array<[string, Parameters<typeof isDecisiveEligibleEdge>[0], boolean]> = [
    ["observed + active is decisive-eligible", { sourceClass: "observed", linkState: "active", resolver: "explicit-reference" }, true],
    ["derived + active is decisive-eligible", { sourceClass: "derived", linkState: "active", resolver: "user:alex-rivera" }, true],
    ["model candidate confirmed by threshold is decisive-eligible", { sourceClass: "model_candidate", linkState: "active", resolver: "system:threshold" }, true],
    ["model candidate confirmed by a human is decisive-eligible", { sourceClass: "model_candidate", linkState: "active", resolver: "user:mishal-fatima" }, true],
    ["raw model candidate is never decisive", { sourceClass: "model_candidate", linkState: "active", resolver: "model:run-9" }, false],
    ["unresolved link is never decisive", { sourceClass: "unresolved", linkState: "active", resolver: "model:run-9" }, false],
    ["a human-confirmed unresolved link is decisive", { sourceClass: "unresolved", linkState: "active", resolver: "user:alex-rivera" }, true],
    ["dismissed link is inert", { sourceClass: "observed", linkState: "dismissed", resolver: "explicit-reference" }, false],
    ["revoked link is inert", { sourceClass: "derived", linkState: "revoked", resolver: "user:alex-rivera" }, false],
  ];

  it.each(cases)("%s", (_name, edge, expected) => {
    expect(isDecisiveEligibleEdge(edge)).toBe(expected);
  });
});

describe("link eligibility classification", () => {
  const cases: Array<[string, Parameters<typeof eligibilityFor>[0], string]> = [
    ["human confirmation is confirmed", { sourceClass: "model_candidate", resolver: "user:alex-rivera" }, "confirmed"],
    ["threshold confirmation is system-confirmed", { sourceClass: "model_candidate", resolver: "system:threshold" }, "system-confirmed"],
    ["observed source is system-confirmed", { sourceClass: "observed", resolver: "explicit-reference" }, "system-confirmed"],
    ["derived source is system-confirmed", { sourceClass: "derived", resolver: "explicit-reference" }, "system-confirmed"],
    ["raw model candidate is inferred", { sourceClass: "model_candidate", resolver: "model:run-9" }, "inferred"],
    ["unresolved source is unconfirmed", { sourceClass: "unresolved", resolver: "model:run-9" }, "unconfirmed"],
  ];

  it.each(cases)("%s", (_name, edge, expected) => {
    expect(eligibilityFor(edge)).toBe(expected);
  });

  it("agrees with the decisive boundary for every source class", () => {
    for (const sourceClass of ["observed", "derived", "model_candidate", "unresolved"] as const) {
      for (const resolver of ["user:alex", "system:threshold", "model:run-9", "explicit-reference"]) {
        const edge = { sourceClass, resolver };
        const decisive = eligibilityFor(edge) === "confirmed" || eligibilityFor(edge) === "system-confirmed";
        expect(isDecisiveEligibleEdge({ ...edge, linkState: "active" })).toBe(decisive);
      }
    }
  });
});

describe("edge identity (00010_edge_dedupe)", () => {
  const link = {
    fromId: "00000000-0000-4000-8000-0000000000a1",
    toId: "00000000-0000-4000-8000-0000000000a2",
    type: "IMPLEMENTS",
  } as const;

  it("keys a link on its endpoints and type", () => {
    expect(edgeIdentityKey(link)).toBe(
      "00000000-0000-4000-8000-0000000000a1|00000000-0000-4000-8000-0000000000a2|IMPLEMENTS",
    );
  });

  it("distinguishes links that differ by direction or type", () => {
    expect(edgeIdentityKey({ ...link, fromId: link.toId, toId: link.fromId })).not.toBe(
      edgeIdentityKey(link),
    );
    expect(edgeIdentityKey({ ...link, type: "TRACKS" })).not.toBe(edgeIdentityKey(link));
  });
});

describe("code anchors (§22)", () => {
  const baseAnchor = {
    id: "00000000-0000-4000-8000-000000000009",
    edgeId: "00000000-0000-4000-8000-000000000007",
    prevAnchorId: null,
    repo: "unify/core",
    filePath: "src/checkout/total.ts",
    symbolFqn: "checkout.computeTotal",
    startLine: 12,
    endLine: 40,
    blobHash: SHA256,
    commitSha: "c".repeat(40),
    method: "symbol",
    status: "active",
    confidence: 0.9,
    provenance: { reanchoredFrom: null },
  };

  it("parses a commit-pinned FR anchor", () => {
    expect(codeAnchorSchema.parse(baseAnchor).symbolFqn).toBe("checkout.computeTotal");
  });

  it("rejects an inverted line range", () => {
    const result = codeAnchorSchema.safeParse({ ...baseAnchor, startLine: 60, endLine: 40 });
    expect(result.success).toBe(false);
  });

  it("accepts an NFR anchor with no line range (§22.4)", () => {
    const nfr = { ...baseAnchor, startLine: null, endLine: null, method: "hash" };
    expect(codeAnchorSchema.safeParse(nfr).success).toBe(true);
  });

  it("records a broken anchor rather than dropping it (FR-23)", () => {
    expect(codeAnchorSchema.parse({ ...baseAnchor, status: "broken" }).status).toBe("broken");
  });
});
