import { BacktestResult } from "@/lib/types";
import { TradeCharges } from "@/lib/costs/engine";
import { COST_PRESETS } from "@/lib/costs/presets";
import { formatCurrency } from "@/lib/format";

const EMPTY: TradeCharges = { brokerage: 0, stt: 0, exchange: 0, sebi: 0, ipft: 0, gst: 0, stamp: 0, dp: 0, total: 0 };
const LABELS: Array<[keyof Omit<TradeCharges, "total">, string]> = [["brokerage", "Brokerage"], ["stt", "STT"], ["exchange", "Exchange charges"], ["sebi", "SEBI charges"], ["ipft", "IPFT"], ["stamp", "Stamp duty"], ["gst", "GST"], ["dp", "DP charges"]];

export function CostAnalysis({ result }: { result: BacktestResult }) {
  const totals = result.trades.reduce<TradeCharges>((sum, trade) => {
    const cost = trade.costBreakdown ?? EMPTY;
    for (const key of Object.keys(sum) as (keyof TradeCharges)[]) sum[key] += cost[key];
    return sum;
  }, { ...EMPTY });
  const nonZero = LABELS.filter(([key]) => totals[key] > 0);
  const max = Math.max(...nonZero.map(([key]) => totals[key]), 1);
  return (
    <section className="qe-card p-5 sm:p-6" aria-labelledby="cost-analysis-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="qe-eyebrow">Execution impact</p><h2 id="cost-analysis-title" className="qe-title mt-1 text-lg">Cost analysis</h2><p className="mt-1 text-xs text-slate-500">{COST_PRESETS[result.settings.costs?.preset ?? "ZERO"]} · Modeled estimates, not a broker contract note.</p></div><div className="sm:text-right"><p className="text-xs text-slate-500">Total charges</p><p className="qe-figure mt-1 text-xl font-bold text-slate-900">{formatCurrency(result.summary.totalTradingCosts, 2)}</p></div></div>
      {nonZero.length ? <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">{nonZero.map(([key, label]) => <div key={key}><div className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-600">{label}</span><span className="qe-figure font-semibold text-slate-800">{formatCurrency(totals[key], 2)}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[var(--qe-accent-dark)]" style={{ width: `${Math.max(3, totals[key] / max * 100)}%` }} /></div></div>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><strong>Zero-cost model active.</strong> Choose an Indian-market preset or custom charges to study execution drag.</div>}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3"><div><p className="text-slate-500">Gross P&L</p><p className="qe-figure mt-1 font-bold">{formatCurrency(result.summary.grossPnl)}</p></div><div><p className="text-slate-500">Slippage impact</p><p className="qe-figure mt-1 font-bold">{formatCurrency(result.summary.slippageImpact, 2)}</p></div><div className="col-span-2 sm:col-span-1"><p className="text-slate-500">Turnover</p><p className="qe-figure mt-1 font-bold">{formatCurrency(result.summary.turnover)}</p></div></div>
    </section>
  );
}
