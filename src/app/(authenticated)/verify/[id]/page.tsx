"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Clock, 
  FileText, 
  Download, 
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";

type VerificationDetail = {
  id: string;
  documentName: string;
  verdict: "AUTHENTIC" | "SUSPICIOUS" | "FAKE";
  trustScore: number;
  summary: string;
  date: string;
  flags: string[];
  passedChecks: string[];
  createdAt: string;
  completedAt: string;
  paymentRef: string;
  user: {
    name: string;
    organisation: string;
  };
};

export default function VerificationResultPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<VerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/verifications/${id}`);
        if (response.status === 404 || response.status === 403) {
          router.push("/history");
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="max-w-[760px] mx-auto p-6 md:p-10 lg:pt-20 space-y-8">
        <div className="h-48 w-full bg-white/5 rounded-[3rem] animate-pulse"></div>
        <div className="h-32 w-full bg-white/5 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse"></div>
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getVerdictConfig = () => {
    switch (data.verdict) {
      case "AUTHENTIC":
        return {
          bg: "bg-[#052e16]",
          border: "border-[#16A34A]",
          text: "text-[#16A34A]",
          icon: ShieldCheck,
          ring: "text-[#16A34A]"
        };
      case "SUSPICIOUS":
        return {
          bg: "bg-[#431407]",
          border: "border-[#D97706]",
          text: "text-[#D97706]",
          icon: ShieldAlert,
          ring: "text-[#D97706]"
        };
      case "FAKE":
        return {
          bg: "bg-[#450a0a]",
          border: "border-[#DC2626]",
          text: "text-[#DC2626]",
          icon: ShieldX,
          ring: "text-[#DC2626]"
        };
    }
  };

  const config = getVerdictConfig();
  const timeToVerify = Math.max(1, Math.round((new Date(data.completedAt).getTime() - new Date(data.createdAt).getTime()) / 1000));

  return (
    <div className="max-w-[760px] mx-auto p-6 md:p-10 lg:pt-20 space-y-8 pb-32 lg:pb-20">
      {/* Verdict Banner */}
      <div className={`w-full p-8 md:p-10 rounded-[3rem] border ${config.bg} ${config.border} shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 reveal active`}>
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl bg-white/10 ${config.text}`}>
            <config.icon className="w-12 h-12" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60 mb-1">VERDICT</p>
            <h1 className="text-5xl font-heading font-black">{data.verdict}</h1>
          </div>
        </div>

        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48" cy="48" r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/5"
            />
            <circle
              cx="48" cy="48" r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * data.trustScore) / 100}
              className={`${config.text} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-heading font-black">{data.trustScore}%</span>
          </div>
        </div>
      </div>

      {/* AI Summary Card */}
      <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4 reveal active" style={{ transitionDelay: "100ms" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">AI Summary</span>
          <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">{data.date}</span>
        </div>
        <p className="text-lg text-white font-medium leading-relaxed">
          {data.summary}
        </p>
        <div className="pt-4 flex items-center gap-3 text-sm font-bold text-foreground/40 italic">
          <FileText className="w-4 h-4" />
          {data.documentName}
        </div>
      </div>

      {/* Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal active" style={{ transitionDelay: "200ms" }}>
        {/* Left Column: Flags */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-heading font-bold">Issues Found</h3>
          </div>
          <div className="space-y-3">
            {data.flags.length > 0 ? (
              data.flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-bold leading-tight">{flag}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">No issues detected</span>
              </div>
            )}
            {data.verdict === "AUTHENTIC" && data.flags.length === 0 && (
              <p className="text-xs font-medium text-foreground/30 px-1 italic">
                All forensic checks passed cleanly.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Passed Checks */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-heading font-bold">Passed Checks</h3>
          </div>
          <div className="space-y-3">
            {data.passedChecks.map((check, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-bold leading-tight">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Details */}
      <div className="glass p-8 rounded-[2.5rem] border-white/5 reveal active" style={{ transitionDelay: "300ms" }}>
        <h3 className="text-xl font-heading font-bold mb-8">Verification Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          {[
            { label: "Document Name", value: data.documentName },
            { label: "Date Verified", value: new Date(data.completedAt).toLocaleString() },
            { label: "Time to Verify", value: `${timeToVerify} seconds` },
            { label: "Payment Ref", value: data.paymentRef },
            { label: "Verified By", value: `${data.user.name} (${data.user.organisation})` },
            { label: "Verification ID", value: data.id },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{item.label}</p>
              <p className="text-sm font-bold text-white truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:static bg-dark-bg/80 backdrop-blur-xl lg:bg-transparent border-t lg:border-none border-white/5 p-6 lg:p-0 flex flex-col md:flex-row items-center justify-between gap-4 z-40 reveal active" style={{ transitionDelay: "400ms" }}>
        <Link href="/history" className="flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Link>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <Link href="/verify" className="flex items-center justify-center gap-2 text-foreground/60 hover:text-white px-4 py-2 font-bold transition-all text-sm">
            <RotateCcw className="w-4 h-4" />
            Run Another
          </Link>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .glass, .lg\\:static { 
            background: white !important; 
            color: black !important; 
            border: 1px solid #eee !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          aside, nav, .fixed, .hidden, .lg\\:ml-64 { display: none !important; }
          .max-w-\\[760px\\] { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          main { margin: 0 !important; padding: 0 !important; }
          h1, h2, h3, p, span { color: black !important; }
          .text-primary, .text-green-500, .text-red-500, .text-amber-500 { color: black !important; font-weight: bold !important; }
          .bg-green-500\\/10, .bg-red-500\\/10, .bg-amber-500\\/10 { background: transparent !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </div>
  );
}
