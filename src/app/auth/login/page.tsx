"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans selection:bg-primary/30 selection:text-primary-light">
      <Navbar />

      <main className="flex min-h-screen pt-20">
        {/* Left Column: Login Form (40%) */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-md glass p-10 rounded-[2rem] border-white/10 shadow-2xl reveal active">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-primary p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-extrabold tracking-tight">VeraDoc</span>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-heading font-bold mb-2">Welcome back.</h1>
              <p className="text-foreground/50 font-medium">Sign in to your account to continue verifying.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Email Address</label>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format"
                    }
                  })}
                  disabled={isLoading}
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium placeholder:text-white/10`}
                  placeholder="name@institution.edu.ng"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Password</label>
                  <button type="button" className="text-xs font-bold text-primary hover:text-primary-light transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-5 py-4 outline-none transition-all font-medium placeholder:text-white/10`}
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
                className="w-full bg-primary hover:bg-primary-light disabled:bg-primary/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
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

            <p className="text-center mt-8 text-foreground/50 font-medium">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary-light font-bold transition-colors">
                Get Started
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Branding (60%) */}
        <div className="hidden lg:flex lg:w-[60%] bg-[#0A0E1A] relative items-center justify-center overflow-hidden border-l border-white/5">
          <div className="absolute inset-0 bg-dots opacity-20"></div>
          <div className="absolute inset-0 bg-glow-radial opacity-30"></div>
          
          <div className="relative z-10 p-20 max-w-2xl text-center">
            <h2 className="text-5xl font-heading font-black leading-tight text-white mb-6">
              "One fake certificate. <br />
              One wrong hire. <br />
              <span className="text-primary-light italic">One costly mistake."</span>
            </h2>
            <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-sm mb-16">
              VeraDoc helps Nigerian institutions verify smarter.
            </p>

            <div className="space-y-6 relative">
              {/* Floating Stat Cards */}
              <div className="glass p-6 rounded-2xl border-white/10 flex items-center gap-4 -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-heading font-black text-white">10,000+</div>
                  <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">documents verified</div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border-white/10 flex items-center gap-4 rotate-1 translate-x-12 hover:rotate-0 hover:translate-x-0 transition-transform duration-500 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-heading font-black text-white">99.2%</div>
                  <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">detection accuracy</div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border-white/10 flex items-center gap-4 -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-heading font-black text-white">&lt; 8 seconds</div>
                  <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">average verification time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
