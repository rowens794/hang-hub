import Link from "next/link";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions.auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "child") {
    redirect("/play");
  }

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
        <div className="flex items-center justify-between gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-[#8b5cf6]">
              HangHub
            </span>
          </Link>
        </div>

        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Logged in as
          </div>
          <div className="font-bold truncate">{session.name}</div>
          <form
            action={async () => {
              "use server";
              await logout();
            }}
            className="mt-2"
          >
            <button className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors">
              Log Out
            </button>
          </form>
        </div>

        <Sidebar navItems={navItems} />
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">{children}</div>

      {/* Bottom Nav - Mobile */}
      <MobileNav mobileNavItems={mobileNavItems} />
    </div>
  );
}
