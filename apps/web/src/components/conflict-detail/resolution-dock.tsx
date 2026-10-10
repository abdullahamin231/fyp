"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { disputeReasons, suppressionReasons } from "@/lib/mock/conflict-detail";
import type { Finding } from "@/lib/types";

type Dialog = "suppress" | "dispute" | null;

const statusCopy: Record<Finding["status"], { dot: string; label: string }> = {
  open: { dot: "bg-error animate-pulse", label: "Remediation action required" },
  acknowledged: { dot: "bg-tertiary", label: "Acknowledged — awaiting resolution" },
  resolved: { dot: "bg-secondary", label: "Resolution recorded" },
  suppressed: { dot: "bg-outline", label: "Suppressed — alerts muted" },
};

const actionButton =
  "px-3 py-2 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-body-sm font-body-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container";

interface Toast {
  title: string;
  message: string;
}

/**
 * Sticky resolution dock from the reference: acknowledge / resolve / dispute /
 * suppress-with-reason / reopen, plus the suppression & dispute dialogs and the
 * transient confirmation toast.
 */
export function ResolutionDock({ finding }: { finding: Finding }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [reason, setReason] = useState(suppressionReasons[0]);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fire = (title: string, message: string) => setToast({ title, message });

  const openDialog = (next: Exclude<Dialog, null>) => {
    setReason(next === "suppress" ? suppressionReasons[0] : disputeReasons[0]);
    setNote("");
    setDialog(next);
  };

  const confirmDialog = () => {
    if (dialog === "suppress") {
      fire("Conflict suppressed", `Exemption logged in the audit ledger — reason: ${reason}`);
    } else {
      fire("Dispute filed", `Evidence case reopened — reason: ${reason}`);
    }
    setDialog(null);
  };

  const copy = statusCopy[finding.status];

  return (
    <>
      <div className="sticky bottom-4 z-30 rounded-xl bg-surface-container-high/95 backdrop-blur-md p-stack-comfortable shadow-2xl flex flex-wrap items-center justify-between gap-stack-comfortable">
        <div className="flex items-center gap-stack-compact">
          <span className={`w-3 h-3 rounded-full ${copy.dot}`} />
          <div className="flex flex-col">
            <span className="text-on-surface font-semibold text-body-sm">{copy.label}</span>
            <span className="text-muted font-mono-code text-micro-label">
              Choose a resolution vector for conflict #{finding.id}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-stack-compact">
          <button
            type="button"
            className={actionButton}
            disabled={finding.status === "suppressed"}
            onClick={() => openDialog("suppress")}
          >
            Suppress…
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={finding.status !== "open"}
            onClick={() =>
              fire("Conflict acknowledged", `Logged as non-impact for ${finding.id} by @current_user`)
            }
          >
            Acknowledge
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={finding.status !== "open" && finding.status !== "acknowledged"}
            onClick={() =>
              fire("Conflict resolved", `${finding.id} closed with a cited resolution vector.`)
            }
          >
            Resolve
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={finding.status === "resolved"}
            onClick={() => openDialog("dispute")}
          >
            Dispute verdict
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={finding.status === "open"}
            onClick={() => fire("Conflict reopened", `${finding.id} returned to the open queue.`)}
          >
            Reopen
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-primary-container text-on-primary-container text-body-sm font-body-sm font-semibold transition-all shadow-md hover:brightness-110 active:scale-95 flex items-center gap-1.5"
            onClick={() =>
              fire("Remediation queued", `Ticket & PR draft created for ${finding.id}.`)
            }
          >
            <Icon name="add_task" className="text-[18px]" />
            <span>Create remediation</span>
          </button>
        </div>
      </div>

      {/* Suppress / dispute dialog */}
      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-margin-page">
          <div className="rounded-xl bg-surface-container-low max-w-lg w-full p-margin-page shadow-2xl relative">
            <div className="flex items-center justify-between mb-stack-comfortable">
              <div className="flex items-center gap-2">
                <Icon
                  name={dialog === "suppress" ? "shield_with_heart" : "gavel"}
                  className="text-tertiary text-[24px]"
                />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {dialog === "suppress" ? "Suppress" : "Dispute"} conflict #{finding.id}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                className="text-muted hover:text-on-surface"
                onClick={() => setDialog(null)}
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <p className="text-body-md text-on-surface-variant mb-stack-comfortable">
              {dialog === "suppress"
                ? "Suppressing prevents recurring alerts for this pair of artifacts. An immutable audit record will log this action."
                : "Disputing reopens the evidence case: a human re-reads the decisive citations before the verdict can stand."}
            </p>
            <div className="space-y-stack-comfortable mb-margin-page">
              <div>
                <label className="block font-label-caps text-label-caps text-muted uppercase mb-1">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface-container text-on-surface font-body-md focus:outline-none focus:bg-surface-container-highest"
                >
                  {(dialog === "suppress" ? suppressionReasons : disputeReasons).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-muted uppercase mb-1">
                  Audit justification note
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Link the approved exemption doc or Slack thread…"
                  className="w-full px-3 py-2 rounded bg-surface-container text-on-surface font-mono-code text-mono-code focus:outline-none focus:bg-surface-container-highest placeholder:text-muted"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-stack-compact">
              <button
                type="button"
                className="px-4 py-2 rounded bg-surface-container text-on-surface text-body-sm hover:bg-surface-container-high transition-colors"
                onClick={() => setDialog(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-error-container text-error text-body-sm font-semibold hover:brightness-110 transition"
                onClick={confirmDialog}
              >
                {dialog === "suppress" ? "Confirm suppression" : "File dispute"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div className="fixed top-20 right-8 z-50 rounded-lg bg-surface-container-high p-stack-comfortable shadow-2xl flex items-center gap-3 border border-outline-variant/60">
          <Icon name="check_circle" className="text-secondary text-[22px]" />
          <div className="flex flex-col">
            <span className="text-on-surface font-semibold text-body-sm">{toast.title}</span>
            <span className="text-on-surface-variant font-mono-code text-micro-label">
              {toast.message}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
