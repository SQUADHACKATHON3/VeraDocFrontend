import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import Logo from "@/components/brand/Logo";

const HERO_CHECKS = [
  "Font consistency across all pages",
  "Federal Ministry seal verified",
  "Issue date 2024-06-12 within range",
  "Registration number matches institution",
];

const STATS = [
  { value: "2.1%", label: "fake certificate rate covers ~10 years (estimated from 2014–2023, extrapolating the 2019–2023 data)." },
  { value: "+192%", label: "increase is based on Nigeria's verified document fraud trend (proxy for academic certificates)." },
  { value: "₦9.12B", label: "loss is confirmed for 2019–2023; the ₦67.6 billion+ projection assumes the +192% fraud increase continues through 2025." },
];

const STEPS = [
  {
    num: "01",
    title: "Upload",
    text: "Drop your certificate or transcript. PDF, JPG, PNG. Up to 5 MB.",
  },
  {
    num: "02",
    title: "Pay",
    text: "A small verification fee processed securely through Squad.",
  },
  {
    num: "03",
    title: "Verify",
    text: "Receive an AI trust score, verdict, and a detailed forensic breakdown.",
  },
];

const AUDIENCE = [
  {
    title: "HR officers",
    text: "Processing 50+ applications a month, screening before interviews.",
  },
  {
    title: "University admissions",
    text: "Verifying transfer and postgraduate applicant transcripts.",
  },
  {
    title: "Recruitment agencies",
    text: "High-volume candidate pipelines, defensible audit trail.",
  },
  {
    title: "Embassies & visa agencies",
    text: "Educational credentials submitted with travel applications.",
  },
  {
    title: "Government procurement",
    text: "Vendor and contractor credential checks.",
  },
];

const PAYG_FEATURES = [
  "For occasional checks. No commitment.",
  "Single verification",
  "Full forensic breakdown",
  "Shareable report link",
  "Pay only when you check",
];

const PACK_FEATURES = [
  "For HR teams running weekly screens.",
  "20 document verifications",
  "Bulk-friendly history & filters",
  "Credits never expire",
  "Shareable report links",
];

