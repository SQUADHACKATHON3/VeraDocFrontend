import Link from "next/link";
import { 
  LayoutDashboard, 
  FileCheck, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">VeraDoc</span>
        </div>

        <nav className="flex-grow px-4 space-y-2 py-4">
          {[
            { icon: <LayoutDashboard className="w-5 h-5" />, label: "Overview", href: "/dashboard", active: true },
            { icon: <FileCheck className="w-5 h-5" />, label: "Verify Document", href: "/dashboard/verify" },
            { icon: <History className="w-5 h-5" />, label: "History", href: "/dashboard/history" },
            { icon: <CreditCard className="w-5 h-5" />, label: "Payments", href: "/dashboard/payments" },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "hover:bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
          <h2 className="font-semibold text-lg">Institutional Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500">Credits</span>
              <span className="text-sm font-bold text-emerald-400">12,450 NGN</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              JD
            </div>
          </div>
        </header>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
