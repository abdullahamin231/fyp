import type { IntegrationProvider } from "@/lib/integrations/types";

/** Wizard steps in order; providers occupy steps 2-4. */
export const ONBOARDING_STEPS = ["workspace", "figma", "github", "jira", "policy"] as const;

/** Where a returning user resumes: step 1 with no workspace, else the first source still to connect. */
export function resumeStep(
  workspace: { slug: string } | null,
  providers: { provider: IntegrationProvider; connected: boolean }[],
): number {
  if (!workspace) return 1;
  const pending = (["figma", "github", "jira"] as const).find(
    (key) => !providers.find((p) => p.provider === key)?.connected,
  );
  return pending ? ONBOARDING_STEPS.indexOf(pending) + 1 : ONBOARDING_STEPS.length;
}

/** The OAuth start route for a provider in a created workspace. */
export function authorizePath(provider: IntegrationProvider, slug: string): string {
  return `/api/integrations/${provider}/authorize?workspace=${encodeURIComponent(slug)}`;
}
