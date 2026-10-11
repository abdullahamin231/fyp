import { describe, expect, it } from "vitest";
import { extractJiraKeys, findKeysInText } from "../src/linking/extract-keys.js";

const UNI = ["UNI"];

describe("findKeysInText", () => {
  it("finds a key in the usual places people write it", () => {
    expect(findKeysInText("UNI-123: fix login", UNI)).toEqual(["UNI-123"]);
    expect(findKeysInText("feature/UNI-123-login-form", UNI)).toEqual(["UNI-123"]);
    expect(findKeysInText("[UNI-7] tidy up", UNI)).toEqual(["UNI-7"]);
    expect(findKeysInText("Fixes UNI-12, UNI-13", UNI)).toEqual(["UNI-12", "UNI-13"]);
  });

  it("returns nothing when there is no key", () => {
    expect(findKeysInText("Refactor button styles", UNI)).toEqual([]);
    expect(findKeysInText("", UNI)).toEqual([]);
  });

  it("does not mistake lookalikes for keys", () => {
    expect(findKeysInText("uni-123 lowercase", UNI)).toEqual([]); // Jira keys are uppercase
    expect(findKeysInText("XUNI-123", UNI)).toEqual([]); // glued on the left
    expect(findKeysInText("UNI-123abc", UNI)).toEqual([]); // glued on the right
    expect(findKeysInText("UNI-0123", UNI)).toEqual([]); // Jira never pads with zeros
    expect(findKeysInText("UNI-", UNI)).toEqual([]);
  });

  it("uses the project allow-list to reject UTF-8, SHA-256 and friends", () => {
    const text = "Use UTF-8 and SHA-256 per ISO-8601 for UNI-5";
    expect(findKeysInText(text, null)).toEqual(["UTF-8", "SHA-256", "ISO-8601", "UNI-5"]);
    expect(findKeysInText(text, UNI)).toEqual(["UNI-5"]);
  });

  it("lists a repeated key once", () => {
    expect(findKeysInText("UNI-1 and again UNI-1", UNI)).toEqual(["UNI-1"]);
  });
});

describe("extractJiraKeys", () => {
  it("merges title, branch and commits and records where each key came from", () => {
    const keys = extractJiraKeys(
      {
        title: "UNI-123 Login form",
        branch: "feature/UNI-123-login",
        commits: [
          { sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", message: "UNI-123 add form" },
          { sha: "b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", message: "also touches UNI-124" },
        ],
      },
      UNI,
    );
    expect(keys).toEqual([
      { key: "UNI-123", foundIn: ["title", "branch", "commit:a1b2c3d"] },
      { key: "UNI-124", foundIn: ["commit:b1b2c3d"] },
    ]);
  });
});
