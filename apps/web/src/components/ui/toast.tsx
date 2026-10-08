"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/ui/icon";

type ToastTone = "success" | "error" | "neutral";

type ToastState = {
  message: string;
  icon: string;
  tone: ToastTone;
};

export type ShowToast = (
  message: string,
  opts?: { icon?: string; tone?: ToastTone },
) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Read the transient feedback toast (mirrors the Stitch screen's toast). */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

const toneClass: Record<ToastTone, string> = {
  success: "text-secondary",
  error: "text-error",
  neutral: "text-outline",
};

/**
 * Shared bottom-right toast so only one transient notification is visible at
 * a time (mirrors the Stitch screens' toast element).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message, opts) => {
    setToast({
      message,
      icon: opts?.icon ?? "check_circle",
      tone: opts?.tone ?? "success",
    });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className={`fixed bottom-margin-page right-margin-page z-50 px-4 py-3 rounded-lg bg-surface-container-highest shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <Icon
          name={toast?.icon ?? "check_circle"}
          className={`text-[20px] ${toneClass[toast?.tone ?? "success"]}`}
        />
        <span className="font-body-md text-body-md text-on-surface">
          {toast?.message ?? ""}
        </span>
      </div>
    </ToastContext.Provider>
  );
}
