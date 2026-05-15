"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Info,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type VerificationDetail } from "@/lib/api";
import { formatVerdict, forensicVerdictModifier } from "@/lib/verdict";
import ForensicDetailSkeleton from "@/components/skeletons/ForensicDetailSkeleton";

const FORENSIC_SIGNAL_COUNT = 8;

function TrustGauge({ score }: { score: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="vd-forensic-gauge-ring">
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle
          className="vd-gauge-track"
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="7"
        />
        <circle
          className="vd-gauge-progress"
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="vd-forensic-gauge-center">
        <span className="vd-forensic-gauge-value">{clamped}</span>
        <span className="vd-forensic-gauge-label">Trust score</span>
      </div>
    </div>
  );
}

export default function VerificationResultPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const fromHistory = searchParams.get("from") === "history";
  const [data, setData] = useState<VerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const result = await api.getVerification(id);
        setData(result);
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 403)
        ) {
          router.push("/history");
          return;
        }
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id, router]);

  const copyOutreach = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isLoading) {
    return <ForensicDetailSkeleton />;
  }

  if (!data) return null;

  if (data.status !== "complete" || !data.verdict) {
    return (
      <div className="vd-forensic">
        <div className="vd-card" style={{ padding: 48, textAlign: "center" }}>
          {data.status === "error" ? (
            <>
              <XCircle
                size={40}
                style={{ color: "var(--fake)", margin: "0 auto 16px" }}
              />
              <h1 className="vd-verify-title" style={{ fontSize: 28 }}>
                Analysis failed
              </h1>
              <p className="vd-verify-lead" style={{ margin: "12px auto 24px" }}>
                Something went wrong analyzing{" "}
                <strong>{data.documentName}</strong>. Please contact support.
              </p>
            </>
          ) : (
            <>
              <Loader2
                size={40}
                className="animate-spin"
                style={{ color: "var(--forest)", margin: "0 auto 16px" }}
              />
              <h1 className="vd-verify-title" style={{ fontSize: 28 }}>
                Still analysing
              </h1>
              <p className="vd-verify-lead" style={{ margin: "12px auto 24px" }}>
                This verification is still being processed. Check back in a moment.
              </p>
            </>
          )}
          <Link href="/history" className="vd-btn-ghost">
            <ArrowLeft size={16} />
            Back to history
          </Link>
        </div>
      </div>
    );
  }

  const verdictMod = forensicVerdictModifier(data.verdict);
  const trustScore = data.trustScore ?? 0;
  const hints = data.issuerContactHints;
  const verifiedDate = data.completedAt
    ? new Date(data.completedAt).toLocaleString()
    : new Date(data.createdAt).toLocaleString();
  const timeToVerify =
    data.completedAt &&
    Math.max(
      1,
      Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.createdAt).getTime()) /
          1000
      )
    );

  const showIssuer =
    hints &&
    (hints.included ||
      hints.suggestedOutreachMessage ||
      hints.items.length > 0 ||
      hints.note);

  const reportQuery = fromHistory ? "?from=history&print=1" : "?print=1";

  const openReport = () => {
    window.open(`/verify/${id}/report${reportQuery}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="vd-forensic">
      <header className={`vd-forensic-hero vd-forensic-hero--${verdictMod}`}>
        <div className="vd-forensic-hero-body">
          <p className="vd-forensic-hero-kicker">Verdict</p>
          <h1 className="vd-forensic-hero-title">
            {formatVerdict(data.verdict)}.
          </h1>
          <p className="vd-forensic-hero-lead">
            {data.summary || "No summary available for this verification."}
          </p>
          <div className="vd-forensic-hero-meta">
            <div className="vd-forensic-file-pill">
              <FileText size={13} strokeWidth={1.5} />
              <span>{data.documentName}</span>
            </div>
            {timeToVerify ? (
              <span className="vd-forensic-hero-meta-note">
                Analysed in {timeToVerify} seconds
              </span>
            ) : null}
          </div>
        </div>
        <div className="vd-forensic-hero-gauge">
          <TrustGauge score={trustScore} />
          <p className="vd-forensic-signals">
            {data.passedChecks.length} of{" "}
            {Math.max(
              data.passedChecks.length + data.flags.length,
              FORENSIC_SIGNAL_COUNT
            )}{" "}
            signals consistent
          </p>
        </div>
      </header>

      <article className="vd-card vd-forensic-summary">
        <div className="vd-forensic-summary-head">
          <span className="vd-eyebrow">AI summary</span>
          <span className="vd-forensic-summary-date">{verifiedDate}</span>
        </div>
        <div className="vd-forensic-summary-body">
          <p>
            {data.summary || "No summary available for this verification."}
          </p>
        </div>
        <div className="vd-forensic-summary-foot">
          <p>
            This is an AI screening result, not a legal confirmation. For
            high-stakes decisions, confirm directly with the issuing school or
            ministry.
          </p>
        </div>
      </article>

      <div className="vd-forensic-grid">
        <section className="vd-forensic-panel vd-forensic-panel--issues">
          <h3 className="vd-forensic-panel-title">
            <ShieldAlert size={18} strokeWidth={1.75} />
            Issues found
          </h3>
          {data.flags.length > 0 ? (
            <ul className="vd-forensic-flag-list">
              {data.flags.map((flag, i) => (
                <li key={i} className="vd-forensic-flag">
                  <XCircle size={16} strokeWidth={2} />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="vd-forensic-empty">
              <CheckCircle2 size={18} />
              <span>No issues detected</span>
            </div>
          )}
        </section>

        <section className="vd-forensic-panel vd-forensic-panel--passed">
          <h3 className="vd-forensic-panel-title">
            <ShieldCheck size={18} strokeWidth={1.75} />
            Passed checks
          </h3>
          {data.passedChecks.length > 0 ? (
            <ul className="vd-forensic-pass-list">
              {data.passedChecks.map((check, i) => (
                <li key={i} className="vd-forensic-pass">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vd-forensic-issuer-note" style={{ margin: 0 }}>
              No checks recorded.
            </p>
          )}
        </section>
      </div>

      {showIssuer && hints && (
        <article className="vd-card vd-forensic-issuer">
          <h3 className="vd-forensic-issuer-title">
            <Info size={18} strokeWidth={1.75} />
            Confirm with the issuer
          </h3>

          {hints.disclaimer && (
            <div className="vd-forensic-notice">{hints.disclaimer}</div>
          )}

          {hints.items.length > 0 ? (
            <ul className="vd-forensic-flag-list" style={{ marginBottom: 18 }}>
              {hints.items.map((item, i) => (
                <li
                  key={i}
                  className="vd-forensic-pass"
                  style={{
                    background: "var(--paper)",
                    borderColor: "var(--hairline)",
                    color: "var(--ink)",
                  }}
                >
                  {item.type === "email" ? (
                    <Mail size={16} />
                  ) : (
                    <Phone size={16} />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500, wordBreak: "break-all" }}>
                      {item.value}
                    </p>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--forest)",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={12} />
                        {item.sourceTitle || "Source"}
                      </a>
                    )}
                  </div>
                  <span className="vd-eyebrow">Unverified</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vd-forensic-issuer-note">
              {hints.note === "no_contacts_found_in_snippets"
                ? "No issuer contact details were found in web snippets."
                : "No contact details available."}
            </p>
          )}

          {hints.suggestedOutreachMessage && (
            <div>
              <div className="vd-forensic-outreach-head">
                <span className="vd-eyebrow">Draft outreach message</span>
                <button
                  type="button"
                  className="vd-forensic-outreach-copy"
                  onClick={() => copyOutreach(hints.suggestedOutreachMessage!)}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="vd-forensic-outreach-body">
                {hints.suggestedOutreachMessage}
              </pre>
              {hints.suggestedOutreachMessageNote && (
                <p
                  className="vd-forensic-issuer-note"
                  style={{ marginTop: 10, marginBottom: 0 }}
                >
                  {hints.suggestedOutreachMessageNote}
                </p>
              )}
            </div>
          )}
        </article>
      )}

      <article className="vd-card vd-forensic-details">
        <h3>Verification details</h3>
        <dl className="vd-forensic-meta">
          <div>
            <dt>Document name</dt>
            <dd>{data.documentName}</dd>
          </div>
          <div>
            <dt>Date verified</dt>
            <dd>{verifiedDate}</dd>
          </div>
          <div>
            <dt>Time to verify</dt>
            <dd>{timeToVerify ? `${timeToVerify} seconds` : "—"}</dd>
          </div>
          <div>
            <dt>Payment ref</dt>
            <dd>{data.squadTransactionRef || "Paid with credits"}</dd>
          </div>
          <div>
            <dt>Verified by</dt>
            <dd>
              {user ? `${user.name} (${user.organisation})` : "—"}
            </dd>
          </div>
          <div>
            <dt>Verification ID</dt>
            <dd>{data.id}</dd>
          </div>
        </dl>
      </article>

      <div className="vd-forensic-actions-bar">
        <nav className="vd-forensic-toolbar" aria-label="Report actions">
          <Link
            href={fromHistory ? "/history" : "/dashboard"}
            className="vd-btn-pill vd-btn-pill-light"
          >
            <ArrowLeft size={16} />
            {fromHistory ? "Back to history" : "Back to dashboard"}
          </Link>
          <div className="vd-forensic-toolbar-actions">
            <Link href="/verify" className="vd-btn-pill vd-btn-pill-light">
              Run another
            </Link>
            <button
              type="button"
              onClick={openReport}
              className="vd-btn-pill vd-btn-pill-dark"
            >
              <Download size={16} />
              Download report
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
