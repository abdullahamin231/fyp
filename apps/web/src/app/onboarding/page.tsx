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
    <AppShell
      action={
        <span className="font-mono-code text-[11px] text-secondary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          setup in progress
        </span>
      }
    >
      <OnboardingWizard />
    </AppShell>
  );
}
