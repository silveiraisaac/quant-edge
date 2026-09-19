import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkGapExit, checkIntrabarExit, updateTrailingStopForNextBar, runBacktestEngine, computeSignals, OpenPosition } from '../src/lib/backtest/engine';
import { calculatePositionQuantity, calculateAvailableAllocationCapacity } from '../src/lib/backtest/position-sizing';
import { settings, candles } from './fixtures';
const pos = (): OpenPosition => ({ quantity:10,entryPrice:100,entryDate:'2024-01-01',stopLossPrice:95,targetPrice:110,highestFavorablePrice:100,trailingStopPrice:90,positionSizeValue:1000,positionSizingMode:'FIXED_QUANTITY' });
const config = { ...settings, strategy: {type:'SMA_CROSSOVER' as const,fastPeriod:2,slowPeriod:3} };
test('conflicting intrabar stop and target is conservative',()=>assert.deepEqual(checkIntrabarExit(pos(),{...candles([100])[0],low:90,high:115}),{price:95,reason:'STOP_LOSS'}));
test('gap below stop fills at available open',()=>assert.deepEqual(checkGapExit(pos(),candles([80])[0]),{price:80,reason:'STOP_LOSS'}));
test('gap above target fills at available open',()=>assert.deepEqual(checkGapExit(pos(),candles([120])[0]),{price:120,reason:'TARGET'}));
test('highest protective stop takes priority',()=>{ const p=pos();p.trailingStopPrice=98;assert.deepEqual(checkIntrabarExit(p,{...candles([100])[0],low:96}),{price:98,reason:'TRAILING_STOP'}); });
test('trailing only rises after this bar exit decision',()=>{
  const p=pos();p.stopLossPrice=null;p.targetPrice=null;
  const b={...candles([110])[0],high:120,low:95};
  assert.equal(checkIntrabarExit(p,b),null);updateTrailingStopForNextBar(p,b,10);assert.equal(p.trailingStopPrice,108);
  updateTrailingStopForNextBar(p,candles([105])[0],10);assert.equal(p.trailingStopPrice,108);
});
test('signal close executes at NEXT open and terminal close liquidates',()=>{
  const b=candles([3,2,1,2,3,10]); b[5].open=7;b[5].low=7;
  const r=runBacktestEngine(b,config); assert.equal(r.trades.length,1);
  assert.equal(r.trades[0].entryDate,b[5].date);assert.equal(r.trades[0].entryPrice,7);assert.equal(r.trades[0].exitPrice,10);
  assert.equal(r.trades[0].reason,'PERIOD_END');
});
test('last-bar signal cannot execute retrospectively',()=>assert.equal(runBacktestEngine(candles([3,2,1,2,3]),config).trades.length,0));
test('future OHLC cannot change prior signals',()=>{
  const b=candles([3,2,1,2,3,4,2,1,5,3]);
  for(let n=1;n<=b.length;n++) assert.deepEqual(computeSignals(b.slice(0,n),config.strategy),computeSignals(b,config.strategy).slice(0,n));
});
test('entry sizing does not inspect current close or high',()=>{
  const b=candles([3,2,1,2,3,7]);const other=structuredClone(b);other[5].high=9000;other[5].close=9000;
  assert.equal(runBacktestEngine(b,config).trades[0].quantity,runBacktestEngine(other,config).trades[0].quantity);
});
test('insufficient capital for one share safely skips',()=>{
  const r=runBacktestEngine(candles([3,2,1,2,3,7]),{...config,initialCapital:1});assert.equal(r.trades.length,0);assert.equal(r.entriesSkippedInsufficientCapital,1);
});
test('cash plus marked holdings equals equity each day',()=>{
 const r=runBacktestEngine(candles([3,2,1,2,3,7,8,9,8,7,6]),config);
 for(const p of r.equityCurve){assert.ok(p.cash!>=0);assert.equal(p.equity,p.cash!+p.invested!);}
});
test('fixed quantity respects cash and allocation',()=>{
 const result=calculatePositionQuantity({config:{mode:'FIXED_QUANTITY',fixedQuantity:20,capitalPercent:90,riskPercent:1},availableCash:1000,entryPrice:100,initialStopLossPrice:95,maxAllocationCapacity:550});assert.equal(result.quantity,5);
});
test('risk sizing requires fixed stop and uses available cash',()=>{
 const input={config:{mode:'RISK_PERCENT' as const,fixedQuantity:20,capitalPercent:90,riskPercent:1},availableCash:10000,entryPrice:100,initialStopLossPrice:95,maxAllocationCapacity:10000};
 assert.equal(calculatePositionQuantity(input).quantity,20);assert.equal(calculatePositionQuantity({...input,initialStopLossPrice:null}).rejected,true);
});
test('allocation headroom subtracts existing lots',()=>{assert.equal(calculateAvailableAllocationCapacity(1000,50,300),200);assert.equal(calculateAvailableAllocationCapacity(1000,50,600),0);});
test('strategy exit allows a later new entry',()=>{
 const r=runBacktestEngine(candles([3,2,1,2,3,4,3,2,1,2,3,4]),config);assert.equal(r.trades.length,2);assert.equal(r.trades[0].reason,'STRATEGY_EXIT');
});
