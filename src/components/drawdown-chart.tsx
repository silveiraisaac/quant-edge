"use client";

import { DrawdownPoint } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DrawdownChart({ data }: { data: DrawdownPoint[] }) {
  return (
    <div className="qe-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Drawdown</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d)}
            tick={{ fontSize: 11, fill: "#64748b" }}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={50}
          />
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(2)}%`}
            labelFormatter={(d) => formatDate(String(d))}
          />
          <Area
            type="monotone"
            dataKey="drawdownPct"
            stroke="#dc2626"
            fill="#fecaca"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
