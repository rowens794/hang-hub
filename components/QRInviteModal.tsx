"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateQRInvite } from "@/lib/actions.qr-invite";

interface Props {
  type: "hang" | "friend";
  hangId?: string;
  hangTitle?: string;
  onClose: () => void;
}

export function QRInviteModal({ type, hangId, hangTitle, onClose }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function generate() {
      const result = await generateQRInvite(type === "hang" ? hangId : undefined);
      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        setToken(result.token);
      }
    }
    generate();
  }, [type, hangId]);

  const inviteUrl = token
    ? `${window.location.origin}/invite/${token}`
    : null;

  function copyLink() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {type === "hang" ? "Invite to Hang" : "Invite a Friend"}
          </h2>
          {hangTitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {hangTitle}
            </p>
          )}

          {error ? (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                !
              </div>
              <p className="text-red-500">{error}</p>
            </div>
          ) : !token ? (
            <div className="py-12">
              <div className="w-12 h-12 border-4 border-electric-purple border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 mt-4">Generating QR code...</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                <QRCodeSVG
                  value={inviteUrl || ""}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Have your friend scan this QR code with their phone camera
              </p>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-sm"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-medium transition-colors text-sm"
                >
                  Done
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                This invite expires in 7 days
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
