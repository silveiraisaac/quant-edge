import { advancedAnalytics } from "./analytics";
import { DrawdownPoint, EquityPoint, MonthlyReturn, PerformanceSummary, Trade } from "@/lib/types";

export function computeDrawdownCurve(equityCurve: EquityPoint[]): DrawdownPoint[] {
  let peak = -Infinity;
  return equityCurve.map((point) => {
    peak = Math.max(peak, point.equity);
    const drawdownPct = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
    return { date: point.date, drawdownPct };
  });
}

export function computeMaxDrawdownPct(drawdownCurve: DrawdownPoint[]): number {
  return drawdownCurve.reduce((min, p) => Math.min(min, p.drawdownPct), 0);
}

/**
 * Monthly return = % change in equity from the last trading day of the
 * previous month to the last trading day of the current month.
 */
export function computeMonthlyReturns(equityCurve: EquityPoint[], initialCapital?: number): MonthlyReturn[] {
  if (equityCurve.length === 0) return [];

  const monthEndEquity = new Map<string, number>(); // "YYYY-MM" -> equity at last bar of that month
  for (const point of equityCurve) {
    const key = point.date.slice(0, 7);
    monthEndEquity.set(key, point.equity); // later entries overwrite, leaving the month's last value
  }

  const keys = Array.from(monthEndEquity.keys()).sort();
  const results: MonthlyReturn[] = [];

  // Anchor the first month's return to the starting equity (first bar of the series).
  let prevEquity = initialCapital ?? equityCurve[0].equity;

  for (const key of keys) {
    const equity = monthEndEquity.get(key)!;
    const [yearStr, monthStr] = key.split("-");
    const returnPct = prevEquity !== 0 ? ((equity - prevEquity) / prevEquity) * 100 : 0;
    results.push({ year: Number(yearStr), month: Number(monthStr), returnPct });
    prevEquity = equity;
  }

  return results;
}

export function computeSummary(
  startingCapital: number,
  equityCurve: EquityPoint[],
  _drawdownCurve: DrawdownPoint[],
  trades: Trade[],
  riskFreeRatePct = 0,
): PerformanceSummary {
  const endingCapital=equityCurve.at(-1)?.equity??startingCapital;
  const wins=trades.filter(t=>t.pnl>0),losses=trades.filter(t=>t.pnl<0);
  return {
    startingCapital,endingCapital,netPnl:endingCapital-startingCapital,
    totalReturnPct:(endingCapital/startingCapital-1)*100,totalTrades:trades.length,
    avgWinPct:wins.length?wins.reduce((s,t)=>s+t.pnlPct,0)/wins.length:null,
    avgLossPct:losses.length?losses.reduce((s,t)=>s+t.pnlPct,0)/losses.length:null,
    ...advancedAnalytics(startingCapital,equityCurve,trades,riskFreeRatePct),
  };
}
