import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Workspace Onboarding",
  description:
    "UNIFY setup wizard — connect Figma, GitHub and Jira, import your workspace and run the first policy check.",
};

export default function OnboardingPage() {
  return (
    <AppShell>
      <OnboardingWizard />
    </AppShell>
  );
}
