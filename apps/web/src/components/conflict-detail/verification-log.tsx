import { Icon } from "@/components/ui/icon";
import type { PassRow } from "@/lib/data/rows";

/**
 * The bounded verifier loop's pass log, read back from `verifier_passes`.
 *
 * Unlike the pass *summary* elsewhere on this screen, every row here is a
 * stored fact: the pass number, whether its output parsed, why it stopped and
 * how long the model took. That is the difference between "the system says it
 * verified" and "here is what happened, pass by pass" — §11.8's requirement
 * that a reviewer can re-read why a verdict stopped where it did.
 */

const STOP_TONE: Record<string, string> = {
  VERIFIED: "bg-secondary/15 text-secondary",
  CRITIC_REVIEWED: "bg-primary/15 text-primary",
  NO_APPLICABLE_EVIDENCE: "bg-surface-container-highest text-muted",
  REACHED_MAX_PASSES: "bg-tertiary-container/40 text-on-tertiary-container",
  MODEL_UNAVAILABLE: "bg-error-container/30 text-on-error-container",
  MALFORMED_OUTPUT: "bg-error-container/30 text-on-error-container",
};

function stopChip(stop: string | null) {
  if (!stop) return null;
  return (
    <span
      className={`px-2 py-0.5 rounded font-mono-code text-micro-label ${STOP_TONE[stop] ?? "bg-surface-container-highest text-muted"}`}
    >
      {stop}
    </span>
  );
}

export function VerificationLog({
  passes,
  stopReason,
  modelId,
}: {
  passes: PassRow[];
  stopReason?: string;
  modelId?: string;
}) {
  return (
    <section
      aria-label="Verification pass log"
      className="rounded-xl bg-surface-container-low p-margin-page shadow-md"
    >
      <div className="flex items-center gap-2 mb-stack-comfortable">
        <Icon name="fact_check" className="text-primary text-[22px]" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Verification pass log
        </h3>
        <span className="ml-auto font-mono-code text-micro-label text-muted">
          {passes.length} pass{passes.length === 1 ? "" : "es"} recorded
        </span>
      </div>

      {modelId || stopReason ? (
        <div className="flex flex-wrap items-center gap-2 mb-stack-comfortable font-mono-code text-micro-label">
          {modelId ? (
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
              model: {modelId}
            </span>
          ) : null}
          {stopReason ? stopChip(stopReason) : null}
        </div>
      ) : null}

      {passes.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No pass rows recorded — either the job predates the pass log or it failed
          before the first model call.
        </p>
      ) : (
        <ol className="space-y-2">
          {passes.map((pass) => (
            <li
              key={pass.id}
              className="rounded-lg bg-surface-container p-stack-compact flex flex-wrap items-center gap-3"
            >
              <span className="w-7 h-7 rounded bg-primary/15 text-primary grid place-items-center font-mono-code text-mono-code font-bold shrink-0">
                {pass.pass_no}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                  {pass.stop_reason ? `stopped: ${pass.stop_reason}` : "pass recorded"}
                </span>
                <span className="font-mono-code text-micro-label text-muted truncate">
                  prompt {pass.prompt_hash.slice(0, 12)} ·{" "}
                  {pass.model_and_run?.startedAt
                    ? new Date(pass.model_and_run.startedAt).toISOString()
                    : "time not recorded"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono-code text-micro-label ${
                    pass.parsed_ok ? "bg-secondary/15 text-secondary" : "bg-error-container/30 text-on-error-container"
                  }`}
                >
                  {pass.parsed_ok ? "schema ok" : "MALFORMED"}
                </span>
                <span className="font-mono-code text-micro-label text-on-surface-variant">
                  {pass.duration_ms}ms
                </span>
                {stopChip(pass.stop_reason)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
