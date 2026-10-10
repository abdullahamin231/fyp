import { describe, expect, it } from "vitest";
import { EVENT_SCHEMA_VERSION, eventDedupeKey, normalisedEventSchema } from "../src/index.js";
import { baseEvent, SHA256 } from "./fixtures.js";

describe("normalised event envelope", () => {
  it("parses a minimal envelope", () => {
    const parsed = normalisedEventSchema.parse(baseEvent());
    expect(parsed.eventId).toBe("evt-0001");
    expect(parsed.schemaVersion).toBe(EVENT_SCHEMA_VERSION);
  });

  it("defaults schemaVersion to the current envelope version", () => {
    const { schemaVersion: _dropped, ...withoutVersion } = baseEvent();
    const parsed = normalisedEventSchema.parse(withoutVersion);
    expect(parsed.schemaVersion).toBe(EVENT_SCHEMA_VERSION);
  });

  it("rejects an unknown field instead of silently dropping it", () => {
    const result = normalisedEventSchema.safeParse({ ...baseEvent(), extra: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { eventId: _dropped, ...withoutEventId } = baseEvent();
    expect(normalisedEventSchema.safeParse(withoutEventId).success).toBe(false);
  });

  it("rejects a timestamp without a timezone", () => {
    const result = normalisedEventSchema.safeParse(baseEvent({ occurredAt: "2026-10-09T10:00:00" }));
    expect(result.success).toBe(false);
  });

  it("accepts references with a deep link and rejects a malformed one", () => {
    const withUrl = baseEvent({
      references: [
        { sourceTool: "jira", entityType: "Ticket", entityId: "UN-104", url: "https://j.example/UN-104" },
      ],
    });
    expect(normalisedEventSchema.safeParse(withUrl).success).toBe(true);

    const badUrl = baseEvent({
      references: [{ sourceTool: "jira", entityType: "Ticket", entityId: "UN-104", url: "not-a-url" }],
    });
    expect(normalisedEventSchema.safeParse(badUrl).success).toBe(false);
  });

  it("derives one dedupe key per (sourceTool, vendorDeliveryId) pair", () => {
    const a = baseEvent();
    const duplicate = baseEvent({ eventId: "evt-0002" });
    const differentTool = baseEvent({ sourceTool: "jira" });

    expect(eventDedupeKey(duplicate)).toBe(eventDedupeKey(a));
    expect(eventDedupeKey(differentTool)).not.toBe(eventDedupeKey(a));
    expect(eventDedupeKey(a)).toBe("github:delivery-0001");
  });

  it("keeps rawHash pinned to a sha256 digest", () => {
    expect(normalisedEventSchema.safeParse(baseEvent({ rawHash: SHA256.slice(0, 32) })).success).toBe(false);
  });
});
