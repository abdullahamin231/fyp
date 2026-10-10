import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { PolicyWorkbench } from "@/components/policies/policy-workbench";

export const metadata: Metadata = {
  title: "Policy Configuration",
  description:
    "Define cross-tool consistency rules, trigger conditions, temporal thresholds, and recipient escalation policies.",
};

export default function PoliciesPage() {
  return (
    <AppShell
      action={
        <Link
          href="/policies/simulation"
          className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Open Test Lab
        </Link>
      }
    >
      {/* Top ambient glow & title section */}
      <div className="relative overflow-hidden pt-2">
        <div className="absolute -top-12 -left-12 w-96 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-20 w-80 h-36 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-2 max-w-3xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Policy Management &amp; Governance
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Define cross-tool consistency rules, trigger conditions, temporal thresholds, and
              recipient escalation policies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/audit"
              className="flex items-center gap-2 px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm transition-colors shadow-sm"
            >
              <Icon name="history_edu" className="text-[18px]" />
              <span>Global Audit</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-body-sm text-body-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Icon name="add" className="text-[18px]" />
              <span>Create New Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master / detail grid — list + rule builder */}
      <PolicyWorkbench />
    </AppShell>
  );
}
