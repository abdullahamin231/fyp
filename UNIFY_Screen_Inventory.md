# UNIFY — Complete Screen Inventory

Derived from `UNIFY_Strengthened_Stream_B_FYP_Development_Pack.md`

---

## 1. Onboarding / Workspace Setup
**Purpose:** First-time setup where an admin connects the team's Figma, GitHub, and Jira workspaces.
**UI:** A multi-step wizard. Step 1: create workspace / name it. Step 2: OAuth-connect Figma (least-privilege scopes). Step 3: OAuth-connect GitHub. Step 4: OAuth-connect Jira. Step 5: invite team members or skip. Each step shows connection status (green check / red fail) and explains what data will be accessed. A "skip for now" option exists for any source not yet available. Tokens are encrypted at rest; the screen must never display raw tokens.

---

## 2. Main Dashboard (Conflict Inbox)
**Purpose:** The primary view users land on after login. Shows all unresolved, acknowledged, resolved, and suppressed conflicts.
**UI:** A filterable list/table. Columns: severity badge (critical/warning/info), policy name, affected artifacts (design ticket name, PR title, Jira key), status, age, assigned recipient(s). A top bar has filters for severity, team, policy, resolution state, and time range. Summary counters at the top show total open, acknowledged, resolved, and suppressed counts. Sorting by severity, age, or artifact. Clicking a row opens the Conflict Detail screen. The PM sees a "team health" summary; developers see conflicts assigned to them; designers see design-related violations.

---

## 3. Conflict Detail / Explainable Violation Record
**Purpose:** Shows one conflict with its full evidence chain, explanation, and resolution actions.
**UI:** A detail panel or full page. Sections:
- **Header:** severity badge, policy name, policy version, status, created timestamp.
- **Evidence chain:** a visual path showing the source events (Figma version change → PR merge → Jira state), with timestamps and confidence scores for each link.
- **Explanation:** auto-generated natural-language summary of why this conflict fired (e.g. "Design v3 was published 4 days after PR #142 was merged, but Jira ticket PROJ-88 remains in 'In Progress'").
- **Affected artifacts:** clickable cards for each linked Figma node, GitHub PR, and Jira ticket, showing current state.
- **Recipients:** list of people who received this alert, with their role and reason for selection (owner, assignee, watcher, escalation).
- **Resolution actions:** buttons for "Acknowledge (no impact)", "Create/update implementation work", "Relink to correct version", "Suppress with reason", "Reopen". Each action requires a reason text input and creates an audit record.
- **History:** timeline of state changes on this conflict (created → acknowledged → resolved, etc.).

---

## 4. Artifact Graph / Relationship Explorer
**Purpose:** Visualizes the typed provenance-aware artifact graph — how Figma designs, GitHub PRs, and Jira tickets are linked.
**UI:** A node-link diagram. Nodes are color-coded by source tool (Figma = purple, GitHub = dark, Jira = blue). Edges are labeled with relationship type (IMPLEMENTS, TRACKS, TOUCHES, OWNS). Node cards show artifact name, version, and current state. Users can click any node to expand its details in a side panel. Filtering by entity type, relationship type, confidence level, and provenance (deterministic / manual / inferred). A search bar lets users find a specific artifact. Inferred/suggested links are shown as dashed lines with a "Confirm" or "Dismiss" action. Deterministic links are solid. This view helps developers and designers understand the full chain of related work.

---

## 5. Link Management Screen
**Purpose:** Manually create, review, confirm, or unlink artifact relationships.
**UI:** A search-and-select interface. User selects two artifacts (from a dropdown or search) and chooses a relationship type (IMPLEMENTS, TRACKS, TOUCHES). The system shows existing links for both artifacts. A list of inferred/suggested links appears with confidence scores and a "Confirm" or "Dismiss" button per suggestion. Each confirmed/dismissed action requires a brief reason. A table of all existing links in the workspace is shown below, filterable by type, source, and confidence. Each row has "Unlink" and "View provenance" actions. The provenance view shows who created the link, when, and from what evidence.

---

