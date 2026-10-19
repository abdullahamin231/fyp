"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <AppShell>
      <section
        role="alert"
        className="mt-6 rounded-xl bg-surface-container-low p-5 shadow-sm flex items-start gap-3"
      >
        <Icon name="error" className="text-error text-[22px] shrink-0" />
        <div className="flex flex-col gap-2">
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            This page could not load
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            {error.digest ? (
              <>
                Reference <span className="font-mono-code">{error.digest}</span> is in the server log.
              </>
            ) : (
              error.message
            )}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={retry}
              className="px-3 py-1.5 rounded bg-primary-container text-on-primary-container font-body-sm font-semibold"
            >
              Try again
            </button>
            <Link href="/" className="text-body-sm text-primary hover:underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
