"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddFriendModal from "./AddFriendModal";
import FriendRequests from "./FriendRequests";
import SentRequests from "./SentRequests";
import AssignGroupModal from "./AssignGroupModal";
import { removeFriend } from "@/lib/actions";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: string;
  isOnline: boolean;
  groups: string[];
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  createdAt: string;
}

interface SentRequest {
  id: string;
  toUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  createdAt: string;
}

interface FriendsClientProps {
  initialFriends: Friend[];
  pendingRequests: FriendRequest[];
  sentRequests: SentRequest[];
  existingGroups: string[];
}

const DEFAULT_GROUPS = ["The Squad", "Gaming", "Basketball Team"];

export default function FriendsClient({ initialFriends, pendingRequests, sentRequests, existingGroups }: FriendsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCrew, setActiveCrew] = useState("All");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [isRemoving, startRemoving] = useTransition();
  const [groupModalFriend, setGroupModalFriend] = useState<Friend | null>(null);

  // Combine default groups with user's custom groups for filtering
  const allGroups = ["All", ...new Set([...DEFAULT_GROUPS, ...existingGroups])];

  const handleUnfriend = (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    startRemoving(async () => {
      await removeFriend(friendId);
      router.refresh();
    });
  };

  const filteredFriends = initialFriends.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCrew = activeCrew === "All" || friend.groups.includes(activeCrew);
    return matchesSearch && matchesCrew;
  });

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-10">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black mb-2">The Squad</h1>
          <p className="text-slate-500 dark:text-slate-400">See who's free and what they're doing.</p>
        </div>
        <button
          onClick={() => setShowAddFriend(true)}
          className="px-4 py-2 rounded-xl bg-electric-purple text-white font-bold hover:bg-electric-purple/90 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Friend
        </button>
      </header>

      {/* Pending Friend Requests */}
      <FriendRequests requests={pendingRequests} />

      {/* Sent Friend Requests */}
      <SentRequests requests={sentRequests} />

      {/* Search & Filters */}
      <section className="mb-8 space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white p-4 pl-12 text-sm font-bold shadow-sm outline-none ring-electric-purple focus:ring-2 dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allGroups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveCrew(group)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCrew === group
                  ? "bg-electric-purple text-white shadow-lg shadow-electric-purple/20"
                  : "bg-white text-slate-500 dark:text-slate-400 border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </section>

      {/* Friends Grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="group relative flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={friend.avatar} alt={friend.name} />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 ${
                  friend.isOnline ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-lg">{friend.name}</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 truncate">
                {friend.isOnline ? friend.status : "Offline"}
              </p>
              <div className="flex flex-wrap gap-1">
                {friend.groups.length > 0 ? (
                  friend.groups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setGroupModalFriend(friend)}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:bg-slate-800 hover:bg-electric-purple hover:text-white transition-colors"
                      title="Change groups"
                    >
                      {group}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setGroupModalFriend(friend)}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:bg-slate-800 hover:bg-electric-purple hover:text-white transition-colors"
                    title="Add to group"
                  >
                    + Add group
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="h-8 w-8 rounded-full bg-electric-purple/10 text-electric-purple flex items-center justify-center hover:bg-electric-purple hover:text-white transition-colors">
                👋
              </button>
              <button
                onClick={() => handleUnfriend(friend.id)}
                disabled={isRemoving}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors dark:bg-slate-800 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50"
                title="Unfriend"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Empty State */}
      {filteredFriends.length === 0 && (
        <div className="py-20 text-center">
          <span className="text-6xl mb-4 block">🏜️</span>
          <h3 className="text-xl font-bold">No friends found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try searching for something else!</p>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <AddFriendModal onClose={() => setShowAddFriend(false)} />
      )}

      {/* Assign Group Modal */}
      {groupModalFriend && (
        <AssignGroupModal
          friendId={groupModalFriend.id}
          friendName={groupModalFriend.name}
          currentGroups={groupModalFriend.groups}
          existingGroups={existingGroups}
          onClose={() => setGroupModalFriend(null)}
        />
      )}
    </div>
  );
}
