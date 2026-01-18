"use client";

import { useState, useEffect, useTransition } from "react";
import { getHangHistory, cancelHangParticipation } from "@/lib/actions.parent";

interface Participant {
  id: string;
  name: string;
  avatar: string;
}

interface HangHistoryItem {
  hangId: string;
  childId: string;
  childName: string;
  childAvatar: string | null;
  hangTitle: string;
  scheduledAt: string;
  suggestedByName: string;
  status: "approved" | "denied" | "cancelled";
  participants: Participant[];
}

interface HangHistoryProps {
  history: HangHistoryItem[];
}

export default function HangHistory({ history: initialHistory }: HangHistoryProps) {
  const [filter, setFilter] = useState<"all" | "approved" | "denied" | "cancelled">("all");
  const [history, setHistory] = useState(initialHistory);
  const [isPending, startTransition] = useTransition();

  // Update state when initial props change
  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const freshHistory = await getHangHistory();
        setHistory(freshHistory as HangHistoryItem[]);
      } catch (error) {
        console.error("Failed to poll for updates:", error);
      }
    };

    const interval = setInterval(pollForUpdates, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (hangId: string, childId: string) => {
    startTransition(async () => {
      await cancelHangParticipation(hangId, childId);
      const freshHistory = await getHangHistory();
      setHistory(freshHistory as HangHistoryItem[]);
    });
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const approvedCount = history.filter((h) => h.status === "approved").length;
  const deniedCount = history.filter((h) => h.status === "denied").length;
  const cancelledCount = history.filter((h) => h.status === "cancelled").length;

  if (history.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Hang History</h2>
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-dashed border-[var(--card-border)] text-center text-[var(--muted)] text-sm">
          No approved or denied hangs yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Hang History
          <span className="bg-white/10 text-[var(--muted)] px-1.5 py-0.5 rounded-full text-xs">
            {history.length}
          </span>
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-white/10 text-white"
                : "text-[var(--muted)] hover:text-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
              filter === "approved"
                ? "bg-green-500/20 text-green-400"
                : "text-[var(--muted)] hover:text-gray-300"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter("denied")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
              filter === "denied"
                ? "bg-red-500/20 text-red-400"
                : "text-[var(--muted)] hover:text-gray-300"
            }`}
          >
            Denied ({deniedCount})
          </button>
          {cancelledCount > 0 && (
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                filter === "cancelled"
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-[var(--muted)] hover:text-gray-300"
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {filteredHistory.map((item) => (
          <div
            key={`${item.hangId}-${item.childId}`}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs overflow-hidden shrink-0">
              {item.childAvatar ? (
                <img
                  src={item.childAvatar}
                  alt={item.childName}
                  className="w-full h-full object-cover"
                />
              ) : (
                item.childName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                <span className="font-medium">{item.hangTitle}</span>
                <span className="text-[var(--muted)]"> · {item.childName} · </span>
                <span className="text-[var(--muted)]">
                  {new Date(item.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>

            {item.participants.length > 1 && (
              <div className="flex -space-x-1 shrink-0">
                {item.participants
                  .filter((p) => p.id !== item.childId)
                  .slice(0, 2)
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="w-5 h-5 rounded-full border border-[#161616] overflow-hidden bg-gray-800"
                      title={participant.name}
                    >
                      {participant.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]">
                          {participant.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                {item.participants.length > 3 && (
                  <div className="w-5 h-5 rounded-full border border-[#161616] bg-gray-800 flex items-center justify-center text-[10px]">
                    +{item.participants.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Cancel button for approved future hangs */}
            {item.status === "approved" && new Date(item.scheduledAt) > new Date() && (
              <button
                onClick={() => handleCancel(item.hangId, item.childId)}
                disabled={isPending}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 shrink-0"
              >
                Cancel
              </button>
            )}

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                item.status === "approved"
                  ? "bg-green-500/20 text-green-400"
                  : item.status === "cancelled"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {item.status === "approved" ? "Approved" : item.status === "cancelled" ? "Cancelled" : "Denied"}
            </span>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--card-border)] text-center text-[var(--muted)] text-sm">
          No {filter} hangs found.
        </div>
      )}
    </div>
  );
}