## 6. Policy Configuration / Management
**Purpose:** View, create, edit, version, and activate consistency policies (P1, P2, P3, and any team-custom policies).
**UI:** A table listing all policies: policy ID, name, version, status (draft/active/deprecated), last modified, created by. Clicking a policy opens a configuration form:
- **Policy name and description.**
- **Applicable relation types** (checkboxes: IMPLEMENTS, TRACKS, TOUCHES).
- **Trigger events** (dropdown: DEV_MODE_STATUS_UPDATE, FILE_VERSION_UPDATE, PR_MERGED, JIRA_TRANSITION, etc.).
- **Temporal condition:** grace period input (hours/days), state-before/state-after mappings.
- **Guards:** exclusion rules (e.g., ignore comments, ignore generated files).
- **Severity:** critical/warning/info selector.
- **Recipient roles:** checkboxes for owner, assignee, watcher, escalation.
- **Explanation template:** editable text with placeholders.
- **Suppression rules:** conditions under which this policy should not fire.
- **Effective dates:** start/end date pickers.
- A "Preview on historical events" button that runs the policy against past events without creating conflicts, showing what would have fired. A version history tab shows all prior versions with diffs. Changes create a new policy version.

---

## 7. Policy Preview / Simulation Screen
**Purpose:** Test a policy configuration against historical or simulated events before activating it.
**UI:** A split view. Left side: the policy configuration form (read-only or editable). Right side: a list of historical events that would match this policy's triggers. Each event shows its raw data, which artifacts it touches, and whether the policy would have fired (green check) or not (grey dash). Summary: "X of Y events would have triggered this policy." The user can adjust policy parameters and re-run the simulation. No conflicts are created; this is read-only. Used during evaluation and before policy activation.

---

## 8. Search / Advanced Filtering
**Purpose:** Find artifacts, conflicts, links, or policies across the entire workspace.
**UI:** A global search bar at the top of the app. Results are grouped by type: Artifacts, Conflicts, Links, Policies. Each result shows a mini-card with key fields (name, type, status, date). Advanced filter panel (expandable) lets users combine: artifact type, source tool, severity, team, policy, resolution state, date range, linked-to relationship, and confidence level. Results are paginated. Clicking a result navigates to the relevant detail screen.

---

## 9. Notification Preferences / Digest Settings
**Purpose:** Control how and when the user receives alerts (immediate vs digest, channels).
**UI:** A settings panel. Per-user preferences:
- **Delivery channel:** dashboard only, dashboard + Slack, Slack only.
- **Frequency:** immediate, hourly digest, daily digest.
- **Severity filter:** minimum severity to receive (e.g., only critical).
- **Policy filter:** which policies to receive alerts for.
- **Quiet hours:** time window where alerts are held (not pushed).
- **Escalation:** configure if unacknowledged alerts escalate after N hours.
- A "Test notification" button sends a sample alert to the selected channel. Slack channel configuration (outbound only) shows the connected Slack workspace and selected channel, with a "Send test message" button.

---

## 10. Audit Trail / Export
**Purpose:** View and export the full audit history of conflicts, link changes, policy changes, and user actions.
**UI:** A chronological log table. Columns: timestamp, actor (user or system), action type (conflict created, acknowledged, resolved, suppressed, link created, link dismissed, policy changed, etc.), affected artifact, reason (if provided). Filterable by actor, action type, date range, and artifact. An "Export" button generates a CSV or JSON file containing the filtered records, excluding tokens, raw vendor payloads, and private content. The export is scoped to the workspace and requires authorization. The screen is primarily used by PMs for compliance and by the evaluation team for benchmarking.

---

## 11. Slack Configuration (Outbound)
**Purpose:** Connect and configure the outbound Slack notification channel.
**UI:** A simple setup panel within workspace settings. Shows connected Slack workspace name and icon. A channel selector dropdown (reads available channels via Slack API). A "Send test message" button. A toggle to enable/disable Slack delivery globally. A per-policy override to send certain severity levels to Slack vs dashboard-only. This screen does not allow Slack message ingestion — Slack is outbound only.

---

