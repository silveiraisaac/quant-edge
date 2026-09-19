import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGY_DEFINITIONS } from '../src/lib/strategies';
import { computeSignals, runBacktestEngine } from '../src/lib/backtest/engine';
import { exponentialMovingAverage as ema, relativeStrengthIndex as rsi, simpleMovingAverage as sma } from '../src/lib/backtest/indicators';
import { validateStrategy } from '../src/lib/validation';
import { candles, settings } from './fixtures';
test('SMA rolling window arithmetic',()=>assert.deepEqual(sma([1,2,3,4],3),[null,null,2,3]));
test('EMA seeded with SMA',()=>assert.deepEqual(ema([1,2,3,4,5],3),[null,null,2,3,4]));
test('flat RSI is neutral, up-only 100, down-only zero',()=>{assert.equal(rsi([10,10,10,10],2)[3],50);assert.equal(rsi([1,2,3,4],2)[3],100);assert.equal(rsi([4,3,2,1],2)[3],0);});
test('invalid indicator periods fail',()=>{assert.throws(()=>sma([1,2],0));assert.throws(()=>ema([1,2],1.5));});
for(const def of STRATEGY_DEFINITIONS) {
 test(`${def.type} default parameters validate`,()=>validateStrategy(def.defaultConfig));
 test(`${def.type} is deterministic and prefix invariant`,()=>{
   const b=candles(Array.from({length:160},(_,i)=>100+i/10+Math.sin(i/4)*20));
   const all=computeSignals(b,def.defaultConfig);assert.deepEqual(all,computeSignals(b,def.defaultConfig));
   for(let n=1;n<=b.length;n++)assert.deepEqual(computeSignals(b.slice(0,n),def.defaultConfig),all.slice(0,n));
   assert.equal(all.length,b.length);
 });
 test(`${def.type} full engine net accounting`,()=>{
   const b=candles(Array.from({length:200},(_,i)=>100+Math.sin(i/5)*30+i/20));
   const result=runBacktestEngine(b,{...settings,strategy:def.defaultConfig});
   assert.ok(result.equityCurve.every(p=>Number.isFinite(p.equity)&&p.cash!>=0));
   assert.ok(Math.abs(result.equityCurve.at(-1)!.equity-settings.initialCapital-result.trades.reduce((a,t)=>a+t.pnl,0))<1e-6);
 });
}
test('Donchian excludes current high and exits each lot independently',()=>{
 const b=candles([10,10,12,14,16,18,17,14]);
 const strategy={type:'DONCHIAN' as const,entryPeriod:2,exitPeriod:2};
 assert.equal(computeSignals(b,strategy)[2],'ENTER');
 const r=runBacktestEngine(b,{...settings,strategy,positionSizing:{...settings.positionSizing,mode:'FIXED_QUANTITY',fixedQuantity:10},portfolio:{maxConcurrentPositions:3,maxCapitalAllocationPct:100},riskManagement:{...settings.riskManagement,stopLossEnabled:true,stopLossPct:10}});
 assert.ok(r.trades.length>=3);assert.ok(r.equityCurve.some(p=>p.openPositions===3));assert.ok(r.entriesSkippedMaxPositions>0);
 assert.ok(new Set(r.trades.filter(t=>t.reason==='STOP_LOSS').map(t=>t.exitPrice)).size>=1);
});
test('RSI momentum thresholds ordered',()=>assert.throws(()=>validateStrategy({type:'RSI_MOMENTUM',period:14,entryThreshold:30,exitThreshold:70})));
test('MACD signal warmup prevents early signals',()=>assert.ok(computeSignals(candles([1,2,3,4,5]),{type:'MACD',fastPeriod:2,slowPeriod:4,signalPeriod:3}).every(s=>s===null)));
