import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { LinkManager } from "@/components/links/link-manager";
import { isDecisive } from "@/components/links/present";
import { listLinks } from "@/lib/data/queries";

/**
 * Link management — a server component over the RLS-scoped `edges` table.
 *
 * Confirmed and system-confirmed links render in the directory; everything
 * still awaiting a human (derived, model-candidate, unresolved) sits in the
 * verification queue, where confirm/reject write back through the server
 * actions with the reviewer's resolver string and an audit row.
 */

export const metadata: Metadata = {
  title: "Link Management",
  description:
    "Manage explicit cross-tool graph bindings, verify heuristic link suggestions and inspect cryptographic provenance across Figma, GitHub and Jira.",
};

export default async function LinksPage() {
  const { links, suggestions } = await listLinks();

  const advisoryLinks = links.filter((link) => !isDecisive(link.eligibility));
  const decisiveLinks = links.filter((link) => isDecisive(link.eligibility));
  const pendingSuggestions = suggestions.length + advisoryLinks.length;
  const avgConfidence =
    pendingSuggestions === 0
      ? 0
      : Math.round(
          ((advisoryLinks.reduce((sum, link) => sum + link.confidence, 0) +
            suggestions.reduce((sum, link) => sum + link.confidence, 0)) /
            pendingSuggestions) *
            1000,
        ) / 10;

  const telemetry: {
    label: string;
    value: string;
    meta?: string;
    metaClass?: string;
    icon: string;
    iconClass: string;
    valueClass?: string;
  }[] = [
    {
      label: "Explicit Edges",
      value: String(decisiveLinks.length),
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
  ];
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
        <div className="space-y-2">
          <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Link Management &amp; Relationship Provenance
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
            Manage explicit cross-system graph bindings, inspect heuristic AI link suggestions, and
            verify cryptographic provenance trails across Figma, GitHub, and Jira.
          </p>
        </div>
        <a
          href="#link-wizard"
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded bg-primary text-on-primary hover:bg-primary/90 transition-all font-body-sm font-semibold shadow-md shadow-primary/20"
        >
          <Icon name="add_link" className="text-[18px]" />
          <span>Create New Link</span>
        </a>
      </div>

      {/* Derived graph counts */}
      <section aria-label="Graph telemetry" className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {telemetry.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-surface-container flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between text-muted text-label-caps uppercase font-bold tracking-wider gap-2">
              <span className="truncate">{card.label}</span>
              <Icon name={card.icon} className={`${card.iconClass} text-[18px] shrink-0`} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`font-headline-md text-headline-md font-bold text-on-surface ${
                  card.valueClass ?? ""
                }`}
              >
                {card.value}
              </span>
              {card.meta ? (
                <span className={`font-mono-code text-[12px] ${card.metaClass ?? ""}`}>
                  {card.meta}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <LinkManager initialLinks={links} initialSuggestions={suggestions} />
    </AppShell>
  );
}
