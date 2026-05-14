/**
 * Register Page — /auth/register
 * Allows new users to create an account and join the VeraDoc platform.
 * Auth required: No
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

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
  const { register: signUp } = useAuth();

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
      // Registers the user, then signs in with the same credentials.
      await signUp({
        name: data.fullName,
        organisation: data.organisation,
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("An account with this email already exists");
      } else if (err instanceof ApiError && err.status === 422) {
        setError(err.message);
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
        {/* Left Column: Register Form */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 md:p-12 pt-40 lg:pt-32 relative z-10">
          <div className="w-full max-w-md glass p-8 md:p-10 rounded-[2.5rem] reveal active">
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
                  className={`w-full bg-card border ${errors.fullName ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
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
                  className={`w-full bg-card border ${errors.organisation ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
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
                  className={`w-full bg-card border ${errors.email || error?.includes("email") ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium placeholder:text-white/10`}
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
                      className={`w-full bg-card border ${errors.password ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-sm`}
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
                      className={`w-full bg-card border ${errors.confirmPassword ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-xl px-5 py-3.5 outline-none transition-all font-medium text-sm`}
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
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group mt-2"
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

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-card-border"></div>
              <span className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-card-border"></div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const { url } = await api.getGoogleAuthUrl();
                  window.location.href = url;
                } catch (err) {
                  setError("Failed to initialize Google Auth");
                }
              }}
              className="w-full bg-white hover:bg-white/90 text-black font-medium py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-poppins font-medium">Continue with Google</span>
            </button>

            <p className="text-center mt-8 text-foreground/50 font-medium text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary-light font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Branding */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-sidebar relative items-center justify-center overflow-hidden border-l border-card-border pt-32 lg:pt-20">
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
                <div key={i} className="glass p-5 rounded-2xl flex items-center gap-4 reveal active" style={{ transitionDelay: `${i * 100}ms` }}>
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
