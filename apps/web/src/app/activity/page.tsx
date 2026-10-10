import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityFeed } from "@/components/activity/activity-feed";
import type { ActivityEvent } from "@/lib/types";

/**
 * DATA HOLE — replace with the activity API.
 * Empty until the endpoint exists; the feed renders its empty state.
 */
const activity: ActivityEvent[] = [];

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
