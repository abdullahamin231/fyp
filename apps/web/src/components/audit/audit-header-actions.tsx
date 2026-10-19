"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { auditCsv, type AuditActor, type AuditEvent } from "@/lib/domain/audit";

const EXPORT_OPTIONS = [
  { id: "csv", icon: "table_chart", label: "Delimited CSV (.csv)", iconClass: "text-primary" },
  { id: "jsonl", icon: "data_object", label: "Stored records (.jsonl)", iconClass: "text-secondary" },
] as const;

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exports exactly the rows the console currently shows. */
export function AuditExportMenu({ events, actors }: { events: AuditEvent[]; actors: AuditActor[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function startExport(format: "csv" | "jsonl") {
    setMenuOpen(false);
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      download(`unify-audit-${stamp}.csv`, "text/csv", auditCsv(events, new Map(actors.map((a) => [a.id, a]))));
    } else {
      const lines = events.map((e) => JSON.stringify({ ...e.payload, sha256: e.digest }));
      download(`unify-audit-${stamp}.jsonl`, "application/x-ndjson", lines.join("\n"));
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        disabled={events.length === 0}
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-container hover:bg-primary-container/90 text-on-primary-container text-body-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
      >
        <Icon name="download" className="text-[18px]" />
        <span>Export {events.length.toLocaleString("en-US")} Records</span>
        <Icon name="expand_more" className="text-[16px]" />
      </button>

      {menuOpen ? (
        <div role="menu" className="absolute right-0 mt-2 w-72 rounded bg-surface-container-high shadow-xl p-3 z-30">
          <div className="flex flex-col gap-1">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => startExport(option.id)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-bright text-on-surface text-left transition-colors"
              >
                <Icon name={option.icon} className={`text-[18px] ${option.iconClass}`} />
                <span className="font-body-sm text-body-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
