"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/actions.auth";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    startTransition(async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed.");
      }
    });
  }, [token]);

  return (
    <div className="w-full max-w-md bg-[#161616] rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
          <h1 className="text-3xl font-bold">Email Verified!</h1>
          <p className="text-gray-400">
            Your account is now fully activated. You can head over to your
            dashboard to manage your crew.
          </p>
          <Link
            href="/parent/dashboard"
            className="block w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto">
            ✕
          </div>
          <h1 className="text-3xl font-bold">Verification Failed</h1>
          <p className="text-gray-400">{message}</p>
          <Link
            href="/login"
            className="block w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md bg-[#161616] rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
