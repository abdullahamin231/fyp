"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { isActive, primaryNav, workspaceNav, type NavItem } from "@/lib/nav";

function NavEntry({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer active:scale-95 group",
        "border-r-2",
        active
          ? "text-primary font-bold border-primary bg-surface-container-high"
          : "text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface",
      ].join(" ")}
    >
      <Icon name={item.icon} className="text-[20px]" />
      <span className="font-body-md">{item.label}</span>
      {item.badge ? (
        <span className="ml-auto bg-error-container text-on-error-container text-[10px] font-bold px-1.5 rounded-full">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col h-screen w-[240px] shrink-0 py-margin-page bg-surface-container border-r border-outline-variant sticky left-0 top-0 z-50">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <Link href="/" className="font-headline-sm text-headline-sm text-primary font-bold">
          Unify Dev
        </Link>
        <span className="font-body-sm text-on-surface-variant">Engineering Hub</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 pb-2 font-label-caps text-label-caps uppercase text-on-surface-variant/70">
          Review
        </p>
        {primaryNav.map((item) => (
          <NavEntry key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <p className="px-4 pt-5 pb-2 font-label-caps text-label-caps uppercase text-on-surface-variant/70">
          Workspace
        </p>
        {workspaceNav.map((item) => (
          <NavEntry key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto px-3">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-4 rounded-lg bg-surface-container-low border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-all"
        >
          <span className="w-8 h-8 rounded-full border border-primary/20 bg-primary-container grid place-items-center text-on-primary-container font-bold text-body-sm">
            AR
          </span>
          <span className="flex flex-col">
            <span className="text-on-surface font-bold text-body-sm">Alex Rivera</span>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-wider">
              Staff Eng
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}

function TopBar({ action }: { action?: ReactNode }) {
  return (
    <header className="sticky top-0 w-full z-40 bg-surface border-b border-outline-variant flex items-center justify-between px-margin-page py-stack-compact">
      <div className="flex items-center gap-margin-page flex-1 min-w-0">
        <div className="font-headline-md text-headline-md font-black text-on-surface">Unify</div>
        <div className="relative w-full max-w-xl group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="text-on-surface-variant text-[18px]" />
          </div>
          <input
            type="text"
            placeholder="Jump to PR, Figma frame, or Slack thread..."
            className="block w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-12 py-2 font-mono-code text-body-sm transition-all text-on-surface placeholder:text-on-surface-variant/70"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-bold border border-outline-variant">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button className="p-2 rounded-full hover:bg-surface-container-lowest transition-colors relative">
          <Icon name="notifications" className="text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="h-8 w-[1px] bg-outline-variant" />
        {action ?? (
          <button className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all">
            Link Item
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Standard application chrome: 240px side rail + sticky top bar with the
 * omnibar, matching every Stitch screen.
 */
export function AppShell({
  children,
  action,
  contentClassName = "p-margin-page max-w-[1600px] mx-auto w-full space-y-6",
}: {
  children: ReactNode;
  action?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <TopBar action={action} />
        <div className={contentClassName}>{children}</div>
      </main>
    </div>
  );
}
