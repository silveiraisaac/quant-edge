import { BacktestResult } from "@/lib/types";
import { InsufficientCapitalWarning } from "@/components/insufficient-capital-warning";
import { SummaryStatsCards } from "@/components/summary-stats-cards";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { MonthlyReturnsTable } from "@/components/monthly-returns-table";
import { TradeLogTable } from "@/components/trade-log-table";
import { ReportDetails } from './report-details';
import { RunSummary } from "@/components/run-summary";
import { CostAnalysis } from "@/components/cost-analysis";

export function ResultsDashboard({ result }: { result: BacktestResult }) {
  return (
    <div className="space-y-6">
      <RunSummary result={result} />
      {result.insufficientCapitalWarning && <InsufficientCapitalWarning result={result} />}

      <SummaryStatsCards summary={result.summary} />
      <EquityCurveChart data={result.equityCurve} />
      <DrawdownChart data={result.drawdownCurve} summary={result.summary} />
      <MonthlyReturnsTable data={result.monthlyReturns} />
      <CostAnalysis result={result} />
      <TradeLogTable trades={result.trades} />
      <ReportDetails result={result} />
    </div>
  );
}
