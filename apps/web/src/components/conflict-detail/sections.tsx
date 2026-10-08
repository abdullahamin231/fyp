import { Icon } from "@/components/ui/icon";
import { ToolPill } from "@/components/ui/badge";
import { AffectedArtifactCard } from "@/components/conflict-detail/artifact-card";
import {
  auditTrailFor,
  evidenceCaseFor,
  evidenceChainFor,
  stakeholdersFor,
  timelineFor,
  verificationRunFor,
} from "@/lib/mock/conflict-detail";
import type { Finding, ToolKind } from "@/lib/types";

const toolMark: Record<ToolKind, string> = {
  figma: "F",
  github: "GH",
  jira: "J",
  slack: "S",
  git: "G",
  test: "T",
};

const toneText: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  error: "text-error",
  outline: "text-outline",
};

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  error: "bg-error",
  outline: "bg-outline",
};

const statusTone: Record<string, string> = {
  COMPLETED: "bg-secondary/15 text-secondary",
  RAN: "bg-tertiary-container/40 text-on-tertiary-container",
  SKIPPED: "bg-surface-container-highest text-outline",
  STOPPED: "bg-error-container/40 text-error",
};

/* ------------------------------------------------------------- evidence chain */

export function EvidenceChainSection({ finding }: { finding: Finding }) {
  const chain = evidenceChainFor(finding);
  const marks = timelineFor(finding);

  return (
    <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-stack-comfortable mb-gutter">
        <div className="flex items-center gap-2">
          <Icon name="account_tree" className="text-secondary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Visual Evidence Chain &amp; Temporal Sequence
          </h2>
        </div>
        <div className="flex items-center gap-gutter font-mono-code text-[11px] text-outline">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" /> High confidence (&gt;90%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary" /> State divergence
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error" /> Conflict point
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter relative">
        {chain.events.map((event) => (
          <div
            key={event.key}
            className="rounded-lg bg-surface-container p-stack-comfortable flex flex-col justify-between shadow-sm relative group hover:bg-surface-container-high transition-all"
          >
            <div className="flex items-center justify-between mb-stack-comfortable">
              <div className="flex items-center gap-2">
                <ToolPill tool={event.tool}>{toolMark[event.tool]}</ToolPill>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Event · {event.tool}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono-code text-[10px] font-semibold">
                {event.badge}
              </span>
            </div>
            <div className="mb-stack-comfortable">
              <h3 className="text-body-md font-semibold text-on-surface mb-1">{event.heading}</h3>
              <p className="text-body-sm text-on-surface-variant">{event.body}</p>
            </div>
            <div className="pt-stack-compact bg-surface-container-lowest/40 rounded p-2 text-mono-code font-mono-code text-[11px] flex flex-col gap-1 text-outline">
              <div className="flex items-center justify-between">
                <span className="text-on-surface flex items-center gap-1">
                  <Icon name="person" className="text-[13px] text-outline" />
                  {event.actor}
                </span>
                <span className={event.divergence ? "text-tertiary" : undefined}>{event.when}</span>
              </div>
              <div className={`truncate ${event.divergence ? "text-tertiary" : "text-outline-variant"}`}>
                {event.ref}
              </div>
            </div>
          </div>
        ))}

        {/* Conflict trigger node */}
        <div className="rounded-lg bg-error-container/20 p-stack-comfortable flex flex-col justify-between shadow-sm relative group hover:bg-error-container/30 transition-all">
          <div className="flex items-center justify-between mb-stack-comfortable">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-error/30 text-error flex items-center justify-center">
                <Icon name="warning" className="text-[14px]" fill />
              </span>
              <span className="font-label-caps text-label-caps text-error uppercase">
                Conflict trigger
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-error-container text-error font-mono-code text-[10px] font-bold">
              {chain.trigger.badge}
            </span>
          </div>
          <div className="mb-stack-comfortable">
            <h3 className="text-body-md font-semibold text-on-surface mb-1">
              {chain.trigger.heading}
            </h3>
            <p className="text-body-sm text-on-surface-variant">{chain.trigger.body}</p>
          </div>
          <div className="pt-stack-compact bg-surface-container-lowest/60 rounded p-2 text-mono-code font-mono-code text-[11px] flex flex-col gap-1 text-error">
            <div className="flex items-center justify-between font-bold">
              <span>{chain.trigger.metricLabel}</span>
              <span>{chain.trigger.metricValue}</span>
            </div>
            <div className="text-on-surface-variant truncate">{chain.trigger.trigger}</div>
          </div>
        </div>
      </div>

      {/* Temporal timeline bar */}
      <div className="mt-gutter pt-gutter flex flex-col gap-2">
        <div className="flex items-center justify-between text-outline font-mono-code text-[11px]">
          {marks.map((mark) => (
            <span key={mark.label} className={toneText[mark.tone]}>
              {mark.label}
            </span>
          ))}
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-highest relative">
          <div className="h-full rounded-full bg-gradient-to-r from-secondary via-tertiary to-error w-full" />
          {marks.map((mark) => (
            <span
              key={mark.label}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ring-2 ring-surface ${toneDot[mark.tone]}`}
              style={{ left: mark.left }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- affected artifacts */

export function AffectedArtifactsSection({ finding }: { finding: Finding }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-stack-comfortable">
        <div className="flex items-center gap-2">
          <Icon name="category" className="text-primary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Affected Artifacts Under Inspection
          </h2>
        </div>
        <span className="font-mono-code text-body-sm text-outline">
          {finding.artifacts.length} Interdependent Object{finding.artifacts.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {finding.artifacts.map((artifact) => (
          <AffectedArtifactCard
            key={`${artifact.tool}-${artifact.ref}`}
            artifact={artifact}
            finding={finding}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- verification passes */

export function VerificationPassesSection({ finding }: { finding: Finding }) {
  const run = verificationRunFor(finding);

  return (
    <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-stack-comfortable mb-gutter">
        <div className="flex items-center gap-2">
          <Icon name="fact_check" className="text-primary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Bounded Verification Passes
          </h2>
        </div>
        <span className="font-mono-code text-[11px] text-outline">
          pass 1 scope/retrieval → pass 2 verify → pass 3 conditional critic
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {run.passes.map((pass) => (
          <div
            key={pass.n}
            className="rounded-lg bg-surface-container border border-outline-variant/40 p-stack-comfortable flex flex-col gap-stack-compact shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-mono-code text-[12px] font-bold">
                  {pass.n}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase">
                  Pass {pass.n} — {pass.name}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono-code text-[10px] font-bold ${statusTone[pass.status]}`}
              >
                {pass.status}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">{pass.purpose}</p>
            <div className="mt-auto space-y-stack-compact pt-stack-compact border-t border-outline-variant/40 font-mono-code text-[11px]">
              {pass.rows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <span className="text-outline shrink-0">{row.label}:</span>
                  <span
                    className={`text-right ${row.tone ? toneText[row.tone] : "text-on-surface"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-gutter rounded-lg bg-surface-container-lowest/60 px-stack-comfortable py-3 flex flex-wrap items-center gap-stack-compact">
        <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
          Stop reason
        </span>
        <span
          className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold ${
            run.stopTone === "error"
              ? "bg-error-container text-error"
              : run.stopTone === "tertiary"
                ? "bg-tertiary-container text-on-tertiary-container"
                : run.stopTone === "secondary"
                  ? "bg-secondary/15 text-secondary"
                  : "bg-primary/15 text-primary"
          }`}
        >
          {run.stopCode}
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{run.stopReason}</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- evidence case */

export function EvidenceCaseSection({ finding }: { finding: Finding }) {
  const evidenceCase = evidenceCaseFor(finding);

  return (
    <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-stack-comfortable mb-gutter">
        <div className="flex items-center gap-2">
          <Icon name="gavel" className="text-secondary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">The Evidence Case</h2>
        </div>
        <span className="font-mono-code text-[11px] text-outline">
          {evidenceCase.resolvedCount}/{evidenceCase.citationCount} citations resolved ·{" "}
          {evidenceCase.gapCount} open gap{evidenceCase.gapCount === 1 ? "" : "s"}
        </span>
      </div>

      <p className="text-body-lg text-on-surface leading-relaxed mb-gutter">
        {evidenceCase.verdictLine}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="rounded-lg bg-surface-container p-stack-comfortable border-l-2 border-secondary">
          <div className="flex items-center justify-between mb-stack-comfortable">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Carries the verdict
            </span>
            <span className="font-mono-code text-[11px] text-outline">
              {evidenceCase.supports.length} citation{evidenceCase.supports.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-stack-compact">
            {evidenceCase.supports.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No resolved citation supports this verdict — the packet abstained.
              </p>
            ) : (
              evidenceCase.supports.map((support, index) => (
                <div
                  key={`${support.locator}-${index}`}
                  className="rounded bg-surface-container-lowest/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <ToolPill tool={support.tool}>{support.criterionId} · {support.locator}</ToolPill>
                    <span className="font-mono-code text-[10px] text-secondary shrink-0">
                      VERBATIM
                    </span>
                  </div>
                  <p className="font-mono-code text-[11px] text-on-surface-variant leading-relaxed">
                    “{support.excerpt}”
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg bg-surface-container p-stack-comfortable border-l-2 border-tertiary">
          <div className="flex items-center justify-between mb-stack-comfortable">
            <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-wider">
              Open gaps
            </span>
            <span className="font-mono-code text-[11px] text-outline">
              {evidenceCase.gaps.length} item{evidenceCase.gaps.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-stack-compact">
            {evidenceCase.gaps.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Every cited source resolved — no missing evidence recorded.
              </p>
            ) : (
              evidenceCase.gaps.map((gap, index) => (
                <div
                  key={`${gap.criterionId}-${index}`}
                  className="rounded bg-surface-container-lowest/70 p-3 flex items-start gap-2"
                >
                  <Icon name="hourglass_disabled" className="text-tertiary text-[16px] mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-mono-code text-[10px] text-outline block">
                      {gap.criterionId}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{gap.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- stakeholders + audit */

export function StakeholdersSection({ finding }: { finding: Finding }) {
  const stakeholders = stakeholdersFor(finding);

  return (
    <div className="xl:col-span-8 rounded-xl bg-surface-container-low p-margin-page shadow-md">
      <div className="flex items-center justify-between mb-stack-comfortable">
        <div className="flex items-center gap-2">
          <Icon name="notification_important" className="text-secondary text-[22px]" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Targeted Stakeholders &amp; Selection Rationale
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline font-mono-code text-[11px]">
          Dynamic routing engine
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-md text-body-md">
          <thead>
            <tr className="text-outline font-label-caps text-label-caps uppercase border-b border-surface-container-highest">
              <th className="pb-stack-compact font-semibold">Recipient</th>
              <th className="pb-stack-compact font-semibold">Functional role</th>
              <th className="pb-stack-compact font-semibold">Calculated rationale</th>
              <th className="pb-stack-compact font-semibold text-right">Dispatch status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest/60 font-body-sm">
            {stakeholders.map((person) => (
              <tr key={person.name} className="hover:bg-surface-container/60 transition-colors">
                <td className="py-stack-comfortable">
                  <div className="flex items-center gap-stack-compact">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono-code text-[12px] font-bold">
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-on-surface font-semibold">{person.name}</div>
                      <div className="text-outline font-mono-code text-[11px]">{person.handle}</div>
                    </div>
                  </div>
                </td>
                <td className="py-stack-comfortable text-on-surface-variant font-mono-code text-[12px]">
                  {person.role}
                </td>
                <td className="py-stack-comfortable text-on-surface-variant">{person.rationale}</td>
                <td className="py-stack-comfortable text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-code text-[11px] ${
                      person.statusTone === "secondary"
                        ? "bg-secondary/15 text-secondary"
                        : person.statusTone === "tertiary"
                          ? "bg-tertiary-container/30 text-on-tertiary-container"
                          : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Icon name={person.statusIcon} className="text-[12px]" />
                    {person.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AuditTrailSection({ finding }: { finding: Finding }) {
  const entries = auditTrailFor(finding);

  return (
    <div className="xl:col-span-4 rounded-xl bg-surface-container-low p-margin-page shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-stack-comfortable">
          <div className="flex items-center gap-2">
            <Icon name="history" className="text-primary text-[22px]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Audit Trail</h2>
          </div>
          <span className="font-mono-code text-outline text-[11px]">Immutable ledger</span>
        </div>
        <div className="space-y-stack-comfortable relative pl-4 border-l-2 border-surface-container-highest">
          {entries.map((entry) => (
            <div key={entry.key} className="relative">
              <span
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${toneDot[entry.tone]}`}
              />
              <div className="flex items-center justify-between text-outline font-mono-code text-[11px]">
                <span>{entry.time}</span>
                <span className={toneText[entry.tone]}>{entry.tag}</span>
              </div>
              <p className="text-body-sm font-semibold text-on-surface mt-0.5">{entry.title}</p>
              <p className="text-body-sm text-outline font-mono-code text-[11px]">{entry.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-gutter pt-stack-comfortable border-t border-surface-container-highest/60 flex items-center justify-between font-mono-code text-[11px] text-outline">
        <span>Packet SHA: {finding.id.toLowerCase()}</span>
        <span className="text-primary flex items-center gap-1">
          <span>Full ledger</span>
          <Icon name="arrow_forward" className="text-[13px]" />
        </span>
      </div>
    </div>
  );
}
