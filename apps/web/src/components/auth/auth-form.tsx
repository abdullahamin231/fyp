"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";

/**
 * Email + password sign-in / sign-up form, styled against the UNIFY token
 * set (monochrome zinc, white = the action colour). Email confirmation is
 * disabled on the project, so a successful signup returns a session
 * immediately and lands on the return path (or the dashboard).
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const supabase = createClient();

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setBusy(false);
        return;
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // Confirmation is disabled project-wide; this makes the redirect
          // explicit if it is ever re-enabled.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setBusy(false);
        return;
      }
      if (!data.session) {
        setNotice("Check your inbox to confirm your email, then sign in.");
        setBusy(false);
        return;
      }
    }

    router.push(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Icon name="token" className="text-on-primary text-[20px] leading-none" />
        </span>
        <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
          UNIFY
        </span>
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
        {isLogin ? "Sign in" : "Create your account"}
      </h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {!isLogin ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
              Name
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className="px-3 py-2 rounded-md bg-surface-container border border-outline-variant text-on-surface placeholder-muted font-body-sm text-body-sm focus:outline-none focus:border-outline focus:ring-1 focus:ring-primary/40 transition"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@team.dev"
            className="px-3 py-2 rounded-md bg-surface-container border border-outline-variant text-on-surface placeholder-muted font-body-sm text-body-sm focus:outline-none focus:border-outline focus:ring-1 focus:ring-primary/40 transition"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="px-3 py-2 rounded-md bg-surface-container border border-outline-variant text-on-surface placeholder-muted font-body-sm text-body-sm focus:outline-none focus:border-outline focus:ring-1 focus:ring-primary/40 transition"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="px-3 py-2 rounded-md bg-error-container text-error font-body-sm text-body-sm"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="px-3 py-2 rounded-md bg-primary-container text-on-primary-container font-body-sm text-body-sm"
          >
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 px-4 py-2 rounded-md bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {busy
            ? "Working…"
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="font-body-sm text-body-sm text-on-surface-variant mt-6">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link
          href={
            next
              ? `${isLogin ? "/signup" : "/login"}?next=${encodeURIComponent(next)}`
              : isLogin
                ? "/signup"
                : "/login"
          }
          className="text-on-surface font-medium underline underline-offset-2 hover:opacity-80 transition"
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
