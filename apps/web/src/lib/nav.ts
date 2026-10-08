export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

/**
 * Canonical navigation derived from the Stitch screens' SideNavBar.
 * Grouped so the rail reads the same on every page.
 */
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Graph Explorer", href: "/graph", icon: "account_tree" },
  { label: "Activity Feed", href: "/activity", icon: "rss_feed" },
  { label: "Conflict Alerts", href: "/conflicts", icon: "warning", badge: 3 },
  { label: "Link Management", href: "/links", icon: "link" },
  { label: "Audit Trail", href: "/audit", icon: "fact_check" },
];

export const workspaceNav: NavItem[] = [
  { label: "Policy Configuration", href: "/policies", icon: "tune" },
  { label: "Policy Simulation", href: "/policies/simulation", icon: "science" },
  { label: "Search & Filters", href: "/search", icon: "search" },
  { label: "Workspace Admin", href: "/settings/workspace", icon: "domain" },
  { label: "Notifications", href: "/settings/notifications", icon: "notifications" },
  { label: "Slack Delivery", href: "/settings/slack", icon: "chat" },
  { label: "Evaluation", href: "/evaluation", icon: "monitoring" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
