"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ navItems }: { navItems: any[] }) {
  const pathname = usePathname();

  return (
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
  );
}
