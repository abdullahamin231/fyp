"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  activeHref,
  navGroups,
  settingsNav,
  type NavItem,
  type NavBadge,
} from "@/lib/nav";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

const STORAGE_KEY = "unify:sidebar";
/** Fired when this tab changes the rail so `useSyncExternalStore` re-reads it. */
const CHANGE_EVENT = "unify:sidebar:change";

const readCollapsed = () => {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "open";
};

const subscribe = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

const writeCollapsed = (collapsed: boolean) => {
  window.localStorage.setItem(STORAGE_KEY, collapsed ? "rail" : "open");
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const badgeTone: Record<NavBadge["tone"], string> = {
  error: "bg-error-container text-error font-semibold text-[11px]",
  tertiary:
    "bg-tertiary-container text-on-tertiary-container font-semibold text-[11px]",
  primary:
    "bg-primary-container text-on-primary-container font-semibold text-[11px]",
};

function NavEntry({
  item,
  active,
  open,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
}) {
  const base = active
    ? "bg-surface-container-highest text-on-surface font-medium"
    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors";

  return (
    <Link
      href={item.href}
      data-path={item.path}
      aria-current={active ? "page" : undefined}
      aria-label={open ? undefined : item.label}
      className={`group relative flex items-center h-9 rounded-md ${base} ${
        open ? "justify-between px-2.5 mx-1.5" : "justify-center mx-2.5"
      }`}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute -left-1.5 top-1 bottom-1 w-[2px] rounded-full bg-primary"
        />
      ) : null}

      <span className={`flex items-center min-w-0 ${open ? "gap-3" : ""}`}>
        {/* Icon box is a fixed 18×18 so the count dot can sit outside the
            glyph instead of on top of it. */}
        <span className="relative flex items-center justify-center shrink-0 w-[18px] h-[18px]">
          <span className="material-symbols-outlined text-[18px] leading-none">
            {item.icon}
          </span>
          {item.badge && item.badge.tone === "error" && !open ? (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-error ring-2 ring-surface-container-low"
            />
          ) : null}
        </span>
        {open ? (
          <span className="rail-label font-body-sm text-body-sm whitespace-nowrap">
            {item.label}
          </span>
        ) : null}
      </span>

      {item.badge && open ? (
        <span
          className={`rail-label px-1.5 py-0.5 rounded font-mono-code ${badgeTone[item.badge.tone]}`}
        >
          {item.badge.text}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Fixed-height slot for a group's title.
 *
 * The slot is rendered in **both** rail and expanded modes at exactly the nav
 * row height, and only its contents swap: the caps label when expanded, a
 * divider when collapsed, nothing at the very top. Keeping the box constant is
 * what stops the hover preview from reflowing the rows underneath the pointer —
 * a slot that grew on hover would push every item below it down by ~a full row,
 * so the cursor would land on a different item than the one it hovered.
 */
function GroupLabel({
  children,
  show,
  divider,
}: {
  children?: ReactNode;
  show: boolean;
  divider: boolean;
}) {
  return (
    <div className="h-9 flex items-end px-3 pb-1.5 shrink-0">
      {show && children ? (
        <span className="rail-label font-label-caps text-label-caps text-muted uppercase tracking-wider whitespace-nowrap">
          {children}
        </span>
      ) : divider ? (
        <span aria-hidden className="w-full border-t border-outline-variant" />
      ) : null}
    </div>
  );
}

/**
 * Side rail. In rail mode (64px) it shows icons only; hovering it opens a
 * 256px panel in place — labels fade in after the panel has finished growing,
 * so nothing is ever half-drawn over the icons. Clicking the header button (or
 * the top-bar toggle) pins it open; that choice is persisted, because a nav
 * that eats a sixth of the viewport should be the user's call, not ours.
 */
function SideNav({
  active,
  collapsed,
  hovering,
  onHoverChange,
  onToggle,
}: {
  active: string | null;
  collapsed: boolean;
  hovering: boolean;
  onHoverChange: (value: boolean) => void;
  onToggle: () => void;
}) {
  const open = !collapsed || hovering;

  return (
    <aside
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={`fixed left-0 top-0 h-full z-50 flex flex-col bg-surface-container-low border-r border-outline-variant transition-[width] duration-200 ease-out ${
        open ? "w-64" : "w-16"
      } ${collapsed && hovering ? "shadow-2xl shadow-black/50" : ""}`}
    >
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div
          className={`h-12 flex items-center border-b border-outline-variant shrink-0 ${
            open ? "justify-between px-3" : "justify-center px-0"
          }`}
        >
          <Link
            href="/"
            aria-label="UNIFY home"
            className="flex items-center gap-2.5 min-w-0"
          >
            <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[16px] leading-none">
                token
              </span>
            </span>
            {open ? (
              <span className="rail-label font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                UNIFY
              </span>
            ) : null}
          </Link>
          {open ? (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Pin navigation open" : "Collapse navigation"}
              className="rail-label p-1.5 rounded-md text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">
                {collapsed ? "push_pin" : "left_panel_close"}
              </span>
            </button>
          ) : null}
        </div>

        {navGroups.map((group, index) => (
          <div key={group.label ?? index}>
            <GroupLabel show={open} divider={!open && index > 0}>
              {group.label}
            </GroupLabel>
            <nav className="flex flex-col gap-1 pt-2 pb-1">
              {group.items.map((item) => (
                <NavEntry
                  key={item.href}
                  item={item}
                  active={active === item.href}
                  open={open}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-outline-variant py-2 shrink-0 bg-surface-container-low">
        <nav className="flex flex-col gap-1">
          {settingsNav.map((item) => (
            <NavEntry
              key={item.href}
              item={item}
              active={active === item.href}
              open={open}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

/**
 * Fixed top bar: sidebar toggle, ⌘K omnibar, per-page action slot, and the
 * notification/profile affordances. Its `left` tracks the *pinned* rail width,
 * not the hover preview, so the page never reflows under the pointer.
 */
function TopBar({
  action,
  collapsed,
  onToggle,
}: {
  action?: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <header
      className={`fixed top-0 right-0 h-12 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant flex items-center gap-3 px-6 transition-[left] duration-200 ease-out ${
        collapsed ? "left-16" : "left-64"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!collapsed}
        className="p-1.5 -ml-1.5 rounded-md text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[19px] leading-none">
          {collapsed ? "left_panel_open" : "left_panel_close"}
        </span>
      </button>

      <div className="relative w-full max-w-md">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[17px] leading-none">
          search
        </span>
        <input
          type="text"
          aria-label="Search"
          placeholder="Search artifacts, conflicts, policies"
          className="w-full pl-8 pr-14 py-1.5 rounded-md bg-surface-container border border-outline-variant text-on-surface placeholder-muted font-mono-code text-mono-code focus:outline-none focus:border-outline focus:ring-1 focus:ring-primary/40 transition"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-mono-code text-[11px] text-muted">
          ⌘K
        </kbd>
      </div>

      <WorkspaceSwitcher />

      <div className="flex items-center gap-2 ml-auto">
        {action}
        <NotificationsBell />
        <Link
          href="/profile"
          aria-label="Profile"
          className="w-7 h-7 rounded-md bg-surface-container-highest hover:bg-surface-container flex items-center justify-center border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[16px] leading-none">
            person
          </span>
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[19px] leading-none">
              logout
            </span>
          </button>
        </form>
      </div>
    </header>
  );
}

/**
 * Standard application chrome: a collapsible left rail, a fixed 48px top bar
 * and a `py-16 px-margin-page` main column that tracks the pinned rail width.
 */
export function AppShell({
  children,
  action,
  contentClassName = "w-full space-y-gutter",
}: {
  children: ReactNode;
  action?: ReactNode;
  contentClassName?: string;
}) {
  const pathname = usePathname();
  // localStorage-backed, not effect-backed: `useSyncExternalStore` renders the
  // server value first and swaps in the stored one after hydration, so there is
  // no mismatch and no cascading render. Default is the 64px rail.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => true);
  const [hovering, setHovering] = useState(false);
  const toggleCollapsed = () => writeCollapsed(!collapsed);

  const active =
    activeHref(
      pathname,
      navGroups.flatMap((g) => g.items),
    ) ?? activeHref(pathname, settingsNav);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md text-body-md">
      <SideNav
        active={active}
        collapsed={collapsed}
        hovering={hovering}
        onHoverChange={setHovering}
        onToggle={toggleCollapsed}
      />
      <div
        className={`transition-[padding] duration-200 ease-out ${collapsed ? "pl-16" : "pl-64"}`}
      >
        <TopBar
          action={action}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        <main className="w-full py-16 px-margin-page bg-background min-h-screen">
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
}
