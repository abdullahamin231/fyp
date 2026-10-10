import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a UNIFY account for your workspace.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
