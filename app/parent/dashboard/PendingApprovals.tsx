"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveHangParticipation,
  declineHangParticipation,
  getPendingHangApprovals,
} from "@/lib/actions.parent";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  approved: boolean;
}

interface InvitedFriend {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface PendingApproval {
  hangId: string;
  childId: string;
  childName: string;
  childAvatar: string | null;
  childUsername: string;
  hangTitle: string;
  scheduledAt: string;
  suggestedBy: string;
  suggestedByName: string;
  creatorApproved: boolean;
  participants: Participant[];
  invitedFriends: InvitedFriend[];
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
}

export default function PendingApprovals({ approvals: initialApprovals }: PendingApprovalsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approvals, setApprovals] = useState(initialApprovals);

  // Update state when initial props change
  useEffect(() => {
    setApprovals(initialApprovals);
  }, [initialApprovals]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const freshApprovals = await getPendingHangApprovals();
        setApprovals(freshApprovals as PendingApproval[]);
      } catch (error) {
        console.error("Failed to poll for updates:", error);
      }
    };

    const interval = setInterval(pollForUpdates, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (hangId: string, childId: string) => {
    startTransition(async () => {
      await approveHangParticipation(hangId, childId);
      router.refresh();
    });
  };

  const handleDecline = async (hangId: string, childId: string) => {
    startTransition(async () => {
      await declineHangParticipation(hangId, childId);
      router.refresh();
    });
  };

  if (approvals.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Pending Approvals
        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-sm">
          {approvals.length}
        </span>
      </h2>
      <div className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={`${approval.hangId}-${approval.childId}`}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl overflow-hidden">
                  {approval.childAvatar ? (
                    <img
                      src={approval.childAvatar}
                      alt={approval.childName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    approval.childName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{approval.childName}</p>
                  <p className="text-[var(--muted)] text-sm">@{approval.childUsername}</p>
                </div>
              </div>
              <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                Awaiting Approval
              </span>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
                Wants to join
              </p>
              <h3 className="text-xl font-bold mb-2">{approval.hangTitle}</h3>
              <p className="text-[var(--muted)] text-sm">
                {new Date(approval.scheduledAt).toLocaleString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[var(--muted)] text-sm mt-2">
                Suggested by{" "}
                <span className="text-gray-300">{approval.suggestedByName}</span>
                {approval.childId === approval.suggestedBy && (
                  <span className="text-purple-400 ml-2">(your child created this)</span>
                )}
              </p>
            </div>

            {(approval.invitedFriends.length > 0 || approval.participants.filter(p => p.id !== approval.childId).length > 0) && (
              <div className="mb-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
                  Invited Friends
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Show invited friends */}
                  {approval.invitedFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 shrink-0">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {friend.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300">{friend.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        friend.status === 'accepted'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-[var(--muted)]'
                      }`}>
                        {friend.status === 'accepted' ? 'joined' : 'invited'}
                      </span>
                    </div>
                  ))}
                  {/* Show other participants not in invites list */}
                  {approval.participants
                    .filter((p) => p.id !== approval.childId && !approval.invitedFriends.some(f => f.id === p.id))
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1"
                      >
                        <div className={`w-6 h-6 rounded-full overflow-hidden bg-gray-800 shrink-0 ring-1 ${
                          participant.approved ? 'ring-green-500' : 'ring-gray-600'
                        }`}>
                          {participant.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              {participant.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-300">{participant.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          participant.approved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {participant.approved ? 'approved' : 'pending'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(approval.hangId, approval.childId)}
                disabled={isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecline(approval.hangId, approval.childId)}
                disabled={isPending}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-[var(--card-border)] text-gray-300 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
