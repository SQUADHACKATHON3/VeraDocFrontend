"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#audience", label: "For institutions" },
  ];

  return (
    <header className={`vd-topnav${open ? " open" : ""}`}>
      <div className="vd-topnav-inner">
        <Logo />

        <nav className="vd-topnav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="vd-topnav-actions">
          <Link href="/auth/login" className="vd-btn vd-btn-ghost">
            Sign in
          </Link>
          <Link href="/auth/register" className="vd-btn vd-btn-primary">
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="vd-mobile-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
