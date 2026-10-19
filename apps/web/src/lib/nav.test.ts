import { describe, expect, it } from "vitest";
import { navHref, settingsNav } from "./nav";

const settings = settingsNav.find((item) => item.href === "/settings/workspace")!;
const providerApps = settingsNav.find((item) => item.href === "/settings/integrations")!;

describe("navHref", () => {
  it("carries the active workspace slug into workspace-scoped settings links", () => {
    expect(navHref(settings, "acme-eng")).toBe("/settings/workspace?workspace=acme-eng");
    expect(navHref(providerApps, "acme-eng")).toBe("/settings/integrations?workspace=acme-eng");
  });

  it("leaves the plain path when no workspace is active", () => {
    expect(navHref(settings, null)).toBe("/settings/workspace");
  });
});
