import type { VerificationDetail } from "@/lib/api";
import { formatVerdict, forensicVerdictModifier } from "@/lib/verdict";

type ReportUser = {
  name: string;
  organisation: string;
} | null;

type VerificationReportDocumentProps = {
  data: VerificationDetail;
  user: ReportUser;
};

const FORENSIC_SIGNAL_COUNT = 8;

function formatIssuedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
    timeZoneName: "short",
  });
}

export default function VerificationReportDocument({
  data,
  user,
}: VerificationReportDocumentProps) {
  const verdictMod = forensicVerdictModifier(data.verdict);
  const trustScore = data.trustScore ?? 0;
  const issuedAt = data.completedAt ?? data.createdAt;
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

  const signalTotal = Math.max(
    data.passedChecks.length + data.flags.length,
    FORENSIC_SIGNAL_COUNT
  );
  const signalPassed = data.passedChecks.length;
  const shortId = data.id.slice(0, 8).toUpperCase();
  const vdRef = `VD-${shortId}`;

  const forensicRows = [
    ...data.passedChecks.map((check) => ({
      check,
      result: "Pass" as const,
      observation: "Consistent with expected document patterns.",
    })),
    ...data.flags.map((flag) => ({
      check: flag,
      result: "Flag" as const,
      observation: "Requires issuer confirmation.",
    })),
  ];

  const issuerLine =
    data.issuerContactHints?.items[0]?.sourceTitle ||
    data.flags.find((f) => /issuer|ministry|institution/i.test(f)) ||
    "Not identified from document";

  const nextStep =
    data.issuerContactHints?.suggestedOutreachMessage?.split("\n")[0] ||
    data.summary ||
    "Confirm directly with the issuing institution before making a final decision.";

  return (
    <article className={`vd-pdf-report vd-pdf-report--${verdictMod}`}>
      <header className="vd-pdf-header">
        <div className="vd-pdf-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/assets/veradoc_logo.png"
            alt="VeraDoc"
            style={{ height: '30px', width: 'auto' }}
          />
          <span className="vd-logo" style={{ fontSize: '24px' }}>
            Vera<em>Doc</em>
          </span>
        </div>
        <div className="vd-pdf-header-meta">
          <h1 className="vd-pdf-title">Verification report</h1>
          <p className="vd-pdf-issued">Issued · {formatIssuedAt(issuedAt)}</p>
        </div>
      </header>

      <section className="vd-pdf-summary-grid">
        <div>
          <p className="vd-pdf-label">Verification ID</p>
          <p className="vd-pdf-mono vd-pdf-id">{data.id}</p>
        </div>
        <div>
          <p className="vd-pdf-label">Verdict</p>
          <p className="vd-pdf-verdict">{formatVerdict(data.verdict)}.</p>
        </div>
        <div>
          <p className="vd-pdf-label">Trust score</p>
          <p className="vd-pdf-score">{trustScore}</p>
          <p className="vd-pdf-sub">
            {signalPassed} of {signalTotal} forensic checks passed
          </p>
        </div>
      </section>

      <section className="vd-pdf-meta-grid">
        <div>
          <p className="vd-pdf-label">Document</p>
          <p className="vd-pdf-value">{data.documentName}</p>
        </div>
        <div>
          <p className="vd-pdf-label">Issued by</p>
          <p className="vd-pdf-value">{issuerLine}</p>
        </div>
        <div>
          <p className="vd-pdf-label">Verifier</p>
          <p className="vd-pdf-value">
            {user ? `${user.name} — ${user.organisation}` : "—"}
          </p>
        </div>
        <div>
          <p className="vd-pdf-label">Analysed</p>
          <p className="vd-pdf-value">
            {timeToVerify ? `${timeToVerify} seconds` : "—"} via Groq vision LLM
          </p>
        </div>
      </section>

      <section className="vd-pdf-signals-row">
        <div className="vd-pdf-signals-col vd-pdf-signals-col--flag">
          <h2>Signals flagged</h2>
          <p className="vd-pdf-signals-count">FLAG · {data.flags.length}</p>
          <ul>
            {data.flags.length > 0 ? (
              data.flags.map((f) => (
                <li key={f}>{f}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
        <div className="vd-pdf-signals-col vd-pdf-signals-col--ok">
          <h2>Signals consistent</h2>
          <p className="vd-pdf-signals-count">OK · {data.passedChecks.length}</p>
          <ul>
            {data.passedChecks.length > 0 ? (
              data.passedChecks.map((c) => (
                <li key={c}>{c}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
      </section>

      <p className="vd-pdf-confidential">
        {vdRef} · Confidential
      </p>

      <section className="vd-pdf-table-section">
        <h2 className="vd-pdf-section-title">Forensic record</h2>
        <p className="vd-pdf-section-lead">
          Per-signal output from the AI vision model. Use this table as evidence in
          any escalation.
        </p>
        <div className="vd-table-scroll">
          <table className="vd-pdf-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Result</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            {forensicRows.length > 0 ? (
              forensicRows.map((row) => (
                <tr key={`${row.result}-${row.check}`}>
                  <td>{row.check}</td>
                  <td>
                    <span
                      className={
                        row.result === "Pass"
                          ? "vd-pdf-result vd-pdf-result--pass"
                          : "vd-pdf-result vd-pdf-result--flag"
                      }
                    >
                      {row.result}
                    </span>
                  </td>
                  <td>{row.observation}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No forensic rows recorded.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </section>

      {data.summary && (
        <section className="vd-pdf-next-step">
          <h2 className="vd-pdf-section-title">Recommended next step</h2>
          <p>{nextStep}</p>
        </section>
      )}

      <footer className="vd-pdf-footer">
        <p className="vd-pdf-disclosure">
          veradoc.ng · Built for Squad Hackathon 3.0 · OAU Ile-Ife
        </p>
        <p className="vd-pdf-disclosure">
          This is an AI screening result, not a legal confirmation. For high-stakes
          decisions, confirm directly with the issuing school or ministry.
        </p>
        <p className="vd-pdf-signed">
          Signed <strong>VeraDoc AI</strong> · llama-4-scout-17b · Groq
        </p>
      </footer>
    </article>
  );
}
