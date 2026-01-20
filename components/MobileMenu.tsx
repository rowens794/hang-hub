"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-slate-950 md:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="text-lg font-bold tracking-tight text-[#8b5cf6]">
                HangHub
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-2 p-6">
            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-4 text-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-4 text-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              How it Works
            </Link>
            <hr className="my-4 border-slate-200 dark:border-slate-800" />
            <Link
              href="/get-started"
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-electric-purple px-4 py-4 text-center text-lg font-bold text-white hover:bg-electric-purple/90 transition-colors"
            >
              Get Started
            </Link>
          </nav>
          <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
