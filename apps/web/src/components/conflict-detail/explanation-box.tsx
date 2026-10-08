"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { explanationFor, ruleAstFor } from "@/lib/mock/conflict-detail";
import type { Finding } from "@/lib/types";

const toneClass: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  error: "text-error",
};

/**
 * "Semantic Explanation" box from the reference — plain-language summary of the
 * finding plus a collapsible deterministic rule AST drawer.
 */
export function ExplanationBox({ finding }: { finding: Finding }) {
  const [showAst, setShowAst] = useState(false);
  const parts = explanationFor(finding);
  const ast = ruleAstFor(finding);

  return (
    <section className="rounded-xl bg-surface-container p-margin-page shadow-md relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-margin-page">
        <div className="flex items-start gap-gutter min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon name="auto_awesome" className="text-[24px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                Semantic explanation
              </span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline font-mono-code text-[10px]">
                Deterministic rule graph
              </span>
            </div>
            <p className="text-on-surface font-body-lg text-body-lg leading-relaxed">
              {parts.map((part, index) => {
                const classes = [
                  part.mono ? "font-mono-code font-medium" : "",
                  part.strong ? "font-semibold" : "",
                  part.tone ? toneClass[part.tone] : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return classes ? (
                  <span key={index} className={classes}>
                    {part.text}
                  </span>
                ) : (
                  <span key={index}>{part.text}</span>
                );
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-stack-compact shrink-0">
          <button
            type="button"
            onClick={() => setShowAst((value) => !value)}
            className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-body-sm font-body-sm flex items-center gap-1.5 transition-colors"
          >
            <Icon name={showAst ? "close" : "data_object"} className="text-[16px]" />
            <span>{showAst ? "Hide AST" : "View Rule AST"}</span>
          </button>
        </div>
      </div>

      {showAst ? (
        <div className="mt-gutter pt-gutter border-t border-surface-container-highest">
          <div className="rounded-lg bg-surface-container-lowest p-stack-comfortable font-mono-code text-[12px] text-on-surface-variant overflow-x-auto leading-5">
            <pre>
              <code>{ast}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
