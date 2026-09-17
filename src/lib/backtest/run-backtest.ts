import { BacktestResult, BacktestSettings } from "@/lib/types";
import { getProvider } from "@/lib/data/registry";
import { runBacktestEngine } from "@/lib/backtest/engine";
import { computeDrawdownCurve, computeMonthlyReturns, computeSummary } from "@/lib/backtest/metrics";

export async function runBacktest(settings: BacktestSettings): Promise<BacktestResult> {
  const provider = getProvider(settings.providerId);
  const bars = await provider.getBars(settings.symbol, settings.startDate, settings.endDate);

  if (bars.length === 0) {
    throw new Error(
      "No price data available for the selected symbol and date range. Try a wider date range.",
    );
  }

  const { trades, equityCurve } = runBacktestEngine(bars, settings);
  const drawdownCurve = computeDrawdownCurve(equityCurve);
  const monthlyReturns = computeMonthlyReturns(equityCurve);
  const summary = computeSummary(settings.initialCapital, equityCurve, drawdownCurve, trades);

  return {
    settings,
    isSynthetic: provider.isSynthetic,
    bars,
    trades,
    equityCurve,
    drawdownCurve,
    monthlyReturns,
    summary,
  };
}
