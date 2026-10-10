"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { RELATIONS, guessArtifact, relationMeta, toolIcon, type Relation } from "./present";

export interface LinkDraft {
  source: string;
  target: string;
  relation: Relation;
  notes: string;
}

function PreviewCard({
  value,
  placeholder,
  meta,
  footer,
}: {
  value: string;
  placeholder: string;
  /**
   * DATA HOLE — workspace/branch context and last-modified attribution come
   * from the artifact API once a node resolves; both render as an em dash
   * until then.
   */
  meta?: string;
  footer?: string;
}) {
  const artifact = guessArtifact(value);
  return (
    <div className="p-4 rounded-lg bg-surface-container-high space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-variant font-mono-code text-micro-label text-on-surface-variant">
          <Icon name={toolIcon[artifact.tool]} className="text-[13px]" />
          {artifact.kind}
        </span>
        <span className="font-mono-code text-micro-label text-muted">
          {value.trim() ? "Resolved node" : "Awaiting input"}
        </span>
      </div>
      <div className="font-body-md text-body-md font-semibold text-on-surface truncate">
        {value.trim() || placeholder}
      </div>
      <div className="text-body-sm text-on-surface-variant truncate">{meta ?? "—"}</div>
      <div className="flex items-center gap-2 pt-1 font-mono-code text-micro-label text-muted">
        <Icon name="history" className="text-[14px]" />
        <span className="truncate">{footer ?? "—"}</span>
      </div>
    </div>
  );
}

export function LinkWizard({ onEstablish }: { onEstablish: (draft: LinkDraft) => void }) {
  /**
   * DATA HOLE — the wizard starts empty.
   * Source/target are supplied by the user (or, later, preselected from the
   * graph API); nothing is prefilled until then.
   */
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [relation, setRelation] = useState<Relation>("IMPLEMENTS");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  function establish() {
    if (!source.trim() || !target.trim()) {
      setStatus({ tone: "warn", text: "Define both source and target artifacts before linking." });
      return;
    }
    onEstablish({ source: source.trim(), target: target.trim(), relation, notes: notes.trim() });
    setNotes("");
    setStatus({
      tone: "ok",
      text: "Link committed to the live knowledge graph with manual provenance.",
    });
  }

  function reset() {
    setSource("");
    setTarget("");
    setNotes("");
    setStatus(null);
  }

  return (
    <section
      id="link-wizard"
      className="rounded-xl bg-surface-container-low p-4 shadow-xl relative overflow-hidden scroll-mt-24"
    >
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
            <Icon name="timeline" className="text-[20px]" />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Create / Connect New Relationship
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Declare explicit directional links across your design systems, repos, and trackers.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-surface-container font-mono-code text-label-caps text-muted uppercase tracking-wider">
          SYNAPSE-BUILDER
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mt-2">
        {/* 1. Source */}
        <div className="lg:col-span-4 bg-surface-container rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label htmlFor="link-source" className="font-label-caps text-label-caps uppercase text-muted">
              1. Source Artifact
            </label>
            <span className="font-mono-code text-micro-label text-secondary">Origin Node</span>
          </div>
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]"
            />
            <input
              id="link-source"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setStatus(null);
              }}
              placeholder="Search Figma, GitHub, Jira..."
              className="w-full pl-9 pr-8 py-2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-mono-code focus:outline-none focus:ring-1 focus:ring-primary shadow-inner placeholder:text-muted"
            />
          </div>
          <PreviewCard value={source} placeholder="No source selected" />
        </div>

        {/* 2. Relationship */}
        <div className="lg:col-span-4 bg-surface-container rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-muted">
              2. Relationship Type
            </span>
            <span className="font-mono-code text-micro-label text-primary font-bold">{relation}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {RELATIONS.map((rel) => {
              const active = rel === relation;
              return (
                <button
                  key={rel}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRelation(rel)}
                  className={`flex items-center justify-between px-3 py-2 rounded font-mono-code text-[12px] transition-all ${
                    rel === "BLOCKS" ? "col-span-2" : ""
                  } ${
                    active
                      ? "bg-primary-container text-on-primary-container font-semibold"
                      : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span>{rel}</span>
                  <Icon name={relationMeta[rel].icon} className="text-[14px]" />
                </button>
              );
            })}
          </div>
          <div className="p-3.5 rounded bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant italic">
            {relationMeta[relation].description}
          </div>
        </div>

        {/* 3. Target */}
        <div className="lg:col-span-4 bg-surface-container rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label htmlFor="link-target" className="font-label-caps text-label-caps uppercase text-muted">
              3. Target Artifact
            </label>
            <span className="font-mono-code text-micro-label text-tertiary">Destination Node</span>
          </div>
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]"
            />
            <input
              id="link-target"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setStatus(null);
              }}
              placeholder="Search target PR, Jira key..."
              className="w-full pl-9 pr-8 py-2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-mono-code focus:outline-none focus:ring-1 focus:ring-primary shadow-inner placeholder:text-muted"
            />
          </div>
          <PreviewCard value={target} placeholder="No target selected" />
        </div>
      </div>

      {/* Reason + commit bar */}
      <div className="mt-5 p-4 rounded-xl bg-surface-container-lowest flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 rounded bg-surface-container text-muted">
            <Icon name="swap_horiz" className="text-[20px]" />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="link-notes"
              className="font-label-caps text-label-caps uppercase text-muted"
            >
              Link Reason / Context Notes (Optional)
            </label>
            <input
              id="link-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Implementing spec from Figma design review"
              className="w-full mt-1 px-3 py-1.5 rounded bg-surface-container text-body-sm text-on-surface placeholder-muted focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            {status ? (
              <p
                aria-live="polite"
                className={`mt-2 font-mono-code text-micro-label ${
                  status.tone === "ok" ? "text-secondary" : "text-tertiary"
                }`}
              >
                {status.text}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-sm transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={establish}
            className="flex items-center gap-2 px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary/90 transition-all font-body-sm font-semibold shadow-md shadow-secondary/20"
          >
            <Icon name="link" className="text-[18px]" />
            <span>Establish Link</span>
          </button>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
        <Icon name="info" className="text-[15px] text-muted mt-0.5" />
        <span>
          Links created here are <span className="text-on-surface font-semibold">manual</span>{" "}
          provenance and <span className="text-secondary font-semibold">confirmed</span> eligibility,
          so they may take part in decisive findings and notifications.
        </span>
      </p>
    </section>
  );
}
