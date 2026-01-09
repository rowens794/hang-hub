"use client";

import { useState } from "react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: string;
  isOnline: boolean;
  crew: string;
}

interface FriendsClientProps {
  initialFriends: Friend[];
}

const CREWS = ["All", "The Squad", "Gaming", "Basketball Team"];

export default function FriendsClient({ initialFriends }: FriendsClientProps) {
  const [search, setSearch] = useState("");
  const [activeCrew, setActiveCrew] = useState("All");

  const filteredFriends = initialFriends.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCrew = activeCrew === "All" || friend.crew === activeCrew;
    return matchesSearch && matchesCrew;
  });

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2">The Squad</h1>
        <p className="text-slate-500">See who's free and what they're doing.</p>
      </header>

      {/* Search & Filters */}
      <section className="mb-8 space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
          {CREWS.map((crew) => (
            <button
              key={crew}
              onClick={() => setActiveCrew(crew)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCrew === crew
                  ? "bg-electric-purple text-white shadow-lg shadow-electric-purple/20"
                  : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              {crew}
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
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100">
                <img src={friend.avatar} alt={friend.name} />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 ${
                  friend.isOnline ? "bg-green-500" : "bg-slate-300"
                }`}
              />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-lg">{friend.name}</h4>
              <p className="text-xs font-medium text-slate-500 mb-2 truncate">
                {friend.isOnline ? friend.status : "Offline"}
              </p>
              <div className="flex gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-slate-800">
                  {friend.crew}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="h-8 w-8 rounded-full bg-electric-purple/10 text-electric-purple flex items-center justify-center hover:bg-electric-purple hover:text-white transition-colors">
                👋
              </button>
              <button className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors dark:bg-slate-800">
                ➕
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
          <p className="text-slate-500">Try searching for something else!</p>
        </div>
      )}
    </div>
  );
}
