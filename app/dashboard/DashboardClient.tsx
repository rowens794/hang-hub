"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  createHang as createHangAction,
  toggleHangParticipation,
  pingParents as pingParentsAction,
} from "@/lib/actions";

// Types
type HangStatus = "suggested" | "confirmed" | "parent_approved";

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

interface Hang {
  id: string;
  title: string;
  time: string;
  suggestedBy: string;
  friendsIn: string[]; // friend IDs
  status: HangStatus;
  parentCool: boolean;
}

interface DashboardClientProps {
  initialHangs: any[];
  friends: any[];
  currentUser: any;
}

export default function DashboardClient({
  initialHangs,
  friends,
  currentUser,
}: DashboardClientProps) {
  const [hangs, setHangs] = useState<Hang[]>(initialHangs as any);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHangTitle, setNewHangTitle] = useState("");
  const [newHangDate, setNewHangDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newHangTime, setNewHangTime] = useState("19:00");
  const [selectedHangForAttendees, setSelectedHangForAttendees] =
    useState<Hang | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(
    currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
  );

  useEffect(() => {
    // If we have a local storage image, use it (override database for now as requested in previous conversation)
    const savedImage = localStorage.getItem("userProfileImage");
    if (savedImage) {
      setCurrentProfileImage(savedImage);
    }

    const reloadImage = () => {
      const img = localStorage.getItem("userProfileImage");
      if (img) setCurrentProfileImage(img);
    };

    window.addEventListener("profileImageUpdated", reloadImage);
    return () => {
      window.removeEventListener("profileImageUpdated", reloadImage);
    };
  }, []);

  // Update hangs state when initialHangs changes (e.g. after revalidation)
  useEffect(() => {
    setHangs(initialHangs as any);
  }, [initialHangs]);

  const toggleStatus = async (hangId: string) => {
    await toggleHangParticipation(hangId);
    // Next.js revalidatePath will trigger a server update,
    // but for instant UI we could optimistic-update here if we wanted.
  };

  const pingParents = async (hangId: string) => {
    await pingParentsAction(hangId);
    alert("Parents Piped! Waiting for approval...");
  };

  const createHang = async () => {
    if (!newHangTitle) return;
    await createHangAction(newHangTitle, newHangDate, newHangTime);
    setNewHangTitle("");
    setIsModalOpen(false);
  };

  return (
    <>
      <main className="mx-auto max-w-4xl p-4 md:p-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">Hey, Ready to Play?</h1>
            <p className="text-slate-500">
              Coordinate your squad for the weekend.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="h-10 w-10 rounded-full border-2 border-electric-purple overflow-hidden hover:scale-110 transition-transform shadow-lg shadow-electric-purple/20"
            >
              <img src={currentProfileImage} alt="My Profile" />
            </Link>
          </div>
        </header>

        {/* Suggest Hang Button */}
        <section className="mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative w-full overflow-hidden rounded-3xl bg-electric-purple p-8 text-left text-white shadow-xl shadow-electric-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="relative z-10">
              <span className="text-4xl mb-2 block">🍕</span>
              <h2 className="text-2xl font-black">Suggest a Hang</h2>
              <p className="opacity-80">
                Ping your friends and see who's down.
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] rotate-12 opacity-20 transition-transform group-hover:scale-110 lg:right-4">
              <span className="text-[120px]">🎮</span>
            </div>
          </button>
        </section>

        {/* Active Hangs */}
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            Suggested Hangs{" "}
            <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
              {hangs.length}
            </span>
          </h3>
          <div className="grid gap-4">
            {hangs.map((hang) => (
              <div
                key={hang.id}
                className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      {hang.suggestedBy === "Me" ||
                      hang.suggestedBy === currentUser.name
                        ? "You Suggested"
                        : `${hang.suggestedBy} wants to...`}
                    </span>
                    <h4 className="text-xl font-extrabold">{hang.title}</h4>
                    <p className="text-slate-500 text-sm font-medium">
                      📅{" "}
                      {new Date(hang.time).toLocaleString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {hang.parentCool ? (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ✅ Parent Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => pingParents(hang.id)}
                      className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-200 transition-colors"
                    >
                      🛡️ Ping Parents
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedHangForAttendees(hang)}
                    className="flex -space-x-2 hover:scale-105 transition-transform"
                    title="View Attendees"
                  >
                    {hang.friendsIn.slice(0, 4).map((id) => {
                      const friend = [
                        ...friends,
                        {
                          id: "me",
                          name: "Me",
                          avatar: currentProfileImage,
                        },
                      ].find((f) => f.id === id);
                      return (
                        <div
                          key={id}
                          className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200"
                        >
                          <img src={friend?.avatar} alt={friend?.name} />
                        </div>
                      );
                    })}
                    {hang.friendsIn.length > 4 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-500">
                        +{hang.friendsIn.length - 4}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => toggleStatus(hang.id)}
                    className={`rounded-2xl px-6 py-2 text-sm font-bold transition-all ${
                      hang.friendsIn.includes("me")
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-electric-purple text-white shadow-lg shadow-electric-purple/20 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {hang.friendsIn.includes("me") ? "Count Me Out" : "I'm In!"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Suggest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-6">What's the Plan?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Hangout Idea
                </label>
                <input
                  type="text"
                  value={newHangTitle}
                  onChange={(e) => setNewHangTitle(e.target.value)}
                  placeholder="Pizza & Fortnite?"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-lg font-bold outline-none ring-electric-purple focus:ring-2 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newHangDate}
                    onChange={(e) => setNewHangDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none ring-electric-purple focus:ring-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newHangTime}
                    onChange={(e) => setNewHangTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none ring-electric-purple focus:ring-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={createHang}
                className="flex-1 rounded-2xl bg-electric-purple py-4 font-bold text-white shadow-lg shadow-electric-purple/20 hover:bg-electric-purple/90"
              >
                Post to Squad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendee List Modal */}
      {selectedHangForAttendees && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedHangForAttendees(null)}
          />
          <div className="relative w-full max-sm rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Who's In?</h2>
              <button
                onClick={() => setSelectedHangForAttendees(null)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedHangForAttendees.friendsIn.map((id) => {
                const friend = [
                  ...friends,
                  {
                    id: "me",
                    name: "Me (You)",
                    avatar: currentProfileImage,
                  },
                ].find((f) => f.id === id);
                return (
                  <div key={id} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 dark:border-slate-800 dark:bg-slate-950 transition-transform group-hover:scale-110">
                      <img src={friend?.avatar} alt={friend?.name} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{friend?.name}</p>
                      <p className="text-xs font-bold text-green-500 uppercase tracking-wider">
                        Confirmed
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setSelectedHangForAttendees(null)}
              className="mt-8 w-full rounded-2xl bg-electric-purple py-4 font-bold text-white shadow-lg shadow-electric-purple/20 hover:bg-electric-purple/90"
            >
              Sweet!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
