"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Friends", href: "/dashboard/friends", icon: "👥" },
    { name: "Activity", href: "/dashboard/activity", icon: "🔔" },
    { name: "Profile", href: "/dashboard/profile", icon: "👤" },
  ];

  const mobileNavItems = [
    { name: "Home", href: "/dashboard", icon: "🏠" },
    { name: "Crew", href: "/dashboard/friends", icon: "👥" },
    { name: "Pings", href: "/dashboard/activity", icon: "🔔" },
    { name: "Profile", href: "/dashboard/profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="flex items-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-[#8b5cf6]">
              HangHub
            </span>
          </Link>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold transition-colors ${
                  isActive
                    ? "bg-electric-purple/10 text-electric-purple"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span>{item.icon}</span> {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">{children}</div>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-slate-200 bg-white/80 p-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:hidden">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-electric-purple font-bold" : "text-slate-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
