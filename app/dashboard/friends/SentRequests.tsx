"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelFriendRequest } from "@/lib/actions";

interface SentRequest {
  id: string;
  toUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  createdAt: string;
}

interface SentRequestsProps {
  requests: SentRequest[];
}

export default function SentRequests({ requests }: SentRequestsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (requests.length === 0) {
    return null;
  }

  const handleCancel = (requestId: string) => {
    startTransition(async () => {
      await cancelFriendRequest(requestId);
      router.refresh();
    });
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
          {requests.length}
        </span>
        Pending Requests You Sent
      </h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Waiting...
              </span>
              <button
                onClick={() => handleCancel(request.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