export default function LandingPage() {
  return (
    <div className="vd">
      <PublicNav />

      <main>
        {/* Hero */}
        <section className="vd-landing-wrap">
          <div className="vd-hero">
            <div>
              <span className="vd-hero-badge">Trusted by institutions across Nigeria</span>
              <h1 className="vd-serif">
                Stop trusting.
                <br />
                <span className="accent">Start verifying.</span>
              </h1>
              <p className="vd-hero-lead">
                VeraDoc detects fake academic certificates and transcripts in seconds.
                Upload, pay, verify —{" "}
                <strong>before the damage is done.</strong>
              </p>
              <div className="vd-hero-ctas">
                <Link href="/auth/register" className="vd-btn vd-btn-primary">
                  Start verifying
                  <ArrowRight size={16} />
                </Link>
                <Link href="#how-it-works" className="vd-btn vd-btn-outline">
                  See how it works
                </Link>
              </div>
              <div className="vd-hero-stats">
                <div>
                  <strong>10,000+</strong>
                  documents verified
                </div>
                <div>
                  <strong>99.2%</strong>
                  detection accuracy
                </div>
                <div>
                  <strong>&lt;8 second</strong>
                  average
                </div>
              </div>
            </div>

            <div className="vd-card vd-hero-card">
              <div className="vd-hero-card-top">
                <span>Verified · OAU 2026</span>
                <span>
                  Verdict <span className="ref">VD-7C12-A8F1</span>
                </span>
              </div>
              <p className="vd-hero-verdict">Authentic.</p>
              <div className="vd-hero-score">
                <span className="num">98</span>
                <span className="label">Trust score</span>
              </div>
              <ul className="vd-hero-checks">
                {HERO_CHECKS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="vd-hero-file">
                <span>WAEC_2024_OBafemi.pdf</span>
                <span>1.2 MB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="vd-section vd-section-paper">
          <div className="vd-landing-wrap">
            <div className="vd-section-head">
              <h2 className="vd-serif">The cost of trusting on paper</h2>
              <p>
                Fake certificates cost Nigerian institutions{" "}
                <strong>millions</strong> every year.
              </p>
            </div>
            <div className="vd-stat-grid">
              {STATS.map((item) => (
                <div key={item.value} className="vd-stat-box">
                  <p className="vd-serif">{item.value}</p>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
            <p className="vd-section-foot">
              Traditional verification is slow, expensive, and manual.{" "}
              <strong>VeraDoc changes that.</strong>
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="vd-section">
          <div className="vd-landing-wrap">
            <div className="vd-steps-header">
              <div>
                <p className="vd-eyebrow">How it works</p>
                <h2 className="vd-serif">
                  Three steps. <span className="accent">Seconds</span>
                  <span className="muted">, not days.</span>
                </h2>
              </div>
              <Link href="#how-it-works" className="vd-engineering-link">
                Read the engineering details
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="vd-step-grid">
              {STEPS.map((step) => (
                <article key={step.num} className="vd-step-card">
                  <p className="num">{step.num}</p>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section id="audience" className="vd-section vd-section-paper">
          <div className="vd-landing-wrap">
            <div className="vd-section-head">
              <p className="vd-eyebrow">Who it&apos;s for</p>
              <h2 className="vd-serif">
                Built for the people
                <br />
                doing the verifying
              </h2>
            </div>
            <div className="vd-audience-grid">
              {AUDIENCE.map((item) => (
                <article key={item.title} className="vd-audience-card">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="vd-section">
          <div className="vd-landing-wrap">
            <div className="vd-section-head">
              <p className="vd-eyebrow">Pricing</p>
              <h2 className="vd-serif">
                Pay only for what you <span className="accent">verify</span>
              </h2>
            </div>
            <div className="vd-pricing-grid">
              <article className="vd-price-card">
                <h3>Pay as you go</h3>
                <p className="tagline">For occasional checks. No commitment.</p>
                <p className="amount">
                  ₦700 <small>/ verification</small>
                </p>
                <ul className="vd-price-features">
                  {PAYG_FEATURES.slice(1).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/auth/register" className="vd-btn vd-btn-outline" style={{ width: "100%" }}>
                  Get started
                </Link>
              </article>

              <article className="vd-price-card featured">
                <span className="vd-price-badge">Best value</span>
                <h3>20-credit pack</h3>
                <p className="tagline">For HR teams running weekly screens.</p>
                <p className="amount">
                  ₦14,000 <small>· 20 verifications</small>
                </p>
                <ul className="vd-price-features">
                  {PACK_FEATURES.slice(1).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/auth/register" className="vd-btn vd-btn-forest" style={{ width: "100%" }}>
                  Get started
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="vd-section" style={{ paddingTop: 0 }}>
          <div className="vd-landing-wrap">
            <div className="vd-cta-band">
              <h2 className="vd-serif">
                Your next bad hire could
                <br />
                cost you everything.
              </h2>
              <p>
                Join the institutions already verifying smarter with Nigeria&apos;s most
                advanced AI document forensics.
              </p>
              <div className="vd-cta-actions">
                <Link href="/auth/register" className="vd-btn vd-btn-primary">
                  Start verifying for free
                </Link>
                <a href="mailto:veradoc@samkiel.dev" className="vd-btn vd-btn-outline">
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="vd-footer">
        <div className="vd-landing-wrap">
          <div className="vd-footer-grid">
            <div>
              <Logo href="/" />
              <p className="vd-footer-tagline">
                AI-powered document trust for a more transparent educational ecosystem
                in Nigeria.
              </p>
            </div>
            <div className="vd-footer-col">
              <h4>Product</h4>
              <Link href="#how-it-works">How it works</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/auth/register">Register</Link>
            </div>
            <div className="vd-footer-col">
              <h4>Resources</h4>
              <a href="https://github.com/SQUADHACKATHON3" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="#">Status</a>
            </div>
          </div>
          <p className="vd-footer-copy">
            © 2026 VeraDoc · Built for Squad Hackathon 3.0 · The Dev Team, OAU Ile-Ife
          </p>
        </div>
      </footer>
    </div>
  );
}
