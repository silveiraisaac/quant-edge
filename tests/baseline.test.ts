import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBacktest } from '../src/lib/backtest/run-backtest';
import { settings } from './fixtures';
test('SMA demo baseline', async () => {
  const r = await runBacktest(settings);
  console.info('SMA baseline', r.trades.length, r.summary.endingCapital);
  assert.equal(r.trades.length, 8);
  assert.ok(Math.abs(r.summary.endingCapital - 1542508.7499999993) < 0.000001);
});
test('RSI demo baseline', async () => {
  const r = await runBacktest({ ...settings, symbol: 'DEMO-MIDCAP-A', strategy: { type: 'RSI_MEAN_REVERSION', period: 14, oversold: 30, overbought: 70 } });
  console.info('RSI baseline', r.trades.length, r.summary.endingCapital);
  assert.equal(r.trades.length, 4);
  assert.ok(Math.abs(r.summary.endingCapital - 1551418.5299999998)<1e-6);
});
