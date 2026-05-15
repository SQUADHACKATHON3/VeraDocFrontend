/**
 * Payment Callback Page — /credits/callback
 * Handles the redirect from the payment gateway and verifies the transaction.
 * Auth required: Yes
 */
"use client";

/**
 * Squad checkout redirect target.
 *
 * Squad sends the customer's browser here after they finish (or abandon)
 * payment on the hosted checkout page. This page calls
 * `POST /api/credits/purchases/{id}/verify` with the `purchaseId` stored in
 * localStorage by `BuyCreditsModal` — that endpoint asks Squad whether the
 * payment cleared and grants credits if so. It's retried until the purchase
 * settles to `completed`/`failed`, then the pending purchase is cleared.
 *
 * This is the critical fallback: even if the user closed the BuyCreditsModal
 * tab or refreshed the page, landing here will still pick up the pending
 * purchase and wait for it to complete.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import Logo from "@/components/brand/Logo";
import {
  api,
  pendingPurchaseStore,
  tokenStore,
} from "@/lib/api";

// Squad has used a few different names for the reference param over time —
// read all the likely ones so we don't depend on a single spelling.
const REF_PARAMS = [
  "transaction_ref",
  "transactionRef",
  "reference",
  "ref",
  "txn_ref",
];

type Status = "polling" | "success" | "failed" | "no_purchase" | "no_auth";

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("polling");
  const [canClose, setCanClose] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  const reference =
    REF_PARAMS.map((key) => searchParams.get(key)).find(Boolean) ?? null;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Prevent double-firing in React strict mode.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    setCanClose(typeof window !== "undefined" && !!window.opener);

    // Need an auth token to call the purchase status endpoint.
    const token = tokenStore.getAccess();
    if (!token) {
      setStatus("no_auth");
      return;
    }

    // Need a pending purchase to poll.
    const pending = pendingPurchaseStore.get();
    if (!pending) {
      setStatus("no_purchase");
      return;
    }

    // Don't poll a stale purchase (> 30 min).
    const age = Date.now() - new Date(pending.initiatedAt).getTime();
    if (age > 30 * 60 * 1000) {
      pendingPurchaseStore.clear();
      setStatus("no_purchase");
      return;
    }

    // Verify with Squad every 3 seconds until the purchase settles.
    setStatus("polling");

    const poll = async () => {
      try {
        const res = await api.verifyPurchase(pending.purchaseId);
        if (res.status === "completed") {
          stopPolling();
          pendingPurchaseStore.clear();

          if (sessionStorage.getItem("veradoc.isPayAndVerify") === "true") {
            sessionStorage.removeItem("veradoc.isPayAndVerify");
            window.location.href = "/verify?payment=success";
            return;
          }

          setStatus("success");
        } else if (res.status === "failed") {
          stopPolling();
          pendingPurchaseStore.clear();
          setStatus("failed");
        }
        // "pending" → Squad hasn't confirmed yet, keep retrying.
      } catch {
        // Transient error — keep polling.
      }
    };

    // Fire immediately, then every 3s.
    poll();
    pollRef.current = setInterval(poll, 3000);

    return () => stopPolling();
  }, [stopPolling]);

  return (
    <div className="min-h-screen bg-canvas text-foreground font-sans flex items-center justify-center p-6">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface-raised p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-6 text-center">
        <Logo />

        {/* ── Polling / Waiting ── */}
        {status === "polling" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-forest mx-auto" />
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-black">
                Confirming payment
              </h1>
              <p className="text-ink-secondary font-medium text-sm">
                We&apos;re verifying your payment with Squad. This usually takes
                a few seconds. Please don&apos;t close this page.
              </p>
            </div>
            {reference && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Transaction reference
                </p>
                <p className="font-mono text-sm text-ink break-all">
                  {reference}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-black">
                Credits added!
              </h1>
              <p className="text-ink-secondary font-medium text-sm">
                Your payment was confirmed and credits have been deposited to
                your account. You&apos;re good to verify.
              </p>
            </div>
            {reference && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Transaction reference
                </p>
                <p className="font-mono text-sm text-ink break-all">
                  {reference}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-black">
                Payment didn&apos;t go through
              </h1>
              <p className="text-ink-secondary font-medium text-sm">
                The payment was not confirmed. No credits were deducted. You can
                try again from the dashboard.
              </p>
            </div>
          </>
        )}

        {/* ── No pending purchase found ── */}
        {status === "no_purchase" && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-black">
                Payment received
              </h1>
              <p className="text-ink-secondary font-medium text-sm">
                Your credits should appear automatically in your account. Head
                back to the dashboard to check your balance.
              </p>
            </div>
            {reference && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Transaction reference
                </p>
                <p className="font-mono text-sm text-ink break-all">
                  {reference}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Not authenticated ── */}
        {status === "no_auth" && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-black">
                Session expired
              </h1>
              <p className="text-ink-secondary font-medium text-sm">
                Please log in again to verify your payment. Your credits will be
                deposited automatically once the payment is confirmed.
              </p>
            </div>
          </>
        )}

        {/* ── Actions ── */}
        <div className="space-y-3 pt-2">
          {canClose && status !== "polling" && (
            <button
              type="button"
              onClick={() => window.close()}
              className="w-full bg-forest hover:bg-forest-mid text-ink font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Close this tab
            </button>
          )}
          <Link
            href={status === "no_auth" ? "/auth/login" : "/dashboard"}
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 ${
              canClose && status !== "polling"
                ? "text-foreground/40 hover:text-ink"
                : "bg-forest hover:bg-forest-mid text-ink hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {status === "no_auth" ? "Log in" : "Back to VeraDoc"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreditsCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
