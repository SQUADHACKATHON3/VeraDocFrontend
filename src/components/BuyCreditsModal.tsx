"use client";

/**
 * Credits purchase flow (Squad checkout).
 *
 *   pick a pack -> POST /api/credits/purchase/initiate -> open checkoutUrl
 *   -> poll GET /api/credits/purchases/{id} until completed/failed
 *   -> refresh the user's balance.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { api, formatNaira, ApiError, pendingPurchaseStore, type CreditPack } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called once credits land on the account. */
  onPurchased?: () => void;
};

type Phase = "select" | "awaiting" | "done" | "error";

export default function BuyCreditsModal({ open, onClose, onPurchased }: Props) {
  const { refreshUser } = useAuth();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resume polling for a pending purchase that survived a page refresh / tab switch.
  const resumePendingPurchase = useCallback(
    (purchaseId: string) => {
      setPhase("awaiting");
      pollRef.current = setInterval(async () => {
        try {
          const status = await api.getPurchaseStatus(purchaseId);
          if (status.status === "completed") {
            stopPolling();
            pendingPurchaseStore.clear();
            await refreshUser();
            setPhase("done");
            onPurchased?.();
          } else if (status.status === "failed") {
            stopPolling();
            pendingPurchaseStore.clear();
            setError("Payment failed or was cancelled.");
            setPhase("error");
          }
        } catch {
          /* transient — keep polling */
        }
      }, 3000);
    },
    [refreshUser, onPurchased]
  );

  // Load the pack catalogue when the modal opens, and check for pending purchase.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected(null);

    // If there's a pending purchase less than 30 minutes old, resume polling.
    const pending = pendingPurchaseStore.get();
    if (pending) {
      const age = Date.now() - new Date(pending.initiatedAt).getTime();
      if (age < 30 * 60 * 1000) {
        resumePendingPurchase(pending.purchaseId);
        return;
      }
      // Stale — clear it.
      pendingPurchaseStore.clear();
    }

    setPhase("select");
    api
      .getCreditPacks()
      .then((res) => {
        setPacks(res.packs);
        setSelected(res.packs[0]?.credits ?? null);
      })
      .catch(() => setError("Couldn't load credit packs. Try again."));
  }, [open, resumePendingPurchase]);

  // Clear any active poll on close/unmount.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleClose = useCallback(() => {
    stopPolling();
    onClose();
  }, [onClose]);

  const startPurchase = async () => {
    if (selected == null) return;
    setIsInitiating(true);
    setError(null);
    try {
      const res = await api.initiatePurchase(selected);

      // Persist so the callback page / a refresh can resume polling.
      pendingPurchaseStore.set({
        purchaseId: res.purchaseId,
        credits: res.credits,
        initiatedAt: new Date().toISOString(),
      });

      window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");

      // Start polling (reuses the same resilient helper).
      resumePendingPurchase(res.purchaseId);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't start the purchase."
      );
    } finally {
      setIsInitiating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-dark-bg/80"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md glass p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sharp space-y-6">
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 sm:right-8 sm:top-8 p-2 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {phase === "select" && (
          <>
            <div className="space-y-2">
              <h2 className="text-3xl font-heading font-black">Buy credits</h2>
              <p className="text-foreground/50 font-medium text-sm">
                Each verification uses 1 credit. Pick a pack to top up.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {packs.map((pack) => {
                const isActive = selected === pack.credits;
                return (
                  <button
                    key={pack.credits}
                    onClick={() => setSelected(pack.credits)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isActive
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-card-border hover:border-primary"
                    }`}
                  >
                    <p className="text-2xl font-heading font-black text-white">
                      {pack.credits}
                      <span className="text-sm font-bold text-foreground/40">
                        {" "}
                        {pack.credits === 1 ? "credit" : "credits"}
                      </span>
                    </p>
                    <p className="text-sm font-bold text-primary-light mt-1">
                      {formatNaira(pack.amountKobo)}
                    </p>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              onClick={startPurchase}
              disabled={selected == null || isInitiating}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  Pay with Squad <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {phase === "awaiting" && (
          <div className="text-center space-y-6 py-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-black">
                Waiting for payment
              </h2>
              <p className="text-foreground/50 font-medium text-sm">
                Complete the payment in the Squad tab. Your credits appear here
                automatically once it clears.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-foreground/40 hover:text-white font-bold text-sm transition-colors"
            >
              I'll do this later
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-black">
                Credits added
              </h2>
              <p className="text-foreground/50 font-medium text-sm">
                Your balance has been topped up. You're good to verify.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl transition-all"
            >
              Done
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-black">
                Payment didn't go through
              </h2>
              <p className="text-foreground/50 font-medium text-sm">
                {error}
              </p>
            </div>
            <button
              onClick={() => setPhase("select")}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
