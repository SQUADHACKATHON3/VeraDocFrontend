"use client";

import { useEffect, useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Shield,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, type VerificationListItem } from "@/lib/api";

type Stats = {
  total: number;
  authentic: number;
  flagged: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, authentic: 0, flagged: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // The list endpoint reports `total` per query — derive real stats from
        // three lightweight (limit:1) calls plus one for the recent table.
        const [all, authentic, flagged, recent] = await Promise.all([
          api.listVerifications({ limit: 1 }),
          api.listVerifications({ limit: 1, verdict: "AUTHENTIC" }),
          api.listVerifications({ limit: 1, verdict: "FAKE" }),
          api.listVerifications({ limit: 5 }),
        ]);
        setStats({
          total: all.total,
          authentic: authentic.total,
          flagged: flagged.total,
        });
        setVerifications(recent.data);
      } catch (error) {
        console.error("Failed to fetch verifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name?.split(" ")[0] || "User";

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case "AUTHENTIC":
        return "bg-[#052e16] text-[#16A34A] border-[#16A34A]";
      case "SUSPICIOUS":
        return "bg-[#431407] text-[#D97706] border-[#D97706]";
      case "FAKE":
        return "bg-[#450a0a] text-[#DC2626] border-[#DC2626]";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 74) return "text-green-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="reveal active">
        <h1 className="text-3xl md:text-4xl font-heading font-black mb-2">
          {getGreeting()}, {firstName}.
        </h1>
        <p className="text-foreground/50 font-medium">Here's your verification overview.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Verifications", value: stats.total, icon: FileCheck, color: "text-primary" },
          { label: "Authentic Results", value: stats.authentic, icon: ShieldCheck, color: "text-green-500" },
          { label: "Flagged Results", value: stats.flagged, icon: ShieldAlert, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="glass glass-hover group p-6 rounded-3xl transition-all duration-500 reveal active" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Link href="/history" className="text-[10px] font-bold text-foreground/30 hover:text-primary transition-colors uppercase tracking-widest">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-heading font-black text-white">{isLoading ? "---" : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Credits Balance Card */}
      <div className="glass glass-hover p-6 rounded-3xl flex items-center gap-5 reveal active">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Coins className="w-7 h-7 text-primary-light" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-0.5">Your Balance</p>
          <p className="text-3xl font-heading font-black text-white">
            {user?.credits ?? 0}
            <span className="text-sm font-bold text-foreground/40 ml-1.5">
              {user?.credits === 1 ? "credit" : "credits"}
            </span>
          </p>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-card border-l-4 border-primary p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 reveal active">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-heading font-bold mb-2 text-white">Ready to verify a document?</h3>
          <p className="text-foreground/50 font-medium">Upload and get results in under 10 seconds.</p>
        </div>
        <Link href="/verify" className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
          New Verification <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Recent Verifications Table */}
      <div className="space-y-6 reveal active">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-heading font-bold">Recent Verifications</h2>
          <Link href="/history" className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            View All →
          </Link>
        </div>

        <div className="glass rounded-[2rem] overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="h-12 w-full bg-white/5 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : verifications.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Document Name</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Date</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Verdict</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Trust Score</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-bold text-white text-sm">{v.documentName}</td>
                      <td className="px-8 py-6 text-foreground/50 text-xs font-medium">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider ${getVerdictStyles(v.verdict ?? "")}`}>
                          {v.verdict ?? v.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-8 py-6 font-heading font-black text-lg ${v.trustScore != null ? getScoreColor(v.trustScore) : "text-foreground/30"}`}>
                        {v.trustScore != null ? `${v.trustScore}%` : "—"}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/verify/${v.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground/30 group-hover:text-primary transition-all">
                          View <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {verifications.map((v) => (
                  <Link
                    key={v.id}
                    href={`/verify/${v.id}`}
                    className="block p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-bold text-white text-sm break-words min-w-0">{v.documentName}</span>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black border tracking-wider ${getVerdictStyles(v.verdict ?? "")}`}>
                        {v.verdict ?? v.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</p>
                        <p className={`text-sm font-heading font-black ${v.trustScore != null ? getScoreColor(v.trustScore) : "text-foreground/30"}`}>
                          {v.trustScore != null ? `${v.trustScore}% Trust` : "Pending"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 md:p-20 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-card flex items-center justify-center border border-card-border">
                <Shield className="w-10 h-10 text-foreground/20" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-heading font-bold">No verifications yet.</p>
                <p className="text-foreground/40 font-medium">Your verification history will appear here.</p>
              </div>
              <Link href="/verify" className="bg-white text-dark-bg px-8 py-3 rounded-full font-bold transition-all hover:scale-105">
                Run your first verification →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
