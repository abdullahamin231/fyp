import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AlertsFeed } from "@/components/alerts/alerts-feed";
import { AlertsSidePanel } from "@/components/alerts/alerts-side-panel";

export const metadata: Metadata = {
  title: "Conflict Alerts",
  description:
    "Live conflict feed with an AI health summary, policy filters and delivery context across Jira, GitHub, Figma and Slack.",
};

export default function ConflictAlertsPage() {
  return (
    <AppShell action={<span className="font-mono-code text-[11px] text-secondary">alerts live</span>}>
      <div className="flex flex-col xl:flex-row gap-gutter items-start">
        <AlertsFeed />
        <AlertsSidePanel />
      </div>
    </AppShell>
  );
}
