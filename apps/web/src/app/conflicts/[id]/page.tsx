import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { Badge, type Tone } from "@/components/ui/badge";
import { CopyLinkButton } from "@/components/conflict-detail/copy-link-button";
import { CriterionResults } from "@/components/conflict-detail/criterion-results";
import { ExplanationBox } from "@/components/conflict-detail/explanation-box";
import { ResolutionDock } from "@/components/conflict-detail/resolution-dock";
import {
  AffectedArtifactsSection,
  AuditTrailSection,
  EvidenceCaseSection,
  EvidenceChainSection,
  StakeholdersSection,
  VerificationPassesSection,
} from "@/components/conflict-detail/sections";
import { formatUtcFull, packetHash } from "@/lib/domain/conflict-detail";
import type { ActivityEvent, Finding, FindingStatus, Policy, Severity, Verdict } from "@/lib/types";

/**
 * DATA HOLE — replace with API lookups.
 *
 * The findings + policies endpoints do not exist yet, so both stores are empty
 * and every route renders the "not found" state. Swap these two consts for real
 * fetches and the rest of this screen works unchanged: the detail body below is
 * already driven entirely by the `Finding` / `Policy` shapes.
 */
const findings: Finding[] = [];
const policiesById: Record<string, Policy> = {};

/** Activity events for a finding — supplied by the activity API. */
const activity: ActivityEvent[] = [];

function getFinding(id: string): Finding | undefined {
  return findings.find((f) => f.id === id);
}

function getPolicy(finding: Finding): Policy {
  return policiesById[finding.policy];
}

const severityMeta: Record<Severity, { chip: string; tone: Tone; bar: string }> = {
  critical: { chip: "CRITICAL SEV-1", tone: "critical", bar: "bg-error" },
  warning: { chip: "WARNING SEV-2", tone: "warning", bar: "bg-tertiary" },
  info: { chip: "INFO SEV-3", tone: "info", bar: "bg-primary" },
};

const statusLabel: Record<FindingStatus, string> = {
  open: "STATUS: UNRESOLVED",
  acknowledged: "STATUS: ACKNOWLEDGED",
  resolved: "STATUS: RESOLVED",
  suppressed: "STATUS: SUPPRESSED",
};

