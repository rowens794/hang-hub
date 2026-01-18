"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav({
  mobileNavItems,
}: {
  mobileNavItems: any[];
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-slate-200 bg-white/80 p-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-electric-purple font-bold" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
