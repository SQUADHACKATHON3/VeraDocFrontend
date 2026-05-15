"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.forgotPassword(data.email);
      sessionStorage.setItem("reset_email", data.email);
      router.push("/auth/reset-password");
    } catch (err: any) {
      if (err.status === 404) {
        setError("No account found with this email.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-foreground font-sans selection:bg-primary/30">
      <div className="p-6"><Logo /></div>

      <main className="flex flex-col items-center justify-center p-6 pt-32 lg:pt-40">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 md:p-10 rounded-[2.5rem] border border-border  reveal active">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-foreground/40 hover:text-ink text-xs font-bold uppercase tracking-widest transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-ink mb-3 tracking-tight">Reset your password.</h1>
            <p className="text-ink-secondary font-medium leading-relaxed">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Email Address</label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format"
                  }
                })}
                disabled={isLoading}
                className={`w-full bg-card border ${errors.email ? 'border-red-500' : 'border-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium text-ink placeholder:text-ink/10`}
                placeholder="name@institution.edu.ng"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest hover:bg-forest-mid disabled:bg-primary/50 text-ink font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
