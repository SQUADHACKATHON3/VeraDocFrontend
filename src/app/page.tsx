"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Building2, 
  FileText,
  Lock,
  Globe,
  Plus
} from "lucide-react";

// --- Components ---

const Navbar = () => (
  <motion.nav 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between"
  >
    <div className="glass px-6 py-3 rounded-full flex items-center justify-between w-full max-w-7xl mx-auto border-white/5">
      <div className="flex items-center gap-2">
        <div className="bg-brand-primary p-1.5 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase italic">VeraDoc</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-zinc-400">
        <Link href="#features" className="hover:text-brand-primary transition-colors">Technology</Link>
        <Link href="#institutions" className="hover:text-brand-primary transition-colors">Institutions</Link>
        <Link href="#security" className="hover:text-brand-primary transition-colors">Security</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-bold uppercase tracking-wider hover:text-brand-primary transition-colors">Login</Link>
        <Link 
          href="/register" 
          className="bg-brand-primary text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          Sign Up
        </Link>
      </div>
    </div>
  </motion.nav>
);

const BackgroundEffects = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full animate-pulse-slow delay-1000" />
    <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-brand-accent/5 blur-[120px] rounded-full animate-pulse-slow delay-2000" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] contrast-150" />
  </div>
);

const FeatureCard = ({ icon, title, description, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    className="glass p-8 rounded-[2rem] space-y-4 group transition-all hover:border-brand-primary/30"
  >
    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-brand-primary/20 transition-colors shadow-2xl">
      {React.cloneElement(icon, { className: "w-7 h-7 text-brand-primary" })}
    </div>
    <h3 className="text-2xl font-black italic uppercase tracking-tight">{title}</h3>
    <p className="text-zinc-400 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

// --- Main Page ---

export default function Home() {
  const [activeVerification, setActiveVerification] = useState(0);
  
  const fakeVerifications = [
    { name: "University of Lagos", doc: "B.Sc Computer Science", status: "AUTHENTIC", color: "text-emerald-400" },
    { name: "Covenant University", doc: "B.Eng Electrical", status: "FLAGGED", color: "text-rose-500" },
    { name: "Obafemi Awolowo Univ", doc: "M.Sc Data Science", status: "AUTHENTIC", color: "text-emerald-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVerification(prev => (prev + 1) % fakeVerifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-brand-primary/30 selection:text-brand-primary">
      <BackgroundEffects />
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center py-20">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary"
            >
              <Zap className="w-3 h-3 fill-brand-primary" />
              <span>Next-Gen Verification Technology</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter italic uppercase"
            >
              Real AI. <br />
              <span className="text-gradient">Real Trust.</span> <br />
              <span className="text-white/20">Real Fast.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed font-semibold italic"
            >
              Eliminating academic fraud in Nigeria through advanced OCR and neural pattern recognition. Powered by Squad.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link 
                href="/register" 
                className="bg-brand-primary text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
              >
                Start Verification <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#demo" 
                className="glass text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 border-white/5"
              >
                Watch Demo
              </Link>
            </motion.div>
          </div>

          {/* Interactive Hero Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] -z-10 animate-pulse-slow" />
            <div className="glass rounded-[3rem] p-10 border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Analyzer v2.0</div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="h-2 w-32 bg-white/10 rounded-full" />
                      <div className="h-2 w-20 bg-white/5 rounded-full" />
                    </div>
                    <div className="w-20 h-8 bg-brand-primary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center text-[10px] font-black text-brand-primary">
                      ANALYZING...
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                          className="h-full bg-brand-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeVerification}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass p-5 rounded-2xl border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`} />
                          <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500">{fakeVerifications[activeVerification].name}</p>
                            <p className="text-sm font-bold">{fakeVerifications[activeVerification].doc}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase ${fakeVerifications[activeVerification].color}`}>
                          {fakeVerifications[activeVerification].status}
                        </span>
                      </motion.div>
                   </AnimatePresence>
                </div>
              </div>

              {/* Glowing Orb */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full group-hover:bg-brand-primary/20 transition-all duration-700" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-32 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">The Core Tech</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Superior Integrity <br /> Infrastructure</h2>
            </div>
            <p className="text-zinc-500 max-w-sm font-medium italic">We don't just verify. We establish an unbreakable chain of trust across the Nigerian educational ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search />}
              title="AI OCR Scanning"
              description="Proprietary neural networks trained on Nigerian certificate templates to detect even the most subtle pixel-level manipulations."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Lock />}
              title="Blockchain Hash"
              description="Every verified document is timestamped and hashed on our private ledger to prevent future alteration or duplicate fraud."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Building2 />}
              title="Squad Vault"
              description="Financial-grade security for institutional transactions, ensuring every verification is processed with Squad's robust gateway."
              delay={0.3}
            />
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative bg-gradient-to-br from-brand-primary to-brand-secondary rounded-[3rem] p-12 md:p-24 overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldCheck className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 space-y-8">
               <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-black leading-none">
                 Join the <br /> 
                 Academic <br />
                 Revolution.
               </h2>
               <p className="text-black/70 text-lg max-w-md font-bold italic">
                 VeraDoc is the gold standard for institutional verification. Get your university onboarded in under 24 hours.
               </p>
               <div className="pt-4 flex flex-wrap gap-4">
                 <Link href="/register" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl">
                   Partner With Us
                 </Link>
                 <Link href="/contact" className="bg-white/20 backdrop-blur-md text-black border border-black/10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/30 transition-all">
                   Contact Sales
                 </Link>
               </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">VeraDoc</span>
        </div>
        
        <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="#" className="hover:text-brand-primary transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-brand-primary transition-colors">LinkedIn</Link>
          <Link href="#" className="hover:text-brand-primary transition-colors">GitHub</Link>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          © 2026 VeraDoc Labs. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
