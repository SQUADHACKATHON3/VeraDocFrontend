"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Clock, Settings } from "lucide-react";
import { isNavItemActive } from "@/lib/app-nav";

const items = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Verify", icon: ShieldCheck, href: "/verify" },
  { label: "History", icon: Clock, href: "/history" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="vd-mobile-nav">
      {items.map((item) => {
        const active = isNavItemActive(item.href, pathname, searchParams);
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
            <item.icon size={20} strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
