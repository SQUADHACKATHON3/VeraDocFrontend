/**
 * Authenticated Layout — /dashboard, /verify, /history, /settings
 * Shared layout for protected pages, including the sidebar and navigation.
 * Auth required: Yes
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShieldCheck,
  Clock,
  Settings,
  LogOut,
  Coins,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BuyCreditsModal from "@/components/BuyCreditsModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  // Route guard — bounce unauthenticated users to login.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "New Verification", icon: ShieldCheck, href: "/verify" },
    { label: "History", icon: Clock, href: "/history" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans flex flex-col lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-card-border bg-sidebar z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center group">
            <Image
              src="/assets/veradoc_banner.png"
              alt="VeraDoc"
              width={590}
              height={249}
              priority
              className="h-8 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Credits balance */}
        <div className="px-4 mb-2">
          <div className="rounded-xl bg-primary/10 border border-primary/20 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary-light" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Credits
                </span>
              </div>
              <span className="text-lg font-heading font-black text-white">
                {user.credits}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBuyCredits(true)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Plus className="w-3 h-3" />
              Top Up
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                  isActive
                    ? "bg-card text-primary border-l-[3px] border-primary"
                    : "hover:bg-white/5 text-foreground/60 hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-primary"
                      : "text-foreground/40 group-hover:text-white"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-card-border">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-bold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">
                {user.name}
              </p>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider truncate">
                {user.organisation}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-card-border z-50 flex justify-around p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <item.icon
                className={`w-6 h-6 ${
                  isActive ? "text-primary" : "text-foreground/40"
                }`}
              />
              <span
                className={`text-[10px] font-bold ${
                  isActive ? "text-primary" : "text-foreground/40"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onPurchased={() => refreshUser()}
      />
    </div>
  );
}
