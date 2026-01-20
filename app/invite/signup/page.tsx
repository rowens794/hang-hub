import { getSignupInviteDetails } from "@/lib/actions.qr-invite";
import SignupFormClient from "./SignupFormClient";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteSignupPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
            !
          </div>
          <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
            Missing Token
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            This page requires a valid signup link from an invite email.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-electric-purple hover:bg-electric-purple/90 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Sign Up Manually
          </Link>
        </div>
      </div>
    );
  }

  const details = await getSignupInviteDetails(token);

  if (!details.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
            !
          </div>
          <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
            Invalid Link
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            {details.error}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-electric-purple hover:bg-electric-purple/90 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            Sign Up Manually
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-electric-purple flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            H
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Welcome to HangHub!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create an account for <strong>{details.inviteeName}</strong>
          </p>
        </div>

        {details.hangTitle && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
              Invited to
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
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              by {details.inviterName}
            </p>
          </div>
        )}

        <SignupFormClient
          signupToken={token}
          inviteeName={details.inviteeName || ""}
          parentEmail={details.parentEmail || ""}
        />
      </div>
    </div>
  );
}
