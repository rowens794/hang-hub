"use client";

import { useState } from "react";
import ResetPinModal from "./ResetPinModal";

interface ChildCardProps {
  child: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function ChildCard({ child }: ChildCardProps) {
  const [showResetPin, setShowResetPin] = useState(false);

  return (
    <>
      <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] flex items-center space-x-6 hover:border-blue-500/50 transition-all group">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold overflow-hidden">
          {child.avatar_url ? (
            <img
              src={child.avatar_url}
              alt={child.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            child.display_name[0]
          )}
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">{child.display_name}</div>
          <div className="text-[var(--muted)] text-sm">@{child.username}</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-all flex space-x-2">
          <button
            onClick={() => setShowResetPin(true)}
            className="text-[var(--muted)] hover:text-blue-400 text-sm"
          >
            Reset PIN
          </button>
        </div>
      </div>

      {showResetPin && (
        <ResetPinModal
          childId={child.id}
          childName={child.display_name}
          onClose={() => setShowResetPin(false)}
        />
      )}
    </>
  );
}
