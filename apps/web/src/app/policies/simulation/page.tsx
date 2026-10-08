import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SimulationLab } from "@/components/policies/simulation-lab";

export const metadata: Metadata = {
  title: "Policy Simulation",
  description:
    "What-if workbench for UNIFY policies: replay historical events against adjusted grace windows and guard clauses without firing a single alert.",
};

export default function PolicySimulationPage() {
  return (
    <AppShell>
      <SimulationLab />
    </AppShell>
  );
}
