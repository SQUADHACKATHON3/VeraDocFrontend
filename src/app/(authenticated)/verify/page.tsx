"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  X,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  ApiError,
  type Verdict,
  type VerificationStatusOut,
} from "@/lib/api";
import BuyCreditsModal from "@/components/BuyCreditsModal";

type VerificationStep = 1 | 2 | 3 | 4;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;
const POLL_MS = 3000;
const TIMEOUT_MS = 60000;

export default function VerifyPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<VerificationStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationStatusOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusLines, setStatusLines] = useState(0);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const credits = user?.credits ?? 0;

  // Poll verification status during step 3.
  useEffect(() => {
    if (step !== 3 || !verificationId) return;

    const lineInterval = setInterval(() => {
      setStatusLines((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2000);

    const poll = setInterval(async () => {
      try {
        const data = await api.getVerificationStatus(verificationId);
        if (data.status === "complete") {
          setResult(data);
          setStep(4);
        } else if (data.status === "error") {
          setError("Analysis failed. Please contact support.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_MS);

    const timeout = setTimeout(() => {
      setError("Analysis timed out. Check your history shortly for the result.");
    }, TIMEOUT_MS);

    return () => {
      clearInterval(lineInterval);
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [step, verificationId]);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_SIZE) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const startVerification = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await api.initiateVerification(file);
      setVerificationId(res.verificationId);
      await refreshUser(); // a credit was just consumed
      setStatusLines(0);
      setStep(3);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        // Out of credits — prompt a top-up.
        setShowBuyCredits(true);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to start verification. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setVerificationId(null);
    setResult(null);
    setError(null);
    setStatusLines(0);
  };

  return (
    <div className="max-w-[680px] mx-auto p-6 md:p-10 lg:pt-20">
      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-8 reveal active">
          <div>
            <h1 className="text-4xl font-heading font-black mb-3">
              Upload your document.
            </h1>
            <p className="text-foreground/50 font-medium text-lg">
              PDF, JPG, PNG or JPEG. Maximum 5MB.
            </p>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) validateAndSetFile(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-10 sm:p-16 md:p-20 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-card-border hover:border-primary hover:bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                aria-label="Upload document"
              />
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xl font-heading font-bold text-white mb-1">
                  Drag and drop your file here
                </p>
                <p className="text-foreground/40 font-medium">
                  or <span className="text-primary font-bold">click to browse</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-3xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {file.type === "application/pdf" ? (
                    <FileText className="w-6 h-6 text-foreground/40" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-foreground/40" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white truncate max-w-[200px] md:max-w-[300px]">
                    {file.name}
                  </p>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!file}
            className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Confirm & spend a credit */}
      {step === 2 && (
        <div className="space-y-8 reveal active">
          <div>
            <h1 className="text-4xl font-heading font-black mb-3">
              Confirm verification.
            </h1>
            <p className="text-foreground/50 font-medium text-lg">
              Each verification uses one credit. Analysis starts immediately.
            </p>
          </div>

          <div className="glass p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-card-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-foreground/40" />
                </div>
                <p className="font-bold text-white truncate max-w-[150px] md:max-w-[250px]">
                  {file?.name}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground/40">1 credit</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground/40 font-medium text-sm">
                Your balance
              </span>
              <span className="flex items-center gap-2 text-white font-bold">
                <Coins className="w-4 h-4 text-primary-light" />
                {credits} {credits === 1 ? "credit" : "credits"}
              </span>
            </div>

            {credits < 1 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                You're out of credits. Buy a pack to run this verification.
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {credits < 1 ? (
              <button
                type="button"
                onClick={() => setShowBuyCredits(true)}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Coins className="w-5 h-5" /> Buy Credits
              </button>
            ) : (
              <button
                type="button"
                onClick={startVerification}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting analysis...</span>
                  </>
                ) : (
                  <>
                    Verify Document (1 credit) <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              disabled={isProcessing}
              className="w-full text-foreground/40 hover:text-white font-bold py-2 transition-colors text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="text-center space-y-12 py-10 reveal active">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin absolute -inset-2" />
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse border-2 border-primary/30">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-heading font-black mb-3">
              Analyzing your document.
            </h1>
            <p className="text-foreground/50 font-medium text-lg">
              This usually takes under 10 seconds.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-4">
            {[
              { id: 1, label: "Document received", success: true },
              { id: 2, label: "Running forensic analysis...", success: false },
              { id: 3, label: "Generating trust report...", success: false },
            ].map((line, i) => (
              <div
                key={line.id}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  statusLines >= i
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {statusLines > i || (statusLines === i && line.success) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : statusLines === i ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                )}
                <span
                  className={`text-sm font-bold ${
                    statusLines >= i ? "text-foreground" : "text-foreground/20"
                  }`}
                >
                  {line.label}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="space-y-6 pt-4">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-[2.5rem] text-sm font-medium">
                {error}
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={reset}
                  className="bg-white text-dark-bg px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
                >
                  Start Over
                </button>
                <Link
                  href="/history"
                  className="text-foreground/40 hover:text-white font-bold text-sm transition-colors"
                >
                  View History
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Result Preview */}
      {step === 4 && result && verificationId && (
        <div className="space-y-10 reveal active">
          <div
            className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border transition-all duration-700 ${
              result.verdict === "AUTHENTIC"
                ? "bg-[#052e16] border-[#16A34A]"
                : result.verdict === "SUSPICIOUS"
                ? "bg-[#431407] border-[#D97706]"
                : "bg-[#450a0a] border-[#DC2626]"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                  result.verdict === "AUTHENTIC"
                    ? "bg-green-500/20"
                    : result.verdict === "SUSPICIOUS"
                    ? "bg-amber-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {result.verdict === "AUTHENTIC" && (
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                )}
                {result.verdict === "SUSPICIOUS" && (
                  <ShieldAlert className="w-10 h-10 text-amber-500" />
                )}
                {result.verdict === "FAKE" && (
                  <ShieldX className="w-10 h-10 text-red-500" />
                )}
              </div>

              <div>
                <h2
                  className={`text-4xl sm:text-5xl font-heading font-black mb-2 ${
                    result.verdict === "AUTHENTIC"
                      ? "text-[#16A34A]"
                      : result.verdict === "SUSPICIOUS"
                      ? "text-[#D97706]"
                      : "text-[#DC2626]"
                  }`}
                >
                  {result.verdict}
                </h2>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-heading font-black text-white">
                    {result.trustScore ?? "—"}%
                  </span>
                  <span className="text-foreground/40 font-bold uppercase tracking-widest text-sm">
                    Trust Score
                  </span>
                </div>
              </div>

              {result.summary && (
                <p className="text-lg text-foreground/60 font-medium leading-relaxed max-w-sm">
                  {result.summary}
                </p>
              )}

              <div className="w-full h-px bg-card-border my-4" />

              <div className="w-full space-y-4">
                <Link
                  href={`/verify/${verificationId}`}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  View Full Report <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full text-foreground/40 hover:text-white font-bold py-3 transition-colors text-sm"
                >
                  Run Another Verification
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm font-bold text-foreground/20 hover:text-primary transition-all underline underline-offset-8 decoration-white/5 hover:decoration-primary/30"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onPurchased={() => refreshUser()}
      />

      <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
