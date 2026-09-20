"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DrawdownPoint, PerformanceSummary } from "@/lib/types";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";

export function DrawdownChart({ data, summary }: { data: DrawdownPoint[]; summary: PerformanceSummary }) {
  const episode = summary.drawdownPeakDate ? `${formatDate(summary.drawdownPeakDate)} → ${formatDate(summary.drawdownTroughDate ?? summary.drawdownPeakDate)}` : "No drawdown episode";
  return (
    <figure className="qe-card overflow-hidden" aria-labelledby="drawdown-title">
      <figcaption className="grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-6">
        <div><p className="qe-eyebrow">Downside risk</p><h2 id="drawdown-title" className="qe-title mt-1 text-lg">Drawdown profile</h2><p className="mt-1 text-xs text-slate-500">Decline from each running equity peak. Recovery is measured against the prior peak.</p></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-right"><div><p className="text-slate-500">Maximum</p><p className="qe-figure mt-1 font-bold qe-negative">{formatPct(summary.maxDrawdownPct)}</p></div><div><p className="text-slate-500">Rupee decline</p><p className="qe-figure mt-1 font-bold text-slate-800">{formatCurrency(summary.maxDrawdownInr)}</p></div></div>
      </figcaption>
      <div className="grid gap-4 px-5 py-4 text-xs sm:grid-cols-3 sm:px-6"><div><p className="text-slate-500">Peak → trough</p><p className="mt-1 font-semibold text-slate-800">{episode}</p></div><div><p className="text-slate-500">Recovery</p><p className="mt-1 font-semibold text-slate-800">{summary.recoveryDate ? formatDate(summary.recoveryDate) : summary.drawdownPeakDate ? "Not recovered" : "N/A"}</p></div><div><p className="text-slate-500">Episode duration</p><p className="qe-figure mt-1 font-semibold text-slate-800">{summary.drawdownDurationDays} calendar days</p></div></div>
      <div className="h-[230px] w-full px-2 pb-4 sm:px-4">
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}><defs><linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--qe-chart-drawdown)" stopOpacity={0.18}/><stop offset="100%" stopColor="var(--qe-chart-drawdown)" stopOpacity={0.34}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--qe-chart-grid)"/><XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize:10,fill:"var(--qe-chart-tick)"}} tickLine={false} axisLine={false} minTickGap={55} dy={8}/><YAxis tickFormatter={(value)=>`${Number(value).toFixed(0)}%`} tick={{fontSize:10,fill:"var(--qe-chart-tick)"}} tickLine={false} axisLine={false} width={42}/><Tooltip formatter={(value)=>[`${Number(value).toFixed(2)}%`,"Drawdown"]} labelFormatter={(label)=>formatDate(String(label))} contentStyle={{background:"var(--qe-chart-tooltip)",border:"1px solid var(--qe-line)",color:"var(--qe-ink)",borderRadius:"10px",boxShadow:"0 10px 30px rgba(0,0,0,.18)",fontSize:"12px"}}/><Area type="monotone" dataKey="drawdownPct" stroke="var(--qe-chart-drawdown)" fill="url(#drawdownFill)" strokeWidth={1.8} dot={false} isAnimationActive={false}/></AreaChart></ResponsiveContainer>
      </div>
    </figure>
  );
}
