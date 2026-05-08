"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

type VerificationStep = 1 | 2 | 3 | 4;

type VerificationResult = {
  id: string;
  verdict: "AUTHENTIC" | "SUSPICIOUS" | "FAKE";
  trustScore: number;
  summary: string;
};

function VerifyContent() {
  const [step, setStep] = useState<VerificationStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusLines, setStatusLines] = useState<number>(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for payment redirect reference
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setVerificationId(ref);
      setStep(3);
    }
  }, [searchParams]);

  // Polling for status in Step 3
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 3 && verificationId) {
      // Simulate staggered status lines
      const lineInterval = setInterval(() => {
        setStatusLines(prev => prev < 3 ? prev + 1 : prev);
      }, 2000);

      // Poll API
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/verify/${verificationId}/status`);
          const data = await response.json();
          
          if (data.status === "complete") {
            setResult(data.result);
            setStep(4);
            clearInterval(interval);
            clearInterval(lineInterval);
          } else if (data.status === "error") {
            setError("Analysis failed. Please contact support.");
            clearInterval(interval);
            clearInterval(lineInterval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

      // Timeout after 60s
      const timeout = setTimeout(() => {
        if (step === 3) {
          setError("Analysis timed out. Please try again.");
          clearInterval(interval);
          clearInterval(lineInterval);
        }
      }, 60000);

      return () => {
        clearInterval(interval);
        clearInterval(lineInterval);
        clearTimeout(timeout);
      };
    }
  }, [step, verificationId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handlePayment = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/verify/initiate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const data = await response.json();
      setVerificationId(data.verificationId);
      // Redirect to Squad payment page
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError("Failed to initiate payment. Please try again.");
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
    router.replace("/verify");
  };

  return (
    <div className="max-w-[680px] mx-auto p-6 md:p-10 lg:pt-20">
      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-8 reveal active">
          <div>
            <h1 className="text-4xl font-heading font-black mb-3">Upload your document.</h1>
            <p className="text-foreground/50 font-medium text-lg">PDF, JPG, PNG or JPEG. Maximum 5MB.</p>
          </div>

          {!file ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) validateAndSetFile(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                isDragActive 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-white/10 hover:border-primary/30 hover:bg-white/[0.02]"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xl font-heading font-bold text-white mb-1">Drag and drop your file here</p>
                <p className="text-foreground/40 font-medium">or <span className="text-primary font-bold">click to browse</span></p>
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-3xl border-white/10 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {file.type === "application/pdf" ? (
                    <FileText className="w-6 h-6 text-foreground/40" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-foreground/40" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
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
            onClick={() => setStep(2)}
            disabled={!file}
            className="w-full bg-primary hover:bg-primary-light disabled:bg-primary/50 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Continue to Payment <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-8 reveal active">
          <div>
            <h1 className="text-4xl font-heading font-black mb-3">Complete payment.</h1>
            <p className="text-foreground/50 font-medium text-lg">Your document will be analyzed immediately after payment.</p>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-foreground/40" />
                </div>
                <p className="font-bold text-white truncate max-w-[150px] md:max-w-[250px]">{file?.name}</p>
              </div>
              <p className="text-xl font-heading font-black text-white">NGN 1,000</p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/40 font-medium">Verification fee</span>
              <span className="text-white font-bold">NGN 1,000.00</span>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-[0.2em] text-center">
                Powered by <span className="text-foreground/40">Squad</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Initiating payment...</span>
                </>
              ) : (
                <>Pay NGN 1,000 with Squad <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <button 
              onClick={() => setStep(1)}
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
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin absolute -inset-2"></div>
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse border-2 border-primary/30">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-heading font-black mb-3">Analyzing your document.</h1>
            <p className="text-foreground/50 font-medium text-lg">This usually takes under 10 seconds.</p>
          </div>

          <div className="max-w-xs mx-auto space-y-4">
            {[
              { id: 1, label: "Payment confirmed", icon: CheckCircle2, success: true },
              { id: 2, label: "Running forensic analysis...", icon: Loader2, success: false },
              { id: 3, label: "Generating trust report...", icon: Loader2, success: false }
            ].map((line, i) => (
              <div 
                key={line.id} 
                className={`flex items-center gap-3 transition-all duration-500 ${
                  statusLines >= i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {statusLines > i || (statusLines === i && line.success) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : statusLines === i ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                )}
                <span className={`text-sm font-bold ${statusLines >= i ? "text-foreground" : "text-foreground/20"}`}>
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
              <button onClick={reset} className="bg-white text-dark-bg px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Result Preview */}
      {step === 4 && result && (
        <div className="space-y-10 reveal active">
          <div className={`p-10 rounded-[3rem] border transition-all duration-700 shadow-2xl ${
            result.verdict === "AUTHENTIC" 
              ? "bg-green-500/10 border-green-500/20 shadow-green-500/5" 
              : result.verdict === "SUSPICIOUS"
              ? "bg-amber-500/10 border-amber-500/20 shadow-amber-500/5"
              : "bg-red-500/10 border-red-500/20 shadow-red-500/5"
          }`}>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                result.verdict === "AUTHENTIC" ? "bg-green-500/20" : result.verdict === "SUSPICIOUS" ? "bg-amber-500/20" : "bg-red-500/20"
              }`}>
                {result.verdict === "AUTHENTIC" && <ShieldCheck className="w-10 h-10 text-green-500" />}
                {result.verdict === "SUSPICIOUS" && <ShieldAlert className="w-10 h-10 text-amber-500" />}
                {result.verdict === "FAKE" && <ShieldX className="w-10 h-10 text-red-500" />}
              </div>
              
              <div>
                <h2 className={`text-5xl font-heading font-black mb-2 ${
                  result.verdict === "AUTHENTIC" ? "text-green-500" : result.verdict === "SUSPICIOUS" ? "text-amber-500" : "text-red-500"
                }`}>
                  {result.verdict}
                </h2>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-heading font-black text-white">{result.trustScore}%</span>
                  <span className="text-foreground/40 font-bold uppercase tracking-widest text-sm">Trust Score</span>
                </div>
              </div>

              <p className="text-lg text-foreground/60 font-medium leading-relaxed max-w-sm">
                {result.summary}
              </p>

              <div className="w-full h-px bg-white/5 my-4"></div>

              <div className="w-full space-y-4">
                <Link href={`/verify/${result.id}`} className="w-full bg-primary hover:bg-primary-light text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                  View Full Report <ArrowRight className="w-5 h-5" />
                </Link>
                <button onClick={reset} className="w-full text-foreground/40 hover:text-white font-bold py-3 transition-colors text-sm">
                  Run Another Verification
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/dashboard" className="text-sm font-bold text-foreground/20 hover:text-primary transition-all underline underline-offset-8 decoration-white/5 hover:decoration-primary/30">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* CSS Animations (Inline for simplicity as requested) */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
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

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
