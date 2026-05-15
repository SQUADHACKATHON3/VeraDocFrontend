"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, formatNaira, pendingPurchaseStore, type VerificationStatusOut } from "@/lib/api";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { formatVerdict, verdictPillClass } from "@/lib/verdict";
import { idbStore } from "@/lib/idb";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const MAX = 5 * 1024 * 1024;

const CHECKS = [
  "Font consistency across all pages",
  "Seal & watermark integrity",
  "Layout, alignment and spacing anomalies",
  "Text-layer tampering signals",
  "Date format & logical consistency",
  "Institution name & official formatting",
  "Signature presence and placement",
];

const FORENSIC_CHECKS = [
  "Font consistency",
  "Seal & watermark integrity",
  "Layout & spacing analysis",
  "Text-layer tamper signals",
  "Date format validation",
  "Institution name matching",
  "Signature placement",
];

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "01 · Upload" },
  { id: 2, label: "02 · Pay" },
  { id: 3, label: "03 · Verify" },
] as const;

function stepIndicatorState(phase: 1 | 2 | 3, n: number): string {
  if (phase >= 3) {
    if (n < 3) return "done";
    if (n === 3) return "active";
    return "";
  }
  if (phase === 2) {
    if (n === 1) return "done";
    if (n === 2) return "active";
    return "";
  }
  if (phase === 1 && n === 1) return "active";
  return "";
}

