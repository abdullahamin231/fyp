"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ToolPill } from "@/components/ui/badge";
import type { CriterionResult, Finding, FreshnessState, Verdict } from "@/lib/types";

const verdictStyle: Record<Verdict, string> = {
  SUPPORTED: "bg-secondary/15 text-secondary",
  CONTRADICTED: "bg-error-container text-error",
  PARTIAL: "bg-tertiary-container text-on-tertiary-container",
  INSUFFICIENT_EVIDENCE: "bg-surface-container-highest text-on-surface-variant",
};

const freshnessStyle: Record<FreshnessState, string> = {
  CURRENT: "bg-secondary/15 text-secondary",
  STALE: "bg-tertiary-container text-on-tertiary-container",
  UNKNOWN: "bg-surface-container-highest text-muted",
};

function CriterionCard({ criterion }: { criterion: CriterionResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-surface-container border border-outline-variant/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full text-left p-stack-comfortable hover:bg-surface-container-high transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-stack-compact">
          <div className="flex items-start gap-stack-compact min-w-0">
            <span className="shrink-0 px-2 py-0.5 rounded bg-primary/15 text-primary font-mono-code text-micro-label font-bold">
              {criterion.criterionId}
            </span>
            <div className="min-w-0">
              <span className="font-mono-code text-micro-label text-muted block mb-0.5">
                anchor: {criterion.requirementRef}
              </span>
              <span className="text-body-md text-on-surface font-medium">{criterion.text}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <span
              className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-bold ${verdictStyle[criterion.verdict]}`}
            >
              {criterion.verdict}
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono-code text-micro-label ${freshnessStyle[criterion.freshness]}`}
            >
              {criterion.freshness}
            </span>
            {criterion.reviewRequired ? (
              <span className="px-2 py-0.5 rounded bg-tertiary-container/40 text-on-tertiary-container font-mono-code text-micro-label font-bold">
                REVIEW REQUIRED
              </span>
            ) : null}
            <Icon
              name={open ? "expand_less" : "expand_more"}
              className="text-[18px] text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {criterion.reasonCode ? (
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-muted font-mono-code text-micro-label">
              reason: {criterion.reasonCode}
            </span>
          ) : null}
          {criterion.divergenceTag ? (
            <span className="px-2 py-0.5 rounded bg-error-container/40 text-error font-mono-code text-micro-label">
              {criterion.divergenceTag}
            </span>
          ) : null}
          <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-muted font-mono-code text-micro-label">
            {criterion.evidence.length} citation{criterion.evidence.length === 1 ? "" : "s"}
          </span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-outline-variant/40 p-stack-comfortable bg-surface-container-lowest/40 space-y-stack-comfortable">
          {criterion.evidence.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              No citation retrieved for this criterion
            </p>
          ) : (
            criterion.evidence.map((citation, index) => (
              <div key={`${citation.locator}-${index}`} className="rounded bg-surface-container-lowest/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <ToolPill tool={citation.tool}>{citation.locator}</ToolPill>
                  <span
                    className={`font-mono-code text-micro-label font-bold ${
                      citation.resolved ? "text-secondary" : "text-error"
                    }`}
                  >
                    {citation.resolved ? "CITATION RESOLVED" : "CITATION UNRESOLVED"}
                  </span>
                </div>
                <p className="font-mono-code text-[12px] text-on-surface-variant leading-relaxed border-l-2 border-outline-variant pl-3">
                  “{citation.excerpt}”
                </p>
              </div>
            ))
          )}

          {(criterion.missingEvidence ?? []).length > 0 ? (
            <div className="rounded bg-tertiary-container/10 border border-tertiary/20 p-4">
              <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-wider block mb-1.5">
                Missing evidence
              </span>
              <ul className="space-y-1.5">
                {(criterion.missingEvidence ?? []).map((item) => (
                  <li
                    key={item}
                    className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-2"
                  >
                    <Icon name="remove" className="text-tertiary text-[14px] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Criterion-by-criterion verdict table (expandable rows). */
export function CriterionResults({ finding }: { finding: Finding }) {
  return (
    <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-stack-comfortable mb-gutter">
        <div className="flex items-center gap-2">
          <Icon name="checklist" className="text-primary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Criterion-by-Criterion Results
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono-code text-micro-label text-muted">
            {finding.criteria.length} anchored
          </span>
          {finding.reviewRequired ? (
            <span className="px-2 py-0.5 rounded bg-tertiary-container/40 text-on-tertiary-container font-mono-code text-micro-label font-bold">
              HUMAN REVIEW REQUIRED
            </span>
          ) : null}
          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label font-bold">
            {finding.verdict ?? "INSUFFICIENT_EVIDENCE"}
          </span>
        </div>
      </div>

      {finding.criteria.length === 0 ? (
        <div className="rounded-lg bg-surface-container p-stack-comfortable border border-dashed border-outline-variant flex items-start gap-3">
          <Icon name="info" className="text-muted text-[18px] mt-0.5" />
          <div>
            <p className="text-body-md text-on-surface font-semibold">
              No anchored criteria in this packet
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-stack-comfortable">
          {finding.criteria.map((criterion) => (
            <CriterionCard key={criterion.criterionId} criterion={criterion} />
          ))}
        </div>
      )}
    </section>
  );
}
