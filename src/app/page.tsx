import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, Building2, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">VeraDoc</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">Sign In</Link>
          <Link href="/register" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl -z-10" />
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-emerald-400 animate-fade-in">
              <Zap className="w-3 h-3" />
              <span>AI-Powered Verification in Seconds</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Ensuring Academic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Integrity with AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              VeraDoc helps Nigerian institutions detect fake certificates and verify academic credentials instantly. Secure, reliable, and powered by Squad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                Start Verifying Now
              </Link>
              <Link href="#demo" className="w-full sm:w-auto bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Watch Demo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats/Institutions */}
        <section className="border-y border-white/5 bg-white/[0.02] py-12">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">Trusted by Leading Institutions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center justify-center font-bold text-xl">UNILAG</div>
              <div className="flex items-center justify-center font-bold text-xl">OAU</div>
              <div className="flex items-center justify-center font-bold text-xl">UNIBADAN</div>
              <div className="flex items-center justify-center font-bold text-xl">ABU</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Why Choose VeraDoc?</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">Modern solutions for the Nigerian educational landscape.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="w-8 h-8 text-emerald-400" />,
                  title: "Instant Verification",
                  description: "Upload a document and get a verification report in less than 10 seconds using our advanced AI."
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" />,
                  title: "Squad Payments",
                  description: "Seamlessly pay for verification credits using Squad's secure payment infrastructure."
                },
                {
                  icon: <Building2 className="w-8 h-8 text-purple-400" />,
                  title: "Institutional Portal",
                  description: "Dedicated dashboard for universities and employers to manage multiple verifications."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-2">
                  <div className="bg-black p-4 rounded-2xl w-fit mb-6 shadow-xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 overflow-hidden relative">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
             <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to secure your institution?</h2>
                <p className="text-white/80 text-lg max-w-xl mx-auto">
                  Join 50+ Nigerian institutions already using VeraDoc to combat academic fraud.
                </p>
                <div className="pt-4">
                  <Link href="/register" className="bg-white text-emerald-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-zinc-100 transition-all shadow-2xl">
                    Create Institutional Account
                  </Link>
                </div>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">VeraDoc</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
          <p className="text-sm text-zinc-600">© 2026 VeraDoc. Built for Squad Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
