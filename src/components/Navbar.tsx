"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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
          <Link href="/#how-it-works" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">How It Works</Link>
          <Link href="/#pricing" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">Pricing</Link>
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
          <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">How It Works</Link>
          <Link href="/#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Pricing</Link>
          <hr className="border-white/10" />
          <Link href="/auth/login" className="text-lg font-medium">Sign In</Link>
          <Link href="/auth/register" className="bg-primary text-white text-center py-3 rounded-xl font-semibold">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
