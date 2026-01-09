"use client";

import { useActionState } from "react";
import { loginChild } from "@/lib/actions.auth";
import Link from "next/link";

export default function ChildLoginPage() {
  const [state, action, isPending] = useActionState(loginChild, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md bg-[#161616] rounded-2xl p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/20">
            🎮
          </div>
          <h1 className="text-3xl font-bold">HangHub Play</h1>
          <p className="text-gray-400 mt-2">
            Enter your username and PIN to join the fun!
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-center text-xl tracking-wide"
              placeholder="super_gamer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              4-6 Digit PIN
            </label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4,6}"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-center text-3xl tracking-[1em]"
              placeholder="••••"
            />
          </div>

          {state?.error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-xl italic text-center">
              {state.error}
            </div>
          )}

          <button
            disabled={isPending}
            className="w-full bg-linear-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 text-xl"
          >
            {isPending ? "Connecting..." : "LET'S PLAY!"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 border-t border-white/5 pt-6">
          Parents: Need to manage profiles?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Go to Parent Login
          </Link>
        </div>
      </div>
    </div>
  );
}
