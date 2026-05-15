"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
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

      <main className="flex flex-col items-center justify-center p-6 pt-12 lg:pt-20">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 md:p-10 rounded-[2.5rem] border border-border shadow-2xl reveal active">
          <Link 
            href="/auth/login" 
            className="vd-auth-kicker inline-flex items-center gap-2 hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="mb-10">
            <h1 className="vd-auth-title">Reset your <em>password.</em></h1>
            <p className="text-ink-secondary font-medium leading-relaxed">
              Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="vd-field">
              <label className="vd-field-label ml-1">Email Address</label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format"
                  }
                })}
                disabled={isLoading}
                className={`vd-input${errors.email ? ' vd-input-error' : ''}`}
                placeholder="name@institution.edu.ng"
              />
              {errors.email && <p className="vd-field-error ml-1">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="vd-auth-error text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
