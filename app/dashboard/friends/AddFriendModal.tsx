"use client";

import { useState, useTransition } from "react";
import { searchUsers, sendFriendRequest } from "@/lib/actions";

interface SearchResult {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

interface AddFriendModalProps {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSearching, startSearching] = useTransition();
  const [isAdding, startAdding] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    setError("");
    setSuccess("");

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    startSearching(async () => {
      const searchResults = await searchUsers(value);
      setResults(searchResults);
    });
  };

  const handleSendRequest = (userId: string, displayName: string) => {
    setError("");
    setSuccess("");

    startAdding(async () => {
      const result = await sendFriendRequest(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Friend request sent to ${displayName}!`);
        // Remove from results
        setResults((prev) => prev.filter((r) => r.id !== userId));
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add a Friend</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Search by username to find friends
          </p>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Enter username..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 pl-12 text-sm font-medium outline-none focus:ring-2 focus:ring-electric-purple"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isSearching && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                Searching...
              </div>
            )}

            {!isSearching && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-slate-500 dark:text-slate-400">No users found</p>
              </div>
            )}

            {!isSearching &&
              results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                        {user.displayName[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{user.displayName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.id, user.displayName)}
                    disabled={isAdding}
                    className="px-4 py-2 rounded-xl bg-electric-purple text-white text-sm font-bold hover:bg-electric-purple/90 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? "..." : "Request"}
                  </button>
                </div>
              ))}

            {query.length < 2 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
