"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthAside from "@/components/auth/AuthAside";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

type LoginForm = { email: string; password: string };

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const me = await login(data.email, data.password);
      router.push(me.emailVerified ? "/dashboard" : "/auth/verify-email");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password"
          : "An unexpected error occurred. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="vd vd-auth">
      <main className="vd-auth-main">
        <div className="vd-auth-form">
          <p className="vd-auth-kicker">Welcome back</p>
          <h1 className="vd-auth-title">
            Sign in to <em>continue verifying.</em>
          </h1>

          <p className="vd-auth-switch">
            New here? <Link href="/auth/register">Create an account →</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="vd-field">
              <label className="vd-field-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`vd-input${errors.email ? " vd-input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="vd-field-error">{errors.email.message}</p>
              )}
            </div>

            <div className="vd-field">
              <div className="vd-field-row">
                <label className="vd-field-label" htmlFor="password">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="vd-auth-forgot">
                  Forgot password?
                </Link>
              </div>
              <div className="vd-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`vd-input${errors.password ? " vd-input-error" : ""}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="vd-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="vd-field-error">{errors.password.message}</p>
              )}
            </div>

            {error && <div className="vd-auth-error">{error}</div>}

            <button
              type="submit"
              className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="vd-auth-divider">
            <span>or</span>
          </div>

          <GoogleSignInButton disabled={isLoading} onError={setError} />
        </div>
      </main>

      <AuthAside />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="vd vd-auth" style={{ minHeight: "100vh", placeItems: "center" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--forest)" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
