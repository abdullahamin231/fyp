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
  plainText,
} from "./criteria";
import { ADF_DESCRIPTION, jiraCommentWebhook, jiraIssueWebhook, WIKI_DESCRIPTION } from "./jira-webhook.fixture";

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

  it("drops list markers from a wiki or markdown text field", () => {
    expect(criteriaFromField("# first\n# second\n*# nested")).toEqual(["first", "second", "nested"]);
    expect(criteriaFromField("- first\n2) second")).toEqual(["first", "second"]);
  });

  it("reads a rich-text (ADF) field: its list items, or its paragraphs when it has no list", () => {
    expect(criteriaFromField(ADF_DESCRIPTION)).toEqual([
      "the cart total drops by the code percentage",
      "the reduced total is what checkout renders",
      "and what the receipt shows",
      "rounding follows the finance spec, not a criterion",
    ]);
    const paragraphs = {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: "one rule" }] },
        { type: "paragraph", content: [{ type: "text", text: "another rule" }] },
      ],
    };
    expect(criteriaFromField(paragraphs)).toEqual(["one rule", "another rule"]);
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

describe("criteriaFromDescription in Jira wiki markup", () => {
  it("reads an h3. section with * and # items, nested levels flattened in document order", () => {
    expect(criteriaFromDescription(WIKI_DESCRIPTION)).toEqual([
      "the cart total drops by the code percentage",
      "the reduced total is *what checkout renders*",
      "and what the receipt shows",
    ]);
  });

  it("accepts any heading level, a bold heading, and - or # lists", () => {
    expect(criteriaFromDescription("h1. Acceptance criteria\n# first\n## second\n- third")).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(criteriaFromDescription("*Acceptance Criteria:*\n* only one\n\nThanks!")).toEqual(["only one"]);
  });

  it("treats a plain numbered wiki list after a plain heading as criteria, not markdown headings", () => {
    expect(criteriaFromDescription("Acceptance Criteria\n# first\n# second")).toEqual(["first", "second"]);
  });

  it("stops at the next wiki heading", () => {
    expect(criteriaFromDescription("h2. Acceptance Criteria\n* first\nh2. Out of scope\n* not this")).toEqual(["first"]);
  });
});

describe("criteriaFromDescription in Atlassian Document Format", () => {
  it("reads the list after a heading node, nested lists flattened, inline marks dropped", () => {
    expect(criteriaFromDescription(ADF_DESCRIPTION)).toEqual([
      "the cart total drops by the code percentage",
      "the reduced total is what checkout renders",
      "and what the receipt shows",
    ]);
  });

  it("accepts a bold paragraph as the heading and an orderedList as the items", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Acceptance criteria:", marks: [{ type: "strong" }] }] },
        {
          type: "orderedList",
          attrs: { order: 1 },
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "first" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "second" }] }] },
          ],
        },
        { type: "paragraph", content: [{ type: "text", text: "not a criterion" }] },
      ],
    };
    expect(criteriaFromDescription(doc)).toEqual(["first", "second"]);
  });

  it("returns nothing for an ADF document without the section", () => {
    const doc = { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }] };
    expect(criteriaFromDescription(doc)).toEqual([]);
  });
});

describe("plainText", () => {
  it("gives the readable text of any notation, one block per line", () => {
    expect(plainText("h3. Goal\n* fast\n# safe")).toBe("Goal\nfast\nsafe");
    expect(plainText(ADF_DESCRIPTION).split("\n")[0]).toBe("As a shopper I want discount codes applied at checkout.");
    expect(plainText(null)).toBe("");
  });
});

describe("extractCriteria", () => {
  it("reads the description of a real jira:issue_updated delivery", () => {
    expect(extractCriteria(jiraIssueWebhook(), "customfield_10045")).toEqual({
      texts: [
        "the cart total drops by the code percentage",
        "the reduced total is *what checkout renders*",
        "and what the receipt shows",
      ],
      source: "description",
    });
  });

  it("returns null when the payload does not carry the description (comment events)", () => {
    expect(extractCriteria(jiraCommentWebhook(), "customfield_10045")).toBeNull();
    expect(extractCriteria({}, "customfield_10045")).toBeNull();
  });

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
    expect(extractCriteria(jiraPayload({ description: null }), null)).toEqual({ texts: [], source: null });
  });
});
