import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { StudyRunner } from "@/components/study/study-runner";

export const metadata: Metadata = {
  title: "Manual Workflow Study",
  description:
    "UNIFY human-study runner: participant task list, manual vs UNIFY-assisted conditions, timing capture and per-task notes.",
};

export default function StudyPage() {
  return (
    <AppShell>
      <StudyRunner />
    </AppShell>
  );
}
