import { describe, expect, it } from "vitest";
import { parseNdjson, textFromEvents } from "../src/model/opencode.js";

/**
 * The exact shape the OpenCode CLI v2.0.26 emits for `opencode run --format
 * json "hi"` (captured during the model-client spike), so the wrapper is
 * pinned to reality rather than to a guess.
 */
const SPIKE_STDOUT = [
  '{"type":"step_start","timestamp":1791702393360,"sessionID":"ses_1","part":{"id":"prt_1","sessionID":"ses_1","messageID":"msg_1","type":"step-start","snapshot":"ba56"}}',
  '{"type":"text","timestamp":1791702394558,"sessionID":"ses_1","part":{"id":"prt_2","sessionID":"ses_1","messageID":"msg_1","type":"text","text":"Hi! How can I help you today?","time":{"start":1791702394505,"end":1791702394510}}}',
  "",
].join("\n");

describe("opencode NDJSON handling", () => {
  it("parses the event stream the CLI actually emits", () => {
    const events = parseNdjson(SPIKE_STDOUT);
    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe("step_start");
  });

  it("concatenates only the text parts, in order", () => {
    expect(textFromEvents(parseNdjson(SPIKE_STDOUT))).toBe("Hi! How can I help you today?");
  });

  it("skips partial or corrupt lines instead of failing the run", () => {
    const stdout = ['{"part":{"type":"text","text":"first"}}', '{"part":{"type":"te', ""].join(
      "\n",
    );
    expect(textFromEvents(parseNdjson(stdout))).toBe("first");
  });

  it("returns empty text when the stream carries no answer", () => {
    expect(textFromEvents(parseNdjson('{"type":"step_start"}'))).toBe("");
  });
});
