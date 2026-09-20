"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Research" },
  { href: "/#results", label: "Reports" },
  { href: "/strategies", label: "Strategies" },
  { href: "/docs", label: "Methodology" },
  { href: "/about", label: "About" },
];

function BrandMark() {
  return (
    <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--qe-accent)] text-[var(--qe-navy-950)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.22)]" aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
        <path d="M5 21.5 11 16l4 3 8-10 4 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 26h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      </svg>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--qe-navy-950)]/96 shadow-[0_1px_0_rgba(255,255,255,.04)] backdrop-blur">
      <div className="qe-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)} aria-label="Quant Edge home">
          <BrandMark />
          <span className="min-w-0">
            <span className="block text-[15px] font-bold tracking-tight text-white">Quant Edge</span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-400 sm:block">Strategy research</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const baseHref = link.href.split("#")[0];
            const active = link.href === "/" ? pathname === "/" : baseHref !== "/" && pathname === baseHref;
            return <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/6 hover:text-white"}`}>{link.label}</Link>;
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/#builder" className="hidden rounded-lg bg-[var(--qe-accent)] px-3.5 py-2 text-xs font-bold text-[var(--qe-navy-950)] transition hover:bg-[#4fd0c2] sm:inline-flex">New backtest</Link>
          <ThemeToggle />
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation" className="grid h-10 w-10 place-items-center rounded-lg text-slate-200 hover:bg-white/10 lg:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="qe-container border-t border-white/10 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="grid gap-1 sm:grid-cols-5">
            {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/8">{link.label}</Link>)}
          </div>
        </nav>
      )}
    </header>
  );
}
