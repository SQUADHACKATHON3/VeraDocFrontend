"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileText,
  Download,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type VerificationDetail } from "@/lib/api";

export default function VerificationResultPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<VerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const result = await api.getVerification(id);
        setData(result);
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 403)
        ) {
          router.push("/history");
          return;
        }
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
        <div className="h-48 w-full bg-white/5 rounded-[3rem] animate-pulse" />
        <div className="h-32 w-full bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Still processing / errored — no verdict yet.
  if (data.status !== "complete" || !data.verdict) {
    return (
      <div className="max-w-[760px] mx-auto p-6 md:p-10 lg:pt-20">
        <div className="glass p-12 rounded-[3rem] border-white/5 text-center space-y-6">
          {data.status === "error" ? (
            <>
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-heading font-black">
                  Analysis failed
                </h1>
                <p className="text-foreground/50 font-medium">
                  Something went wrong analyzing{" "}
                  <span className="text-white">{data.documentName}</span>.
                  Please contact support.
                </p>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <div className="space-y-2">
                <h1 className="text-3xl font-heading font-black">
                  Still analyzing
                </h1>
                <p className="text-foreground/50 font-medium">
                  This verification is still being processed. Check back in a
                  moment.
                </p>
              </div>
            </>
          )}
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
        </div>
      </div>
    );
  }

  const getVerdictConfig = () => {
    switch (data.verdict) {
      case "AUTHENTIC":
        return {
          bg: "bg-[#052e16]",
          border: "border-[#16A34A]",
          text: "text-[#16A34A]",
          icon: ShieldCheck,
        };
      case "SUSPICIOUS":
        return {
          bg: "bg-[#431407]",
          border: "border-[#D97706]",
          text: "text-[#D97706]",
          icon: ShieldAlert,
        };
      default:
        return {
          bg: "bg-[#450a0a]",
          border: "border-[#DC2626]",
          text: "text-[#DC2626]",
          icon: ShieldX,
        };
    }
  };

  const config = getVerdictConfig();
  const trustScore = data.trustScore ?? 0;
  const hints = data.issuerContactHints;

  const verifiedDate = data.completedAt
    ? new Date(data.completedAt).toLocaleString()
    : new Date(data.createdAt).toLocaleString();
  const timeToVerify =
    data.completedAt &&
    Math.max(
      1,
      Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.createdAt).getTime()) /
          1000
      )
    );

  const copyOutreach = async () => {
    if (!hints?.suggestedOutreachMessage) return;
    try {
      await navigator.clipboard.writeText(hints.suggestedOutreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="max-w-[760px] mx-auto p-6 md:p-10 lg:pt-20 space-y-8 pb-32 lg:pb-20">
      {/* Verdict Banner */}
      <div
        className={`w-full p-8 md:p-10 rounded-[3rem] border ${config.bg} ${config.border} shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 reveal active`}
      >
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl bg-white/10 ${config.text}`}>
            <config.icon className="w-12 h-12" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60 mb-1">
              VERDICT
            </p>
            <h1 className="text-5xl font-heading font-black">{data.verdict}</h1>
          </div>
        </div>

        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/5"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * trustScore) / 100}
              className={`${config.text} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-heading font-black">
              {trustScore}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary Card */}
      <div
        className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4 reveal active"
        style={{ transitionDelay: "100ms" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
            AI Summary
          </span>
          <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">
            {verifiedDate}
          </span>
        </div>
        <p className="text-lg text-white font-medium leading-relaxed">
          {data.summary || "No summary available for this verification."}
        </p>
        <div className="pt-4 flex items-center gap-3 text-sm font-bold text-foreground/40 italic">
          <FileText className="w-4 h-4" />
          {data.documentName}
        </div>
        <p className="text-[11px] font-medium text-foreground/30 leading-relaxed pt-2 border-t border-white/5">
          This is an AI screening result, not a legal confirmation. For
          high-stakes decisions, confirm directly with the issuing school or
          ministry.
        </p>
      </div>

      {/* Checks Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal active"
        style={{ transitionDelay: "200ms" }}
      >
        {/* Flags */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-heading font-bold">Issues Found</h3>
          </div>
          <div className="space-y-3">
            {data.flags.length > 0 ? (
              data.flags.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500"
                >
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-bold leading-tight">
                    {flag}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">No issues detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Passed Checks */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-heading font-bold">Passed Checks</h3>
          </div>
          <div className="space-y-3">
            {data.passedChecks.length > 0 ? (
              data.passedChecks.map((check, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500"
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-bold leading-tight">
                    {check}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm font-medium text-foreground/30 italic">
                No checks recorded.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Issuer Contact Hints */}
      {hints && hints.included && (
        <div
          className="glass p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/[0.02] space-y-6 reveal active"
          style={{ transitionDelay: "250ms" }}
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-heading font-bold">
              Confirm With the Issuer
            </h3>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/90 p-4 rounded-2xl text-xs font-medium leading-relaxed">
            {hints.disclaimer}
          </div>

          {/* Contact items */}
          {hints.items.length > 0 ? (
            <div className="space-y-3">
              {hints.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-foreground/40 flex-shrink-0">
                    {item.type === "email" ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white break-all">
                      {item.value}
                    </p>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-light transition-colors mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {item.sourceTitle || "Source"}
                      </a>
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-foreground/30 bg-white/5 px-2 py-1 rounded-full">
                    Unverified
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-foreground/30 italic">
              {hints.note === "no_contacts_found_in_snippets"
                ? "No issuer contact details were found in web snippets."
                : "No contact details available."}
            </p>
          )}

          {/* Suggested outreach message */}
          {hints.suggestedOutreachMessage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">
                  Draft Outreach Message
                </span>
                <button
                  type="button"
                  onClick={copyOutreach}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-light transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground/80 font-sans whitespace-pre-wrap leading-relaxed">
                {hints.suggestedOutreachMessage}
              </pre>
              {hints.suggestedOutreachMessageNote && (
                <p className="text-[11px] font-medium text-foreground/30 leading-relaxed">
                  {hints.suggestedOutreachMessageNote}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Verification Details */}
      <div
        className="glass p-8 rounded-[2.5rem] border-white/5 reveal active"
        style={{ transitionDelay: "300ms" }}
      >
        <h3 className="text-xl font-heading font-bold mb-8">
          Verification Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          {[
            { label: "Document Name", value: data.documentName },
            { label: "Date Verified", value: verifiedDate },
            {
              label: "Time to Verify",
              value: timeToVerify ? `${timeToVerify} seconds` : "—",
            },
            {
              label: "Payment Ref",
              value: data.squadTransactionRef || "Paid with credits",
            },
            {
              label: "Verified By",
              value: user
                ? `${user.name} (${user.organisation})`
                : "—",
            },
            { label: "Verification ID", value: data.id },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">
                {item.label}
              </p>
              <p className="text-sm font-bold text-white truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:static bg-dark-bg/80 backdrop-blur-xl lg:bg-transparent border-t lg:border-none border-white/5 p-6 lg:p-0 flex flex-col md:flex-row items-center justify-between gap-4 z-40 reveal active"
        style={{ transitionDelay: "400ms" }}
      >
        <Link
          href="/history"
          className="flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Link>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <Link
            href="/verify"
            className="flex items-center justify-center gap-2 text-foreground/60 hover:text-white px-4 py-2 font-bold transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Run Another
          </Link>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .glass,
          .lg\\:static {
            background: white !important;
            color: black !important;
            border: 1px solid #eee !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          aside,
          nav,
          .fixed,
          .hidden,
          .lg\\:ml-64 {
            display: none !important;
          }
          .max-w-\\[760px\\] {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          h1,
          h2,
          h3,
          p,
          span,
          pre {
            color: black !important;
          }
          .text-primary,
          .text-green-500,
          .text-red-500,
          .text-amber-500 {
            color: black !important;
            font-weight: bold !important;
          }
          .bg-green-500\\/10,
          .bg-red-500\\/10,
          .bg-amber-500\\/10 {
            background: transparent !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </div>
  );
}
