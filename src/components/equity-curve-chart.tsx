"use client";

import { EquityPoint } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  return (
    <div className="qe-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Equity Curve</h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--qe-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--qe-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d)}
            tick={{ fontSize: 11, fill: "#64748b" }}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={90}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(d) => formatDate(String(d))}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--qe-accent-dark)"
            strokeWidth={2}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
