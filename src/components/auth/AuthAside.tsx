import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const STATS = [
  { value: "10,000+", label: "Documents verified" },
  { value: "99.2%", label: "Detection accuracy" },
  { value: "<8s", label: "Avg. verification" },
];

export default function AuthAside() {
  return (
    <aside className="vd-auth-panel">
      <Link href="/" className="vd-auth-panel-brand">
        <ShieldCheck size={22} strokeWidth={1.5} />
        <span className="vd-logo-light">
          Vera<em>Doc</em>
        </span>
      </Link>

      <div className="vd-auth-panel-body">
        <p className="vd-eyebrow vd-eyebrow-on-dark">From the field</p>
        <blockquote className="vd-auth-quote">
          &ldquo;One fake certificate.
          <br />
          One wrong hire.
          <br />
          <span className="dim">One costly mistake.&rdquo;</span>
        </blockquote>
      </div>

      <div className="vd-auth-stats-grid">
        {STATS.map((item) => (
          <div key={item.label} className="vd-auth-stat-cell">
            <span className="value">{item.value}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
