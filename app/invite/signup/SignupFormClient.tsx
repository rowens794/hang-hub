"use client";

import { useActionState, useState } from "react";
import { completeQRInviteSignup } from "@/lib/actions.qr-invite";

interface Props {
  signupToken: string;
  inviteeName: string;
  parentEmail: string;
}

export default function SignupFormClient({
  signupToken,
  inviteeName,
  parentEmail,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    completeQRInviteSignup,
    null
  );
  const [showPin, setShowPin] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="signupToken" value={signupToken} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Parent Account
        </p>

        <div>
          <label
            htmlFor="parentEmail"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="parentEmail"
            value={parentEmail}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="parentName"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            placeholder="Your full name"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
          />
        </div>

        <div>
          <label
            htmlFor="parentPassword"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="parentPassword"
            name="parentPassword"
            placeholder="Create a password"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Child Profile for {inviteeName}
        </p>

        <div>
          <label
            htmlFor="childDisplayName"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            Display Name
          </label>
          <input
            type="text"
            id="childDisplayName"
            name="childDisplayName"
            defaultValue={inviteeName}
            placeholder="What friends will see"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
          />
        </div>

        <div>
          <label
            htmlFor="childUsername"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="childUsername"
            name="childUsername"
            placeholder="unique_username"
            required
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
          />
          <p className="text-xs text-slate-500 mt-1">
            Letters, numbers, and underscores only
          </p>
        </div>

        <div>
          <label
            htmlFor="childPin"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
          >
            PIN (4-6 digits)
          </label>
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              id="childPin"
              name="childPin"
              placeholder="****"
              required
              minLength={4}
              maxLength={6}
              pattern="[0-9]{4,6}"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-purple"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPin ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {inviteeName} will use this PIN to log in
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {state.error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-6 rounded-xl bg-electric-purple hover:bg-electric-purple/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold text-lg transition-all disabled:cursor-not-allowed"
      >
        {isPending ? "Creating Account..." : "Create Account"}
      </button>

      <p className="text-xs text-center text-slate-500 dark:text-slate-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
