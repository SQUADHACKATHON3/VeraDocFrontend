"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const newPassword = watch("newPassword");
  const isOtpComplete = otp.every(digit => digit !== "");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email");
    if (!storedEmail) {
      router.push("/auth/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
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
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return;
    setIsResending(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      setResendTimer(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!isOtpComplete || !email) return;
    setIsLoading(true);
    setError(null);
    setShake(false);

    try {
      await api.resetPassword({
        email,
        otp: otp.join(""),
        newPassword: data.newPassword
      });
      setIsSuccess(true);
      sessionStorage.removeItem("reset_email");
    } catch (err: any) {
      setError("Invalid or expired code. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 font-poppins">
        <div className="w-full max-w-md glass p-8 md:p-10 rounded-[2.5rem] border border-card-border bg-card/50 backdrop-blur-xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password reset successfully.</h1>
          <p className="text-foreground/50 mb-8 font-medium">You can now sign in with your new password.</p>
          <Link 
            href="/auth/login"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl transition-all block text-center"
          >
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-poppins selection:bg-primary/30">
      <Navbar />

      <main className="flex flex-col items-center justify-center p-6 pt-32 lg:pt-40">
        <div className="w-full max-w-md glass p-8 md:p-10 rounded-[2.5rem] border border-card-border bg-card/50 backdrop-blur-xl reveal active">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Enter your reset code.</h1>
            <p className="text-foreground/50 text-sm font-medium leading-relaxed">
              Check your email for the 6-digit reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className={`flex justify-between gap-2 ${shake ? 'animate-shake' : ''}`}>
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
                  className="w-12 h-14 bg-card border border-card-border focus:border-primary rounded-xl text-center text-xl font-bold text-white outline-none transition-all"
                />
              ))}
            </div>

            <div className={`space-y-6 transition-all duration-500 overflow-hidden ${isOtpComplete ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">New Password</label>
                <div className="relative">
                  <input
                    {...register("newPassword", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Min 8 characters" }
                    })}
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className={`w-full bg-card border ${errors.newPassword ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-white text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.newPassword.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Confirm Password</label>
                <input
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === newPassword || "Passwords do not match"
                  })}
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  className={`w-full bg-card border ${errors.confirmPassword ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-white text-sm`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword.message as string}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={!isOtpComplete || !!errors.newPassword || !!errors.confirmPassword || !newPassword || isLoading}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isResending}
                  className="text-sm font-medium text-foreground/50 hover:text-primary transition-colors disabled:text-foreground/30 disabled:cursor-not-allowed"
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
      </main>

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
