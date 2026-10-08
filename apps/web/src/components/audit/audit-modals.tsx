"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AuditEvent } from "@/lib/mock/audit";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

/** Raw event payload inspector (JSON) from the audit table. */
export function InspectModal({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEscape(Boolean(event), onClose);

  if (!event) return null;

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(event?.payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-margin-page"
      role="dialog"
      aria-modal="true"
      aria-label="Event proof inspector"
      onClick={(click) => {
        if (click.target === click.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded bg-surface-container-high shadow-2xl p-margin-page relative flex flex-col space-y-stack-comfortable max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="terminal" className="text-primary text-[20px]" />
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Event Proof Inspector
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1 rounded hover:bg-surface-bright text-outline hover:text-on-surface transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded font-mono-code text-[11px] gap-3">
          <span className="text-outline">VERIFICATION HASH:</span>
          <span className="text-secondary font-medium truncate">0x{event.hash}</span>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded font-mono-code text-[12px] text-on-surface-variant max-h-72 overflow-y-auto leading-relaxed">
          <pre className="whitespace-pre-wrap text-primary-fixed-dim break-all">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-stack-compact gap-3 flex-wrap">
          <span className="font-body-sm text-body-sm text-outline flex items-center gap-1">
            <Icon name="check_circle" className="text-[15px] text-secondary" />
            Redacted Vendor Secrets: None Present
          </span>
          <button
            type="button"
            onClick={copyPayload}
            className="px-3 py-1.5 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono-code text-[12px] transition-colors"
          >
            {copied ? "Copied ✓" : "Copy Payload"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Before/after state diff for a single audit event. */
export function DiffModal({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  useEscape(Boolean(event), onClose);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-margin-page"
      role="dialog"
      aria-modal="true"
      aria-label="Artifact state diff"
      onClick={(click) => {
        if (click.target === click.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded bg-surface-container-high shadow-2xl p-margin-page relative flex flex-col space-y-stack-comfortable">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="difference" className="text-secondary text-[20px] shrink-0" />
            <span className="font-headline-sm text-headline-sm text-on-surface truncate">
              Diff: {event.artifact.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close diff"
            className="p-1 rounded hover:bg-surface-bright text-outline hover:text-on-surface transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="space-y-2 font-mono-code text-[12px]">
          <div className="p-3 rounded bg-error-container/20 text-error flex items-start gap-2">
            <span className="font-bold select-none">-</span>
            <div className="break-all font-mono-code">{event.diff.removed}</div>
          </div>
          <div className="p-3 rounded bg-secondary-container/20 text-secondary flex items-start gap-2">
            <span className="font-bold select-none">+</span>
            <div className="break-all font-mono-code">{event.diff.added}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-stack-compact">
          <span className="font-mono-code text-[11px] text-outline truncate">{event.hash}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-primary-container text-on-primary-container font-body-sm text-body-sm font-semibold transition-colors"
          >
            Dismiss Diff
          </button>
        </div>
      </div>
    </div>
  );
}
