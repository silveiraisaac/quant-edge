import { BacktestResult } from "@/lib/types";
import { DemoDataBanner } from "@/components/demo-data-banner";
import { SummaryStatsCards } from "@/components/summary-stats-cards";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { MonthlyReturnsTable } from "@/components/monthly-returns-table";
import { TradeLogTable } from "@/components/trade-log-table";

export function ResultsDashboard({ result }: { result: BacktestResult }) {
  return (
    <div className="space-y-5">
      {result.isSynthetic && <DemoDataBanner />}

      <SummaryStatsCards summary={result.summary} />
      <EquityCurveChart data={result.equityCurve} />
      <DrawdownChart data={result.drawdownCurve} />
      <MonthlyReturnsTable data={result.monthlyReturns} />
      <TradeLogTable trades={result.trades} />
    </div>
  );
}
