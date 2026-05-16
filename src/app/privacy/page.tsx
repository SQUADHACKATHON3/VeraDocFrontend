import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import Logo from "@/components/brand/Logo";

export default function PrivacyPage() {
  return (
    <div className="vd min-h-screen bg-surface">
      <PublicNav />

      <main className="vd-landing-wrap py-24 md:py-32">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="mb-12">
          <p className="vd-eyebrow mb-2">Legal</p>
          <h1 className="vd-serif text-4xl md:text-5xl lg:text-6xl mb-6">
            Privacy <em>Policy.</em>
          </h1>
          <p className="text-ink-secondary text-lg max-w-2xl">
            Last updated: May 16, 2026. Your privacy is critical to us. This policy describes how VeraDoc handles your data.
          </p>
        </header>

        <div className="prose prose-slate max-w-3xl">
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-ink mb-4">1. Information we collect</h2>
            <p className="text-ink-secondary leading-relaxed mb-4">
              When you use VeraDoc, we collect information that you provide directly to us:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-secondary">
              <li><strong>Account Information:</strong> Name, email address, and organisation details when you register.</li>
              <li><strong>Verification Data:</strong> Documents (PDFs, images) you upload for verification.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our service, including IP addresses and browser types.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-ink mb-4">2. How we use your information</h2>
            <p className="text-ink-secondary leading-relaxed mb-4">
              We use the collected data for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-secondary">
              <li>To provide and maintain our verification service.</li>
              <li>To process your payments via our third-party provider, Squad.</li>
              <li>To notify you about changes to our service or your account status.</li>
              <li>To improve our AI forensic models (using anonymised data).</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-ink mb-4">3. Data Retention & Deletion</h2>
            <p className="text-ink-secondary leading-relaxed mb-4">
              We believe in data minimisation. Documents uploaded for verification are processed and stored securely. You can delete your account and all associated verification history at any time from your settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-ink mb-4">4. Third-Party Services</h2>
            <p className="text-ink-secondary leading-relaxed mb-4">
              We use <strong>Squad</strong> (by GTCO) for payment processing. We do not store your credit card or bank details on our servers. Their use of your personal information is governed by their own Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-ink mb-4">5. Contact Us</h2>
            <p className="text-ink-secondary leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@veradoc.ng" className="text-forest hover:underline">privacy@veradoc.ng</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="vd-footer">
        <div className="vd-landing-wrap">
          <div className="vd-footer-grid">
            <div>
              <Logo href="/" />
              <p className="vd-footer-tagline">
                AI-powered document trust for a more transparent educational ecosystem in Nigeria.
              </p>
            </div>
            <div className="vd-footer-col">
              <h4>Product</h4>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/auth/register">Register</Link>
            </div>
            <div className="vd-footer-col">
              <h4>Resources</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <a href="https://github.com/SQUADHACKATHON3" target="_blank" rel="noopener noreferrer">GitHub</a>
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
