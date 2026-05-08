"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileCheck, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  ShieldCheck,
  Bell,
  Menu
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Overview", href: "/dashboard" },
    { icon: <FileCheck className="w-5 h-5" />, label: "Scan Document", href: "/dashboard/verify" },
    { icon: <History className="w-5 h-5" />, label: "Logs", href: "/dashboard/history" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Squad Wallet", href: "/dashboard/payments" },
  ];

  return (
    <div className="flex min-h-screen bg-[#02040a] text-zinc-100 font-sans selection:bg-brand-primary/30">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-brand-primary p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">VeraDoc</span>
        </div>

        <nav className="flex-grow px-6 space-y-2 py-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 px-4">Navigation</div>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={i} 
                href={item.href}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                  ? "bg-brand-primary text-black shadow-[0_10px_20px_rgba(16,185,129,0.1)]" 
                  : "hover:bg-white/5 text-zinc-500 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-black" : "text-zinc-500 group-hover:text-brand-primary"} transition-colors`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3">
          <Link href="/dashboard/settings" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-white/5 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 transition-all text-left">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4 lg:hidden">
             <Menu className="w-6 h-6 text-zinc-400" />
             <span className="text-xl font-black tracking-tighter uppercase italic">VeraDoc</span>
          </div>
          
          <div className="hidden lg:block">
             <h2 className="font-black italic uppercase tracking-wider text-zinc-400 text-xs">VeraDoc Security Cloud / <span className="text-white">Institution Alpha</span></h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Squad Wallet</span>
              <span className="text-sm font-black text-brand-primary">₦12,450.00</span>
            </div>
            
            <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
            
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full" />
            </button>

            <div className="flex items-center gap-3 glass px-3 py-1.5 rounded-xl border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-black font-black text-xs shadow-lg">
                UL
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black uppercase tracking-tighter">UNILAG Admin</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 flex-grow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
