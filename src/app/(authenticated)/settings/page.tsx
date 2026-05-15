"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const TABS = ["Profile", "Security", "Billing & credits", "Notifications", "API access", "Danger zone"] as const;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<PasswordForm>();
  const newPassword = watch("newPassword");

  const onPassword = async (data: PasswordForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Current password is incorrect"
          : err instanceof ApiError
            ? err.message
            : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (deleteText !== "DELETE") return;
    setLoading(true);
    try {
      await api.deleteAccount();
      logout();
    } catch {
      alert("Failed to delete account.");
      setLoading(false);
    }
  };

  return (
    <div className="vd-settings">
      <p className="vd-dash-meta">Account</p>
      <h1 className="vd-serif" style={{ fontSize: "clamp(28px, 4vw, 36px)", marginBottom: 8 }}>
        Your <em>settings.</em>
      </h1>
      <p className="vd-verify-lead" style={{ marginBottom: 32 }}>
        Manage your profile, security, and billing.
      </p>

      <div className="vd-settings-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(tab === t && "is-active")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="vd-settings-card">
          <div>
            <h2>Who you are</h2>
            <p className="vd-settings-lead">Optional. PNG or JPG, up to 2 MB.</p>
            <button type="button" className="vd-btn-pill vd-btn-pill-light">
              Upload photo
            </button>
          </div>
          {[
            { label: "Full name", value: user?.name },
            { label: "Organisation", value: user?.organisation },
            { label: "Email", value: user?.email, badge: "Verified" },
          ].map((f) => (
            <div key={f.label} className="vd-settings-field">
              <label>{f.label}</label>
              <div className="vd-settings-field-row">
                <input readOnly value={f.value ?? ""} className="vd-input" />
                {f.badge && <span className="vd-settings-badge">{f.badge}</span>}
              </div>
            </div>
          ))}
          <button type="button" className="vd-btn-pill vd-btn-pill-dark">
            Save changes
          </button>
        </div>
      )}

      {tab === "Security" && (
        <form onSubmit={handleSubmit(onPassword)} className="vd-settings-card">
          <h2>Change password</h2>
          {(["currentPassword", "newPassword", "confirmNewPassword"] as const).map((field, i) => {
            const labels = ["Current password", "New password", "Confirm new"];
            const show =
              i === 0 ? showCurrent : i === 1 ? showNew : i === 2 ? showConfirm : false;
            const setShow =
              i === 0
                ? setShowCurrent
                : i === 1
                  ? setShowNew
                  : i === 2
                    ? setShowConfirm
                    : () => {};
            return (
              <div key={field} className="vd-settings-field">
                <label>{labels[i]}</label>
                <div className="vd-input-wrap">
                  <input
                    {...register(field, {
                      required: "Required",
                      ...(field === "newPassword"
                        ? { minLength: { value: 8, message: "Min 8 characters" } }
                        : {}),
                      ...(field === "confirmNewPassword"
                        ? {
                            validate: (v) => v === newPassword || "Passwords do not match",
                          }
                        : {}),
                    })}
                    type={show ? "text" : "password"}
                    className="vd-input"
                  />
                  <button
                    type="button"
                    className="vd-input-toggle"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors[field] && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fake)" }}>
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            );
          })}
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--forest)" }}>
              <CheckCircle2 size={16} /> Password updated
            </div>
          )}
          {error && <p style={{ fontSize: 14, color: "var(--fake)" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="vd-btn-pill vd-btn-pill-dark"
            style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update password
          </button>
        </form>
      )}

      {tab === "Billing & credits" && (
        <div className="vd-settings-card">
          <p className="vd-settings-lead" style={{ marginBottom: 4 }}>Current balance</p>
          <p style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 600, color: "var(--ink)" }}>
            {user?.credits ?? 0} credits
          </p>
          <p className="vd-settings-lead" style={{ marginBottom: 24 }}>
            ~{user?.credits ?? 0} verifications remaining
          </p>
          <button type="button" className="vd-btn-pill vd-btn-pill-dark">
            Top up via Squad
          </button>
        </div>
      )}

      {tab === "Danger zone" && (
        <div className="vd-settings-card vd-settings-danger">
          <h2>Delete account</h2>
          <p className="vd-settings-lead">
            Permanently delete your account and all verification history.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="vd-btn-pill vd-btn-pill-light"
            style={{ borderColor: "var(--fake)", color: "var(--fake-ink)" }}
          >
            Delete account
          </button>
        </div>
      )}

      {showDelete && (
        <div className="vd-settings-modal-backdrop">
          <div
            className="vd-settings-modal-scrim"
            onClick={() => setShowDelete(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <div className="vd-settings-modal">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="vd-settings-modal-close"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <ShieldAlert size={40} style={{ color: "var(--fake)", marginBottom: 16 }} />
            <h2>Are you sure?</h2>
            <p>Type DELETE to confirm permanent deletion.</p>
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="vd-input"
              style={{ marginBottom: 16, textAlign: "center", fontFamily: "var(--font-mono)" }}
              placeholder="DELETE"
            />
            <button
              type="button"
              onClick={onDelete}
              disabled={deleteText !== "DELETE" || loading}
              className="vd-btn-pill vd-btn-pill-dark"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "var(--fake)",
                opacity: deleteText !== "DELETE" || loading ? 0.5 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
