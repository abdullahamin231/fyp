"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { RelationLink, ToolKind } from "@/lib/types";
import {
  ELIGIBILITIES,
  PROVENANCES,
  RELATIONS,
  confidenceLabel,
  eligibilityMeta,
  isDecisive,
  provenanceMeta,
  relativeTime,
  relationMeta,
  toolIcon,
  toolLabel,
} from "./present";

type ToolFilter = "all" | ToolKind;

const TOOL_FILTERS: { id: ToolFilter; label: string }[] = [
  { id: "all", label: "All Tools" },
  { id: "figma", label: "Figma" },
  { id: "github", label: "GitHub" },
  { id: "jira", label: "Jira" },
];

function ArtifactCell({
  artifact,
  variant,
}: {
  artifact: RelationLink["source"];
  variant: "source" | "target";
}) {
  const tone =
    variant === "source"
      ? "bg-secondary/15 text-secondary"
      : "bg-primary/20 text-primary";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${tone}`}>
        <Icon name={toolIcon[artifact.tool]} className="text-[16px]" />
      </div>
      <div className="min-w-0">
        <div className="font-mono-code font-bold text-on-surface truncate">{artifact.ref}</div>
        <div className="font-mono-code text-[11px] text-outline truncate">
          {toolLabel[artifact.tool].toUpperCase()} · {artifact.label}
        </div>
      </div>
    </div>
  );
}

export function LinkDirectory({
  links,
  onConfirm,
  onReject,
  onUnlink,
  onAudit,
}: {
  links: RelationLink[];
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onUnlink: (id: string) => void;
  onAudit: (link: RelationLink) => void;
}) {
  const [tool, setTool] = useState<ToolFilter>("all");
  const [relation, setRelation] = useState<"ALL" | RelationLink["relation"]>("ALL");
  const [provenance, setProvenance] = useState<"ALL" | RelationLink["provenance"]>("ALL");
  const [eligibility, setEligibility] = useState<"ALL" | RelationLink["eligibility"]>("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((link) => {
      if (tool !== "all" && link.source.tool !== tool) return false;
      if (relation !== "ALL" && link.relation !== relation) return false;
      if (provenance !== "ALL" && link.provenance !== provenance) return false;
      if (eligibility !== "ALL" && link.eligibility !== eligibility) return false;
      if (!q) return true;
      const haystack = [
        link.id,
        link.source.ref,
        link.source.title ?? "",
        link.target.ref,
        link.target.title ?? "",
        link.relation,
        link.confirmedBy ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [links, tool, relation, provenance, eligibility, query]);

  const visibleIds = filtered.map((link) => link.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const selectedLinks = links.filter((link) => selected.has(link.id));
  const pendingSelected = selectedLinks.filter((link) => !isDecisive(link.eligibility));
  const decisiveSelected = selectedLinks.filter((link) => isDecisive(link.eligibility));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function runBulk(action: "confirm" | "reject" | "unlink", targets: RelationLink[]) {
    targets.forEach((link) => {
      if (action === "confirm") onConfirm(link.id);
      else if (action === "reject") onReject(link.id);
      else onUnlink(link.id);
    });
    setSelected(new Set());
  }

  return (
    <section className="space-y-4">
      {/* Filter toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-lg bg-surface-container-lowest">
            {TOOL_FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTool(entry.id)}
                className={`px-3 py-1 rounded font-mono-code text-body-sm transition-colors ${
                  tool === entry.id
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              aria-label="Filter by relationship"
              value={relation}
              onChange={(e) => setRelation(e.target.value as typeof relation)}
              className="px-3 py-1.5 pr-8 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Relationship: All</option>
              {RELATIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filter by provenance"
              value={provenance}
              onChange={(e) => setProvenance(e.target.value as typeof provenance)}
              className="px-3 py-1.5 pr-8 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Provenance: All</option>
              {PROVENANCES.map((prov) => (
                <option key={prov} value={prov}>
                  {provenanceMeta[prov].label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filter by eligibility"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value as typeof eligibility)}
              className="px-3 py-1.5 pr-8 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Eligibility: All</option>
              {ELIGIBILITIES.map((entry) => (
                <option key={entry} value={entry}>
                  {eligibilityMeta[entry].label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
            />
          </div>
        </div>

        <div className="relative min-w-[280px]">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by artifact key, title, author..."
            className="w-full pl-9 pr-4 py-1.5 rounded bg-surface-container-lowest text-on-surface placeholder:text-outline font-mono-code text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedLinks.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-primary-container/15 border border-primary/30">
          <div className="flex items-center gap-2 font-mono-code text-[12px] text-on-surface">
            <Icon name="checklist" className="text-[16px] text-primary" />
            <span className="font-semibold">{selectedLinks.length}</span> selected
            <span className="text-outline">·</span>
            <span className="text-on-surface-variant">
              {pendingSelected.length} advisory · {decisiveSelected.length} eligible
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pendingSelected.length === 0}
              onClick={() => runBulk("confirm", pendingSelected)}
              title={
                pendingSelected.length === 0
                  ? "Only inferred or unconfirmed links can be confirmed"
                  : "Confirm every selected advisory link"
              }
              className="px-3 py-1.5 rounded bg-secondary text-on-secondary disabled:opacity-40 disabled:cursor-not-allowed font-body-sm text-body-sm font-semibold hover:bg-secondary/90 transition flex items-center gap-1.5"
            >
              <Icon name="check" className="text-[15px]" />
              Confirm ({pendingSelected.length})
            </button>
            <button
              type="button"
              disabled={pendingSelected.length === 0}
              onClick={() => runBulk("reject", pendingSelected)}
              title={
                pendingSelected.length === 0
                  ? "Only inferred or unconfirmed links can be rejected"
                  : "Reject every selected advisory link"
              }
              className="px-3 py-1.5 rounded bg-surface-container-highest text-on-surface-variant hover:bg-error-container hover:text-error disabled:opacity-40 disabled:cursor-not-allowed font-body-sm text-body-sm transition flex items-center gap-1.5"
            >
              <Icon name="close" className="text-[15px]" />
              Reject ({pendingSelected.length})
            </button>
            <button
              type="button"
              disabled={decisiveSelected.length === 0}
              onClick={() => runBulk("unlink", decisiveSelected)}
              title={
                decisiveSelected.length === 0
                  ? "Only established links can be unlinked"
                  : "Unlink every selected established link"
              }
              className="px-3 py-1.5 rounded bg-error-container text-on-error disabled:opacity-40 disabled:cursor-not-allowed font-body-sm text-body-sm transition flex items-center gap-1.5"
            >
              <Icon name="link_off" className="text-[15px]" />
              Unlink ({decisiveSelected.length})
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-sm text-body-sm transition"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* Relationship directory table */}
      <div className="overflow-x-auto rounded-xl bg-surface-container shadow-md">
        <table className="w-full text-left text-body-sm border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-surface-container-highest/60 bg-surface-container-low font-label-caps text-label-caps uppercase text-outline">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all visible relationships"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  className="rounded bg-surface-container-highest cursor-pointer focus:ring-0"
                />
              </th>
              <th className="py-3 px-4 font-bold">Source Artifact</th>
              <th className="py-3 px-4 font-bold text-center">Relationship</th>
              <th className="py-3 px-4 font-bold">Target Artifact</th>
              <th className="py-3 px-4 font-bold">Eligibility</th>
              <th className="py-3 px-4 font-bold">Provenance &amp; Confidence</th>
              <th className="py-3 px-4 font-bold">Sync Age</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest/40 font-body-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <Icon name="find_in_page" className="text-[32px] text-outline mb-2 block mx-auto" />
                  <p className="font-body-md text-body-md text-on-surface font-medium">
                    No relationships match the current filters
                  </p>
                  <p className="font-body-sm text-body-sm text-outline mt-1">
                    Try relaxing the tool, relationship or eligibility constraints.
                  </p>
                </td>
              </tr>
            ) : null}

            {filtered.map((link) => {
              const meta = eligibilityMeta[link.eligibility];
              const prov = provenanceMeta[link.provenance];
              const decisive = isDecisive(link.eligibility);
              const checked = selected.has(link.id);
              return (
                <tr
                  key={link.id}
                  className={`hover:bg-surface-container-high transition-colors ${
                    checked ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${link.id}`}
                      checked={checked}
                      onChange={() => toggle(link.id)}
                      className="rounded bg-surface-container-highest cursor-pointer focus:ring-0"
                    />
                  </td>
                  <td className="py-3 px-4 min-w-[220px]">
                    <ArtifactCell artifact={link.source} variant="source" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      title={relationMeta[link.relation].description}
                      className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold whitespace-nowrap ${relationMeta[link.relation].chipClass}`}
                    >
                      {link.relation}
                    </span>
                  </td>
                  <td className="py-3 px-4 min-w-[220px]">
                    <ArtifactCell artifact={link.target} variant="target" />
                  </td>
                  <td className="py-3 px-4 min-w-[170px]">
                    <span
                      title={meta.hint}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider font-bold ${
                        meta.tone === "critical"
                          ? "bg-error-container text-error"
                          : meta.tone === "warning"
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : meta.tone === "info"
                              ? "bg-primary-container text-on-primary-container"
                              : meta.tone === "success"
                                ? "bg-secondary/15 text-secondary"
                                : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      <Icon name={meta.icon} className="text-[13px]" />
                      {meta.label}
                    </span>
                    <div className="font-mono-code text-[10px] text-outline mt-1">
                      {decisive ? "eligible for decisive findings" : "advisory — gated"}
                    </div>
                  </td>
                  <td className="py-3 px-4 min-w-[190px]">
                    <div className="flex items-center gap-1.5">
                      <Icon name={prov.icon} className="text-[15px] text-on-surface-variant" />
                      <span className="font-mono-code text-[12px] text-on-surface font-medium">
                        {prov.label} · {confidenceLabel(link.confidence)}
                      </span>
                    </div>
                    <div className="font-mono-code text-[10px] text-outline truncate">
                      {link.confirmedBy ? `confirmed by ${link.confirmedBy}` : prov.note}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono-code text-[12px] text-on-surface">
                      {relativeTime(link.changedAt)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-mono-code">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Active sync
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {decisive ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onAudit(link)}
                            title="Inspect provenance record"
                            className="px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant hover:text-on-surface text-[12px] transition-colors font-mono-code"
                          >
                            Audit
                          </button>
                          <button
                            type="button"
                            onClick={() => onUnlink(link.id)}
                            title="Decouple this relationship — writes an audit record"
                            className="px-2 py-1 rounded bg-surface-container-highest hover:bg-error-container hover:text-error text-on-surface-variant text-[12px] transition-colors font-mono-code"
                          >
                            Unlink
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onConfirm(link.id)}
                            title={meta.hint}
                            className="px-2 py-1 rounded bg-secondary text-on-secondary hover:bg-secondary/90 text-[12px] transition-colors font-mono-code font-semibold flex items-center gap-1"
                          >
                            <Icon name="check" className="text-[13px]" />
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(link.id)}
                            title="Reject this suggestion — writes an audit record"
                            className="px-2 py-1 rounded bg-surface-container-highest hover:bg-error-container hover:text-error text-on-surface-variant text-[12px] transition-colors font-mono-code flex items-center gap-1"
                          >
                            <Icon name="close" className="text-[13px]" />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => onAudit(link)}
                            title="Inspect provenance record"
                            className="px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant hover:text-on-surface text-[12px] transition-colors font-mono-code"
                          >
                            Audit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-body-sm text-on-surface-variant font-mono-code text-[12px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <span className="text-on-surface font-semibold">{filtered.length}</span> of{" "}
            <span className="text-on-surface font-semibold">{links.length}</span> relationships
          </span>
          <span className="text-outline">·</span>
          <span className="text-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Live Graph Synchronizer
            Connected
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="px-2.5 py-1 rounded bg-surface-container text-outline disabled:opacity-50"
          >
            Prev
          </button>
          <button type="button" className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-bold">
            1
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            2
          </button>
          <span className="px-1 text-outline">…</span>
          <button
            type="button"
            className="px-2.5 py-1 rounded bg-surface-container text-outline hover:text-on-surface"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
