"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { eligibilityMeta, isDecisive, provenanceMeta, type ProvenanceRecord } from "./present";

/**
 * Provenance Record & Evidence Chain slide-over — mirrors the Stitch modal,
 * and switches its verdict chip to a warning when the edge is advisory only.
 */
export function ProvenanceModal({
  record,
  onClose,
}: {
  record: ProvenanceRecord | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!record) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  if (!record) return null;

  const meta = eligibilityMeta[record.eligibility];
  const prov = provenanceMeta[record.provenance];
  const decisive = isDecisive(record.eligibility);

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Provenance record"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low p-4 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-container-highest pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary shrink-0">
              <Icon name="verified_user" className="text-[24px]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Provenance Record &amp; Evidence Chain
                </h3>
                <span
                  className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-semibold ${
                    decisive ? "bg-secondary/15 text-secondary" : "bg-tertiary/20 text-tertiary"
                  }`}
                >
                  {decisive ? "VERIFIED" : "ADVISORY"}
                </span>
              </div>
              <p className="font-mono-code text-[12px] text-on-surface-variant">
                Immutable graph binding digest &amp; cryptographic trace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close provenance inspector"
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Binding vector */}
        <div className="p-4 rounded-xl bg-surface-container-lowest space-y-3">
          <div className="font-label-caps text-label-caps uppercase text-muted">
            Target Binding Vector
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="p-2.5 rounded bg-surface-container flex-1 min-w-0">
              <div className="font-label-caps text-label-caps text-secondary">SOURCE NODE</div>
              <div className="font-mono-code text-[13px] font-bold text-on-surface truncate">
                {record.source}
              </div>
              <div className="font-mono-code text-micro-label text-muted truncate">
                {record.sourceMeta}
              </div>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <Icon name="arrow_right_alt" className="text-primary text-[20px]" />
              <span className="font-mono-code text-micro-label text-on-surface-variant">
                {record.relation}
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container flex-1 min-w-0">
              <div className="font-label-caps text-label-caps text-primary">TARGET NODE</div>
              <div className="font-mono-code text-[13px] font-bold text-on-surface truncate">
                {record.target}
              </div>
              <div className="font-mono-code text-micro-label text-muted truncate">
                {record.targetMeta}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-3">
          <div className="font-label-caps text-label-caps uppercase text-muted">
            Inference &amp; Verification Evidence
          </div>
          <div className="p-3.5 rounded-lg bg-surface-container space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Confidence Rating:
              </span>
              <span
                className={`font-mono-code text-body-sm font-bold ${
                  decisive ? "text-secondary" : "text-tertiary"
                }`}
              >
                {record.confidence}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Evidence Digest:
              </span>
              <span className="font-mono-code text-micro-label text-muted">{record.digest}</span>
            </div>
            <p className="font-mono-code text-body-sm text-on-surface bg-surface-container-lowest p-2 rounded">
              {record.evidence}
            </p>
          </div>
        </div>

        {/* Advisory rule */}
        {!decisive ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-tertiary-container/15 border border-tertiary/30">
            <Icon name="warning" className="text-[16px] text-tertiary mt-0.5 shrink-0" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="text-tertiary font-semibold">{meta.label} edge.</span> {meta.hint}{" "}
              Confirming it makes the edge eligible for decisive findings without changing how it
              was derived.
            </p>
          </div>
        ) : null}

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface-container">
            <span className="font-label-caps text-label-caps text-muted uppercase">
              Health Status
            </span>
            <div
              className={`mt-1 flex items-center gap-1.5 font-mono-code text-body-sm font-bold ${
                decisive ? "text-secondary" : "text-tertiary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  decisive ? "bg-secondary" : "bg-tertiary"
                }`}
              />
              {decisive ? "Synced & Unbroken" : "Advisory — awaiting confirmation"}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-container">
            <span className="font-label-caps text-label-caps text-muted uppercase">
              Policy Classification
            </span>
            <div className="mt-1 font-mono-code text-body-sm text-on-surface font-semibold">
              {prov.label} provenance · {decisive ? "Zero-Trust Bound (Level 2)" : "Unbound"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest gap-3 flex-wrap">
          <span className="font-mono-code text-micro-label text-muted">{record.digest}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
