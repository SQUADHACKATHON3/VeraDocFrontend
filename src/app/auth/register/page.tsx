"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import AuthAside from "@/components/auth/AuthAside";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

type RegisterForm = {
  fullName: string;
  organisation: string;
  email: string;
  password: string;
  role: string;
  roleOther: string;
  agree: boolean;
};

const OTHER_ROLE = "Other";

const ROLES = [
  "HR officer",
  "University admin",
  "Recruitment agency",
  "Embassy / visa",
  OTHER_ROLE,
] as const;

function passwordStrengthLevel(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  return score;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register: signUp } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { role: ROLES[0], roleOther: "", agree: false },
  });

  const password = watch("password") ?? "";
  const selectedRole = watch("role");
  const isOtherRole = selectedRole === OTHER_ROLE;
  const strength = passwordStrengthLevel(password);

  const selectRole = (role: (typeof ROLES)[number]) => {
    setValue("role", role, { shouldValidate: true });
    if (role !== OTHER_ROLE) {
      setValue("roleOther", "", { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!data.agree) {
      setError("Please accept the terms to continue.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { devOtp } = await signUp({
        name: data.fullName,
        organisation: data.organisation,
        email: data.email,
        password: data.password,
      });
      if (devOtp && typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("veradoc.devOtp", devOtp);
      }
      router.push("/auth/verify-email");
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
    <div className="vd vd-auth vd-auth--register">
      <AuthAside />

      <main className="vd-auth-main">
        <div className="vd-auth-form vd-auth-form--register">
          <p className="vd-auth-kicker">Create your account</p>
          <h1 className="vd-auth-title">
            Start verifying in <em>under a minute.</em>
          </h1>

          <p className="vd-auth-switch">
            Already have one? <Link href="/auth/login">Sign in →</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="vd-auth-field-row-2">
              <div className="vd-field">
                <label className="vd-field-label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  disabled={isLoading}
                  placeholder="Adebayo Okonkwo"
                  className={`vd-input${errors.fullName ? " vd-input-error" : ""}`}
                  {...register("fullName", { required: "Full name is required" })}
                />
                {errors.fullName && (
                  <p className="vd-field-error">{errors.fullName.message}</p>
                )}
              </div>
              <div className="vd-field">
                <label className="vd-field-label" htmlFor="organisation">
                  Organisation
                </label>
                <input
                  id="organisation"
                  disabled={isLoading}
                  placeholder="Eko HR Partners"
                  className={`vd-input${errors.organisation ? " vd-input-error" : ""}`}
                  {...register("organisation", { required: "Organisation is required" })}
                />
                {errors.organisation && (
                  <p className="vd-field-error">{errors.organisation.message}</p>
                )}
              </div>
            </div>

            <div className="vd-field">
              <label className="vd-field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                placeholder="adebayo@ekohr.ng"
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

            <div>
              <span className="vd-role-label">I verify documents as a…</span>
              <input type="hidden" {...register("role", { required: true })} />
              <div className="vd-role-pills" role="group" aria-label="Your role">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`vd-role-pill${selectedRole === role ? " active" : ""}`}
                    disabled={isLoading}
                    onClick={() => selectRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {isOtherRole && (
                <div className="vd-field vd-role-other">
                  <label className="vd-field-label" htmlFor="roleOther">
                    Your role
                  </label>
                  <input
                    id="roleOther"
                    disabled={isLoading}
                    placeholder="e.g. Compliance officer"
                    className={`vd-input${errors.roleOther ? " vd-input-error" : ""}`}
                    autoFocus
                    {...register("roleOther", {
                      validate: (value, formValues) =>
                        formValues.role === OTHER_ROLE && !value?.trim()
                          ? "Please describe your role"
                          : true,
                    })}
                  />
                  {errors.roleOther && (
                    <p className="vd-field-error">{errors.roleOther.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="vd-field">
              <label className="vd-field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                placeholder="At least 10 characters"
                className={`vd-input${errors.password ? " vd-input-error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 10, message: "Minimum 10 characters" },
                })}
              />
              <div
                className="vd-password-strength"
                data-level={strength}
                aria-hidden
              >
                <span />
                <span />
                <span />
              </div>
              {errors.password && (
                <p className="vd-field-error">{errors.password.message}</p>
              )}
            </div>

            <label className="vd-auth-checkbox">
              <input
                type="checkbox"
                disabled={isLoading}
                {...register("agree", { required: true })}
              />
              <span>
                I agree to the <Link href="#">Terms</Link> and{" "}
                <Link href="#">Privacy Policy</Link>. I understand verifications are
                AI-screened, not legally binding.
              </span>
            </label>

            {error && <div className="vd-auth-error">{error}</div>}

            <button
              type="submit"
              className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
