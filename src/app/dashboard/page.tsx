"use client";

import { 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const StatCard = ({ label, value, icon, trend, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-8 rounded-[2rem] border-white/5 space-y-6 group hover:border-brand-primary/20 transition-all shadow-2xl relative overflow-hidden"
  >
    <div className="flex items-center justify-between relative z-10">
      <div className={`p-4 bg-black rounded-2xl border border-white/5 shadow-inner`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
      </div>
      <div className={`text-[10px] font-black px-3 py-1.5 rounded-full bg-white/5 uppercase tracking-widest ${color}/80`}>
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{label}</p>
      <h3 className="text-4xl font-black tracking-tighter italic">{value}</h3>
    </div>
    {/* Background Glow */}
    <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-10 rounded-full bg-${color.split('-')[1]}-500`} />
  </motion.div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-brand-primary mb-4"
          >
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Status: Operational</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none"
          >
            Terminal <span className="text-gradient">Overview</span>
          </motion.h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Link href="/dashboard/verify" className="bg-brand-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2">
            <Zap className="w-4 h-4 fill-black" />
            New Scan
          </Link>
        </motion.div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Total Scans" 
          value="1,284" 
          icon={<FileSearch />} 
          trend="+12% WoW" 
          color="text-brand-secondary" 
          delay={0.3}
        />
        <StatCard 
          label="Verified Trust" 
          value="96.5%" 
          icon={<CheckCircle2 />} 
          trend="Stable" 
          color="text-brand-primary" 
          delay={0.4}
        />
        <StatCard 
          label="Threats Blocked" 
          value="44" 
          icon={<ShieldCheck />} 
          trend="-2% vs LY" 
          color="text-rose-500" 
          delay={0.5}
        />
        <StatCard 
          label="Wallet Balance" 
          value="₦12,450" 
          icon={<TrendingUp />} 
          trend="Top-up" 
          color="text-brand-accent" 
          delay={0.6}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl"
        >
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">Recent Intelligence</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Latest document verification logs</p>
            </div>
            <Link href="/dashboard/history" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1">
              Terminal History <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Candidate</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Document Type</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Time</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "CHUKWUMA ADAOBI", doc: "B.Sc Comp Sci", time: "2m ago", status: "AUTHENTIC", color: "text-brand-primary" },
                  { name: "IBRAHIM MUSA", doc: "M.Sc Economics", time: "1h ago", status: "AUTHENTIC", color: "text-brand-primary" },
                  { name: "AKPAN EKONG", doc: "B.Eng Mech", time: "3h ago", status: "FLAGGED", color: "text-rose-500" },
                  { name: "OLOWO SEGUN", doc: "B.Sc Account", time: "Yesterday", status: "AUTHENTIC", color: "text-brand-primary" },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs border border-white/5 group-hover:border-brand-primary/20 transition-all">
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-zinc-400 font-medium">{item.doc}</td>
                    <td className="px-10 py-6 text-sm text-zinc-500 font-medium">{item.time}</td>
                    <td className="px-10 py-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg bg-white/5 tracking-widest ${item.color}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Side Panel */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border-brand-primary/10 space-y-8 relative overflow-hidden group shadow-2xl"
          >
            <div className="bg-brand-primary p-4 rounded-2xl w-fit shadow-lg shadow-brand-primary/30 relative z-10 group-hover:scale-110 transition-transform duration-500">
               <Globe className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Global <br /> Institutional <br /> Network</h3>
              <p className="text-zinc-400 text-sm font-medium italic leading-relaxed">
                Connect your institution to the VeraDoc mesh network and access 5M+ verified academic records across Nigeria instantly.
              </p>
            </div>
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary transition-all relative z-10 shadow-xl">
              Enable Network Access
            </button>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full group-hover:bg-brand-primary/20 transition-all duration-700" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="glass p-8 rounded-[2rem] border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10 group-hover:border-brand-primary/30 transition-all">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight italic">Security Audit</p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Run system checkup</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-brand-primary transition-colors" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
