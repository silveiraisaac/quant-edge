import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCostModel, ZERO_MODEL } from '../src/lib/costs/presets';
import { affordableQuantity, calculateCharges, executionPrice } from '../src/lib/costs/engine';
import { runBacktest } from '../src/lib/backtest/run-backtest';
import { settings } from './fixtures';
const near = (a: number, b: number) => assert.ok(Math.abs(a-b)<1e-7, `${a} != ${b}`);
test('manual intraday buy, cap and taxable basis', () => {
  const c = calculateCharges(resolveCostModel({preset:'ZERODHA_INTRADAY',slippagePct:0}), 100000, 'BUY');
  near(c.brokerage,20); near(c.stt,0); near(c.exchange,3.07); near(c.sebi,0.1); near(c.ipft,0.0001);
  near(c.stamp,3); near(c.gst,23.1701*0.18); near(c.total,30.340718);
});
test('manual delivery sell, DP and GST', () => {
  const c = calculateCharges(resolveCostModel({preset:'ZERODHA_DELIVERY',slippagePct:0}), 110000, 'SELL', true);
  near(c.brokerage,0); near(c.stt,110); near(c.stamp,0); near(c.dp,13); near(c.gst,(3.377+0.11+0.00011+13)*0.18);
});
test('side-specific stamp and STT rounding', () => {
  const m = resolveCostModel({preset:'ZERODHA_DELIVERY',slippagePct:0});
  assert.equal(calculateCharges(m,52500,'SELL').stt,53);
  near(calculateCharges(m,100000,'BUY').stamp,15);
});
test('slippage worsens each side exactly once', () => { near(executionPrice(100,'BUY',0.5),100.5); near(executionPrice(110,'SELL',0.5),109.45); });
test('cost-aware integer affordability', () => { assert.equal(affordableQuantity(10,100,1000,q=>q*0.5),9); assert.equal(affordableQuantity(1,100,100,()=>1),0); });
test('zero charges preserve exact fills and P&L', async () => {
  const a = await runBacktest(settings), b = await runBacktest({...settings,costs:{preset:'ZERO',slippagePct:0}});
  assert.deepEqual(a.trades,b.trades); assert.equal(a.summary.endingCapital,1542508.7499999993);
});
test('net cash reconciles gross less charges', async () => {
  const r = await runBacktest({...settings,costs:{preset:'ZERODHA_DELIVERY',slippagePct:0.5}});
  near(r.summary.endingCapital,settings.initialCapital+r.trades.reduce((s,t)=>s+t.pnl,0));
  for(const t of r.trades) near(t.pnl,t.grossPnl!-t.charges!);
  assert.ok(r.equityCurve.every(p=>p.equity>=0));
});
test('intraday preset never holds overnight', async () => {
  const r = await runBacktest({...settings,costs:{preset:'ZERODHA_INTRADAY',slippagePct:0}});
  assert.ok(r.trades.length>0); assert.ok(r.trades.every(t=>t.entryDate===t.exitDate));
});
test('zero model is truly zero',()=>assert.equal(calculateCharges(ZERO_MODEL,100000,'SELL',true).total,0));
