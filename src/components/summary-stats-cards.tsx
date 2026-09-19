import { PerformanceSummary } from "@/lib/types";
import { formatCurrency, formatNumber, formatPct } from "@/lib/format";

interface Card {
  label: string;
  value: string;
  accent: string;
}

export function SummaryStatsCards({ summary }: { summary: PerformanceSummary }) {
  const returnCards: Card[] = [
    { label: "Net P&L", value: formatCurrency(summary.netPnl), accent: pnlColor(summary.netPnl) },
    { label: "Total Return", value: formatPct(summary.totalReturnPct), accent: pnlColor(summary.totalReturnPct) },
    { label: "CAGR", value: formatPct(summary.cagrPct), accent: pnlColor(summary.cagrPct) },
    { label: "Ending Capital", value: formatCurrency(summary.endingCapital), accent: "text-slate-900" },
  ];

  const riskCards: Card[] = [
    { label: "Max Drawdown", value: formatPct(summary.maxDrawdownPct), accent: "text-red-600" },
    { label: "Sortino Ratio", value: formatNumber(summary.sortinoRatio, 2), accent: "text-slate-900" },
    { label: "Volatility", value: formatPct(summary.volatilityPct), accent: "text-slate-900" },
    { label: "Sharpe Ratio", value: formatNumber(summary.sharpeRatio, 2), accent: "text-slate-900" },
  ];

  const tradeCards: Card[] = [
    { label: "Number of Trades", value: String(summary.totalTrades), accent: "text-slate-900" },
    { label: "Win Rate", value: `${formatNumber(summary.winRatePct, 1)}%`, accent: "text-slate-900" },
    {
      label: "Profit Factor",
      value: formatNumber(summary.profitFactor, 2),
      accent: "text-slate-900",
    },
    { label: "Average Win", value: formatPct(summary.avgWinPct), accent: "text-emerald-600" },
    { label: "Average Loss", value: formatPct(summary.avgLossPct), accent: "text-red-600" },
  ];

  return (
    <div className="space-y-4">
      <CardGroup title="Returns" cards={returnCards} />
      <CardGroup title="Risk" cards={riskCards} />
      <CardGroup title="Trade Statistics" cards={tradeCards} />
    </div>
  );
}

function pnlColor(value: number | null): string {
  if(value === null) return "text-slate-500";
  return value >= 0 ? "text-emerald-600" : "text-red-600";
}

function CardGroup({ title, cards }: { title: string; cards: Card[] }) {
  return (
    <div>
      <h3 className="qe-section-label mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="qe-card p-4">
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <p className={`qe-figure mt-1 text-xl font-bold ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
