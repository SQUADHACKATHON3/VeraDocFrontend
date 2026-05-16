"use client";

import { useState, useEffect } from "react";
import { Loader2, Building2, User, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onComplete: () => void;
};

export default function OnboardingModal({ open, onComplete }: Props) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setOrganisation(user.organisation || "");
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organisation.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.updateProfile({ name, organisation });
      await refreshUser();
      onComplete();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Background Scrim */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Visual Header */}
        <div className="bg-forest px-6 py-8 text-center text-surface-raised">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised/20">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="vd-serif text-2xl">Welcome to VeraDoc</h2>
          <p className="mt-2 text-sm text-surface-raised/80">
            Let&apos;s get your profile set up so you can start verifying.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Kiel"
                  className="vd-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="organisation" className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Organisation
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="organisation"
                  type="text"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. VeraDoc Inc."
                  className="vd-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-accent/20 bg-accent-soft p-3 text-sm text-accent animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-4 text-sm font-semibold text-surface-raised transition-all hover:bg-forest-mid disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete setup
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-ink-muted">
            You can always update these details later in your settings.
          </p>
        </form>
      </div>
    </div>
  );
}
