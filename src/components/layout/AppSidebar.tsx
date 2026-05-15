"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { isNavItemActive } from "@/lib/app-nav";
import {
  LayoutDashboard,
  ShieldCheck,
  Clock,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";

type AppSidebarProps = {
  userName: string;
  organisation: string;
  credits: number;
  onTopUp: () => void;
  onSignOut: () => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "New verification", icon: ShieldCheck, href: "/verify" },
  { label: "History", icon: Clock, href: "/history" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function AppSidebar({
  userName,
  organisation,
  credits,
  onTopUp,
  onSignOut,
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="vd-sidebar">
      <Link href="/dashboard" className="vd-sidebar-brand">
        <ShieldCheck size={20} strokeWidth={1.5} />
        <span className="vd-logo">
          Vera<em>Doc</em>
        </span>
      </Link>

      <div className="vd-credits-box">
        <div className="vd-credits-box-header">
          <span className="vd-eyebrow">Credits</span>
          <span className="vd-mono">{credits}</span>
        </div>
        <div className="vd-credits-box-footer">
          <button type="button" onClick={onTopUp}>
            <Plus size={14} />
            Top up
          </button>
        </div>
      </div>

      <nav className="vd-nav">
        {navItems.map((item) => {
          const active = isNavItemActive(item.href, pathname, searchParams);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : undefined}
            >
              <item.icon strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="vd-user">
        <div className="vd-user-row">
          <div className="vd-user-avatar">{initials}</div>
          <div>
            <p className="vd-user-name">{userName}</p>
            <p className="vd-user-org">{organisation}</p>
          </div>
        </div>
        <button type="button" className="vd-signout" onClick={onSignOut}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