export function generateStaticParams() {
  return findings.map((finding) => ({ id: finding.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const finding = getFinding(id);
  return { title: finding ? `Conflict ${id}` : "Conflict not found" };
}

function FindingNotFound({ id }: { id: string }) {
  return (
    <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md border border-outline-variant/40">
      <div className="flex items-start gap-gutter">
        <div className="w-10 h-10 rounded-lg bg-error-container/30 text-error grid place-items-center shrink-0">
          <Icon name="search_off" className="text-[22px]" />
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            No evidence packet for #{id}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
            This conflict id is not in the workspace index — it may have been purged, or the id is
            mistyped. Findings resolve from the evidence packet API once it is connected.
          </p>
          <Link
            href="/conflicts"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Conflict Inbox</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function ConflictDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const finding = getFinding(id);

  if (!finding) {
    return (
      <AppShell action={<CopyLinkButton path={`/conflicts/${id}`} />}>
        <FindingNotFound id={id} />
      </AppShell>
    );
  }

  const policy = getPolicy(finding);
  const severity = severityMeta[finding.severity];
  const verdict: Verdict = finding.verdict ?? "INSUFFICIENT_EVIDENCE";
  const contradicted = finding.criteria.filter((c) => c.verdict === "CONTRADICTED").length;
  const decisive = finding.criteria.filter(
    (c) => c.verdict === "CONTRADICTED" || c.verdict === "SUPPORTED",
  ).length;
  const scorePct =
    finding.criteria.length === 0 ? 0 : Math.round((decisive / finding.criteria.length) * 100);

  return (
    <AppShell action={<CopyLinkButton path={`/conflicts/${finding.id}`} />}>
      {/* Breadcrumb & quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-gutter pt-4">
        <div className="flex items-center gap-stack-compact text-on-surface-variant font-mono-code text-mono-code">
          <Link href="/conflicts" className="hover:text-primary transition-colors flex items-center gap-1">
            <Icon name="inbox" className="text-[16px]" />
            <span>Conflict Inbox</span>
          </Link>
          <span className="text-outline">/</span>
          <span className="text-primary font-semibold px-2 py-0.5 rounded bg-surface-container-high">
            #{finding.id}
          </span>
          <span className="text-outline">/</span>
          <span className="text-muted text-body-sm font-body-sm">{finding.policyTitle}</span>
        </div>
        <div className="flex items-center gap-stack-compact">
          <Link
            href="/conflicts"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-body-sm font-body-sm transition-colors shadow-sm"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Inbox</span>
          </Link>
          <CopyLinkButton path={`/conflicts/${finding.id}`} />
        </div>
      </div>

      {/* Violation header */}
      <section className="rounded-xl bg-surface-container-low p-margin-page shadow-md relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${severity.bar}`} />
        <div className="flex flex-wrap items-start justify-between gap-gutter">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-stack-comfortable">
              <Badge tone={severity.tone} pulse={finding.severity === "critical"}>
                {severity.chip}
              </Badge>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label flex items-center gap-1">
                <Icon name="policy" className="text-[14px]" />
                {finding.policyTitle}
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono-code text-micro-label font-bold">
                VERDICT: {verdict}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono-code text-micro-label ${
                  finding.freshness === "CURRENT"
                    ? "bg-secondary/15 text-secondary"
                    : finding.freshness === "STALE"
                      ? "bg-tertiary-container/40 text-on-tertiary-container"
                      : "bg-surface-container-high text-muted"
                }`}
              >
                FRESHNESS: {finding.freshness}
              </span>
              {finding.reasonCode ? (
                <span className="px-2 py-0.5 rounded bg-error-container/30 text-on-error-container font-mono-code text-micro-label">
                  reason: {finding.reasonCode}
                </span>
              ) : null}
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-muted font-label-caps text-label-caps uppercase">
                {statusLabel[finding.status]}
              </span>
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-stack-compact">
              {finding.summary}
            </h1>

            <div className="flex flex-wrap items-center gap-gutter text-on-surface-variant font-mono-code text-mono-code">
              <div className="flex items-center gap-1.5">
                <Icon name="schedule" className="text-[16px] text-muted" />
                <span>
                  Detected: <strong className="text-on-surface">{formatUtcFull(finding.createdAt)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="verified_user" className="text-[16px] text-muted" />
                <span>
                  Packet hash: <span className="text-muted">{packetHash(finding.id)}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="group" className="text-[16px] text-muted" />
                <span>
                  Team: <span className="text-on-surface">{finding.team}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="timer" className="text-[16px] text-muted" />
                <span>
                  Grace window: <strong className="text-on-surface">{policy.graceMinutes}m</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Scorecard mini-metric */}
          <div className="rounded-lg bg-surface-container p-stack-comfortable flex flex-col items-end gap-1 shadow-sm min-w-[220px]">
            <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
              {finding.criteria.length > 0 ? "Criterion Scorecard" : "Composite Verdict"}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono-code font-bold text-error ${
                  finding.criteria.length > 0 ? "text-headline-lg" : "text-headline-sm"
                }`}
              >
                {finding.criteria.length > 0 ? `${contradicted}/${finding.criteria.length}` : verdict}
              </span>
              {finding.criteria.length > 0 ? (
                <span className="text-error font-mono-code text-body-sm">contradicted</span>
              ) : null}
            </div>
            {finding.criteria.length > 0 ? (
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    finding.severity === "critical"
                      ? "bg-error"
                      : finding.severity === "warning"
                        ? "bg-tertiary"
                        : "bg-secondary"
                  }`}
                  style={{ width: `${scorePct}%` }}
                />
              </div>
            ) : null}
            {finding.criteria.length > 0 ? (
              <span className="text-muted font-mono-code text-micro-label mt-1">
                {scorePct}% decisive
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Plain-language explanation + rule AST */}
      <ExplanationBox finding={finding} policy={policy} />

      {/* Evidence chain + timeline */}
      <EvidenceChainSection finding={finding} policy={policy} />

      {/* Affected artifacts */}
      <AffectedArtifactsSection finding={finding} />

      {/* Criterion-by-criterion results */}
      <CriterionResults finding={finding} />

      {/* Bounded verification passes */}
      <VerificationPassesSection finding={finding} />

      {/* Evidence case */}
      <EvidenceCaseSection finding={finding} />

      {/* Stakeholders + audit trail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <StakeholdersSection finding={finding} />
        <AuditTrailSection finding={finding} activity={activity} />
      </div>

      {/* Sticky resolution dock */}
      <ResolutionDock finding={finding} />
    </AppShell>
  );
}
