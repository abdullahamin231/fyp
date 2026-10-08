import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { activity } from "@/lib/mock/activity";

export const metadata: Metadata = {
  title: "Activity Feed",
  description:
    "Everything UNIFY ingested, linked, verified and delivered — with the actor and provenance for every event.",
};

export default function ActivityFeedPage() {
  return (
    <AppShell>
      <ActivityFeed events={activity} />
    </AppShell>
  );
}
