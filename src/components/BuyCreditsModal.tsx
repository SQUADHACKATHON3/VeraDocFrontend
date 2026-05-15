"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import {
  api,
  formatNaira,
  ApiError,
  pendingPurchaseStore,
  type CreditPack,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
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

  const resumePendingPurchase = useCallback(
    (purchaseId: string) => {
      setPhase("awaiting");
      pollRef.current = setInterval(async () => {
        try {
          const status = await api.verifyPurchase(purchaseId);
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
          /* keep polling */
        }
      }, 3000);
    },
    [refreshUser, onPurchased]
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected(null);

    const pending = pendingPurchaseStore.get();
    if (pending) {
      const age = Date.now() - new Date(pending.initiatedAt).getTime();
      if (age < 30 * 60 * 1000) {
        resumePendingPurchase(pending.purchaseId);
        return;
      }
      pendingPurchaseStore.clear();
    }

    setPhase("select");
    api
      .getCreditPacks()
      .then((res) => {
        setPacks(res.packs);
        const best = res.packs.find((p) => p.credits === 20) ?? res.packs[0];
        setSelected(best?.credits ?? null);
      })
      .catch(() => setError("Couldn't load credit packs. Try again."));
  }, [open, resumePendingPurchase]);

  useEffect(() => () => stopPolling(), []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  const startPurchase = async () => {
    if (selected == null) return;
    setIsInitiating(true);
    setError(null);
    try {
      const res = await api.initiatePurchase(selected);
      pendingPurchaseStore.set({
        purchaseId: res.purchaseId,
        credits: res.credits,
        initiatedAt: new Date().toISOString(),
      });
      window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
      resumePendingPurchase(res.purchaseId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the purchase.");
    } finally {
      setIsInitiating(false);
    }
  };

  const selectedPack = packs.find((p) => p.credits === selected);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface-raised p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {phase === "select" && (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted mb-1">
              Top up · Squad
            </p>
            <h2 className="text-2xl font-semibold text-ink mb-2">Buy credits</h2>
            <p className="text-sm text-ink-secondary mb-6">
              Each verification uses one credit. Pick a pack to top up.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {packs.map((pack) => {
                const active = selected === pack.credits;
                const isBest = pack.credits === 20;
                return (
                  <button
                    key={pack.credits}
                    type="button"
                    onClick={() => setSelected(pack.credits)}
                    className={cn(
                      "relative rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-forest bg-forest-light/40"
                        : "border-border bg-surface hover:border-forest/30"
                    )}
                  >
                    {isBest && (
                      <span className="absolute -top-2 left-3 rounded-full bg-forest px-2 py-0.5 text-[9px] font-medium uppercase text-surface-raised">
                        Best value
                      </span>
                    )}
                    <p className="text-2xl font-semibold text-ink">
                      {pack.credits}
                      <span className="text-sm font-normal text-ink-muted ml-1">
                        {pack.credits === 1 ? "credit" : "credits"}
                      </span>
                    </p>
                    <p className="text-sm font-medium text-forest mt-1">
                      {formatNaira(pack.amountKobo)}
                    </p>
                    {isBest && (
                      <p className="text-[10px] text-ink-muted mt-1">30% off per verification</p>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-ink-muted text-center mb-4">
              Processed securely by <strong className="text-ink">Squad</strong>. We never see your
              card details.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent text-center">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={startPurchase}
              disabled={selected == null || isInitiating}
              className="w-full rounded-xl bg-forest py-3.5 text-sm font-medium text-surface-raised hover:bg-forest-mid disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  Pay {selectedPack ? formatNaira(selectedPack.amountKobo) : ""} with Squad
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {phase === "awaiting" && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-forest mx-auto" />
            <h2 className="text-xl font-semibold">Waiting for payment</h2>
            <p className="text-sm text-ink-secondary">
              Complete the payment in the Squad tab. Credits appear here automatically.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-ink-muted hover:text-forest"
            >
              I&apos;ll do this later
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-forest mx-auto" />
            <h2 className="text-xl font-semibold">Credits added</h2>
            <p className="text-sm text-ink-secondary">Your balance has been topped up.</p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl bg-forest py-3 text-sm font-medium text-surface-raised"
            >
              Done
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center py-8 space-y-4">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto" />
            <h2 className="text-xl font-semibold">Payment didn&apos;t go through</h2>
            <p className="text-sm text-ink-secondary">{error}</p>
            <button
              type="button"
              onClick={() => setPhase("select")}
              className="w-full rounded-xl bg-forest py-3 text-sm font-medium text-surface-raised"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
