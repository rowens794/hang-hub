import { approveQRInvite } from "@/lib/actions.qr-invite";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ApproveInvitePage({ params }: Props) {
  const { token } = await params;
  const result = await approveQRInvite(token);

  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
            !
          </div>
          <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
            Something Went Wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            {result.error}
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

  // Redirect to signup page with the signup token
  redirect(`/invite/signup?token=${result.signupToken}`);
}
