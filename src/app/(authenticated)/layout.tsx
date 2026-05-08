"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  LayoutDashboard, 
  ShieldCheck, 
  Clock, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Temporarily allowing access without session
  /*
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;
  */


  // Actually, I'll use the icons requested: LayoutDashboard, ShieldCheck, Clock, Settings
  const actualNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "New Verification", icon: ShieldCheck, href: "/verify" },
    { label: "History", icon: Clock, href: "/history" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "U";


  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans flex flex-col lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-white/5 glass z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight">VeraDoc</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {actualNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                  isActive 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "hover:bg-white/5 text-foreground/60 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-foreground/40 group-hover:text-white"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-bold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{session?.user?.name || "Guest User"}</p>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider truncate">
                {/* Organisation would come from session if we added it to the JWT */}
                Institutional Admin
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50 flex justify-around p-3">
        {actualNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
              <item.icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-foreground/40"}`} />
              <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-foreground/40"}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
