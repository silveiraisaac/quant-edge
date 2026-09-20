import type { Metadata } from "next";
import Link from "next/link";
import { STRATEGY_DEFINITIONS } from "@/lib/strategies";

export const metadata: Metadata = {
  title: "About",
  description: "About Quant Edge v1.0, an independent quantitative-finance and software-engineering portfolio project by Isaac Silveira.",
  alternates: {canonical:"/about"},
};

const ENGINEERING = [
  "Deterministic, causal daily-bar backtesting with signals evaluated at close and executed at the next open",
  "Capital, fixed-quantity and fixed-stop risk-based position sizing with portfolio allocation constraints",
  "Stop-loss, profit-target and trailing-stop mechanics with conservative same-bar ambiguity handling",
  "Indian cash-equity cost assumptions covering brokerage, STT, exchange, SEBI, IPFT, GST, stamp duty, DP and slippage",
  "Runtime validation, typed provider boundaries, reproducible data hashes and report provenance",
  "Responsive reporting, run comparison, browser-local history, optional owner-scoped cloud saves and protected exports",
  "Automated financial, execution, API, authorization, adapter and analytics regression tests",
];

const ANALYTICS = ["Total and annualized return","Gross and net P&L","Sharpe and Sortino ratios","Annualized volatility","Maximum drawdown and recovery","Monthly returns","Win rate, profit factor and expectancy","Exposure, turnover and trade statistics"];

export default function AboutPage() {
  return <main>
    <section className="border-b border-slate-200 bg-[var(--qe-navy-950)] text-white">
      <div className="qe-container py-10 sm:py-14">
        <div className="flex flex-wrap gap-2"><span className="qe-pill border-white/15 bg-white/8 text-slate-200">Portfolio Release</span><span className="qe-pill border-amber-300/20 bg-amber-300/10 text-amber-200">Synthetic data</span></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[var(--qe-accent)]">About Quant Edge</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-[-.035em] sm:text-4xl">A quantitative research system built to make assumptions visible</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Quant Edge is an independent quantitative research and backtesting project built to explore systematic trading, strategy evaluation, risk modelling, performance analytics and financial software engineering.</p>
      </div>
    </section>
    <div className="qe-container space-y-6 py-8 sm:py-10">
      <section className="qe-card grid gap-6 p-6 lg:grid-cols-[1fr_.7fr] lg:p-8">
        <div><p className="qe-eyebrow">Built by</p><h2 className="qe-title mt-2 text-2xl">Isaac Silveira</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Quant Edge was designed and developed by Isaac Silveira as an independent software and quantitative-finance project. It is presented as a portfolio demonstration of careful financial modelling, testable execution rules and production-minded web engineering.</p><a href="https://github.com/silveiraisaac/quant-edge" target="_blank" rel="noopener noreferrer" className="qe-btn-secondary mt-5">View source on GitHub <span aria-hidden="true">↗</span><span className="sr-only">opens in a new tab</span></a></div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 text-sm">
          {[['Project','Quant Edge'],['Release','v1.0'],['Category','Quantitative Finance / Software Engineering'],['Status','Portfolio Project']].map(([term,value])=><div key={term} className="bg-white p-4"><dt className="text-xs font-semibold text-slate-500">{term}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>)}
        </dl>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="qe-card p-6 lg:p-8"><p className="qe-eyebrow">Engineering scope</p><h2 className="qe-title mt-2 text-xl">What was built</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">{ENGINEERING.map(item=><li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--qe-accent-dark)]" aria-hidden="true" />{item}</li>)}</ul></div>
        <div className="qe-card p-6 lg:p-8"><p className="qe-eyebrow">Performance analysis</p><h2 className="qe-title mt-2 text-xl">Metrics in the report</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{ANALYTICS.map(item=><div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">{item}</div>)}</div></div>
      </section>
      <section className="qe-card p-6 lg:p-8"><p className="qe-eyebrow">Strategy library</p><h2 className="qe-title mt-2 text-xl">Eight verified long-only strategies</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STRATEGY_DEFINITIONS.map(strategy=><div key={strategy.type} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--qe-accent-dark)]">{strategy.category}</p><h3 className="mt-2 font-bold text-slate-800">{strategy.label}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{strategy.shortDescription}</p></div>)}</div></section>
      <section className="qe-card border-amber-200 bg-amber-50 p-6 lg:p-8"><p className="qe-eyebrow text-amber-800">Portfolio dataset</p><h2 className="mt-2 text-xl font-bold text-amber-950">Deterministic synthetic market data</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-amber-950">The v1.0 release intentionally uses synthetic demonstration datasets to exercise signal generation, execution, portfolio accounting, transaction-cost modelling, risk controls, analytics and reporting. These results do not represent actual historical NSE or BSE performance and must not be interpreted as the performance of real securities.</p></section>
      <section className="qe-card p-6 lg:p-8"><p className="qe-eyebrow">Project boundaries</p><h2 className="qe-title mt-2 text-xl">Known limitations</h2><div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2 lg:grid-cols-3">{["Daily bars and long-only positions","One instrument per backtest","No live or real-time market data","No broker connection or trade execution","No leverage, shorts or options backtesting","Simplified fills, liquidity and market impact","No independent corporate-action adjustment","Cost schedules are modelling assumptions","No claim of historical or live equivalence"].map(item=><p key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3">{item}</p>)}</div><div className="mt-5 flex flex-wrap gap-3"><Link href="/docs" className="qe-btn-primary">Read the methodology</Link><Link href="/legal/risk-disclosure" className="qe-btn-secondary">Review risk disclosure</Link></div></section>
    </div>
  </main>;
}
