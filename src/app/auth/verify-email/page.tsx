"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Auto-focus first box
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.some(digit => !digit)) return;

    setIsLoading(true);
    setError(null);
    setShake(false);

    try {
      await api.verifyEmail(otp.join(""));
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid or expired code. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await api.resendOtp();
      setResendTimer(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== "");

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 md:p-10 rounded-[2.5rem] border border-border ">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-3">Verify your email.</h1>
          <p className="text-ink-secondary text-sm leading-relaxed">
            We sent a 6-digit code to <span className="text-ink font-semibold">{user?.email || "your email"}</span>. 
            Enter it below to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`flex justify-between gap-2 md:gap-3 ${shake ? 'animate-shake' : ''}`}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 md:w-14 md:h-16 bg-card border border-border focus:border-primary rounded-xl text-center text-2xl font-bold text-ink outline-none transition-all"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full bg-forest hover:bg-forest-mid disabled:bg-primary/50 disabled:cursor-not-allowed text-ink font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Email</span>
              )}
            </button>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            )}

            {resendSuccess && (
              <p className="text-emerald-500 text-sm font-medium text-center">Code resent successfully</p>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className="text-sm font-medium text-ink-secondary hover:text-[#2563EB] transition-colors disabled:text-foreground/30 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? (
                  `Resend in 0:${resendTimer.toString().padStart(2, "0")}`
                ) : (
                  isResending ? "Resending..." : "Resend code"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
