"use client";

import { Icon } from "@/components/ui/icon";
import type { LinkSuggestion } from "@/lib/mock/link-suggestions";
import {
  ADVISORY_RULE,
  confidenceLabel,
  relationMeta,
  suggestionToRecord,
  toolIcon,
  toolLabel,
  type ProvenanceRecord,
} from "./present";

function Endpoint({
  suggestion,
  side,
}: {
  suggestion: LinkSuggestion;
  side: "source" | "target";
}) {
  const artifact = side === "source" ? suggestion.source : suggestion.target;
  const accent = side === "source" ? "text-secondary" : "text-primary";
  return (
    <div className="flex items-center gap-3 min-w-[240px]">
      <div className={`w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center ${accent}`}>
        <Icon name={toolIcon[artifact.tool]} className="text-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-code text-[11px] uppercase text-outline">
            {toolLabel[artifact.tool]}
          </span>
          <span className="font-mono-code text-[11px] text-on-surface font-semibold truncate">
            {artifact.ref}
          </span>
        </div>
        <div className="text-body-sm text-on-surface-variant truncate">{artifact.label}</div>
      </div>
    </div>
  );
}

export function SuggestionStack({
  suggestions,
  onConfirm,
  onConfirmAll,
  onDismiss,
  onInspect,
}: {
  suggestions: LinkSuggestion[];
  onConfirm: (id: string) => void;
  onConfirmAll: () => void;
  onDismiss: (id: string) => void;
  onInspect: (record: ProvenanceRecord) => void;
}) {
  const highConfidence = suggestions.filter((s) => s.confidence >= 0.85);

  return (
    <section className="space-y-4">
      <div className="p-4 rounded-xl bg-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0">
            <Icon name="smart_toy" className="text-[22px]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Pending &amp; Suggested Links for Verification
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono-code text-[11px] font-bold ${
                  suggestions.length > 0
                    ? "bg-tertiary/20 text-tertiary"
                    : "bg-secondary/20 text-secondary"
                }`}
              >
                {suggestions.length > 0 ? `${suggestions.length} UNVERIFIED` : "0 REMAINING"}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Inferred from commit messages, pull request descriptions, and Figma dev-mode comments.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={highConfidence.length === 0}
          onClick={onConfirmAll}
          title={
            highConfidence.length === 0
              ? "No suggestions above the 85% confidence threshold"
              : `Confirm ${highConfidence.length} suggestion(s) at or above 85% confidence`
          }
          className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed text-secondary text-body-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Icon name="done_all" className="text-[16px]" />
          <span>Confirm All High-Confidence</span>
        </button>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl border border-tertiary/30 bg-tertiary-container/10">
        <Icon name="policy" className="text-[16px] text-tertiary mt-0.5 shrink-0" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          <span className="text-tertiary font-semibold">Advisory gate:</span> {ADVISORY_RULE}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface-container flex flex-col items-center text-center">
          <Icon name="task_alt" className="text-[36px] text-secondary mb-2" />
          <p className="font-body-md text-body-md text-on-surface font-medium">
            Every suggestion has been verified
          </p>
          <p className="font-body-sm text-body-sm text-outline mt-1">
            The link engine will keep surfacing new candidates as artifacts change.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const meta = relationMeta[suggestion.relation];
          const strong = suggestion.confidence >= 0.85;
          return (
            <article
              key={suggestion.id}
              className="rounded-xl bg-surface-container p-4 shadow-sm transition-all hover:bg-surface-container-high"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  <Endpoint suggestion={suggestion} side="source" />
                  <div className="flex items-center justify-center px-2">
                    <span
                      className={`px-2.5 py-1 rounded font-mono-code text-[11px] font-bold flex items-center gap-1 ${meta.chipClass}`}
                    >
                      {suggestion.relation}
                      <Icon name="arrow_forward" className="text-[14px]" />
                    </span>
                  </div>
                  <Endpoint suggestion={suggestion} side="target" />
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-label-caps text-outline uppercase">
                        Confidence
                      </span>
                      <span
                        className={`font-mono-code text-[13px] font-bold ${
                          strong ? "text-secondary" : "text-tertiary"
                        }`}
                      >
                        {confidenceLabel(suggestion.confidence)}
                      </span>
                    </div>
                    <span className="font-mono-code text-[11px] text-on-surface-variant">
                      {suggestion.detector} · {suggestion.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Inspect provenance vector"
                      onClick={() => onInspect(suggestionToRecord(suggestion))}
                      className="p-2 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <Icon name="info" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(suggestion.id)}
                      className="px-3 py-1.5 rounded bg-surface-container-highest hover:bg-error-container hover:text-error text-on-surface-variant font-body-sm transition-colors flex items-center gap-1"
                    >
                      <Icon name="close" className="text-[16px]" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfirm(suggestion.id)}
                      className="px-3 py-1.5 rounded bg-secondary text-on-secondary hover:bg-secondary/90 font-body-sm font-semibold transition-all flex items-center gap-1"
                    >
                      <Icon name="check" className="text-[16px]" />
                      <span>Confirm Link</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-3 border-t border-outline-variant/40 font-mono-code text-[11px] text-on-surface-variant flex items-start gap-1.5">
                <Icon name="auto_awesome" className="text-[13px] text-tertiary mt-0.5 shrink-0" />
                <span className="uppercase tracking-wide">
                  {suggestion.eligibility} · provenance inferred · advisory only — no decisive
                  finding or notification is raised from this edge
                </span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
