import { BacktestSettings, OHLCVBar } from '../src/lib/types';
export const settings: BacktestSettings = {
  providerId: 'synthetic', symbol: 'DEMO-NIFTY50', startDate: '2023-09-20', endDate: '2026-09-20',
  initialCapital: 1_000_000, strategy: { type: 'SMA_CROSSOVER', fastPeriod: 20, slowPeriod: 50 },
  riskManagement: { stopLossEnabled: false, stopLossPct: 2, targetEnabled: false, targetPct: 5, trailingStopEnabled: false, trailingStopPct: 3 },
  positionSizing: { mode: 'CAPITAL_PERCENT', capitalPercent: 90, fixedQuantity: 10, riskPercent: 1 },
  portfolio: { maxConcurrentPositions: 1, maxCapitalAllocationPct: 100 },
};
export function candles(closes: number[]): OHLCVBar[] {
  return closes.map((close, i) => ({ date: new Date(Date.UTC(2024, 0, i + 1)).toISOString().slice(0, 10), open: close, high: close, low: close, close, volume: 1000 }));
}
