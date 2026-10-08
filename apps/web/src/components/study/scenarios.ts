/**
 * Human-study scenario data for the manual workflow study interface.
 *
 * The study runs a counterbalanced within-subject design: each scenario is
 * completed twice by a participant — once under the MANUAL condition (native
 * Jira / GitHub / Figma tooling only) and once under the UNIFY-assisted
 * condition (graph + explainable record). Two scenarios are shipped so the
 * session is internally consistent when the runner advances tasks.
 */

export type BriefToken = { text: string; tone?: string; code?: boolean };

export type CodeLine = { text: string; tone?: string; suffix?: string };

/** Named SVG tones — mapped to literal Tailwind classes in the graph renderer. */
export type SvgTone =
  | "tertiary"
  | "primary"
  | "secondary"
  | "outline"
  | "error"
  | "errorContainer"
  | "tertiaryContainer"
  | "primaryContainer"
  | "secondaryContainer"
  | "onSurfaceVariant";

export type GraphNodeSpec = {
  id: string;
  x: number;
  w: number;
  badge: string;
  badgeTone: SvgTone;
  badgeFillTone: SvgTone;
  title: string;
  meta: string;
  metaTone: SvgTone;
  strokeTone: SvgTone;
};

export type InspectorColumn = {
  header: string;
  meta: string;
  metaTone: string;
  dot: string;
  lines: CodeLine[];
  footer: {
    icon: string;
    iconTone: string;
    title: string;
    subtitle: string;
    rightIcon: string;
    rightTone: string;
  };
};

export type ScenarioEvidence = {
  id: "A-1" | "B-2";
  title: string;
  brief: BriefToken[];
  prompt: string;
  requirements: string[];
  claim: string;
  graph: {
    nodes: GraphNodeSpec[];
    edges: { d: string; tone: SvgTone; dashed?: boolean }[];
    pulse?: { from: number; to: number; tone: SvgTone };
    anomaly?: { x: number; y: number; label: string; tone: "error" | "errorContainer" };
    defaultSelection: string;
    anomalyNote: string;
    anomalyTone: string;
  };
  inspector: {
    title: string;
    severity: string;
    severityTone: string;
    keyChip: string;
    left: InspectorColumn;
    right: InspectorColumn;
    inference: string;
  };
  tabs: {
    unify: { timeline: { time: string; label: string; detail: string; tone?: string; flag?: boolean }[]; query: CodeLine[] };
    github: { heading: string; badge: string; badgeTone: string; body: string; stats: string };
    figma: { heading: string; lines: string[] };
    jira: { heading: string; lines: string[] };
  };
  rootCauses: { value: string; label: string }[];
  stakeholders: { id: string; label: string; preselected?: boolean }[];
};

