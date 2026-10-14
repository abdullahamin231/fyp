"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import type { IngestCounts, IngestedEvent } from "@/lib/types";

const toolIcon: Record<string, string> = {
  figma: "draw",
  github: "commit",
  jira: "confirmation_number",
  system: "settings",
};

const toolLabel: Record<string, string> = {
  figma: "Figma",
  github: "GitHub",
  jira: "Jira",
  system: "System",
};

const actionTone: Record<string, "info" | "neutral" | "accent"> = {
  opened: "info",
  closed: "neutral",
  synchronize: "accent",
  pushed: "accent",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function shortVersion(value: string | null) {
  return value ? value.slice(0, 7) : "—";
}

function IngestedRow({ event }: { event: IngestedEvent }) {
  const [expanded, setExpanded] = useState(false);
  const hasState = event.stateBefore !== null || event.stateAfter !== null;
  const action = actionTone[event.action] ?? "neutral";

  return (
    <>
      <tr className="border-t border-outline-variant align-top">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 text-on-surface">
            <Icon name={toolIcon[event.sourceTool] ?? "hub"} className="text-[18px] text-primary" />
            <span className="font-body-sm text-body-sm">{toolLabel[event.sourceTool] ?? event.sourceTool}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="font-body-sm text-body-sm text-on-surface">{event.entityType}</div>
          <div className="font-mono-code text-micro-label text-on-surface-variant break-all">{event.entityId}</div>
        </td>
        <td className="px-4 py-3"><Badge tone={action}>{event.action}</Badge></td>
        <td className="px-4 py-3 font-mono-code text-micro-label text-on-surface-variant">
          {hasState ? `${event.stateBefore ?? "—"} → ${event.stateAfter ?? "—"}` : "—"}
        </td>
        <td className="px-4 py-3">
          <code title={event.version ?? undefined} className="font-mono-code text-micro-label text-on-surface-variant">
            {shortVersion(event.version)}
          </code>
        </td>
        <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{event.actor}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <time dateTime={event.occurredAt} className="font-mono-code text-micro-label text-on-surface-variant">
            {formatDate(event.occurredAt)}
          </time>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <time dateTime={event.receivedAt} className="font-mono-code text-micro-label text-on-surface-variant">
            {formatDate(event.receivedAt)}
          </time>
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex items-center gap-1 text-primary hover:text-accent-hover"
          >
            <Badge tone="neutral">{event.references.length}</Badge>
            <Icon name={expanded ? "expand_less" : "expand_more"} className="text-[18px]" />
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-surface-container border-t border-outline-variant">
          <td colSpan={9} className="px-4 py-4">
            <div className="grid gap-4 text-body-sm">
              <div>
                <h4 className="font-label-caps text-label-caps uppercase text-muted">References</h4>
                {event.references.length > 0 ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-micro-label text-muted">
                        <tr><th className="pr-4 pb-1">Entity</th><th className="pb-1">found in</th></tr>
                      </thead>
                      <tbody>
                        {event.references.map((reference, index) => (
                          <tr key={`${reference.entityType}-${reference.entityId}-${index}`} className="border-t border-outline-variant">
                            <td className="py-1.5 pr-4 font-mono-code text-micro-label text-on-surface">
                              {reference.entityType} · {reference.entityId}
                            </td>
                            <td className="py-1.5 text-on-surface-variant">{reference.provenance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="mt-2 text-on-surface-variant">No references extracted.</p>}
              </div>
              <div className="grid gap-1">
                <span className="font-mono-code text-micro-label break-all text-on-surface-variant">event_id: {event.eventId}</span>
                <span className="font-mono-code text-micro-label break-all text-on-surface-variant">vendor_delivery_id: {event.vendorDeliveryId}</span>
                <span className="font-mono-code text-micro-label break-all text-on-surface-variant">raw_hash: {event.rawHash}</span>
              </div>
              {event.rawPayload ? (
                <details>
                  <summary className="cursor-pointer font-label-caps text-label-caps text-primary">Redacted raw payload</summary>
                  <pre className="mt-2 max-h-80 overflow-auto rounded bg-surface-container-lowest p-3 font-mono-code text-micro-label text-on-surface-variant">
                    {JSON.stringify(event.rawPayload, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function IngestView({ events, counts }: { events: IngestedEvent[]; counts: IngestCounts }) {
  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Ingestion</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
          Every provider delivery UNIFY has received, and the normalised events extracted from them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <StatCard label="Deliveries received" value={String(counts.deliveries)} hint="Raw webhook receipts" icon="move_to_inbox" />
        <StatCard label="Events normalised" value={String(counts.events)} hint="Deliveries may normalise to no event" icon="data_object" />
        <StatCard label="Providers" value={String(counts.providers.length)} hint={counts.providers.join(", ") || "None yet"} icon="hub" />
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Normalised events"
          description="Newest received events first. References show extracted evidence, not linking outcomes."
        />
        {events.length === 0 ? (
          <div className="px-4 pb-6 pt-2 text-body-md text-on-surface-variant">
            No provider events ingested yet.
            {counts.deliveries > 0 ? ` ${counts.deliveries} deliveries received but normalised to no events.` : ""}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left">
              <thead className="bg-surface-container text-label-caps text-label-caps uppercase tracking-wider text-muted">
                <tr>
                  {["Provider", "Entity", "Action", "State", "Version", "Actor", "Occurred", "Received", "References"].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{events.map((event) => <IngestedRow key={event.eventId} event={event} />)}</tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
