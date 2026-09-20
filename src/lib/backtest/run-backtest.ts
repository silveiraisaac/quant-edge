import { BacktestResult, BacktestSettings } from "@/lib/types";
import { historicalData } from "@/lib/data/historical-service";
import { validateSettings } from "@/lib/validation";
import { runBacktestEngine } from "@/lib/backtest/engine";
import { computeDrawdownCurve, computeMonthlyReturns, computeSummary } from "@/lib/backtest/metrics";

export async function runBacktest(settings: BacktestSettings): Promise<BacktestResult> {
  settings = validateSettings(settings);
  const { bars, isSynthetic, provenance } = await historicalData(settings);

  const { trades, equityCurve, entrySignalsGenerated, entriesSkippedInsufficientCapital } =
    runBacktestEngine(bars, settings);
  const drawdownCurve = computeDrawdownCurve(equityCurve);
  const monthlyReturns = computeMonthlyReturns(equityCurve, settings.initialCapital);
  const summary = computeSummary(settings.initialCapital, equityCurve, drawdownCurve, trades, settings.riskFreeRatePct);

  // Only warn when every single entry signal was skipped for this reason —
  // a strategy that never signals at all is a different (unremarkable) case.
  const insufficientCapitalWarning =
    trades.length === 0 &&
    entrySignalsGenerated > 0 &&
    entriesSkippedInsufficientCapital === entrySignalsGenerated;

  return {
    lowestOpenPrice: Math.min(...bars.map(b => b.open)),
    settings,
    isSynthetic,
    provenance,
    bars,
    trades,
    equityCurve,
    drawdownCurve,
    monthlyReturns,
    summary,
    insufficientCapitalWarning,
  };
}
