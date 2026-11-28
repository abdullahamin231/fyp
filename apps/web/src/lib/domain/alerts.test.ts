import { describe, expect, it } from "vitest";
import { frequencyChartPaths, integrationStatus, resolutionLeaders } from "./alerts";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("alerts rail", () => {
  it("ranks this week's resolvers by count", () => {
    const leaders = resolutionLeaders(
      [{ actor_id: "a" }, { actor_id: "b" }, { actor_id: "b" }, { actor_id: "x" }],
      new Map([
        ["a", "Ada Lovelace"],
        ["b", "grace@example.com"],
      ]),
    );
    expect(leaders).toEqual([
      { name: "grace@example.com", initials: "G", resolved: 2 },
      { name: "Ada Lovelace", initials: "AL", resolved: 1 },
      { name: "Unknown reviewer", initials: "UR", resolved: 1 },
    ]);
  });

  it("reports each provider as not connected, quiet, or with its latest event", () => {
    expect(
      integrationStatus(
        [{ provider: "github" }, { provider: "jira" }],
        [
          { provider: "github", received_at: "2026-10-19T09:00:00Z" },
          { provider: "github", received_at: "2026-10-19T11:30:00Z" },
        ],
        NOW,
      ),
    ).toEqual([
      { name: "GitHub", status: "Last event 30m ago", connected: true },
      { name: "Jira", status: "No deliveries yet", connected: true },
      { name: "Figma", status: "Not connected", connected: false },
    ]);
  });

  it("keeps an empty frequency series finite for the SVG chart", () => {
    const chart = frequencyChartPaths([0, 0, 0, 0, 0, 0, 0]);
    expect(chart).not.toBeNull();
    expect(chart!.line).toBe("M0.0,36.0 L16.7,36.0 L33.3,36.0 L50.0,36.0 L66.7,36.0 L83.3,36.0 L100.0,36.0");
    expect(chart!.area).toContain("L100,40 L0,40 Z");
    expect(chart!.line).not.toContain("NaN");
  });

  it("returns no chart path when there are fewer than two points", () => {
    expect(frequencyChartPaths([])).toBeNull();
    expect(frequencyChartPaths([1])).toBeNull();
  });
});
