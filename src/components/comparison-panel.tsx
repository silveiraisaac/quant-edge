"use client";
import { useMemo } from "react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ComparisonRun, comparisonSeries, comparisonWarnings } from "@/lib/comparison";
import { formatCurrency, formatNumber, formatPct } from "@/lib/format";
import { getStrategyDefinition } from "@/lib/strategies";

const COLORS = ["#087f76", "#2f6fbd", "#7c4db3", "#c56b24"];
const metrics = [
  { key: "totalReturnPct", label: "Net return", format: formatPct },
  { key: "cagrPct", label: "CAGR", format: formatPct },
  { key: "maxDrawdownPct", label: "Max drawdown", format: formatPct },
  { key: "sharpeRatio", label: "Sharpe", format: (value: number | null) => formatNumber(value,2) },
  { key: "sortinoRatio", label: "Sortino", format: (value: number | null) => formatNumber(value,2) },
  { key: "winRatePct", label: "Win rate", format: (value: number | null) => value === null ? "N/A" : `${formatNumber(value, 2)}%` },
  { key: "profitFactor", label: "Profit factor", format: (value: number | null) => formatNumber(value,2) },
  { key: "totalTrades", label: "Trades", format: (value: number | null) => formatNumber(value,0) },
  { key: "totalTradingCosts", label: "Charges", format: (value: number | null) => formatCurrency(value,2) },
] as const;

export function ComparisonPanel({ runs, onRemove }: { runs: ComparisonRun[]; onRemove: (id: string) => void }) {
  const data = useMemo(() => comparisonSeries(runs), [runs]);
  if (!runs.length) return <section className="qe-card p-5 sm:p-6" aria-labelledby="comparison-title"><div className="flex gap-4"><span className="qe-icon-box" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 19V9m7 10V5m7 14v-7"/><path d="M3 19h18"/></svg></span><div><p className="qe-eyebrow">Cross-run analysis</p><h2 id="comparison-title" className="qe-title mt-1 text-lg">Compare completed backtests</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Add up to four reports after running them. Quant Edge will align normalized equity without filling missing dates and will flag incompatible datasets, instruments, or periods.</p><p className="mt-3 text-xs font-semibold text-slate-600">Use “Compare run” above a completed report to begin.</p></div></div></section>;
  const warnings = comparisonWarnings(runs);
  return <section className="qe-card overflow-hidden" aria-labelledby="comparison-title"><div className="border-b border-slate-100 px-5 py-5 sm:px-6"><p className="qe-eyebrow">Cross-run analysis</p><div className="mt-1 flex items-end justify-between gap-3"><div><h2 id="comparison-title" className="qe-title text-lg">Strategy comparison</h2><p className="mt-1 text-xs text-slate-500">Normalized to each run’s starting capital. No ranking or winner is assigned.</p></div><span className="qe-pill">{runs.length} / 4 runs</span></div></div>
    {warnings.length > 0 && <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 sm:px-6">{warnings.map((warning)=><p className="text-xs leading-5 text-amber-900" key={warning}>⚠ {warning}</p>)}</div>}
    <div className="qe-scrollbar overflow-x-auto p-4 sm:p-5"><table className="w-full min-w-[650px] text-xs"><thead><tr><th className="p-2 text-left text-[10px] uppercase tracking-[.08em] text-slate-500">Metric</th>{runs.map((run,index)=><th key={run.id} className="p-2 text-left"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{background:COLORS[index]}}/><span className="font-bold text-slate-800">{getStrategyDefinition(run.result.settings.strategy.type).label}</span></span><span className="mt-1 block font-normal text-slate-500">{run.result.isSynthetic ? "DEMO" : "REAL"} · {run.result.settings.symbol}</span><button className="mt-2 min-h-0 text-[10px] font-semibold text-red-700 underline underline-offset-2" onClick={()=>onRemove(run.id)} aria-label={`Remove ${run.name}`}>Remove</button></th>)}</tr></thead><tbody>{metrics.map((metric)=><tr key={metric.key} className="border-t border-slate-100"><th className="p-2.5 text-left font-medium text-slate-500">{metric.label}</th>{runs.map((run)=><td className="qe-figure p-2.5 font-semibold text-slate-800" key={run.id}>{metric.format(run.result.summary[metric.key])}</td>)}</tr>)}</tbody></table></div>
    <div className="h-[300px] border-t border-slate-100 px-2 pb-4 pt-5 sm:px-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><XAxis dataKey="date" minTickGap={55} tick={{fontSize:10,fill:"#6b7987"}} tickLine={false} axisLine={false}/><YAxis tickFormatter={(value)=>`${value}%`} tick={{fontSize:10,fill:"#6b7987"}} tickLine={false} axisLine={false} width={45}/><Tooltip contentStyle={{border:"1px solid #dce3e8",borderRadius:"10px",fontSize:"12px"}}/><Legend wrapperStyle={{fontSize:"11px"}}/>{runs.map((run,index)=><Line key={run.id} dataKey={run.id} name={getStrategyDefinition(run.result.settings.strategy.type).label} stroke={COLORS[index]} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div>
  </section>;
}
