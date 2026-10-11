import { describe, expect, it } from "vitest";
import { extractJson } from "../src/model/extract.js";

describe("model reply extraction", () => {
  it("reads a bare JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("reads a fenced block", () => {
    expect(extractJson('Here you go:\n```json\n{"status":"SUPPORTED"}\n```\nDone.')).toEqual({
      status: "SUPPORTED",
    });
  });

  it("reads the first balanced object when the model narrates around it", () => {
    const parsed = extractJson(
      'Sure! I checked the packet. {"criterionId":"C-1","status":"PARTIAL"} Hope that helps.',
    ) as { criterionId: string };
    expect(parsed.criterionId).toBe("C-1");
  });

  it("is string-aware when finding the balanced object", () => {
    const text = 'noise {"reason":"a } brace inside a string","status":"SUPPORTED"} tail';
    expect(extractJson(text)).toEqual({ reason: "a } brace inside a string", status: "SUPPORTED" });
  });

  it("fails loudly when there is no JSON at all", () => {
    expect(() => extractJson("the packet looks fine to me")).toThrow(/no JSON object/);
  });

  it("fails on an unbalanced object", () => {
    expect(() => extractJson('{"a": {"b": 1}')).toThrow(/unbalanced/);
  });
});
