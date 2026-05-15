"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthAside from "@/components/auth/AuthAside";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type LoginForm = { email: string; password: string };

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

          <button
            type="button"
            className="vd-btn-pill vd-btn-pill-light vd-btn-pill--full"
            onClick={async () => {
              try {
                const { url } = await api.getGoogleAuthUrl();
                window.location.href = url;
              } catch {
                setError("Failed to initialize Google Auth");
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </main>

      <AuthAside />
    </div>
  );
}
