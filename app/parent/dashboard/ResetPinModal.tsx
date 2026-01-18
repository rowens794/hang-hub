"use client";

import { useState, useTransition } from "react";
import { resetChildPin } from "@/lib/actions.parent";

interface ResetPinModalProps {
  childId: string;
  childName: string;
  onClose: () => void;
}

export default function ResetPinModal({
  childId,
  childName,
  onClose,
}: ResetPinModalProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }

    startTransition(async () => {
      const result = await resetChildPin(childId, pin);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--card-border)] shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-2">Reset PIN</h2>
        <p className="text-[var(--muted)] text-sm mb-6">
          Set a new PIN for {childName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              New PIN (4-6 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              pattern="\d{4,6}"
              placeholder="Enter new PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              pattern="\d{4,6}"
              placeholder="Confirm new PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 p-3 rounded-xl">
              PIN updated successfully!
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-[var(--background)] hover:opacity-80 border border-[var(--card-border)] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || success}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
