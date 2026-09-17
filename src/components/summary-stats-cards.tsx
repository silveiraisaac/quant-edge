import { PerformanceSummary } from "@/lib/types";
import { formatCurrency, formatNumber, formatPct } from "@/lib/format";

export function SummaryStatsCards({ summary }: { summary: PerformanceSummary }) {
  const cards = [
    {
      label: "Ending capital",
      value: formatCurrency(summary.endingCapital),
      accent: "text-slate-900",
    },
    {
      label: "Total return",
      value: formatPct(summary.totalReturnPct),
      accent: summary.totalReturnPct >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "CAGR",
      value: formatPct(summary.cagrPct),
      accent: summary.cagrPct >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Max drawdown",
      value: formatPct(summary.maxDrawdownPct),
      accent: "text-red-600",
    },
    {
      label: "Total trades",
      value: String(summary.totalTrades),
      accent: "text-slate-900",
    },
    {
      label: "Win rate",
      value: `${formatNumber(summary.winRatePct, 1)}%`,
      accent: "text-slate-900",
    },
    {
      label: "Profit factor",
      value: Number.isFinite(summary.profitFactor) ? formatNumber(summary.profitFactor, 2) : "∞",
      accent: "text-slate-900",
    },
    {
      label: "Sharpe ratio",
      value: formatNumber(summary.sharpeRatio, 2),
      accent: "text-slate-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          <p className={`mt-1 text-xl font-bold ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
