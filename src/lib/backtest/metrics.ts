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
export function computeMonthlyReturns(equityCurve: EquityPoint[]): MonthlyReturn[] {
  if (equityCurve.length === 0) return [];

  const monthEndEquity = new Map<string, number>(); // "YYYY-MM" -> equity at last bar of that month
  for (const point of equityCurve) {
    const key = point.date.slice(0, 7);
    monthEndEquity.set(key, point.equity); // later entries overwrite, leaving the month's last value
  }

  const keys = Array.from(monthEndEquity.keys()).sort();
  const results: MonthlyReturn[] = [];

  // Anchor the first month's return to the starting equity (first bar of the series).
  let prevEquity = equityCurve[0].equity;

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
  drawdownCurve: DrawdownPoint[],
  trades: Trade[],
): PerformanceSummary {
  const endingCapital = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : startingCapital;
  const netPnl = endingCapital - startingCapital;
  const totalReturnPct = ((endingCapital - startingCapital) / startingCapital) * 100;

  const days = equityCurve.length;
  const years = days / 252;
  const cagrPct =
    years > 0 && endingCapital > 0 && startingCapital > 0
      ? (Math.pow(endingCapital / startingCapital, 1 / years) - 1) * 100
      : 0;

  const maxDrawdownPct = computeMaxDrawdownPct(drawdownCurve);

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const winRatePct = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWinPct = wins.length > 0 ? wins.reduce((s, t) => s + t.pnlPct, 0) / wins.length : 0;
  const avgLossPct = losses.length > 0 ? losses.reduce((s, t) => s + t.pnlPct, 0) / losses.length : 0;

  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Sharpe ratio from daily equity returns, annualized, risk-free rate assumed 0.
  const dailyReturns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    const cur = equityCurve[i].equity;
    if (prev > 0) dailyReturns.push((cur - prev) / prev);
  }
  const meanDaily = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const variance =
    dailyReturns.length > 1
      ? dailyReturns.reduce((s, r) => s + (r - meanDaily) ** 2, 0) / (dailyReturns.length - 1)
      : 0;
  const dailyStdDev = Math.sqrt(variance);
  const sharpeRatio = dailyStdDev > 0 ? (meanDaily / dailyStdDev) * Math.sqrt(252) : 0;

  return {
    startingCapital,
    endingCapital,
    netPnl,
    totalReturnPct,
    cagrPct,
    maxDrawdownPct,
    totalTrades: trades.length,
    winRatePct,
    avgWinPct,
    avgLossPct,
    profitFactor,
    sharpeRatio,
  };
}
