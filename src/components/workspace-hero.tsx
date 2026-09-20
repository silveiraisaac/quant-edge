import Link from "next/link";

const CAPABILITIES = [
  { value: "8", label: "tested strategies" },
  { value: "Daily", label: "execution model" },
  { value: "₹ costs", label: "Indian fee detail" },
  { value: "Next open", label: "signal execution" },
];

export function WorkspaceHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[var(--qe-navy-950)] text-white">
      <div className="absolute inset-0 opacity-60" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.026) 1px,transparent 1px)", backgroundSize: "42px 42px", maskImage: "linear-gradient(to right,black,transparent 85%)" }} />
      <div className="qe-container relative grid gap-8 py-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="qe-pill border-white/15 bg-white/8 text-slate-200">Indian equities</span>
            <span className="qe-pill border-amber-300/20 bg-amber-300/10 text-amber-200">Demo data active</span>
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--qe-accent)]">Quantitative research workspace</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[2.8rem]">Research. Backtest. Understand.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Evaluate long-only strategies with transparent execution, Indian trading-cost estimates, risk analytics, and reproducible data provenance.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#builder" className="qe-btn-primary bg-[var(--qe-accent)] text-[var(--qe-navy-950)] hover:bg-[#4fd0c2]">Build a backtest <span aria-hidden="true">→</span></a>
            <Link href="/docs" className="qe-btn-secondary border-white/15 bg-white/7 text-white hover:bg-white/12">Read methodology</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          {CAPABILITIES.map((item, index) => <div key={item.label} className={`p-4 sm:p-5 ${index % 2 ? "border-l border-white/10" : ""} ${index > 1 ? "border-t border-white/10" : ""}`}><p className="qe-figure text-lg font-bold text-white">{item.value}</p><p className="mt-1 text-xs text-slate-400">{item.label}</p></div>)}
        </div>
      </div>
    </section>
  );
}
