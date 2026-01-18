"use client";

import { useActionState, useState, useEffect } from "react";
import { createChild } from "@/lib/actions.auth";

export default function AddChildForm() {
  const [state, action, isPending] = useActionState(createChild, null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--card-bg)] hover:opacity-80 p-4 rounded-xl border border-dashed border-[var(--card-border)] hover:border-electric-purple/50 transition-all flex items-center justify-center gap-2 text-[var(--muted)] hover:text-white"
      >
        <span className="text-xl">+</span>
        <span className="font-medium">Add Child</span>
      </button>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--card-border)] h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add New Child</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[var(--muted)] hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
      <form action={action} className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Display Name</label>
          <input
            name="displayName"
            type="text"
            required
            placeholder="Bobby"
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Username</label>
          <input
            name="username"
            type="text"
            required
            placeholder="bobby_cool"
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">PIN (4-6 digits)</label>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            required
            pattern="\d{4,6}"
            placeholder="••••"
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Avatar URL (Optional)</label>
          <input
            name="avatarUrl"
            type="text"
            placeholder="https://..."
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {state?.error && (
          <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 p-2 rounded-lg">
            {state.error}
          </div>
        )}

        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-all text-sm disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
