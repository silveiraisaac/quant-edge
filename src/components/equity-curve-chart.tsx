"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EquityPoint } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

const compactInr = (value: number) => new Intl.NumberFormat("en-IN", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1, style: "currency", currency: "INR" }).format(value);

export function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  const start = data[0]?.equity ?? 0;
  const end = data.at(-1)?.equity ?? 0;
  const change = start ? (end / start - 1) * 100 : 0;
  return (
    <figure className="qe-card overflow-hidden" aria-labelledby="equity-curve-title">
      <figcaption className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div><p className="qe-eyebrow">Portfolio value</p><h2 id="equity-curve-title" className="qe-title mt-1 text-lg">Equity curve</h2><p className="mt-1 text-xs text-slate-500">Net marked-to-market equity using actual report observations.</p></div>
        <div className="sm:text-right"><p className="text-xs text-slate-500">Period change</p><p className={`qe-figure mt-1 text-lg font-bold ${change >= 0 ? "qe-positive" : "qe-negative"}`}>{change > 0 ? "+" : ""}{change.toFixed(2)}%</p></div>
      </figcaption>
      <div className="h-[300px] w-full px-2 pb-4 pt-5 sm:h-[370px] sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <defs><linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--qe-chart-equity)" stopOpacity={0.32} /><stop offset="100%" stopColor="var(--qe-chart-equity)" stopOpacity={0.015} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="var(--qe-chart-grid)" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "var(--qe-chart-tick)" }} tickLine={false} axisLine={false} minTickGap={55} dy={8} />
            <YAxis tickFormatter={compactInr} tick={{ fontSize: 10, fill: "var(--qe-chart-tick)" }} tickLine={false} axisLine={false} width={70} domain={["auto", "auto"]} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Net equity"]} labelFormatter={(label) => formatDate(String(label))} contentStyle={{ background: "var(--qe-chart-tooltip)", border: "1px solid var(--qe-line)", color: "var(--qe-ink)", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,.18)", fontSize: "12px" }} labelStyle={{ color: "var(--qe-ink-soft)", marginBottom: "5px" }} />
            <Area type="monotone" dataKey="equity" stroke="var(--qe-chart-equity)" strokeWidth={2.25} fill="url(#equityFill)" dot={false} activeDot={{ r: 4, fill: "var(--qe-chart-equity)", stroke: "var(--qe-surface)", strokeWidth: 2 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