export const scenarios: Record<"A-1" | "B-2", ScenarioEvidence> = {
  "B-2": {
    id: "B-2",
    title: "Scenario B-2: Post-Merge Design Token Divergence",
    brief: [
      { text: "A critical Figma design frame was updated " },
      { text: "4 days after PR #142 was merged", tone: "text-tertiary font-semibold" },
      { text: " into " },
      { text: "main", code: true },
      { text: ". Jira ticket " },
      { text: "PROJ-88", code: true, tone: "text-secondary" },
      { text: ' remains in "In Progress".' },
    ],
    prompt:
      "Investigate the provenance chain across tools, verify if an actionable sync conflict exists, identify the precise root cause, and specify resolution.",
    requirements: [
      "Record an evidence verdict for the claim (four verdicts only)",
      "Identify the root cause (divergent padding commit vs token spec)",
      "Target notification list (designer, PR author/assignee, reviewer)",
      "Specify the justified resolution action",
    ],
    claim: 'the claim "PR #142 satisfies CheckoutModal_v3.2 as merged"',
    graph: {
      nodes: [
        {
          id: "figma",
          x: 30,
          w: 160,
          badge: "F",
          badgeTone: "tertiary",
          badgeFillTone: "tertiaryContainer",
          title: "CheckoutModal_v3.2",
          meta: "UPDATED: Oct 24 (+4d)",
          metaTone: "tertiary",
          strokeTone: "tertiary",
        },
        {
          id: "pr",
          x: 310,
          w: 140,
          badge: "#",
          badgeTone: "primary",
          badgeFillTone: "primaryContainer",
          title: "PR #142 (Merged)",
          meta: "Commit 8ef2a1 · Oct 20",
          metaTone: "onSurfaceVariant",
          strokeTone: "primary",
        },
        {
          id: "jira",
          x: 570,
          w: 150,
          badge: "J",
          badgeTone: "secondary",
          badgeFillTone: "secondaryContainer",
          title: "Jira PROJ-88",
          meta: "Status: IN PROGRESS",
          metaTone: "secondary",
          strokeTone: "outline",
        },
      ],
      edges: [
        { d: "M 190 85 C 240 85, 260 85, 310 85", tone: "tertiary" },
        { d: "M 450 85 C 500 85, 520 85, 570 85", tone: "secondary" },
      ],
      pulse: { from: 190, to: 310, tone: "tertiary" },
      anomaly: { x: 230, y: 32, label: "Δ DIVERGED", tone: "errorContainer" },
      defaultSelection: "CheckoutModal_v3.2",
      anomalyNote: "Temporal anomaly detected (4 days after base merge)",
      anomalyTone: "text-tertiary",
    },
    inspector: {
      title: "Token Discrepancy: Frame Padding Contract",
      severity: "Severity: High",
      severityTone: "bg-error-container text-error",
      keyChip: "Key: modal_padding_insets",
      left: {
        header: "Figma Component Spec",
        meta: "v3.2 · Oct 24, 14:18 UTC",
        metaTone: "text-tertiary",
        dot: "bg-tertiary",
        lines: [
          { text: "// Design Tokens applied", tone: "text-outline-variant" },
          { text: 'component: "CheckoutModal"' },
          {
            text: "+ padding: 16px;",
            tone: "bg-tertiary/10 p-1 rounded text-tertiary font-bold",
            suffix: "(Token: $spacing-comfortable)",
          },
          { text: "border-radius: 8px;" },
          { text: 'layout-mode: "AutoLayout-Vertical"' },
        ],
        footer: {
          icon: "space_dashboard",
          iconTone: "text-tertiary",
          title: "Updated by: Sarah M. (designer)",
          subtitle: "Design System Library v4.1",
          rightIcon: "open_in_new",
          rightTone: "text-outline",
        },
      },
      right: {
        header: "GitHub PR #142 Implementation",
        meta: "Commit 8ef2a1 · Oct 20",
        metaTone: "text-primary",
        dot: "bg-primary",
        lines: [
          { text: "// packages/checkout/Modal.tsx", tone: "text-outline-variant" },
          { text: "export const ModalContainer = styled.div`" },
          {
            text: "- padding: 8px;",
            tone: "bg-error-container/30 p-1 rounded text-error font-bold",
            suffix: "(Merged hardcoded value)",
          },
          { text: "border-radius: 8px;" },
          { text: "display: flex;" },
        ],
        footer: {
          icon: "terminal",
          iconTone: "text-primary",
          title: "Merged by: Alex Chen (assignee)",
          subtitle: "branch: feature/PROJ-88-checkout",
          rightIcon: "done_all",
          rightTone: "text-secondary",
        },
      },
      inference:
        "Design library published updated padding tokens after PR approval. Code was implemented against obsolete mock v3.1. Issue is unresolved in production.",
    },
    tabs: {
      unify: {
        timeline: [
          { time: "Oct 20, 10:15", label: "PR #142 Created", detail: "Ref PROJ-88" },
          { time: "Oct 20, 16:30", label: "PR #142 Merged", detail: "main @ 8ef2a1", tone: "text-secondary" },
          { time: "Oct 22, 09:00", label: "Jira In QA", detail: "Staging deploy" },
          { time: "Oct 24, 14:18", label: "Figma v3.2 Push", detail: "Δ Padding updated", tone: "text-tertiary", flag: true },
        ],
        query: [
          { text: "// Unify Graph Path Resolution (Confidence: 0.982)", tone: "text-secondary font-bold" },
          {
            text: 'MATCH (f:FigmaNode {id: "CheckoutModal_v3.2"})-[:SPECIFIES]->(c:CodeCommit {sha: "8ef2a1"})',
            tone: "text-on-surface-variant",
          },
          {
            text: "WHERE f.timestamp > c.timestamp AND f.attributes.padding != c.attributes.padding",
            tone: "text-error",
          },
          {
            text: "RESULT: 1 active drift pattern (ID: SYNC-2024-998)",
            tone: "text-primary-fixed",
          },
        ],
      },
      github: {
        heading: "PR #142: feat(checkout): Add unified payment modal container",
        badge: "Merged",
        badgeTone: "bg-primary-container text-on-primary-container",
        body: "Closes PROJ-88. Matches Figma Checkout screen designs as reviewed on Monday Oct 19.",
        stats: "+142 lines / -18 lines across 4 files. Checks: 14 passing.",
      },
      figma: {
        heading: "Figma File: Acme Mobile & Web Components / Core Library",
        lines: [
          "Node ID: 412:9082 [CheckoutModal_v3.2]",
          "Last modified by: Sarah M. (design systems)",
          'Version note: "Enlarged modal touch targets & insets to 16px per a11y audit findings."',
        ],
      },
      jira: {
        heading: "Jira Ticket: PROJ-88 [Fix checkout modal spacing in responsive view]",
        lines: [
          "Assignee: Alex Chen | Reporter: Maria G. | Status: IN PROGRESS",
          "Linked PR: #142 (Merged) | Sprint: Sprint 42",
          'Comment (Oct 21): "Merged code to dev branch. Pending designer verification before closing."',
        ],
      },
    },
    rootCauses: [
      {
        value: "post_merge_design_token_update",
        label:
          "Post-merge design update: Figma modified 16px padding after PR #142 merged with 8px",
      },
      { value: "git_revert", label: "Accidental Git revert during branch reconciliation" },
      { value: "jira_out_of_sync", label: "Jira status lag with no actual code divergence" },
      { value: "other", label: "Other architectural discrepancy" },
    ],
    stakeholders: [
      { id: "designer", label: "Sarah M. (designer)", preselected: true },
      { id: "assignee", label: "Alex Chen (PR #142 author / assignee)", preselected: true },
      { id: "reviewer", label: "Reviewer (PR #142 sign-off)" },
      { id: "pm", label: "Maria G. (PM, PROJ-88)" },
    ],
  },

  "A-1": {
    id: "A-1",
    title: "Scenario A-1: Ghost Ticket Without a Code Anchor",
    brief: [
      { text: "Jira ticket " },
      { text: "PROJ-91", code: true, tone: "text-secondary" },
      { text: ' moved to "In Review" ' },
      { text: "3 days ago", tone: "text-tertiary font-semibold" },
      { text: " across a 14-repository workspace, but no pull request, branch or test references it. Policy P2 fired after its 240m grace window as " },
      { text: "CONF-1047", code: true, tone: "text-error" },
      { text: "." },
    ],
    prompt:
      "Trace whether PROJ-91 has any eligible code anchor, decide whether the P2 finding is supported by the evidence, identify who must be notified, and specify the next action.",
    requirements: [
      "Record an evidence verdict for the claim (four verdicts only)",
      "Identify the root cause (missing anchor vs state drift)",
      "Target notification list (assignee, PM, code owner)",
      "Specify the justified resolution action",
    ],
    claim: 'the claim "PROJ-91 has an eligible code anchor"',
    graph: {
      nodes: [
        {
          id: "jira",
          x: 30,
          w: 160,
          badge: "J",
          badgeTone: "secondary",
          badgeFillTone: "secondaryContainer",
          title: "Jira PROJ-91",
          meta: "Status: IN REVIEW",
          metaTone: "secondary",
          strokeTone: "secondary",
        },
        {
          id: "search",
          x: 310,
          w: 140,
          badge: "∅",
          badgeTone: "error",
          badgeFillTone: "errorContainer",
          title: "No anchor found",
          meta: "0 eligible edges",
          metaTone: "errorContainer",
          strokeTone: "errorContainer",
        },
        {
          id: "finding",
          x: 570,
          w: 150,
          badge: "P2",
          badgeTone: "tertiary",
          badgeFillTone: "tertiaryContainer",
          title: "CONF-1047",
          meta: "Status: OPEN",
          metaTone: "tertiary",
          strokeTone: "outline",
        },
      ],
      edges: [
        { d: "M 190 85 C 240 85, 260 85, 310 85", tone: "outline", dashed: true },
        { d: "M 450 85 C 500 85, 520 85, 570 85", tone: "tertiary" },
      ],
      pulse: { from: 450, to: 570, tone: "tertiary" },
      anomaly: { x: 222, y: 32, label: "NO EDGE", tone: "errorContainer" },
      defaultSelection: "Jira PROJ-91",
      anomalyNote: "SATISFIES edge missing after 240m grace window",
      anomalyTone: "text-error",
    },
    inspector: {
      title: "Anchor Gap: PROJ-91 Has No Eligible Code Reference",
      severity: "Severity: Warning",
      severityTone: "bg-tertiary-container text-on-tertiary-container",
      keyChip: "Edge: SATISFIES (absent)",
      left: {
        header: "Jira Issue PROJ-91",
        meta: "Board PROJ · Sprint 42",
        metaTone: "text-secondary",
        dot: "bg-secondary",
        lines: [
          { text: "// canonical issue fields", tone: "text-outline-variant" },
          { text: 'summary: "Watcher mute controls"' },
          {
            text: '+ status: "IN_REVIEW"',
            tone: "bg-tertiary/10 p-1 rounded text-tertiary font-bold",
            suffix: "(moved Oct 07, 17:04 UTC)",
          },
          { text: 'assignee: "jordan.t"' },
          { text: 'fixVersion: "v2.1.0"' },
        ],
        footer: {
          icon: "view_kanban",
          iconTone: "text-secondary",
          title: "Reported by: Maria G. (PM)",
          subtitle: "No linked pull requests",
          rightIcon: "open_in_new",
          rightTone: "text-outline",
        },
      },
      right: {
        header: "Code Anchor Search",
        meta: "14 repos · 3 strategies",
        metaTone: "text-primary",
        dot: "bg-primary",
        lines: [
          { text: "// strategy: symbol → content hash → diff hunk", tone: "text-outline-variant" },
          { text: "search: 'PROJ-91' in symbol names → 0 matches" },
          {
            text: "search: 'PROJ-91' in commits + branches → 0 matches",
            tone: "bg-error-container/30 p-1 rounded text-error font-bold",
            suffix: "(0 results)",
          },
          { text: "branch fix/watcher-mute → not found" },
          { text: "test references → none" },
        ],
        footer: {
          icon: "search",
          iconTone: "text-error",
          title: "0 eligible SATISFIES edges",
          subtitle: "3 strategies exhausted · 14 repos scanned",
          rightIcon: "error",
          rightTone: "text-error",
        },
      },
      inference:
        "Ticket accepted into review with no code or test anchor; P2 fired as CONF-1047 after the 240m grace window. Either the work shipped untracked, or the link was never created.",
    },
    tabs: {
      unify: {
        timeline: [
          { time: "Oct 05, 11:20", label: "PROJ-91 Created", detail: "Sprint 42 grooming" },
          { time: "Oct 06, 09:41", label: "Moved to In Progress", detail: "assignee jordan.t", tone: "text-secondary" },
          { time: "Oct 07, 17:04", label: "Moved to In Review", detail: "0 linked PRs" },
          { time: "Oct 08, 01:04", label: "P2 fired → CONF-1047", detail: "after 240m grace", tone: "text-error", flag: true },
        ],
        query: [
          { text: "// Unify Graph Path Resolution (Confidence: 0.940)", tone: "text-secondary font-bold" },
          { text: "MATCH (j:JiraIssue {key: \"PROJ-91\"})-[r:SATISFIES]->(c:CodeUnit)", tone: "text-on-surface-variant" },
          { text: "WHERE r.eligibility >= 'confirmed' AND c.freshness = 'CURRENT'", tone: "text-error" },
          { text: "RESULT: 0 rows → 1 policy finding (CONF-1047)", tone: "text-primary-fixed" },
        ],
      },
      github: {
        heading: "Search across acme-corp (14 repositories)",
        badge: "0 results",
        badgeTone: "bg-error-container text-error",
        body: "No pull request, branch, commit message or CODEOWNERS entry has referenced PROJ-91 in the last 30 days.",
        stats: "0 branches / 0 PRs / 0 mentions · 14 repos scanned in 1.2s",
      },
      figma: {
        heading: "Figma: no design artifact references PROJ-91",
        lines: [
          "CheckoutModal_v3.2 is anchored to PROJ-88, not PROJ-91",
          "No frame comment or prototype note mentions watcher mute controls",
          "Design delivery for this ticket was never requested",
        ],
      },
      jira: {
        heading: "Jira Ticket: PROJ-91 [Watcher mute controls]",
        lines: [
          "Assignee: Jordan T. | Reporter: Maria G. | Status: IN_REVIEW",
          "Linked PR: none | Sprint: Sprint 42 | Fix version: v2.1.0",
          'Comment (Oct 07): "Finished the UI changes locally — will push the branch tomorrow."',
        ],
      },
    },
    rootCauses: [
      { value: "never_pushed", label: "Work completed locally but never pushed — no PR or branch exists" },
      { value: "premature_state", label: "Ticket moved to In Review prematurely (state drift only)" },
      { value: "anchor_lost", label: "Anchor lost during branch cleanup — re-anchoring failed" },
      { value: "other", label: "Other / inconclusive" },
    ],
    stakeholders: [
      { id: "assignee", label: "Jordan T. (assignee)", preselected: true },
      { id: "pm", label: "Maria G. (PM / reporter)", preselected: true },
      { id: "owner", label: "Core Checkout code owner" },
      { id: "reviewer", label: "Reviewer (Sprint 42 sign-off)" },
    ],
  },
};

export type StudyTask = {
  id: number;
  scenario: "A-1" | "B-2";
  condition: "MANUAL" | "UNIFY";
  label: string;
};

/** Counterbalanced order for group G-A: UNIFY-first on scenario B-2. */
export const studyTasks: StudyTask[] = [
  { id: 1, scenario: "A-1", condition: "MANUAL", label: "Manual baseline" },
  { id: 2, scenario: "B-2", condition: "UNIFY", label: "UNIFY-assisted" },
  { id: 3, scenario: "B-2", condition: "MANUAL", label: "Manual replication" },
  { id: 4, scenario: "A-1", condition: "UNIFY", label: "UNIFY transfer" },
];
