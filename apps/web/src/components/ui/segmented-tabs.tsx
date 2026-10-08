"use client";

import { useState, type ReactNode } from "react";

export type TabDef = {
  id: string;
  label: string;
  count?: number;
  content?: ReactNode;
};

/**
 * Segmented tab strip (the "state tabs" pattern from the Conflict Inbox /
 * Link Management toolbars). Controlled internally; `onChange` optional.
 */
export function SegmentedTabs({
  tabs,
  initialId,
  onChange,
  className = "",
}: {
  tabs: TabDef[];
  initialId?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState(initialId ?? tabs[0]?.id);

  return (
    <div className={`flex flex-wrap gap-1`}>
      <div
        role="tablist"
        className={`inline-flex p-1 rounded-lg bg-surface-container-lowest ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActive(tab.id);
                onChange?.(tab.id);
              }}
              className={[
                "px-3 py-1.5 rounded-md font-body-sm text-body-sm transition flex items-center gap-1.5",
                isActive
                  ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono-code text-[10px] font-bold ${
                    isActive ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-highest text-on-surface"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