export default function VerifyPage() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [vid, setVid] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationStatusOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkIdx, setCheckIdx] = useState(0);
  const [showBuy, setShowBuy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const credits = user?.credits ?? 0;

  useEffect(() => {
    if (file && step === 1) setStep(2);
    if (!file && step === 2) setStep(1);
  }, [file, step]);

  useEffect(() => {
    const resume = async () => {
      const pendingFile = await idbStore.getFile();
      if (pendingFile) {
        setFile(pendingFile);
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") === "success") {
          // Wait a beat for the backend to sync credits, then refresh user
          await new Promise(r => setTimeout(r, 1000));
          await refreshUser();
          start(pendingFile);
          
          // Clean up URL so we don't re-trigger on refresh
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    };
    resume();
  }, []);

  useEffect(() => {
    if (step !== 3 || !vid) return;
    const tick = setInterval(
      () => setCheckIdx((i) => Math.min(i + 1, FORENSIC_CHECKS.length)),
      1200
    );
    const poll = setInterval(async () => {
      try {
        const d = await api.getVerificationStatus(vid);
        if (d.status === "complete") {
          setResult(d);
          setStep(4);
        } else if (d.status === "error") {
          setError("Analysis failed. Your credit has been refunded.");
        }
      } catch {
        /* retry */
      }
    }, 3000);
    const timeout = setTimeout(
      () => setError("Analysis timed out. Check history shortly."),
      60000
    );
    return () => {
      clearInterval(tick);
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [step, vid]);

  const pick = (f: File) => {
    if (f.size === 0) return setError("The selected file is empty.");
    if (f.size > MAX) return setError("File exceeds 5 MB.");
    if (!ALLOWED.includes(f.type)) return setError("PDF, JPG, or PNG only.");
    setError(null);
    setFile(f);
  };

  const start = async (f?: File) => {
    let targetFile = f || file;
    if (!targetFile) return;

    // Reconstruct File object if it's not a proper File instance (e.g. after IDB retrieval)
    if (!((targetFile as any) instanceof File)) {
      console.log("Reconstructing file object...", targetFile);
      const _f = targetFile as any;
      const blobData = _f instanceof Blob ? _f : new Blob([_f]);
      targetFile = new File([blobData], _f.name || "document.pdf", {
        type: _f.type || "application/pdf",
      });
    }

    if (targetFile.size === 0) {
      return setError("Could not read file data. Please re-upload the document.");
    }

    setBusy(true);
    setError(null);
    try {
      const res = await api.initiateVerification(targetFile);
      setVid(res.verificationId);
      await refreshUser();
      await idbStore.clearFile();
      setCheckIdx(0);
      setStep(3);
    } catch (err) {
      console.error("Verification failed:", err);
      if (err instanceof ApiError && err.status === 402) {
        setShowBuy(true);
      } else {
        const size = targetFile ? (targetFile.size / 1024 / 1024).toFixed(2) : "unknown";
        const msg = err instanceof ApiError ? err.message : `Could not start verification (${size} MB). Please try again.`;
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const payAndVerify = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await idbStore.setFile(file);
      const res = await api.initiatePurchase(1);
      pendingPurchaseStore.set({
        purchaseId: res.purchaseId,
        credits: 1,
        initiatedAt: new Date().toISOString(),
      });
      sessionStorage.setItem("veradoc.isPayAndVerify", "true");
      window.location.href = res.checkoutUrl;
    } catch (err) {
      setError("Could not initiate payment. Please try again.");
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setVid(null);
    setResult(null);
    setError(null);
    setCheckIdx(0);
  };

  const getStepState = (n: number) => {
    if (step >= 3) return stepIndicatorState(3, n);
    return stepIndicatorState(file ? 2 : 1, n);
  };

  return (
    <div className="vd-verify-page">
      {step < 3 && (
        <div className="vd-verify-steps">
          {STEPS.map((s) => (
            <span key={s.id} className={getStepState(s.id)}>
              {s.label}
            </span>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="vd-analyse">
          <div className="vd-scan-stage" aria-hidden>
            <div className="vd-scan-frame">
              <div className="vd-scan-corners">
                <span className="tl" />
                <span className="tr" />
                <span className="bl" />
                <span className="br" />
              </div>
              <div className="vd-scan-doc">
                <div className="vd-scan-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="vd-scan-beam" />
              </div>
            </div>
          </div>

          <p className="vd-analyse-kicker">STEP 03 OF 03</p>
          <h1 className="vd-verify-title">
            Analysing the <em>document.</em>
          </h1>
          <p className="vd-verify-lead">
            We&apos;re running seven forensic checks via the vision model. This usually
            takes under ten seconds.
          </p>

          <ul className="vd-check-rows">
            {FORENSIC_CHECKS.map((label, i) => {
              const done = checkIdx > i;
              const active = checkIdx === i;
              const state = done ? "done" : active ? "active" : "queued";
              return (
                <li key={label} className={`vd-check-row vd-check-row--${state}`}>
                  <span className={`vd-check-icon vd-check-icon--${state}`}>
                    {done && <Check size={12} strokeWidth={2.5} />}
                  </span>
                  <span className="vd-check-label">{label}</span>
                  <span className="vd-check-status">
                    {done ? "OK" : active ? "analysing…" : "queued"}
                  </span>
                </li>
              );
            })}
          </ul>
          {error && (
            <div className="vd-verify-error" style={{ marginTop: 20, textAlign: "left" }}>
              {error}
              <button
                type="button"
                onClick={reset}
                style={{
                  display: "block",
                  marginTop: 8,
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {step === 4 && result && vid && (
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <span className={verdictPillClass(result.verdict)} style={{ marginBottom: 16 }}>
            {formatVerdict(result.verdict)}
          </span>
          <p className="vd-verify-title" style={{ fontSize: 56, marginBottom: 8 }}>
            {result.trustScore ?? "—"}
          </p>
          <p className="vd-eyebrow">Trust score</p>
          {result.summary && (
            <p className="vd-verify-lead" style={{ margin: "16px 0" }}>
              {result.summary}
            </p>
          )}
          <Link
            href={`/verify/${vid}`}
            className="vd-btn-pill vd-btn-pill-dark vd-btn-pill--full"
            style={{ marginBottom: 12 }}
          >
            View full report
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={reset}
            className="vd-btn-ghost"
            style={{ width: "100%" }}
          >
            Run another
          </button>
        </div>
      )}

      {(step === 1 || step === 2) && (
        <>
          <header className="vd-upload-header">
            <h1 className="vd-verify-title">
              Upload your <em>document.</em>
            </h1>
            <p className="vd-verify-lead">
              We&apos;ll analyse it for tampering, forgery and authenticity signals. One
              credit per document. PDF, JPG, PNG · up to 5 MB
            </p>
          </header>

          <div className="vd-upload-grid">
            <div className="vd-upload-main">
            {!file ? (
              <div
                className={`vd-dropzone${drag ? " drag" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const f = e.dataTransfer.files[0];
                  if (f) pick(f);
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) pick(f);
                  }}
                />
                <div className="vd-dropzone-corners" aria-hidden>
                  <span className="tl" />
                  <span className="tr" />
                  <span className="bl" />
                  <span className="br" />
                </div>
                <div className="vd-dropzone-icon">
                  <Upload size={22} strokeWidth={1.5} />
                </div>
                <p className="vd-dropzone-title">Drag and drop your file</p>
                <p className="vd-dropzone-browse">
                  or <span>click to browse</span>
                </p>
                <p className="vd-dropzone-foot">PDF · JPG · PNG · 5 MB MAX</p>
              </div>
            ) : (
              <div className="vd-file-ready">
                <div className="vd-file-ready-header">
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <FileText size={24} style={{ color: "var(--forest)", flexShrink: 0 }} />
                    <div>
                      <p
                        className="vd-eyebrow"
                        style={{ color: "var(--forest)", marginBottom: 4 }}
                      >
                        File ready
                      </p>
                      <p style={{ fontWeight: 500, margin: 0 }}>{file.name}</p>
                      <p
                        className="vd-mono"
                        style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}
                      >
                        {(file.size / 1024 / 1024).toFixed(1)} MB · uploaded now
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="vd-eyebrow" style={{ marginBottom: 8 }}>
                  What we&apos;ll check
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {CHECKS.map((c) => (
                    <li
                      key={c}
                      style={{
                        display: "flex",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--ink-2)",
                        marginBottom: 6,
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        style={{ color: "var(--forest)", marginTop: 2, flexShrink: 0 }}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="vd-verify-error">
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            </div>

          <aside className="vd-order-panel">
            <p className="vd-eyebrow">Order</p>
            <div className="vd-order-line">
              <div>
                <h3>1 verification</h3>
                <p>~8 seconds · 1 credit</p>
              </div>
              <span className="vd-order-price">{formatNaira(70000)}</span>
            </div>
            <div className="vd-order-credits">
              <div className="vd-order-credits-row">
                <span>Credit balance</span>
                <span>{credits} credits</span>
              </div>
              <div className="vd-order-credits-row">
                <span>After verification</span>
                <span>{Math.max(0, credits - 1)} credits</span>
              </div>
            </div>

            {credits < 1 ? (
              <>
                <button
                  type="button"
                  className="vd-btn-pay"
                  onClick={() => setShowBuy(true)}
                >
                  Top up to verify
                </button>
                <button
                  type="button"
                  className="vd-btn-credit-alt"
                  disabled={!file || busy}
                  onClick={payAndVerify}
                >
                  Pay per verification
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="vd-btn-pay"
                  disabled={!file || busy}
                  onClick={() => start()}
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      Use 1 credit to verify
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="vd-btn-credit-alt"
                  disabled={!file || busy}
                  onClick={payAndVerify}
                >
                  Pay per verification instead
                </button>
              </>
            )}

            <p className="vd-order-note">
              Documents are encrypted in transit and at rest. Files are not used for AI
              training.
            </p>
          </aside>
          </div>
        </>
      )}

      <BuyCreditsModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        onPurchased={() => refreshUser()}
      />
    </div>
  );
}
