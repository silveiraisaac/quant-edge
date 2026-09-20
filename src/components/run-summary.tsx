import Link from "next/link";
import { BacktestResult } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { getStrategyDefinition } from "@/lib/strategies";
import { COST_PRESETS } from "@/lib/costs/presets";

export function RunSummary({ result }: { result: BacktestResult }) {
  const strategy = getStrategyDefinition(result.settings.strategy.type);
  const costLabel = COST_PRESETS[result.settings.costs?.preset ?? "ZERO"];
  const items = [
    ["Instrument", result.settings.symbol],
    ["Research period", `${formatDate(result.settings.startDate)} – ${formatDate(result.settings.endDate)}`],
    ["Starting capital", formatCurrency(result.summary.startingCapital)],
    ["Cost model", costLabel],
  ];
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[var(--qe-navy-900)] text-white shadow-[0_18px_45px_rgba(7,21,33,.12)]" aria-labelledby="report-title">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className={result.isSynthetic ? "qe-pill qe-pill-demo" : "qe-pill qe-pill-live"}>{result.isSynthetic ? "DATA SOURCE · SYNTHETIC / DEMO" : "DATA SOURCE · REAL HISTORICAL"}</span><span className="qe-pill border-white/10 bg-white/7 text-slate-300">{result.settings.exchange ?? result.provenance?.exchange ?? "NSE"} · Daily</span></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--qe-accent)]">Quantitative research report</p>
          <h2 id="report-title" className="mt-1 text-2xl font-bold tracking-[-0.03em]">{strategy.label}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{strategy.shortDescription}</p>
        </div>
        <Link href="/docs" className="text-xs font-semibold text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white">Methodology & assumptions</Link>
      </div>
      <dl className="grid border-t border-white/10 bg-black/10 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value], index) => <div key={label} className={`px-5 py-4 ${index ? "border-t border-white/10 sm:border-l sm:border-t-0 xl:border-t-0" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</dt><dd className="qe-figure mt-1 text-sm font-semibold text-slate-100">{value}</dd></div>)}
      </dl>
      {result.isSynthetic && <div className="border-t border-amber-300/15 bg-amber-300/8 px-5 py-3 text-xs leading-5 text-amber-100"><strong>Synthetic demonstration data.</strong> This backtest does not represent actual historical NSE/BSE market performance.</div>}
    </section>
  );
}
