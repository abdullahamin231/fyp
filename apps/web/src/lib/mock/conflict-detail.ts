/**
 * Conflict-detail specific mock data.
 *
 * Everything here is derived from the immutable finding / policy / activity
 * mocks plus explicitly authored content for the flagship finding CONF-1048.
 * Nothing in this file edits the shared mocks — it only reads them.
 */
import { activity } from "@/lib/mock/activity";
import { findings } from "@/lib/mock/findings";
import { policies } from "@/lib/mock/policies";
import type { Finding, Policy, ToolKind } from "@/lib/types";

/* ------------------------------------------------------------------ helpers */

export function getPolicy(finding: Finding): Policy {
  return policies.find((p) => p.id === finding.policy) ?? policies[0];
}

export function getFindingById(id: string): Finding | undefined {
  return findings.find((f) => f.id === id);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `Oct 08, 14:20:00 UTC` — always UTC so SSR and client agree. */
export function formatUtc(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${pad(d.getUTCDate())}, ${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:${pad(d.getUTCSeconds())} UTC`;
}

/** `Oct 08, 2026 - 14:20:00 UTC` — full header form. */
export function formatUtcFull(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${pad(d.getUTCDate())}, ${d.getUTCFullYear()} - ${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

/** Deterministic-looking evidence-packet hash for a finding id. */
export function packetHash(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const a = h.toString(16).padStart(8, "0");
  const b = ((h ^ 0x4a11c0de) >>> 0).toString(16).padStart(8, "0");
  return `0x${a.slice(0, 4)}...${b.slice(4, 8)}`;
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function handleOf(name: string): string {
  const parts = name.toLowerCase().split(/\s+/);
  if (parts.length < 2) return `@${parts[0]}`;
  return `@${parts[0][0]}${parts[parts.length - 1]}`;
}

/* ------------------------------------------------- semantic explanation box */

export interface ExplanationPart {
  text: string;
  mono?: boolean;
  strong?: boolean;
  tone?: "primary" | "secondary" | "tertiary" | "error";
}

const toolTone: Record<ToolKind, ExplanationPart["tone"]> = {
  figma: "tertiary",
  github: "primary",
  jira: "secondary",
  slack: "secondary",
  git: "primary",
  test: "secondary",
};

const explicitExplanations: Record<string, ExplanationPart[]> = {
  "CONF-1048": [
    { text: "Design frame " },
    { text: "CheckoutModal_v3", mono: true, tone: "tertiary" },
    {
      text: " was re-published with the three-step indicator intact after ",
    },
    { text: "PR #142", mono: true, tone: "primary" },
    { text: " collapsed the progress state in code, while " },
    { text: "PROJ-88", mono: true, tone: "secondary" },
    {
      text: " stayed In Progress — the anchored criterion set now contradicts the approved design intent.",
    },
  ],
};

export function explanationFor(finding: Finding): ExplanationPart[] {
  const explicit = explicitExplanations[finding.id];
  if (explicit) return explicit;

  const parts: ExplanationPart[] = [
    { text: `${finding.policyTitle} evaluated ` },
  ];
  finding.artifacts.forEach((artifact, index) => {
    if (index > 0) parts.push({ text: " ↔ " });
    parts.push({ text: artifact.ref, mono: true, tone: toolTone[artifact.tool] });
  });
  parts.push({ text: " against the anchored requirement — verdict " });
  parts.push({ text: finding.verdict ?? "INSUFFICIENT_EVIDENCE", mono: true });
  parts.push({ text: ", freshness " });
  parts.push({ text: finding.freshness, mono: true });
  parts.push({
    text: `. ${finding.summary}`,
  });
  return parts;
}

export function ruleAstFor(finding: Finding): string {
  const policy = getPolicy(finding);
  const rule = `${policy.id}_${policy.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  return JSON.stringify(
    {
      rule,
      trigger: policy.trigger,
      conditions: {
        freshness: finding.freshness,
        review_required: finding.reviewRequired,
        reason_code: finding.reasonCode ?? null,
        criteria_evaluated: finding.criteria.length,
        grace_minutes: policy.graceMinutes,
        link_eligibility_min: "confirmed",
      },
      verdict: finding.verdict ?? "INSUFFICIENT_EVIDENCE",
      violation_score: finding.severity === "critical" ? 0.948 : finding.severity === "warning" ? 0.61 : 0.24,
      finding_id: finding.id,
    },
    null,
    2,
  );
}

/* ------------------------------------------------------- visual evidence chain */

export interface ChainEvent {
  key: string;
  tool: ToolKind;
  badge: string;
  heading: string;
  body: string;
  actor: string;
  when: string;
  ref: string;
  divergence?: boolean;
}

export interface ChainTrigger {
  heading: string;
  body: string;
  badge: string;
  metricLabel: string;
  metricValue: string;
  trigger: string;
}

export interface EvidenceChain {
  events: ChainEvent[];
  trigger: ChainTrigger;
}

const explicitChains: Record<string, EvidenceChain> = {
  "CONF-1048": {
    events: [
      {
        key: "e1",
        tool: "figma",
        badge: "98% CONF (DET)",
        heading: "Figma frame CheckoutModal_v3 re-published",
        body: "Approved frame keeps the three-step indicator visible in both collapsed and expanded variants.",
        actor: "Mishal Fatima",
        when: "Oct 08, 09:40 UTC",
        ref: "Ref: fig://CheckoutModal_v3#849",
      },
      {
        key: "e2",
        tool: "github",
        badge: "95% CONF",
        heading: "PR #142 merged into main",
        body: "Collapsed-state refactor hides the progress steps while the payment form is collapsed.",
        actor: "Alex Rivera",
        when: "Oct 08, 12:05 UTC",
        ref: "Commit: sha-39a0c1e",
      },
      {
        key: "e3",
        tool: "jira",
        badge: "100% CONF",
        heading: "PROJ-88 state stagnation",
        body: "Ticket kept the In Progress state post-merge without capturing the collapsed-state delta.",
        actor: "Sam Okafor",
        when: "Oct 08 → Oct 08 (2h)",
        ref: "Assignee: @sokafor",
        divergence: true,
      },
    ],
    trigger: {
      heading: "Grace period boundary violated",
      body: "Anchored acceptance criteria now disagree with the approved design frame after the sync grace window closed.",
      badge: "P1 FIRED",
      metricLabel: "Threshold breached",
      metricValue: "+90m overflow",
      trigger: "Trigger: policy P1 · github.pull_request.merged",
    },
  },
};

export function evidenceChainFor(finding: Finding): EvidenceChain {
  const explicit = explicitChains[finding.id];
  if (explicit) return explicit;

  const events: ChainEvent[] = finding.artifacts.map((artifact, index) => ({
    key: `${finding.id}-a${index}`,
    tool: artifact.tool,
    badge: index === 0 ? "96% CONF (DET)" : "93% CONF",
    heading: `${artifact.label}: ${artifact.ref}`,
    body: artifact.title ?? finding.summary,
    actor: finding.assignedTo[0] ?? "unify-rules",
    when: `${finding.ageLabel} ago`,
    ref: `Anchor: ${artifact.ref}`,
    divergence: index === finding.artifacts.length - 1 && finding.artifacts.length > 1,
  }));

  return {
    events,
    trigger: {
      heading: `${finding.policy} evaluation raised the conflict`,
      body: finding.summary,
      badge: `${finding.policy} EVALUATED`,
      metricLabel: "Verdict",
      metricValue: finding.verdict ?? "INSUFFICIENT_EVIDENCE",
      trigger: `Trigger: policy ${finding.policy} · ${getPolicy(finding).trigger}`,
    },
  };
}

export interface TimelineMark {
  label: string;
  tone: "secondary" | "primary" | "tertiary" | "error";
  left: string;
}

export function timelineFor(finding: Finding): TimelineMark[] {
  const policy = getPolicy(finding);
  const grace =
    policy.graceMinutes >= 1440
      ? `${Math.round(policy.graceMinutes / 1440)}d`
      : policy.graceMinutes >= 60
        ? `${Math.round(policy.graceMinutes / 60)}h`
        : `${policy.graceMinutes}m`;
  return [
    { label: "T0: anchor captured", tone: "secondary", left: "15%" },
    { label: `T+${grace}: grace window`, tone: "primary", left: "30%" },
    { label: `T+${finding.ageLabel}: policy check`, tone: "tertiary", left: "55%" },
    { label: `Raised: ${formatUtc(finding.createdAt).replace(/ \d\d:\d\d:\d\d UTC$/, "")}`, tone: "error", left: "97%" },
  ];
}

/* -------------------------------------------------- bounded verification run */

export interface VerificationRow {
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "tertiary" | "error";
}

export interface VerificationPass {
  n: number;
  name: string;
  purpose: string;
  status: "COMPLETED" | "RAN" | "SKIPPED" | "STOPPED";
  rows: VerificationRow[];
}

export interface VerificationRun {
  passes: VerificationPass[];
  stopCode: string;
  stopReason: string;
  stopTone: "primary" | "secondary" | "tertiary" | "error";
}

export function verificationRunFor(finding: Finding): VerificationRun {
  const citations = finding.criteria.flatMap((c) => c.evidence);
  const resolved = citations.filter((c) => c.resolved).length;
  const verdictTally = finding.criteria.map((c) => `${c.criterionId} ${c.verdict}`).join(" · ");

  const pass3: VerificationPass = {
    n: 3,
    name: "Conditional critic",
    purpose: "Re-reads decisive criteria when review is required, then stops or escalates.",
    status: finding.reviewRequired ? "RAN" : "SKIPPED",
    rows: [
      {
        label: "Critic gate",
        value: finding.reviewRequired ? "review_required = true" : "review_required = false",
        tone: finding.reviewRequired ? "tertiary" : "secondary",
      },
      {
        label: "Reason code",
        value: finding.reasonCode ?? "none",
        tone: finding.reasonCode ? "error" : undefined,
      },
      {
        label: "Escalation",
        value: finding.reviewRequired ? "routed to human reviewers" : "no human needed",
      },
    ],
  };

  const passes: VerificationPass[] = [
    {
      n: 1,
      name: "Scope & retrieval",
      purpose: "Locks the artifact set and retrieves anchored citations from the evidence packet.",
      status: "COMPLETED",
      rows: [
        { label: "Scope", value: `${finding.artifacts.length} artifacts · ${finding.criteria.length} criteria` },
        { label: "Retrieved", value: `${citations.length} citations`, tone: "primary" },
        { label: "Freshness", value: finding.freshness, tone: finding.freshness === "CURRENT" ? "secondary" : "tertiary" },
      ],
    },
    {
      n: 2,
      name: "Verify",
      purpose: "Scores every criterion against its retrieved excerpts — no free-form reasoning.",
      status: finding.criteria.length > 0 ? "COMPLETED" : "STOPPED",
      rows: [
        {
          label: "Criterion verdicts",
          value: verdictTally || "none anchored",
          tone: (finding.verdict ?? "INSUFFICIENT_EVIDENCE") === "CONTRADICTED" ? "error" : "secondary",
        },
        { label: "Citations resolved", value: `${resolved}/${citations.length}`, tone: resolved === citations.length ? "secondary" : "tertiary" },
        { label: "Excerpts", value: "verbatim from packet" },
      ],
    },
    pass3,
  ];

  if (finding.reasonCode) {
    return {
      passes,
      stopCode: finding.reasonCode,
      stopReason: `Critic halted verification — ${finding.reasonCode} on the primary source.`,
      stopTone: "error",
    };
  }
  if ((finding.verdict ?? "INSUFFICIENT_EVIDENCE") === "INSUFFICIENT_EVIDENCE") {
    return {
      passes,
      stopCode: "ABSTAINED",
      stopReason: "Evidence below threshold — verifier abstained instead of guessing.",
      stopTone: "tertiary",
    };
  }
  if (!finding.reviewRequired) {
    return {
      passes,
      stopCode: "CRITERIA_ACCEPTED",
      stopReason: "All decisive criteria resolved in pass 2 — critic pass skipped.",
      stopTone: "secondary",
    };
  }
  return {
    passes,
    stopCode: "CRITERIA_EXHAUSTED",
    stopReason: "Anchored criteria set exhausted after pass 3 of 3 — bounded run complete.",
    stopTone: "primary",
  };
}

/* --------------------------------------------------------------- evidence case */

export interface EvidenceSupport {
  criterionId: string;
  tool: ToolKind;
  locator: string;
  excerpt: string;
}

export interface EvidenceGap {
  criterionId: string;
  text: string;
}

export interface EvidenceCase {
  verdictLine: string;
  supports: EvidenceSupport[];
  gaps: EvidenceGap[];
  citationCount: number;
  resolvedCount: number;
  gapCount: number;
}

export function evidenceCaseFor(finding: Finding): EvidenceCase {
  const supports: EvidenceSupport[] = [];
  const gaps: EvidenceGap[] = [];
  let citationCount = 0;
  let resolvedCount = 0;

  finding.criteria.forEach((criterion) => {
    criterion.evidence.forEach((citation) => {
      citationCount += 1;
      if (citation.resolved) {
        resolvedCount += 1;
        supports.push({
          criterionId: criterion.criterionId,
          tool: citation.tool,
          locator: citation.locator,
          excerpt: citation.excerpt,
        });
      } else {
        gaps.push({
          criterionId: criterion.criterionId,
          text: `Unresolved citation: ${citation.locator}`,
        });
      }
    });
    (criterion.missingEvidence ?? []).forEach((text) => {
      gaps.push({ criterionId: criterion.criterionId, text });
    });
  });

  const decisive = finding.criteria.filter(
    (c) => c.verdict === "CONTRADICTED" || c.verdict === "SUPPORTED",
  ).length;

  const verdictLine =
    finding.criteria.length === 0
      ? `${finding.verdict ?? "INSUFFICIENT_EVIDENCE"} recorded at finding level — no anchored criteria in this packet.`
      : `${finding.verdict ?? "INSUFFICIENT_EVIDENCE"} — ${decisive} of ${finding.criteria.length} criteria decisive, ${gaps.length} gap${
          gaps.length === 1 ? "" : "s"
        } left open.`;

  return {
    verdictLine,
    supports,
    gaps,
    citationCount,
    resolvedCount,
    gapCount: gaps.length,
  };
}

/* ---------------------------------------------------------------- stakeholders */

export interface Stakeholder {
  name: string;
  initials: string;
  handle: string;
  role: string;
  rationale: string;
  status: string;
  statusTone: "secondary" | "tertiary" | "primary";
  statusIcon: string;
}

const dispatchByStatus: Record<
  Finding["status"],
  { status: string; tone: Stakeholder["statusTone"]; icon: string }
> = {
  open: { status: "Delivered (Slack)", tone: "secondary", icon: "done_all" },
  acknowledged: { status: "Acknowledged (Web)", tone: "primary", icon: "done" },
  resolved: { status: "Resolved (Web)", tone: "secondary", icon: "check_circle" },
  suppressed: { status: "Suppressed (Web)", tone: "tertiary", icon: "do_not_disturb_on" },
};

export function stakeholdersFor(finding: Finding): Stakeholder[] {
  const base = dispatchByStatus[finding.status];
  return finding.assignedTo.map((name, index) => {
    const escalation =
      index > 0 && finding.severity === "critical" && finding.status === "open";
    const dispatch = escalation
      ? { status: "Escalation Queue", tone: "tertiary" as const, icon: "schedule" }
      : base;
    return {
      name,
      initials: initialsOf(name),
      handle: handleOf(name),
      role: index === 0 ? `Primary owner • ${finding.team}` : `Secondary reviewer • ${finding.team}`,
      rationale:
        index === 0
          ? `Anchors the artifacts cited by ${finding.policy} and owns the ${finding.team} delta.`
          : `Second signature required by the ${finding.policy} delivery template; reviews decisive criteria.`,
      status: dispatch.status,
      statusTone: dispatch.tone,
      statusIcon: dispatch.icon,
    };
  });
}

/* ----------------------------------------------------------------- audit trail */

export type AuditTone = "error" | "secondary" | "primary" | "tertiary" | "outline";

export interface AuditEntry {
  key: string;
  time: string;
  tag: string;
  tone: AuditTone;
  title: string;
  detail: string;
}

const kindTone: Record<string, AuditTone> = {
  finding: "error",
  verdict: "primary",
  linked: "secondary",
  ingested: "primary",
  human: "tertiary",
  delivery: "outline",
};

export function auditTrailFor(finding: Finding): AuditEntry[] {
  const entries: AuditEntry[] = [];

  entries.push({
    key: `${finding.id}-trigger`,
    time: formatUtc(finding.createdAt),
    tag: "TRIGGER",
    tone: "error",
    title: `${finding.policyTitle} fired`,
    detail: `Rule evaluated against ${finding.artifacts.map((a) => a.ref).join(" · ")}`,
  });

  activity
    .filter((event) => event.findingId === finding.id)
    .forEach((event) => {
      entries.push({
        key: event.id,
        time: formatUtc(event.timestamp),
        tag: event.kind.toUpperCase(),
        tone: kindTone[event.kind] ?? "outline",
        title: event.title,
        detail: `${event.detail} — ${event.actor}`,
      });
    });

  if (finding.status !== "open") {
    const last = activity
      .filter((event) => event.findingId === finding.id && event.kind === "human")
      .at(-1);
    entries.push({
      key: `${finding.id}-status`,
      time: last ? formatUtc(last.timestamp) : formatUtc(finding.createdAt),
      tag: finding.status.toUpperCase(),
      tone: finding.status === "resolved" ? "secondary" : "outline",
      title: `Finding marked ${finding.status}`,
      detail: last ? last.detail : `Recorded by ${finding.assignedTo[0] ?? "unify-rules"} in the immutable ledger.`,
    });
  }

  return entries;
}

/* ----------------------------------------------------------- resolution actions */

export const suppressionReasons: string[] = [
  "Intentional divergence (A/B test variant)",
  "Approved design revision superseded this frame",
  "False positive deterministic link match",
  "Generated / vendored artifact — excluded by policy",
  "Temporary exemption granted by engineering lead",
];

export const disputeReasons: string[] = [
  "Citation excerpt does not match the source",
  "Anchor attached to the wrong artifact",
  "Verdict contradicts the approved design intent",
  "Freshness marked STALE but source is current",
];
