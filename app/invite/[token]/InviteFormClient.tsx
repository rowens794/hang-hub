"use client";

import { useState } from "react";
import { submitQRInviteInfo } from "@/lib/actions.qr-invite";

interface Props {
  token: string;
  inviterName: string;
}

export default function InviteFormClient({ token, inviterName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await submitQRInviteInfo(token, name, email);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
          ✓
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Check Your Parent's Email!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          We sent an email to your parent at <strong>{email}</strong>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Once they approve, they'll set up your account and you can start hanging out with {inviterName}!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Enter your info below. We'll send an email to your parent to set up your account.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Parent's Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mom@email.com or dad@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name || !email}
        className="w-full py-4 px-6 rounded-xl bg-electric-purple hover:bg-electric-purple/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold text-lg transition-all disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send to Parent"}
      </button>

      <p className="text-xs text-center text-slate-500 dark:text-slate-500">
        Your parent will receive an email to approve and set up your account.
      </p>
    </form>
  );
}
