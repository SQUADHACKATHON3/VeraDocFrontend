"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  Upload, 
  CreditCard, 
  CheckCircle, 
  Menu, 
  X, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Scroll reveal logic
      const reveals = document.querySelectorAll(".reveal");
      reveals.forEach((reveal) => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans selection:bg-primary/30 selection:text-primary-light">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass py-3" : "bg-transparent py-4"}`}>

        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-extrabold tracking-tight">VeraDoc</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">Pricing</Link>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/auth/login" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth/register" className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Get Started
              </Link>
            </div>
          </div>


          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass absolute top-full left-0 w-full p-6 flex flex-col gap-6 animate-slide-down">
            <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">How It Works</Link>
            <Link href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Pricing</Link>
            <hr className="border-white/10" />
            <Link href="/auth/login" className="text-lg font-medium">Sign In</Link>
            <Link href="/auth/register" className="bg-primary text-white text-center py-3 rounded-xl font-semibold">Get Started</Link>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-dots pointer-events-none opacity-40"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-glow-radial pointer-events-none"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-3/5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Trusted by institutions across Nigeria
                </div>
                
                <h1 className="text-5xl md:text-7xl font-heading font-black leading-[1.1] mb-6 reveal">
                  Stop Trusting. <br />
                  <span className="text-primary-light">Start Verifying.</span>
                </h1>
                
                <p className="text-xl text-foreground/70 max-w-2xl mb-10 leading-relaxed reveal" style={{ transitionDelay: "200ms" }}>
                  VeraDoc detects fake academic certificates and transcripts in seconds. 
                  Upload, pay, verify — <span className="text-foreground font-medium">before the damage is done.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 reveal" style={{ transitionDelay: "400ms" }}>
                  <Link href="/auth/register" className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    Start Verifying <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto glass hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all text-center">
                    See How It Works
                  </Link>
                </div>
              </div>

              {/* Minimal Surgical UI Element */}
              <div className="lg:w-2/5 flex justify-center lg:justify-end reveal" style={{ transitionDelay: "600ms" }}>
                <div className="relative w-[280px] group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  
                  {/* Glass Card */}
                  <div className="relative glass rounded-3xl p-8 border-white/10 shadow-[0_20px_50px_rgba(8,11,20,0.5),0_0_30px_rgba(37,99,235,0.1)] -rotate-3 hover:rotate-0 transition-all duration-700 ease-out">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        <Shield className="w-7 h-7 text-primary-light" />
                      </div>
                      
                      <div className="text-[10px] font-bold tracking-[0.3em] text-primary-light uppercase mb-2">Verified</div>
                      <div className="text-5xl font-heading font-black text-white mb-6 tracking-tighter">98.4%</div>
                      
                      <div className="w-full h-px bg-white/10 mb-6"></div>
                      
                      <div className="w-full space-y-4 text-left font-sans">
                        <div className="flex items-center gap-3 text-[11px] text-foreground/70 font-medium">
                          <span className="text-primary-light text-xs">✓</span>
                          <span>Font consistency passed</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-foreground/70 font-medium">
                          <span className="text-primary-light text-xs">✓</span>
                          <span>Seal integrity passed</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-amber-400/80 font-medium">
                          <span className="text-xs">⚠</span>
                          <span>Minor formatting anomaly</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 bg-dark-bg relative">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16 reveal">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Fake certificates cost Nigerian institutions millions every year.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: <AlertTriangle className="text-red-400" />, stat: "72%", label: "of HR fraud cases involve fake credentials" },
                { icon: <Clock className="text-primary-light" />, stat: "48hrs", label: "average time to manually verify one document" },
                { icon: <CreditCard className="text-primary-light" />, stat: "₦2.4M+", label: "average cost per bad hire from credential fraud" }
              ].map((item, i) => (
                <div key={i} className="glass glass-hover p-10 rounded-2xl transition-all duration-500 reveal" style={{ transitionDelay: `${i * 200}ms` }}>
                  <div className="mb-6">{item.icon}</div>
                  <div className="text-5xl font-heading font-bold text-white mb-2 tracking-tighter">{item.stat}</div>
                  <p className="text-foreground/60 font-medium leading-snug">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="text-center reveal">
              <p className="text-xl text-foreground/50 max-w-2xl mx-auto">
                Traditional verification is slow, expensive, and manual. <br className="hidden md:block" />
                <span className="text-foreground font-semibold">VeraDoc changes that.</span>
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20 reveal">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Three steps. Seconds, not days.</h2>
            </div>

            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2"></div>
              
              <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
                {[
                  { step: "01", title: "Upload", text: "Drop your certificate or transcript. PDF, JPG, PNG accepted.", icon: <Upload className="w-8 h-8" /> },
                  { step: "02", title: "Pay", text: "A small verification fee processed securely through Squad.", icon: <CreditCard className="w-8 h-8" /> },
                  { step: "03", title: "Verify", text: "Receive an AI trust score, verdict, and detailed forensic breakdown.", icon: <Shield className="w-8 h-8" /> }
                ].map((item, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center reveal" style={{ transitionDelay: `${i * 200}ms` }}>
                    <div className="w-20 h-20 rounded-2xl bg-dark-bg border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-primary transition-colors">
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shadow-lg">
                        {item.step}
                      </div>
                      <div className="text-primary-light">{item.icon}</div>
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-4">{item.title}</h3>
                    <p className="text-foreground/60 leading-relaxed max-w-[280px]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 reveal">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Simple, transparent pricing.</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Pay-As-You-Go */}
              <div className="glass p-10 rounded-3xl flex flex-col reveal" style={{ transitionDelay: "100ms" }}>
                <h3 className="text-xl font-heading font-bold mb-2">Pay-As-You-Go</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold">₦1,000</span>
                  <span className="text-foreground/50 font-sans">/verification</span>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {[ "No commitment", "Best for low volume", "Instant AI analysis", "Shareable report link" ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle className="w-5 h-5 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="w-full py-4 rounded-xl glass hover:bg-white/10 font-bold text-center transition-all">
                  Get Started
                </Link>
              </div>

              {/* Monthly Plan */}
              <div className="relative reveal" style={{ transitionDelay: "300ms" }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase z-10">
                  Most Popular
                </div>
                <div className="glass bg-white/5 border-primary/50 p-10 rounded-3xl flex flex-col h-full glow-blue relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16"></div>
                  <h3 className="text-xl font-heading font-bold mb-2">Monthly Plan</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-heading font-bold">₦50,000</span>
                    <span className="text-foreground/50 font-sans">/month</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {[ "Unlimited verifications", "Best for HR teams", "API access", "Priority institution checks", "Team management" ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground/70">
                        <CheckCircle className="w-5 h-5 text-primary-light" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="w-full py-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-center transition-all shadow-lg shadow-primary/20">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="glass bg-gradient-to-br from-primary/20 to-transparent border-primary/20 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden reveal">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-glow-radial opacity-50"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-heading font-black mb-6 leading-tight">
                  Your next bad hire could <br /> cost you everything.
                </h2>
                <p className="text-xl text-foreground/60 mb-10 max-w-xl mx-auto">
                  Join the institutions already verifying smarter with Nigeria's most advanced AI document forensics.
                </p>
                <Link href="/auth/register" className="inline-flex bg-white text-dark-bg hover:scale-105 transition-transform px-10 py-5 rounded-full font-bold text-lg shadow-2xl">
                  Start Verifying for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-16 pb-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-2xl font-heading font-extrabold">VeraDoc</span>
              </Link>
              <p className="text-foreground/50 max-w-xs leading-relaxed">
                AI-powered document trust for a more transparent educational ecosystem in Nigeria.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-foreground/50">
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-6">Connect</h4>

              <ul className="space-y-4 text-foreground/50">
                <li>
                  <Link href="https://github.com/SQUADHACKATHON3" target="_blank" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <ExternalLink className="w-5 h-5" /> GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-foreground/30 font-medium">
            <p>© 2026 VeraDoc. Built for Squad Hackathon 3.0</p>
            <p>Built by The Dev Team, OAU Ile-Ife.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}