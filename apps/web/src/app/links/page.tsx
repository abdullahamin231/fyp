import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { LinkManager } from "@/components/links/link-manager";
import { isDecisive } from "@/components/links/present";
import { links } from "@/lib/mock/links";
import { linkSuggestions } from "@/lib/mock/link-suggestions";

export const metadata: Metadata = {
  title: "Link Management",
  description:
    "Manage explicit cross-tool graph bindings, verify heuristic link suggestions and inspect cryptographic provenance across Figma, GitHub and Jira.",
};

const advisoryLinks = links.filter((link) => !isDecisive(link.eligibility));
const decisiveLinks = links.filter((link) => isDecisive(link.eligibility));
const pendingSuggestions = linkSuggestions.length + advisoryLinks.length;
const avgConfidence =
  pendingSuggestions === 0
    ? 0
    : Math.round(
        ((advisoryLinks.reduce((sum, link) => sum + link.confidence, 0) +
          linkSuggestions.reduce((sum, link) => sum + link.confidence, 0)) /
          pendingSuggestions) *
          1000,
      ) / 10;

const telemetry = [
  {
    label: "Explicit Edges",
    value: String(decisiveLinks.length),
    meta: "+2 today",
    metaClass: "text-secondary",
    icon: "hub",
    iconClass: "text-secondary",
  },
  {
    label: "Inferred Pending",
    value: String(pendingSuggestions),
    meta: `Avg conf: ${avgConfidence}%`,
    metaClass: "text-on-surface-variant",
    icon: "auto_awesome",
    iconClass: "text-tertiary",
    valueClass: "text-tertiary",
  },
  {
    label: "Graph Health",
    value: "99.8%",
    meta: "0 broken targets",
    metaClass: "text-outline",
    icon: "verified",
    iconClass: "text-secondary",
  },
  {
    label: "Sync Latency",
    value: "120ms",
    meta: "Webhook stream active",
    metaClass: "text-on-surface-variant",
    icon: "bolt",
    iconClass: "text-primary",
    valueClass: "text-primary",
  },
];

export default function LinksPage() {
  return (
    <AppShell
      action={
        <a
          href="#link-wizard"
          className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <Icon name="add_link" className="text-[16px]" />
          Create New Link
        </a>
      }
    >
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Link Management &amp; Relationship Provenance
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono-code text-[11px] font-semibold tracking-wide">
              GRAPH ENGINE V3.1
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Manage explicit cross-system graph bindings, inspect heuristic AI link suggestions, and
            verify cryptographic provenance trails across Figma, GitHub, and Jira.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface text-body-sm font-medium shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Core Engineering Org</span>
            <Icon name="expand_more" className="text-[16px] text-outline" />
          </button>
          <a
            href="#link-wizard"
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-on-primary hover:bg-primary/90 transition-all font-body-sm font-semibold shadow-md shadow-primary/20"
          >
            <Icon name="add_link" className="text-[18px]" />
            <span>Create New Link</span>
          </a>
        </div>
      </div>

      {/* Telemetry strip */}
      <section aria-label="Graph telemetry" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {telemetry.map((card) => (
          <div
            key={card.label}
            className="p-3.5 rounded-xl bg-surface-container flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between text-outline text-label-caps uppercase font-bold tracking-wider gap-2">
              <span className="truncate">{card.label}</span>
              <Icon name={card.icon} className={`${card.iconClass} text-[18px] shrink-0`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`font-headline-md text-headline-md font-bold text-on-surface ${
                  card.valueClass ?? ""
                }`}
              >
                {card.value}
              </span>
              <span className={`font-mono-code text-[12px] ${card.metaClass}`}>{card.meta}</span>
            </div>
          </div>
        ))}
      </section>

      <LinkManager />
    </AppShell>
  );
}
