import { PerformanceSummary } from "@/lib/types";
import { formatCurrency, formatNumber, formatPct } from "@/lib/format";

function tone(value: number | null, inverse = false) {
  if (value === null || value === 0) return "text-slate-900";
  const positive = inverse ? value <= 0 : value > 0;
  return positive ? "qe-positive" : "qe-negative";
}

function formatUnsignedPct(value: number | null, digits = 2) {
  return value === null ? "N/A" : `${formatNumber(value, digits)}%`;
}

function Metric({ label, value, note, className = "" }: { label: string; value: string; note?: string; className?: string }) {
  return <div className="min-w-0"><dt className="text-[11px] font-semibold text-slate-500">{label}</dt><dd className={`qe-figure mt-1 text-lg font-bold ${className || "text-slate-900"}`}>{value}</dd>{note && <p className="mt-1 text-[10px] leading-4 text-slate-400">{note}</p>}</div>;
}

export function SummaryStatsCards({ summary }: { summary: PerformanceSummary }) {
  return (
    <section aria-labelledby="performance-overview-title">
      <div className="mb-3 flex items-end justify-between gap-3"><div><p className="qe-eyebrow">Performance snapshot</p><h2 id="performance-overview-title" className="qe-title mt-1 text-lg">Net results at a glance</h2></div><span className="hidden text-[11px] text-slate-500 sm:block">After modeled costs</span></div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="qe-card relative overflow-hidden p-5 md:col-span-1"><span className={`absolute inset-y-0 left-0 w-1 ${summary.totalReturnPct >= 0 ? "bg-emerald-500" : "bg-red-500"}`} /><Metric label="Net return" value={formatPct(summary.totalReturnPct)} className={`${tone(summary.totalReturnPct)} text-3xl`} note={`CAGR ${formatPct(summary.cagrPct)}`} /></div>
        <div className="qe-card p-5"><Metric label="Ending equity" value={formatCurrency(summary.endingCapital)} className="text-2xl text-slate-900" note={`From ${formatCurrency(summary.startingCapital)} starting capital`} /></div>
        <div className="qe-card p-5"><Metric label="Net P&L" value={formatCurrency(summary.netPnl)} className={`${tone(summary.netPnl)} text-2xl`} note={`${summary.totalTrades} completed trade${summary.totalTrades === 1 ? "" : "s"}`} /></div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="qe-card p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">Risk & consistency</h3><span className="qe-pill">Daily returns</span></div><dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4"><Metric label="Max drawdown" value={formatPct(summary.maxDrawdownPct)} className="qe-negative" /><Metric label="Volatility" value={formatUnsignedPct(summary.volatilityPct)} /><Metric label="Sharpe" value={formatNumber(summary.sharpeRatio, 2)} /><Metric label="Sortino" value={formatNumber(summary.sortinoRatio, 2)} /></dl></div>
        <div className="qe-card p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">Trade quality</h3><span className="qe-pill">Net P&L</span></div><dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4"><Metric label="Win rate" value={formatUnsignedPct(summary.winRatePct, 1)} /><Metric label="Profit factor" value={formatNumber(summary.profitFactor, 2)} /><Metric label="Average win" value={formatCurrency(summary.averageWin)} className="qe-positive" /><Metric label="Average loss" value={formatCurrency(summary.averageLoss)} className="qe-negative" /></dl></div>
      </div>
    </section>
  );
}
