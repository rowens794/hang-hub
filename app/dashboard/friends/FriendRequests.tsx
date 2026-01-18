"use client";

import { useTransition } from "react";
import { acceptFriendRequest, declineFriendRequest } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface FriendRequest {
  id: string;
  fromUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  createdAt: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
}

export default function FriendRequests({ requests }: FriendRequestsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (requests.length === 0) {
    return null;
  }

  const handleAccept = (requestId: string) => {
    startTransition(async () => {
      await acceptFriendRequest(requestId);
      router.refresh();
    });
  };

  const handleDecline = (requestId: string) => {
    startTransition(async () => {
      await declineFriendRequest(requestId);
      router.refresh();
    });
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-electric-purple text-white text-xs font-bold">
          {requests.length}
        </span>
        Friend Requests
      </h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-electric-purple/10 to-transparent border border-electric-purple/20"
          >
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {request.avatar ? (
                <img
                  src={request.avatar}
                  alt={request.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                  {request.displayName[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold">{request.displayName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">@{request.username}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDecline(request.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => handleAccept(request.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-electric-purple text-white text-sm font-bold hover:bg-electric-purple/90 transition-colors disabled:opacity-50"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
