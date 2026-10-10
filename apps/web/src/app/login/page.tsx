import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to UNIFY — cross-tool change assurance.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
