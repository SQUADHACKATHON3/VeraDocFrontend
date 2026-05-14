"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Building2,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Coins,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>();

  const newPassword = watch("newPassword");

  const onUpdatePassword = async (data: PasswordForm) => {
    setIsLoading(true);
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
      if (err instanceof ApiError && err.status === 401) {
        setError("Current password is incorrect");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsLoading(true);
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      alert("Failed to delete account. Please contact support.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto p-6 md:p-10 lg:pt-20 space-y-10 pb-32">
      {/* Header */}
      <header className="reveal active">
        <h1 className="text-4xl font-heading font-black mb-2">Account Settings</h1>
        <p className="text-foreground/50 font-medium">Manage your profile and account preferences.</p>
      </header>

      {/* Section 1: Profile Information */}
      <section className="space-y-4 reveal active" style={{ transitionDelay: "100ms" }}>
        <div className="glass p-8 rounded-[2.5rem] space-y-6">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Profile</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-foreground/20">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Full Name</p>
                <p className="font-bold text-white text-lg">{user?.name || "---"}</p>
              </div>
            </div>

            <div className="h-px bg-card-border"></div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-foreground/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Organisation</p>
                <p className="font-bold text-white text-lg">{user?.organisation || "---"}</p>
              </div>
            </div>

            <div className="h-px bg-card-border"></div>

            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-foreground/20">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-white text-lg">{user?.email || "---"}</p>
                </div>
              </div>
              <span className="bg-white/5 text-foreground/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/5 whitespace-nowrap">
                Cannot be changed
              </span>
            </div>

            <div className="h-px bg-card-border"></div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Credit Balance</p>
                <p className="font-bold text-white text-lg">
                  {user?.credits ?? 0} {user?.credits === 1 ? "credit" : "credits"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Change Password */}
      <section className="space-y-4 reveal active" style={{ transitionDelay: "200ms" }}>
        <div className="glass p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-8">Security</p>
          
          <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Current Password</label>
              <div className="relative">
                <input
                  {...register("currentPassword", { required: "Current password is required" })}
                  type={showCurrent ? "text" : "password"}
                  disabled={isLoading}
                  className={`w-full bg-card border ${errors.currentPassword || error?.includes("Current") ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium text-sm`}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {(errors.currentPassword || (error && error.includes("Current"))) && (
                <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.currentPassword?.message || error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">New Password</label>
                <div className="relative">
                  <input
                    {...register("newPassword", { 
                      required: "New password required",
                      minLength: { value: 8, message: "Minimum 8 characters" }
                    })}
                    type={showNew ? "text" : "password"}
                    disabled={isLoading}
                    className={`w-full bg-card border ${errors.newPassword ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium text-sm`}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">Confirm New</label>
                <div className="relative">
                  <input
                    {...register("confirmNewPassword", { 
                      required: "Please confirm",
                      validate: value => value === newPassword || "Passwords do not match"
                    })}
                    type={showConfirm ? "text" : "password"}
                    disabled={isLoading}
                    className={`w-full bg-card border ${errors.confirmNewPassword ? 'border-red-500' : 'border-card-border'} focus:border-primary rounded-2xl px-5 py-4 outline-none transition-all font-medium text-sm`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmNewPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmNewPassword.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Password updated successfully
                </div>
              )}
              {error && !error.includes("Current") && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold mb-4">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Section 3: Danger Zone */}
      <section className="space-y-4 reveal active" style={{ transitionDelay: "300ms" }}>
        <div className="glass p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-6">Danger Zone</p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-foreground/40 leading-relaxed text-center md:text-left">
              Permanently delete your account and all verification history. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-8 py-3 rounded-xl border border-[#DC2626] text-[#DC2626] font-bold text-xs hover:bg-[#DC2626] hover:text-white transition-all whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10">
          <div className="absolute inset-0 bg-dark-bg/80" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative w-full max-w-md glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sharp space-y-8 reveal active">
            <button type="button" aria-label="Close" onClick={() => setShowDeleteModal(false)} className="absolute right-6 top-6 sm:right-8 sm:top-8 p-2 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black">Are you sure?</h2>
              <p className="text-foreground/50 font-medium leading-relaxed">
                This will permanently delete your account and all associated verification data.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">
                Type <span className="text-white">DELETE</span> to confirm
              </label>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-card border border-card-border focus:border-red-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold text-center tracking-widest text-white placeholder:text-white/10"
                placeholder="DELETE"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isLoading}
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-red-500/20 text-white font-bold py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Delete Account
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full text-foreground/40 hover:text-white font-bold py-2 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
