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
    <AppShell
      action={
        <span className="font-mono-code text-[11px] text-error flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
          REC · P-14
        </span>
      }
    >
      <StudyRunner />
    </AppShell>
  );
}
