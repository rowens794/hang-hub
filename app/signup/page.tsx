"use client";

import { useActionState } from "react";
import { signUpParent } from "@/lib/actions.auth";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUpParent, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--card-border)] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            HangHub Parent
          </h1>
          <p className="text-[var(--muted)] mt-2">
            Create an account to manage your crew
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="parent@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-xl italic">
              {state.error}
            </div>
          )}

          <button
            disabled={isPending}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            {isPending ? "Creating account..." : "Create Parent Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
