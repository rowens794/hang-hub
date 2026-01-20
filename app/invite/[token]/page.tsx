import { getQRInviteDetails } from "@/lib/actions.qr-invite";
import InviteFormClient from "./InviteFormClient";
import Link from "next/link";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const details = await getQRInviteDetails(token);

  if (!details.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
            !
          </div>
          <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
            {details.expired ? "Invite Expired" : "Invalid Invite"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            {details.error}
          </p>
          <Link
            href="/get-started"
            className="inline-block bg-electric-purple hover:bg-electric-purple/90 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Sign Up Instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-electric-purple/10 text-electric-purple rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            {details.inviterAvatar ? (
              <img
                src={details.inviterAvatar}
                alt={details.inviterName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              details.inviterName?.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {details.inviterName} invited you!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {details.inviteType === "hang" && details.hangTitle
              ? `Join them for "${details.hangTitle}"`
              : "Join them on HangHub"}
          </p>
        </div>

        {details.hangTitle && (
          <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Event
            </p>
            <p className="font-bold text-slate-900 dark:text-white">
              {details.hangTitle}
            </p>
            {details.hangDate && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(details.hangDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}

        <InviteFormClient token={token} inviterName={details.inviterName || ""} />
      </div>
    </div>
  );
}
