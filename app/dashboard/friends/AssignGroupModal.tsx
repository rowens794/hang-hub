"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFriendGroup, addCustomGroup } from "@/lib/actions";

const DEFAULT_GROUPS = ["The Squad", "Gaming", "Basketball Team", "School"];

interface AssignGroupModalProps {
  friendId: string;
  friendName: string;
  currentGroups: string[];
  existingGroups: string[];
  onClose: () => void;
}

export default function AssignGroupModal({
  friendId,
  friendName,
  currentGroups,
  existingGroups,
  onClose,
}: AssignGroupModalProps) {
  const router = useRouter();
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set(currentGroups));
  const [customGroup, setCustomGroup] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Combine default groups with user's existing custom groups
  const allGroups = [...new Set([...DEFAULT_GROUPS, ...existingGroups])];

  const handleToggleGroup = (groupName: string) => {
    setError("");
    startTransition(async () => {
      const result = await toggleFriendGroup(friendId, groupName);
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedGroups((prev) => {
          const next = new Set(prev);
          if (next.has(groupName)) {
            next.delete(groupName);
          } else {
            next.add(groupName);
          }
          return next;
        });
        router.refresh();
      }
    });
  };

  const handleAddCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customGroup.trim()) {
      setError("Please enter a group name");
      return;
    }

    startTransition(async () => {
      const result = await addCustomGroup(friendId, customGroup.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedGroups((prev) => new Set([...prev, customGroup.trim()]));
        setCustomGroup("");
        setShowCustom(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Assign Groups</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Select groups for {friendName}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {!showCustom ? (
            <div className="space-y-2">
              {allGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleToggleGroup(group)}
                  disabled={isPending}
                  className={`w-full p-3 rounded-xl text-left font-medium transition-all flex items-center justify-between disabled:opacity-50 ${
                    selectedGroups.has(group)
                      ? "bg-electric-purple text-white"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{group}</span>
                  {selectedGroups.has(group) && <span>✓</span>}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full p-3 rounded-xl text-left font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-2"
              >
                <span>➕</span> Create new group...
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddCustomGroup} className="space-y-3">
              <input
                type="text"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="Enter group name..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-electric-purple"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustom(false);
                    setCustomGroup("");
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 rounded-xl bg-electric-purple text-white font-medium hover:bg-electric-purple/90 disabled:opacity-50"
                >
                  {isPending ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {selectedGroups.size > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Current groups:</p>
              <div className="flex flex-wrap gap-1">
                {[...selectedGroups].map((g) => (
                  <span
                    key={g}
                    className="px-2 py-1 rounded-md bg-electric-purple/10 text-electric-purple text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
