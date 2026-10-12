import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AlertsFeed } from "@/components/alerts/alerts-feed";
import { AlertsSidePanel } from "@/components/alerts/alerts-side-panel";
import { listFindings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Conflict Alerts",
  description:
    "Live conflict feed with an AI health summary, policy filters and delivery context across Jira, GitHub, Figma and Slack.",
};

export default async function ConflictAlertsPage() {
  const findings = await listFindings();

  return (
    <AppShell>
      <div className="flex flex-col xl:flex-row gap-gutter items-start">
        <AlertsFeed findings={findings} />
        <AlertsSidePanel findings={findings} />
      </div>
    </AppShell>
  );
}
