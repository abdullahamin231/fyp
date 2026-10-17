"use client";

import { useActionState } from "react";
import type { AnalysisTargetRow } from "@/lib/integrations/pipeline-settings";

type ActionResult = { error?: string; saved?: string };

type SimpleAction = (
  previous: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

/**
 * The two knobs the live ingestion path reads (migration 00025): which Jira
 * field holds acceptance criteria, and which repositories the worker may
 * analyse — with the exact test command it may run at head.
 */
export function PipelineSettings({
  workspaceId,
  criteriaField,
  targets,
  saveCriteria,
  saveTarget,
  deleteTarget,
}: {
  workspaceId: string;
  criteriaField: string | null;
  targets: AnalysisTargetRow[];
  saveCriteria: SimpleAction;
  saveTarget: SimpleAction;
  deleteTarget: SimpleAction;
}) {
  const [criteriaResult, criteriaAction, criteriaPending] = useActionState(saveCriteria, {});
  const [targetResult, targetAction, targetPending] = useActionState(saveTarget, {});

  return (
    <section className="mt-8 rounded-lg bg-surface-container p-5 shadow-md">
      <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Live pipeline</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        What verification runs on a delivery, and on which repositories. Workspace{" "}
        <code className="font-mono-code text-micro-label">{workspaceId}</code>.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Jira acceptance criteria field</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            The custom field key that holds a ticket&apos;s acceptance criteria (for example{" "}
            <code className="font-mono-code text-micro-label">customfield_10045</code>). Left empty, a
            strictly delimited &ldquo;Acceptance Criteria&rdquo; section in the issue description is
            used instead.
          </p>
          <form action={criteriaAction} className="mt-3 grid gap-2">
            <input
              name="criteriaField"
              defaultValue={criteriaField ?? ""}
              placeholder="customfield_10045"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-mono-code text-body-sm"
            />
            <button type="submit" disabled={criteriaPending} className="w-fit rounded bg-primary px-4 py-2 text-body-sm text-on-primary disabled:opacity-50">
              {criteriaPending ? "Saving..." : "Save field key"}
            </button>
          </form>
          {criteriaResult.error ? <p className="mt-2 text-body-sm text-error">{criteriaResult.error}</p> : null}
          {criteriaResult.saved ? <p className="mt-2 text-body-sm text-primary">{criteriaResult.saved}</p> : null}
        </div>

        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Analysis targets</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Repositories the worker may analyse when a linked pull request arrives. A delivery for an
            unregistered repository produces no code evidence — the verdict abstains, nothing runs
            un-audited.
          </p>
          <ul className="mt-3 grid gap-2">
            {targets.length === 0 ? (
              <li className="text-body-sm text-muted">No repositories registered yet.</li>
            ) : null}
            {targets.map((target) => (
              <li key={target.repoFullName} className="rounded border border-outline-variant bg-surface-container-lowest p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-code text-body-sm text-on-surface">{target.repoFullName}</span>
                  <form
                    action={async (formData) => {
                      await deleteTarget({}, formData);
                    }}
                    className="inline"
                  >
                    <input type="hidden" name="repoFullName" value={target.repoFullName} />
                    <button type="submit" className="text-label-caps text-error hover:underline">
                      Remove
                    </button>
                  </form>
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Test command:{" "}
                  {target.testCommand ? (
                    <code className="font-mono-code text-micro-label">{target.testCommand}</code>
                  ) : (
                    <span className="text-muted">none — diffs and symbols only</span>
                  )}
                </p>
                <p className="mt-1 text-micro-label text-muted">Updated {new Date(target.updatedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <form action={targetAction} className="mt-3 grid gap-2">
            <input
              name="repoFullName"
              required
              placeholder="owner/repo"
              pattern="[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-mono-code text-body-sm"
            />
            <input
              name="testCommand"
              placeholder="test command at head (optional)"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-mono-code text-body-sm"
            />
            <button type="submit" disabled={targetPending} className="w-fit rounded bg-primary px-4 py-2 text-body-sm text-on-primary disabled:opacity-50">
              {targetPending ? "Saving..." : "Add / update target"}
            </button>
          </form>
          {targetResult.error ? <p className="mt-2 text-body-sm text-error">{targetResult.error}</p> : null}
          {targetResult.saved ? <p className="mt-2 text-body-sm text-primary">{targetResult.saved}</p> : null}
        </div>
      </div>
    </section>
  );
}
