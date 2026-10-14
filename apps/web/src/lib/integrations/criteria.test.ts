/**
 * Criteria extraction — the ingestion rules for Jira acceptance criteria.
 *
 * What matters here is what cannot happen: free-text reformatting, invented
 * intent, duplicates, and silent truncation. The tests pin each of those.
 */
import { describe, expect, it } from "vitest";
import {
  criterionExternalIds,
  criteriaFromDescription,
  criteriaFromField,
  extractCriteria,
  MAX_CRITERIA_PER_TICKET,
} from "./criteria";

function jiraPayload(fields: Record<string, unknown>): Record<string, unknown> {
  return { issue: { key: "UNI-42", fields } };
}

describe("criterionExternalIds", () => {
  it("numbers criteria one-based, capped at the sanity bound", () => {
    expect(criterionExternalIds("UNI-42", 2)).toEqual(["UNI-42/AC-1", "UNI-42/AC-2"]);
    expect(criterionExternalIds("UNI-42", 0)).toEqual([]);
    expect(criterionExternalIds("UNI-42", 999)).toHaveLength(MAX_CRITERIA_PER_TICKET);
    expect(criterionExternalIds("UNI-42", 999).at(-1)).toBe(`UNI-42/AC-${MAX_CRITERIA_PER_TICKET}`);
  });
});

describe("criteriaFromField", () => {
  it("accepts the shapes a Jira custom field can hold", () => {
    expect(criteriaFromField(["shopper sees a total", "total is discounted"])).toEqual([
      "shopper sees a total",
      "total is discounted",
    ]);
    expect(criteriaFromField([{ value: "from select-one" }, { name: "from select-many" }])).toEqual([
      "from select-one",
      "from select-many",
    ]);
    expect(criteriaFromField("first line\n\n  second line  \n")).toEqual(["first line", "second line"]);
  });

  it("never invents, deduplicates, and drops empties", () => {
    expect(criteriaFromField(["dup", "dup", "", "  ", "next"])).toEqual(["dup", "next"]);
    expect(criteriaFromField({ unexpected: true })).toEqual([]);
    expect(criteriaFromField(null)).toEqual([]);
    expect(criteriaFromField([{ unrelated: "x" }])).toEqual([]);
  });
});

describe("criteriaFromDescription", () => {
  it("reads a strictly delimited Acceptance Criteria section", () => {
    const description = [
      "As a shopper I want discounts applied.",
      "",
      "## Acceptance Criteria",
      "- the cart total drops by the code percentage",
      "- the reduced total is what the checkout renders",
      "1. and what the receipt shows",
      "",
      "## Notes",
      "- this is not a criterion",
    ].join("\n");
    expect(criteriaFromDescription(description)).toEqual([
      "the cart total drops by the code percentage",
      "the reduced total is what the checkout renders",
      "and what the receipt shows",
    ]);
  });

  it("stops at the first non-list paragraph so later sections cannot leak in", () => {
    const description = [
      "**Acceptance Criteria**",
      "- first",
      "",
      "Some prose that is not a criterion.",
      "- second (must not be picked up)",
    ].join("\n");
    expect(criteriaFromDescription(description)).toEqual(["first"]);
  });

  it("accepts a single unbulleted criterion under the heading, only when nothing follows", () => {
    expect(criteriaFromDescription("Acceptance Criteria:\nthe whole rule, stated once")).toEqual([
      "the whole rule, stated once",
    ]);
  });

  it("returns nothing when there is no section — absence is never papered over", () => {
    expect(criteriaFromDescription("no criteria section here")).toEqual([]);
    expect(criteriaFromDescription("### Acceptance criteria")).toEqual([]); // heading with no items
    expect(criteriaFromDescription(undefined)).toEqual([]);
  });
});

describe("extractCriteria", () => {
  it("prefers the configured field and records its provenance", () => {
    const result = extractCriteria(
      jiraPayload({
        customfield_10045: ["the configured criterion"],
        description: "## Acceptance Criteria\n- the description criterion",
      }),
      "customfield_10045",
    );
    expect(result).toEqual({ texts: ["the configured criterion"], source: "field" });
  });

  it("falls back to the description when the field is absent or empty", () => {
    const result = extractCriteria(
      jiraPayload({ customfield_10045: null, description: "## Acceptance Criteria\n- from description" }),
      "customfield_10045",
    );
    expect(result).toEqual({ texts: ["from description"], source: "description" });
    expect(extractCriteria(jiraPayload({ description: "## Acceptance Criteria\n- from description" }), null)).toEqual({
      texts: ["from description"],
      source: "description",
    });
  });

  it("reports no criteria when the ticket states none", () => {
    expect(extractCriteria(jiraPayload({ description: "just a description" }), "customfield_10045")).toEqual({
      texts: [],
      source: null,
    });
    expect(extractCriteria({}, "customfield_10045")).toEqual({ texts: [], source: null });
  });
});
