"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  createHang as createHangAction,
  toggleHangParticipation,
  pingParents as pingParentsAction,
  acceptHangInvite,
  declineHangInvite,
  getHangs,
  getMyInvites,
} from "@/lib/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  // 0 = not pinged, 1 = pending, 2 = approved, 3 = declined, 4 = cancelled
  myApprovalStatus: number | null;
  isCreator: boolean;
  isCancelled: boolean;
}

interface HangInvite {
  hangId: string;
  title: string;
  scheduledAt: string;
  suggestedByName: string;
  suggestedByAvatar: string;
}

interface DashboardClientProps {
  initialHangs: any[];
  friends: any[];
  currentUser: any;
  initialInvites?: HangInvite[];
}

export default function DashboardClient({
  initialHangs,
  friends,
  currentUser,
  initialInvites = [],
}: DashboardClientProps) {
  const [hangs, setHangs] = useState<Hang[]>(initialHangs as any);
  const [invites, setInvites] = useState<HangInvite[]>(initialInvites);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHangTitle, setNewHangTitle] = useState("");
  const [newHangDate, setNewHangDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newHangTime, setNewHangTime] = useState("19:00");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
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

  // Update invites state when initialInvites changes
  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const [freshHangs, freshInvites] = await Promise.all([
          getHangs(),
          getMyInvites(),
        ]);
        setHangs(freshHangs as any);
        setInvites(freshInvites);
      } catch (error) {
        console.error("Failed to poll for updates:", error);
      }
    };

    const interval = setInterval(pollForUpdates, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (hangId: string) => {
    const result = await toggleHangParticipation(hangId);
    if (result && "error" in result) {
      alert(result.error);
    }
  };

  const pingParents = async (hangId: string) => {
    const result = await pingParentsAction(hangId);
    if (result && "error" in result) {
      alert(result.error);
    }
  };

  const createHang = async () => {
    if (!newHangTitle) return;
    await createHangAction(newHangTitle, newHangDate, newHangTime, selectedFriends);
    setNewHangTitle("");
    setSelectedFriends([]);
    setIsModalOpen(false);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAcceptInvite = async (hangId: string) => {
    const result = await acceptHangInvite(hangId);
    if (result && "error" in result) {
      alert(result.error);
    }
  };

  const handleDeclineInvite = async (hangId: string) => {
    const result = await declineHangInvite(hangId);
    if (result && "error" in result) {
      alert(result.error);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-4xl p-4 md:p-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">Hey, Ready to Play?</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Coordinate your squad for the weekend.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
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

        {/* Hang Invites */}
        {invites.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Hang Invites{" "}
              <span className="rounded-full bg-electric-purple/20 px-2 py-0.5 text-xs text-electric-purple font-bold">
                {invites.length}
              </span>
            </h3>
            <div className="grid gap-4">
              {invites.map((invite) => (
                <div
                  key={invite.hangId}
                  className="rounded-3xl bg-gradient-to-r from-electric-purple/10 to-blue-500/10 p-6 border border-electric-purple/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      {invite.suggestedByAvatar ? (
                        <img
                          src={invite.suggestedByAvatar}
                          alt={invite.suggestedByName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400">
                          {invite.suggestedByName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {invite.suggestedByName}
                        </span>{" "}
                        invited you to
                      </p>
                      <h4 className="text-xl font-extrabold mt-1">
                        {invite.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                        {new Date(invite.scheduledAt).toLocaleString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAcceptInvite(invite.hangId)}
                      className="flex-1 rounded-2xl bg-electric-purple py-3 font-bold text-white shadow-lg shadow-electric-purple/20 hover:bg-electric-purple/90"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.hangId)}
                      className="flex-1 rounded-2xl bg-slate-100 py-3 font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden ${
                  hang.isCancelled ? "opacity-75" : ""
                }`}
              >
                {/* Big CANCELLED stamp overlay - rough rubber stamp effect */}
                {hang.isCancelled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div
                      className="border-[6px] border-red-800 dark:border-red-400 rounded-sm px-6 py-3 rotate-[-12deg] opacity-90"
                      style={{
                        maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                        maskSize: '200px',
                        maskComposite: 'intersect',
                        WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                        WebkitMaskSize: '200px',
                      }}
                    >
                      <span
                        className="text-red-800 dark:text-red-400 font-black text-5xl tracking-widest uppercase"
                        style={{
                          textShadow: '2px 2px 2px rgba(153,27,27,0.5), -1px -1px 0px rgba(255,255,255,0.2)',
                          fontFamily: 'Impact, Haettenschweiler, sans-serif',
                        }}
                      >
                        CANCELLED
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                      {hang.suggestedBy === "Me" ||
                      hang.suggestedBy === currentUser.name
                        ? "You Suggested"
                        : `${hang.suggestedBy} wants to...`}
                    </span>
                    <h4 className="text-xl font-extrabold">{hang.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
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
                  {/* Show approval status for current user's participation */}
                  {hang.isCancelled ? (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🚫 Cancelled
                    </span>
                  ) : hang.myApprovalStatus === 2 ? (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ✅ Parent Approved
                    </span>
                  ) : hang.myApprovalStatus === 1 ? (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ⏳ Awaiting Approval
                    </span>
                  ) : hang.myApprovalStatus === 3 ? (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ❌ Parent Declined
                    </span>
                  ) : hang.myApprovalStatus === 4 ? (
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🚫 Parent Cancelled
                    </span>
                  ) : hang.myApprovalStatus === 0 ? (
                    <button
                      onClick={() => pingParents(hang.id)}
                      className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                    >
                      🛡️ Ping Parents
                    </button>
                  ) : !hang.parentCool && !hang.isCreator ? (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                      🔒 Not Open Yet
                    </span>
                  ) : null}
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
                          id: currentUser.id,
                          name: "Me",
                          avatar: currentProfileImage,
                        },
                      ].find((f) => f.id === id);
                      return (
                        <div
                          key={id}
                          className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-700"
                        >
                          <img src={friend?.avatar} alt={friend?.name} />
                        </div>
                      );
                    })}
                    {hang.friendsIn.length > 4 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        +{hang.friendsIn.length - 4}
                      </div>
                    )}
                  </button>

                  {/* Hide button if declined, cancelled, or hang is cancelled */}
                  {hang.myApprovalStatus !== 3 && hang.myApprovalStatus !== 4 && !hang.isCancelled && (
                    <button
                      onClick={() => toggleStatus(hang.id)}
                      disabled={!hang.parentCool && !hang.isCreator && hang.myApprovalStatus === null}
                      className={`rounded-2xl px-6 py-2 text-sm font-bold transition-all ${
                        hang.myApprovalStatus !== null
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          : !hang.parentCool && !hang.isCreator
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800"
                          : "bg-electric-purple text-white shadow-lg shadow-electric-purple/20 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {hang.myApprovalStatus !== null
                        ? hang.isCreator
                          ? "You Created This"
                          : "Count Me Out"
                        : "I'm In!"}
                    </button>
                  )}
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
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">What's the Plan?</h2>
            <div className="space-y-4">
              {/* Friend Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Invite Friends {selectedFriends.length > 0 && `(${selectedFriends.length})`}
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {friends.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 p-2">No friends yet. Add some friends first!</p>
                  ) : (
                    friends.map((friend: any) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => toggleFriendSelection(friend.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                          selectedFriends.includes(friend.id)
                            ? "bg-electric-purple text-white"
                            : "bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                        }`}
                      >
                        <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600">
                          {friend.avatar && (
                            <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="text-sm font-bold">{friend.name}</span>
                        {selectedFriends.includes(friend.id) && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
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
                  <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
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
                  <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
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
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedHangForAttendees.friendsIn.map((id) => {
                const friend = [
                  ...friends,
                  {
                    id: currentUser.id,
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
