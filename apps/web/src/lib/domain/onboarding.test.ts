import { describe, expect, it } from "vitest";
import { authorizePath, resumeStep } from "./onboarding";

const status = (provider: "figma" | "github" | "jira", connected: boolean) => ({ provider, connected });

describe("resumeStep", () => {
  it("starts at workspace creation when nothing exists", () => {
    expect(resumeStep(null, [])).toBe(1);
  });

  it("resumes at the first unconnected source", () => {
    expect(resumeStep({ slug: "acme" }, [status("figma", false), status("github", false), status("jira", false)])).toBe(2);
    expect(resumeStep({ slug: "acme" }, [status("figma", true), status("github", false), status("jira", true)])).toBe(3);
  });

  it("goes to the policy review once every source is connected", () => {
    expect(resumeStep({ slug: "acme" }, [status("figma", true), status("github", true), status("jira", true)])).toBe(5);
  });
});

describe("authorizePath", () => {
  it("names the created workspace's slug, never an empty one", () => {
    expect(authorizePath("github", "acme-eng")).toBe("/api/integrations/github/authorize?workspace=acme-eng");
  });
});
