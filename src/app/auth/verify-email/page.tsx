"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

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
    <div className="vd vd-auth" style={{ minHeight: "100vh" }}>
      <main className="vd-auth-main" style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
        <div className="vd-auth-form">
          <p className="vd-auth-kicker">Almost there</p>
          <h1 className="vd-auth-title">
            Verify your <em>email.</em>
          </h1>
          <p className="vd-verify-lead" style={{ marginBottom: 24 }}>
            We sent a 6-digit code to{" "}
            <strong style={{ color: "var(--ink)" }}>{user.email}</strong>. Check your inbox
            and spam folder.
          </p>

          {devOtp && (
            <div
              className="vd-auth-error"
              style={{
                marginBottom: 20,
                background: "var(--forest-tint)",
                borderColor: "var(--forest-tint-2)",
                color: "var(--forest)",
              }}
            >
              <strong>Development:</strong> email may not have been delivered (Resend sandbox
              only sends to your Resend account email). Use code{" "}
              <span className="vd-mono" style={{ letterSpacing: "0.2em" }}>
                {devOtp}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              className={shake ? "vd-otp-row vd-otp-row--shake" : "vd-otp-row"}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 24,
              }}
            >
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
                  className="vd-input"
                  style={{
                    width: 48,
                    height: 56,
                    padding: 0,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {error && <p className="vd-auth-error" style={{ marginBottom: 16 }}>{error}</p>}
            {resendSuccess && (
              <p style={{ marginBottom: 16, fontSize: 14, color: "var(--forest)" }}>
                Code sent again. Check your email.
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full"
              style={{ marginBottom: 16 }}
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

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--forest)",
                  fontWeight: 600,
                  cursor: resendTimer > 0 || isResending ? "not-allowed" : "pointer",
                  opacity: resendTimer > 0 || isResending ? 0.5 : 1,
                }}
              >
                {resendTimer > 0
                  ? `Resend in 0:${resendTimer.toString().padStart(2, "0")}`
                  : isResending
                    ? "Sending…"
                    : "Resend code"}
              </button>
            </p>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
              <Link href="/auth/login" style={{ color: "var(--ink-3)" }}>
                ← Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
