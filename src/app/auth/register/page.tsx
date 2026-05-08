"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

type RegisterForm = {
  fullName: string;
  organisation: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          organisation: data.organisation,
          email: data.email,
          password: data.password,
        }),
      });

      if (response.status === 409) {
        setError("An account with this email already exists");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      // 2. Automatically sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        router.push("/auth/login?error=auto-login-failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans selection:bg-primary/30 selection:text-primary-light">
      <Navbar />

      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column: Register Form */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 md:p-12 pt-40 lg:pt-32 relative z-10">
          <div className="w-full max-w-md glass p-8 md:p-10 rounded-[2.5rem] border-white/10 shadow-2xl reveal active">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-heading font-black mb-3 tracking-tight">Create your account.</h1>
              <p className="text-foreground/50 font-medium">Start verifying documents in minutes.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Full Name</label>
                <input
                  {...register("fullName", { required: "Full name is required" })}
                  disabled={isLoading}
                  className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.fullName.message}</p>}
              </div>

              {/* Organisation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Organisation</label>
                <input
                  {...register("organisation", { required: "Organisation name is required" })}
                  disabled={isLoading}
                  className={`w-full bg-white/5 border ${errors.organisation ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
                  placeholder="Company, university, or agency"
                />
                {errors.organisation && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.organisation.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Email Address</label>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format"
                    }
                  })}
                  disabled={isLoading}
                  className={`w-full bg-white/5 border ${errors.email || error?.includes("email") ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
                  placeholder="name@institution.edu.ng"
                />
                {(errors.email || (error && error.includes("email"))) && (
                  <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">
                    {errors.email?.message || error}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Password</label>
                  <div className="relative">
                    <input
                      {...register("password", { 
                        required: "Required",
                        minLength: { value: 8, message: "Min 8 chars" }
                      })}
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Confirm</label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", { 
                        required: "Required",
                        validate: value => value === password || "Passwords don't match"
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={isLoading}
                      className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {error && !error.includes("email") && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-light disabled:bg-primary/50 text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-foreground/50 font-medium text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary-light font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Branding */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-[#0A0E1A] relative items-center justify-center overflow-hidden border-l border-white/5 pt-32 lg:pt-20">
          <div className="absolute inset-0 bg-dots opacity-20"></div>
          <div className="absolute inset-0 bg-glow-radial opacity-30"></div>
          
          <div className="relative z-10 p-12 xl:p-20 max-w-2xl text-center">
            <h2 className="text-3xl xl:text-5xl font-heading font-black leading-tight text-white mb-8">
              Join institutions <br />
              <span className="text-primary-light italic underline decoration-primary/30 underline-offset-8">verifying smarter.</span>
            </h2>
            <p className="text-foreground/60 font-medium text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              VeraDoc gives HR teams, universities, and agencies the tools to detect fake credentials instantly.
            </p>

            <div className="space-y-4 relative max-w-sm mx-auto text-left">
              {[
                "AI-powered forensic document analysis",
                "Payments secured through Squad",
                "Results in under 10 seconds"
              ].map((feature, i) => (
                <div key={i} className="glass p-5 rounded-2xl border-white/10 flex items-center gap-4 reveal active" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                     <CheckCircle className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="font-bold text-white text-sm">{feature}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
