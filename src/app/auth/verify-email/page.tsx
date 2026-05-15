"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import AuthAside from "@/components/auth/AuthAside";

const DEV_OTP_KEY = "veradoc.devOtp";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem(DEV_OTP_KEY);
      if (stored) {
        setDevOtp(stored);
        sessionStorage.removeItem(DEV_OTP_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

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
    if (pastedData.every((char) => /^\d$/.test(char))) {
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
    if (otp.some((digit) => !digit)) return;

    setIsLoading(true);
    setError(null);
    setShake(false);

    try {
      await api.verifyEmail(otp.join(""));
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired code. Try again."
      );
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
      const res = await api.resendOtp();
      setResendTimer(60);
      setResendSuccess(true);
      if (res.devOtp) setDevOtp(res.devOtp);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to resend code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  if (authLoading || !user) {
    return (
      <div className="vd" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--forest)" }} />
      </div>
    );
  }

  return (
    <div className="vd vd-auth">
      <main className="vd-auth-main">
        <div className="vd-auth-form vd-auth-form--verify">
          <p className="vd-auth-kicker">Almost there</p>
          <h1 className="vd-auth-title">
            Verify your <em>email.</em>
          </h1>
          <p className="vd-verify-lead vd-auth-verify-lead">
            We sent a 6-digit code to{" "}
            <strong>{user.email}</strong>. Check your inbox and spam folder.
          </p>

          {devOtp && (
            <div className="vd-auth-dev-otp">
              <p>
                We couldn&apos;t deliver email to this address yet. Use this code:{" "}
                <span className="vd-mono">{devOtp}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={shake ? "vd-auth-otp-row vd-auth-otp-row--shake" : "vd-auth-otp-row"}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="vd-input vd-auth-otp-digit"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {error && <p className="vd-auth-error">{error}</p>}
            {resendSuccess && <p className="vd-auth-success">Code sent again. Check your email.</p>}

            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full vd-auth-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify email"
              )}
            </button>

            <p className="vd-auth-resend">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className="vd-auth-resend-btn"
              >
                {resendTimer > 0
                  ? `Resend in 0:${resendTimer.toString().padStart(2, "0")}`
                  : isResending
                    ? "Sending…"
                    : "Resend code"}
              </button>
            </p>

            <p className="vd-auth-back">
              <Link href="/auth/login">← Back to sign in</Link>
            </p>
          </form>
        </div>
      </main>

      <AuthAside />
    </div>
  );
}
