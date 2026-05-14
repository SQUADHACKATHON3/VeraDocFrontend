"use client";

/**
 * Squad checkout redirect target.
 *
 * Squad sends the customer's browser here after they finish (or abandon)
 * payment on the hosted checkout page, appending the transaction reference
 * as a query param. This route does NOT settle the purchase — that happens
 * server-side via the Squad webhook, and the tab that opened checkout is
 * already polling `GET /api/credits/purchases/{id}` for the result.
 *
 * So this page is purely a confirmation screen: reassure the user, surface
 * the reference, and send them back to the app (or close the tab).
 *
 * Configured on the backend as the checkout `callback_url`.
 */

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Shield, ArrowRight } from "lucide-react";

// Squad has used a few different names for the reference param over time —
// read all the likely ones so we don't depend on a single spelling.
const REF_PARAMS = [
  "transaction_ref",
  "transactionRef",
  "reference",
  "ref",
  "txn_ref",
];

function CallbackContent() {
  const searchParams = useSearchParams();
  const [canClose, setCanClose] = useState(false);

  const reference =
    REF_PARAMS.map((key) => searchParams.get(key)).find(Boolean) ?? null;

  // window.close() only works for tabs opened by script (the checkout tab
  // was opened via window.open from BuyCreditsModal). If it fails, we fall
  // back to the "Back to VeraDoc" link below.
  useEffect(() => {
    setCanClose(typeof window !== "undefined" && !!window.opener);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans flex items-center justify-center p-6">
      <div className="relative w-full max-w-md glass p-8 md:p-10 rounded-[3rem] border-white/10 shadow-2xl space-y-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/40 hover:text-white transition-colors"
        >
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-heading font-extrabold tracking-tight">
            VeraDoc
          </span>
        </Link>

        <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black">Payment received</h1>
          <p className="text-foreground/50 font-medium text-sm">
            We&apos;re confirming your payment with Squad now. Your credits
            appear automatically in the tab you started from — no need to do
            anything here.
          </p>
        </div>

        {reference && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Transaction reference
            </p>
            <p className="font-mono text-sm text-white break-all">
              {reference}
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {canClose && (
            <button
              type="button"
              onClick={() => window.close()}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Close this tab
            </button>
          )}
          <Link
            href="/dashboard"
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 ${
              canClose
                ? "text-foreground/40 hover:text-white"
                : "bg-primary hover:bg-primary-light text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            Back to VeraDoc <ArrowRight className="w-4 h-4" />
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
