/**
 * Login Page — /auth/login
 * Allows existing users to authenticate and access their accounts.
 * Auth required: No
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans selection:bg-primary/30 selection:text-primary-light">
      <Navbar />

      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column: Login Form */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 md:p-12 pt-40 lg:pt-32 relative z-10">
          <div className="w-full max-w-md glass p-8 md:p-10 rounded-[2.5rem] reveal active">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-heading font-black mb-3 tracking-tight">Welcome back.</h1>
              <p className="text-foreground/50 font-medium">Sign in to continue verifying.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
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
                  className={`w-full bg-card border ${errors.email ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium placeholder:text-white/10`}
                  placeholder="name@institution.edu.ng"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Password</label>
                  <button type="button" className="text-xs font-bold text-primary hover:text-primary-light transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className={`w-full bg-card border ${errors.password ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium placeholder:text-white/10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <p className="text-center mt-10 text-foreground/50 font-medium">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary-light font-bold transition-colors">
                Get Started
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Branding */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-sidebar relative items-center justify-center overflow-hidden border-l border-card-border pt-32 lg:pt-20">
          <div className="relative z-10 p-12 xl:p-20 max-w-2xl text-center">
            <h2 className="text-3xl xl:text-4xl font-heading font-black leading-tight text-white mb-8">
              "One fake certificate. <br />
              One wrong hire. <br />
              <span className="text-primary-light italic underline decoration-primary/30 underline-offset-8">One costly mistake."</span>
            </h2>
            <p className="text-foreground/40 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">
              VeraDoc helps Nigerian institutions verify smarter.
            </p>

            <div className="space-y-4 relative max-w-sm mx-auto">
              {/* Floating Stat Cards */}
              <div className="glass p-4 rounded-2xl flex items-center gap-4 -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-heading font-black text-white">10,000+</div>
                  <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">documents verified</div>
                </div>
              </div>

              <div className="glass p-4 rounded-2xl flex items-center gap-4 rotate-1 translate-x-8 hover:rotate-0 hover:translate-x-0 transition-transform duration-500">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-heading font-black text-white">99.2%</div>
                  <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">detection accuracy</div>
                </div>
              </div>

              <div className="glass p-4 rounded-2xl flex items-center gap-4 -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-heading font-black text-white">&lt; 8 seconds</div>
                  <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">average verification time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>


  );
}
