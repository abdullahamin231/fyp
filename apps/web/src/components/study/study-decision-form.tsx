"use client";

import { Icon } from "@/components/ui/icon";
import type { ScenarioEvidence } from "@/components/study/scenarios";
import type { Verdict } from "@/lib/types";

export type Decision = {
  verdict: Verdict | null;
  rootCause: string;
  stakeholders: string[];
  justification: string;
};

const verdicts: { value: Verdict; label: string; hint: string }[] = [
  { value: "SUPPORTED", label: "SUPPORTED", hint: "Evidence confirms the claim" },
  { value: "CONTRADICTED", label: "CONTRADICTED", hint: "Evidence refutes the claim" },
  { value: "PARTIAL", label: "PARTIAL", hint: "Only some criteria hold" },
  {
    value: "INSUFFICIENT_EVIDENCE",
    label: "INSUFFICIENT_EVIDENCE",
    hint: "Cannot decide from citations",
  },
];

/**
 * Final task output: verdict, root cause, stakeholder notifications and the
 * free-text justification, with a completeness gate before submission.
 */
export function StudyDecisionForm({
  evidence,
  taskId,
  condition,
  decision,
  onChange,
  onSubmit,
  submitting,
  complete,
}: {
  evidence: ScenarioEvidence;
  taskId: number;
  condition: "MANUAL" | "UNIFY";
  decision: Decision;
  onChange: (patch: Partial<Decision>) => void;
  onSubmit: () => void;
  submitting: boolean;
  complete: boolean;
}) {
  const ready =
    decision.verdict !== null &&
    decision.rootCause !== "" &&
    decision.stakeholders.length >= 2 &&
    decision.justification.trim().length >= 10;

  return (
    <section
      id="decision-submission"
      className="bg-surface-container rounded-xl p-4 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <Icon name="assignment_turned_in" className="text-[20px]" />
          </span>
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Evaluation Response Form
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Record Decision &amp; Complete Task
            </h3>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-muted font-mono-code text-micro-label">
          Task {taskId} Final · {condition}
        </span>
      </div>

      <div className="space-y-4">
        {/* Q1 — evidence verdict (four verdicts only) */}
        <div>
          <label className="font-body-sm text-body-sm font-semibold text-on-surface block mb-1.5">
            1. Record your verdict for {evidence.claim}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {verdicts.map((verdict) => {
              const selected = decision.verdict === verdict.value;
              return (
                <label
                  key={verdict.value}
                  className={`flex flex-col gap-0.5 p-2.5 rounded cursor-pointer transition-colors border ${
                    selected
                      ? "bg-secondary/10 border-secondary"
                      : "bg-surface-container-lowest border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="study-verdict"
                      className="accent-secondary"
                      checked={selected}
                      onChange={() => onChange({ verdict: verdict.value })}
                    />
                    <span className="font-mono-code text-[12px] font-bold text-on-surface">
                      {verdict.label}
                    </span>
                  </span>
                  <span className="font-body-sm text-micro-label text-on-surface-variant pl-6">
                    {verdict.hint}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Q2 — root cause */}
        <div>
          <label
            htmlFor="root-cause"
            className="font-body-sm text-body-sm font-semibold text-on-surface block mb-1.5"
          >
            2. Identified primary root cause
          </label>
          <select
            id="root-cause"
            value={decision.rootCause}
            onChange={(event) => onChange({ rootCause: event.target.value })}
            className="w-full px-3 py-2 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-high"
          >
            <option value="">Select the root cause you determined…</option>
            {evidence.rootCauses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Q3 — stakeholders to notify */}
        <div>
          <label className="font-body-sm text-body-sm font-semibold text-on-surface block mb-1.5">
            3. Required stakeholder notifications{" "}
            <span className="font-mono-code text-micro-label text-on-surface-variant">
              (select at least 2)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {evidence.stakeholders.map((person) => {
              const selected = decision.stakeholders.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      stakeholders: selected
                        ? decision.stakeholders.filter((id) => id !== person.id)
                        : [...decision.stakeholders, person.id],
                    })
                  }
                  className={`px-2.5 py-1 rounded font-mono-code text-micro-label flex items-center gap-1.5 transition ${
                    selected
                      ? "bg-surface-container-lowest text-on-surface"
                      : "bg-surface-container-lowest text-muted hover:text-on-surface cursor-pointer"
                  }`}
                >
                  <Icon
                    name={selected ? "check" : "add"}
                    className={`text-[14px] ${selected ? "text-secondary" : ""}`}
                  />
                  {person.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q4 — justification */}
        <div>
          <label
            htmlFor="justification"
            className="font-body-sm text-body-sm font-semibold text-on-surface block mb-1.5"
          >
            4. Evidence justification &amp; proposed resolution action
          </label>
          <textarea
            id="justification"
            rows={3}
            value={decision.justification}
            onChange={(event) => onChange({ justification: event.target.value })}
            placeholder="Enter justification based on the evidence you inspected (e.g. generate a patch PR bumping padding to 16px to match Figma v3.2, then notify the designer and assignee)…"
            className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-[12px] placeholder:text-muted focus:outline-none focus:bg-surface-container-high transition-colors"
          />
        </div>
      </div>

      {/* Submission row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono-code text-micro-label">
          <Icon name="verified_user" className="text-secondary text-[16px]" />
          <span>
            Subject P-14 · responses are timestamped and appended to the study dataset
          </span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || complete}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-[14px] font-semibold hover:bg-inverse-primary transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Icon name="refresh" className="text-[18px] animate-spin" />
              <span>Saving Telemetry…</span>
            </>
          ) : complete ? (
            <>
              <Icon name="check_circle" className="text-[18px]" />
              <span>All Tasks Recorded</span>
            </>
          ) : (
            <>
              <Icon name="send" className="text-[18px]" />
              <span>Submit Evaluation Findings &amp; Proceed</span>
            </>
          )}
        </button>
      </div>

      {!ready && !complete ? (
        <p className="font-mono-code text-micro-label text-tertiary">
          Required outputs outstanding: verdict, root cause, ≥ 2 stakeholders, justification.
        </p>
      ) : null}
    </section>
  );
}