## 12. Workspace Administration / Settings
**Purpose:** Manage workspace-level configuration: members, roles, connected sources, security, and retention.
**UI:** Tabbed settings page:
- **Members:** list of users with roles (admin, member, viewer), invite/remove actions, role assignment.
- **Connected Sources:** status cards for Figma, GitHub, Jira — showing connection health, last sync time, token expiry warning, reconnect/revoke buttons. No raw tokens displayed.
- **Security:** token encryption status, least-privilege scope documentation per adapter, webhook signature verification toggle, API key rotation schedule.
- **Retention:** raw vendor payload retention period, audit log retention, entity/link data retention, deletion policy.
- **Danger zone:** workspace deletion, data export before deletion.

---

## 13. User Profile / Preferences
**Purpose:** Individual user settings and role information.
**UI:** A simple profile page. Shows user name, email, role (developer/designer/PM), connected tool accounts (GitHub username, Jira username, Figma email). Notification preferences (link to Notification Preferences screen). Watcher opt-in: user can choose to watch specific artifacts or policies. API access tokens (if applicable) with revoke option.

---

## 14. Activity Feed / Timeline
**Purpose:** A real-time feed of all significant events in the workspace — new conflicts, link changes, policy activations, resolutions.
**UI:** A vertical timeline. Each entry has an icon (by source tool), timestamp, actor, event description, and a link to the relevant detail screen. Filterable by event type, source tool, and date range. Used primarily by PMs to stay informed without checking the conflict inbox constantly. Can be set to auto-refresh.

---

## 15. Evaluation Dashboard (Internal / Admin)
**Purpose:** View system performance metrics, benchmark results, and health indicators.
**UI:** A metrics dashboard. Charts and counters for:
- Internal processing latency (p50, p95, p99).
- Vendor observation delay.
- Conflict precision/recall/F1.
- Link precision/recall/F1.
- Recipient precision/recall.
- Alerts per user per day.
- Duplicate conflict count (target: 0).
- Recovery correctness after outage.
- Full rescan vs incremental evaluation latency.
- Adapter health (webhook status, last reconciliation, checkpoint age).
Used by the development team and during evaluation. Not visible to regular users.

---

## 16. Manual Workflow Study Interface (Evaluation)
**Purpose:** A controlled interface for running the counterbalanced manual-vs-Unify workflow study with stakeholders.
**UI:** A task runner screen. Shows a scenario description (e.g. "A design was updated after the PR was merged. Investigate and determine if there is a conflict."). The user can browse artifacts, inspect links, and make a decision. The system records completion time, paths taken, links inspected, and decision made. Two scenario sets are used (manual-first vs Unify-first). This screen is for evaluation only and may not appear in the final production build.

---

## Summary Table

| # | Screen | Primary User | Core Action |
|---|--------|-------------|-------------|
| 1 | Onboarding / Workspace Setup | Admin | Connect Figma, GitHub, Jira; invite members |
| 2 | Main Dashboard (Conflict Inbox) | All | View, filter, and triage conflicts |
| 3 | Conflict Detail | All | Inspect evidence chain, resolve or suppress |
| 4 | Artifact Graph / Explorer | Developer, Designer | Visualize and navigate artifact relationships |
| 5 | Link Management | Developer, Designer | Create, confirm, dismiss, or unlink relationships |
| 6 | Policy Configuration | Admin, PM | Define and version consistency policies |
| 7 | Policy Preview / Simulation | Admin, PM | Test policies against historical events |
| 8 | Search / Advanced Filtering | All | Find any artifact, conflict, link, or policy |
| 9 | Notification Preferences | All | Control alert delivery channel and frequency |
| 10 | Audit Trail / Export | PM, Admin | View history and export audit records |
| 11 | Slack Configuration (Outbound) | Admin | Connect Slack channel for outbound alerts |
| 12 | Workspace Administration | Admin | Manage members, sources, security, retention |
| 13 | User Profile / Preferences | All | Personal settings and watcher opt-in |
| 14 | Activity Feed / Timeline | PM, All | Real-time event timeline |
| 15 | Evaluation Dashboard | Dev team | Performance metrics and benchmark results |
| 16 | Manual Workflow Study | Evaluation participants | Controlled task runner for user study |
