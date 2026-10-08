"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

/** Transient "workspace synced" toast from the Stitch dashboard screen. */
export function SyncToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 800);
    const hide = setTimeout(() => setVisible(false), 5000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-margin-page right-margin-page bg-surface-container border border-primary/40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <Icon name="cloud_sync" className="text-primary text-[18px] animate-pulse" />
      <span className="text-body-sm font-bold text-on-surface">Workspace synced successfully</span>
    </div>
  );
}
