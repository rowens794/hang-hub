"use client";

import { useState } from "react";

type ActivityType =
  | "ping"
  | "hang_suggested"
  | "hang_joined"
  | "parent_approved"
  | "new_friend";

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  meta?: {
    hangTitle?: string;
  };
}

interface ActivityClientProps {
  initialActivities: Activity[];
}

const FILTERS = ["All", "Pings", "Squad", "Parents"];

export default function ActivityClient({
  initialActivities,
}: ActivityClientProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredActivities = initialActivities.filter((activity) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Pings") return activity.type === "ping";
    if (activeFilter === "Squad")
      return ["hang_suggested", "hang_joined", "new_friend"].includes(
        activity.type
      );
    if (activeFilter === "Parents") return activity.type === "parent_approved";
    return true;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "ping":
        return "🔔";
      case "hang_suggested":
        return "💡";
      case "hang_joined":
        return "✅";
      case "parent_approved":
        return "🛡️";
      case "new_friend":
        return "👥";
      default:
        return "✨";
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "ping":
        return "bg-blue-100 text-blue-600";
      case "hang_suggested":
        return "bg-amber-100 text-amber-600";
      case "hang_joined":
        return "bg-green-100 text-green-600";
      case "parent_approved":
        return "bg-purple-100 text-purple-600";
      case "new_friend":
        return "bg-pink-100 text-pink-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Pings & Vibes</h1>
          <p className="text-slate-500">Stay in the loop with the squad.</p>
        </div>
        <button className="text-sm font-bold text-electric-purple hover:underline">
          Mark all as read
        </button>
      </header>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                activeFilter === filter
                  ? "bg-electric-purple text-white shadow-lg shadow-electric-purple/20"
                  : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`group flex items-start gap-4 rounded-[2.5rem] bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${
                !activity.isRead ? "ring-2 ring-electric-purple/10" : ""
              }`}
            >
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-50 dark:border-slate-800">
                  <img src={activity.user.avatar} alt={activity.user.name} />
                </div>
                {!activity.isRead && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-electric-purple border-2 border-white dark:border-slate-900" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {activity.type.replace("_", " ")}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    • {activity.timestamp}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight">
                  {activity.content}
                </p>
                {activity.meta?.hangTitle && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
                    <span className="text-lg">🗓️</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {activity.meta.hangTitle}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <span className="text-6xl mb-4 block">😴</span>
            <h3 className="text-xl font-bold">Quiet for now...</h3>
            <p className="text-slate-500">No activity matches this filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
