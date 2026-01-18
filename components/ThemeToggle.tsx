"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center hover:opacity-80 transition-all"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* Sun icon */}
      <svg
        className={`h-4 w-4 transition-all absolute ${
          theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      {/* Moon icon */}
      <svg
        className={`h-4 w-4 transition-all absolute ${
          theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}
