import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { listActivity } from "@/lib/data/activity";

export const metadata: Metadata = {
  title: "Activity Feed",
  description:
    "Everything UNIFY ingested, linked, verified and delivered — with the actor and provenance for every event.",
};

export default async function ActivityFeedPage() {
  const activity = await listActivity();

  return (
    <AppShell>
      <ActivityFeed events={activity} />
    </AppShell>
  );
}
