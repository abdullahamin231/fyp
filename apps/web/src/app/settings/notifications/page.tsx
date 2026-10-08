import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationPreferences } from "@/components/settings/notification-preferences";

export const metadata: Metadata = {
  title: "Notification Preferences",
  description:
    "Role-aware delivery channels, batch digests and noise reduction thresholds for UNIFY findings.",
};

export default function NotificationPreferencesPage() {
  return (
    <AppShell>
      <NotificationPreferences />
    </AppShell>
  );
}
