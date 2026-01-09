"use client";

import { useActionState } from "react";
import { createChild } from "@/lib/actions.auth";

export default function AddChildForm() {
  const [state, action, isPending] = useActionState(createChild, null);

  return (
    <div className="bg-[#161616] p-8 rounded-2xl border border-white/10 shadow-2xl h-fit">
      <h2 className="text-xl font-semibold mb-6">Add New Child</h2>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Display Name
          </label>
          <input
            name="displayName"
            type="text"
            required
            placeholder="Bobby"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Username</label>
          <input
            name="username"
            type="text"
            required
            placeholder="bobby_cool"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            PIN (4-6 digits)
          </label>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            required
            pattern="\d{4,6}"
            placeholder="••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Avatar URL (Optional)
          </label>
          <input
            name="avatarUrl"
            type="text"
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {state?.error && (
          <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-xl italic">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 p-3 rounded-xl">
            Child profile created!
          </div>
        )}

        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
