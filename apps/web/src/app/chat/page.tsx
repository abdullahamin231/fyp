import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { InklingChat } from "@/components/chat/inkling-chat";

export const metadata: Metadata = {
  title: "Inkling Chat",
  description: "Chat directly with the Inkling model running on the UNIFY server.",
};

export default function ChatPage() {
  return (
    <AppShell contentClassName="w-full">
      <InklingChat />
    </AppShell>
  );
}
