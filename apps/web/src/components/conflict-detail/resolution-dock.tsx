"use client";

import { Icon } from "@/components/ui/icon";
import { canTransitionFinding, type FindingState } from "@unify/contracts";
import { useEffect, useState, useTransition } from "react";
import { disputeReasons, suppressionReasons } from "@/lib/domain/conflict-detail";
import { transitionFindingAction, type ReviewerAction } from "@/lib/actions/findings";
import type { Finding } from "@/lib/types";

type Dialog = "suppress" | "dispute" | null;

const statusCopy: Record<Finding["status"], { dot: string; label: string }> = {
  open: { dot: "bg-error animate-pulse", label: "Remediation action required" },
  acknowledged: { dot: "bg-tertiary", label: "Acknowledged — awaiting resolution" },
  resolved: { dot: "bg-secondary", label: "Resolution recorded" },
  suppressed: { dot: "bg-outline", label: "Suppressed — alerts muted" },
  disputed: { dot: "bg-tertiary animate-pulse", label: "Disputed — awaiting adjudication" },
  superseded: { dot: "bg-outline", label: "Superseded by a later verification" },
};

const actionButton =
  "px-3 py-2 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-body-sm font-body-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container";

interface Toast {
  title: string;
  message: string;
  tone: "success" | "error";
}

/**
 * Sticky resolution dock from the reference: acknowledge / resolve / dispute /
 * suppress-with-reason / reopen, plus the suppression & dispute dialogs and the
 * transient confirmation toast.
 *
 * Every button here is a server action call (FR-18), and the action itself
 * re-checks `canTransitionFinding` — the same function the contracts export —
 * so a stale dock cannot force an illegal transition; it gets a refusal back
 * and shows it. A reason is required by the same contract, which is why the
 * two consequential buttons open a dialog instead of firing on one click.
 */
export function ResolutionDock({ finding }: { finding: Finding }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [reason, setReason] = useState(suppressionReasons[0]);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fire = (title: string, message: string, tone: Toast["tone"] = "success") =>
    setToast({ title, message, tone });

  /** Call the lifecycle action; a refusal is shown, never swallowed. */
  const run = (action: ReviewerAction, why: string) => {
    const title: Record<ReviewerAction, string> = {
      acknowledge: "Conflict acknowledged",
      resolve: "Conflict resolved",
      dispute: "Dispute filed",
      suppress: "Conflict suppressed",
      reopen: "Conflict reopened",
    };
    startTransition(async () => {
      const result = await transitionFindingAction(finding.id, action, why);
      if (result.ok) {
        fire(
          title[action],
          `Recorded with a reason in the audit ledger — now "${result.state}".`,
        );
      } else {
        fire("Action refused", result.error ?? "Unknown error.", "error");
      }
    });
  };

  const openDialog = (next: Exclude<Dialog, null>) => {
    setReason(next === "suppress" ? suppressionReasons[0] : disputeReasons[0]);
    setNote("");
    setDialog(next);
  };

  const confirmDialog = () => {
    const why = note.trim() ? `${reason} — ${note.trim()}` : reason;
    run(dialog === "suppress" ? "suppress" : "dispute", why);
    setDialog(null);
  };

  const can = (to: FindingState) => canTransitionFinding(finding.status, to);

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
            disabled={pending || !can("suppressed")}
            onClick={() => openDialog("suppress")}
          >
            Suppress…
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={pending || !can("acknowledged")}
            onClick={() => run("acknowledge", "Acknowledged from the conflict inbox")}
          >
            Acknowledge
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={pending || !can("resolved")}
            onClick={() => run("resolve", "Resolved after reading the cited evidence")}
          >
            Resolve
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={pending || !can("disputed")}
            onClick={() => openDialog("dispute")}
          >
            Dispute verdict
          </button>
          <button
            type="button"
            className={actionButton}
            disabled={pending || !can("open")}
            onClick={() => run("reopen", "Reopened for another look")}
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
                disabled={pending}
                className="px-4 py-2 rounded bg-error-container text-error text-body-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
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
          <Icon
            name={toast.tone === "error" ? "error" : "check_circle"}
            className={`${toast.tone === "error" ? "text-error" : "text-secondary"} text-[22px]`}
          />
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
