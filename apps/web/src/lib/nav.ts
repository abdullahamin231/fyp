export type NavBadge = {
  text: string;
  tone: "error" | "tertiary" | "primary";
};

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: NavBadge;
  /** Matches the reference screens' data-path attribute. */
  path: string;
};

/**
 * Navigation derived verbatim from the Stitch screens' canonical SideNavBar
 * (`docs/stitch-reference/screens/*.html`, the `w-64` fixed rail with the
 * "Intelligence & Rules" group). The Operations / Settings groups keep every
 * route reachable using the reference's item styling.
 */
export const intelligenceNav: NavItem[] = [
  { label: "Conflict Inbox", href: "/conflicts", icon: "inbox", path: "conflict-inbox", badge: { text: "14", tone: "error" } },
  { label: "Conflict Detail", href: "/conflicts/CONF-1048", icon: "troubleshoot", path: "conflict-detail" },
  { label: "Policy Configuration", href: "/policies", icon: "rule", path: "policy-configuration" },
  { label: "Policy Simulation", href: "/policies/simulation", icon: "labs", path: "policy-simulation", badge: { text: "TEST", tone: "tertiary" } },
  { label: "Graph Explorer", href: "/graph", icon: "account_tree", path: "graph-explorer" },
  { label: "Link Management", href: "/links", icon: "link", path: "link-management" },
  { label: "Audit Trail", href: "/audit", icon: "history", path: "audit-trail" },
];

export const operationsNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard", path: "dashboard" },
  { label: "Activity Feed", href: "/activity", icon: "rss_feed", path: "activity-feed" },
  { label: "Conflict Alerts", href: "/alerts", icon: "warning", path: "conflict-alerts", badge: { text: "3", tone: "error" } },
  { label: "Search & Filters", href: "/search", icon: "search", path: "search" },
  { label: "Evaluation", href: "/evaluation", icon: "monitoring", path: "evaluation" },
  { label: "Study Runner", href: "/study", icon: "experiment", path: "study" },
  { label: "Onboarding", href: "/onboarding", icon: "rocket_launch", path: "onboarding" },
];

export const settingsNav: NavItem[] = [
  { label: "Settings", href: "/settings/workspace", icon: "settings", path: "settings" },
  { label: "Notifications", href: "/settings/notifications", icon: "notifications", path: "notification-preferences" },
  { label: "Slack Delivery", href: "/settings/slack", icon: "chat", path: "slack-configuration" },
];

export const navGroups: Array<{ label?: string; items: NavItem[] }> = [
  { label: "Intelligence & Rules", items: intelligenceNav },
  { label: "Review & Operations", items: operationsNav },
];

/**
 * Longest-prefix match so `/policies/simulation` activates Policy Simulation
 * rather than Policy Configuration, and `/conflicts/CONF-1048` activates
 * Conflict Detail rather than the inbox.
 */
export function activeHref(pathname: string, items: NavItem[]): string | null {
  let best: { href: string; len: number } | null = null;
  for (const item of items) {
    const match =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (match && (!best || item.href.length > best.len)) {
      best = { href: item.href, len: item.href.length };
    }
  }
  return best?.href ?? null;
}
