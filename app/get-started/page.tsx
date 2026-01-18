"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { inviteParent } from "@/lib/actions";

export default function GetStartedPage() {
  const [selection, setSelection] = useState<"kid" | "parent" | null>(null);
  const [kidStep, setKidStep] = useState<"choice" | "invite">("choice");
  const [parentEmail, setParentEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInviteParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await inviteParent(parentEmail);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        {/* Initial Selection */}
        {!selection && (
          <div className="text-center">
            <div className="mb-8">
              <div className="h-16 w-16 rounded-2xl bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                H
              </div>
              <h1 className="text-4xl font-black mb-2">Welcome to HangHub!</h1>
              <p className="text-[var(--muted)] text-lg">First things first...</p>
            </div>

            <h2 className="text-2xl font-bold mb-6">Are you a Kid or a Parent?</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setSelection("kid")}
                className="group bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-orange-500 rounded-2xl p-8 transition-all hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                  🎮
                </div>
                <h3 className="text-xl font-bold mb-2">I'm a Kid</h3>
                <p className="text-sm text-[var(--muted)]">Ready to coordinate hangs with my friends</p>
              </button>

              <button
                onClick={() => setSelection("parent")}
                className="group bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-blue-500 rounded-2xl p-8 transition-all hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                  👨‍👩‍👧
                </div>
                <h3 className="text-xl font-bold mb-2">I'm a Parent</h3>
                <p className="text-sm text-[var(--muted)]">Setting up accounts for my kids</p>
              </button>
            </div>
          </div>
        )}

        {/* Kid Flow */}
        {selection === "kid" && kidStep === "choice" && (
          <div className="text-center">
            <button
              onClick={() => setSelection(null)}
              className="absolute top-4 left-20 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              ← Start over
            </button>

            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg">
              🎮
            </div>
            <h1 className="text-3xl font-black mb-2">Hey there!</h1>
            <p className="text-[var(--muted)] text-lg mb-8">Do you already have a HangHub account?</p>

            <div className="space-y-4">
              <Link
                href="/play"
                className="block w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1"
              >
                Yes! Take me to login
              </Link>

              <button
                onClick={() => setKidStep("invite")}
                className="w-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-orange-500 text-[var(--foreground)] font-bold py-4 rounded-xl transition-all hover:-translate-y-1"
              >
                No, I need to create one
              </button>
            </div>
          </div>
        )}

        {/* Kid - Invite Parent Flow */}
        {selection === "kid" && kidStep === "invite" && !submitted && (
          <div className="text-center">
            <button
              onClick={() => setKidStep("choice")}
              className="absolute top-4 left-20 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              ← Back
            </button>

            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg">
              ✉️
            </div>
            <h1 className="text-3xl font-black mb-2">Almost there!</h1>
            <p className="text-[var(--muted)] text-lg mb-2">
              To keep everyone safe, a parent needs to set up your account.
            </p>
            <p className="text-[var(--muted)] mb-8">
              Enter your parent's email and we'll send them instructions!
            </p>

            <form onSubmit={handleInviteParent} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="parent@example.com"
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-center text-lg disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? "Sending..." : "Send Invite to My Parent"}
              </button>
            </form>

            <div className="mt-8 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
              <p className="text-sm text-[var(--muted)]">
                <span className="font-bold text-[var(--foreground)]">Pro tip:</span> You can also just tell your parent to go to{" "}
                <span className="text-orange-500 font-mono">hanghub.com</span> and sign up!
              </p>
            </div>
          </div>
        )}

        {/* Kid - Success */}
        {selection === "kid" && kidStep === "invite" && submitted && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg">
              ✅
            </div>
            <h1 className="text-3xl font-black mb-2">Invite Sent!</h1>
            <p className="text-[var(--muted)] text-lg mb-8">
              We sent an email to <span className="font-bold text-[var(--foreground)]">{parentEmail}</span>
              <br />
              Ask them to check their inbox!
            </p>

            <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] mb-6">
              <h3 className="font-bold mb-2">What happens next?</h3>
              <ol className="text-left text-sm text-[var(--muted)] space-y-2">
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">1.</span>
                  Your parent signs up for HangHub
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">2.</span>
                  They create your profile with a username & PIN
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">3.</span>
                  You log in and start coordinating hangs!
                </li>
              </ol>
            </div>

            <Link
              href="/"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Parent Flow */}
        {selection === "parent" && (
          <div className="text-center">
            <button
              onClick={() => setSelection(null)}
              className="absolute top-4 left-20 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              ← Start over
            </button>

            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg">
              👨‍👩‍👧
            </div>
            <h1 className="text-3xl font-black mb-2">Welcome, Parent!</h1>
            <p className="text-[var(--muted)] text-lg mb-8">
              Create an account to set up profiles for your kids
            </p>

            <div className="space-y-4">
              <Link
                href="/signup"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
              >
                Create Parent Account
              </Link>

              <Link
                href="/login"
                className="block w-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-blue-500 text-[var(--foreground)] font-bold py-4 rounded-xl transition-all hover:-translate-y-1"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-8 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
              <h3 className="font-bold mb-2">How it works</h3>
              <ol className="text-left text-sm text-[var(--muted)] space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  Create your parent account
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  Add your kids with a username & PIN
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  Approve hang requests when they come in
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
