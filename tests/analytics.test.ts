import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advancedAnalytics } from '../src/lib/backtest/analytics';
import { computeMonthlyReturns, computeDrawdownCurve } from '../src/lib/backtest/metrics';
import { EquityPoint } from '../src/lib/types';
const curve:EquityPoint[]=[{date:'2024-01-01',equity:100},{date:'2024-01-02',equity:120},{date:'2024-01-03',equity:90},{date:'2024-01-04',equity:110},{date:'2024-01-05',equity:120}];
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('drawdown uses running peak and reports recovery',()=>{
 const a=advancedAnalytics(100,curve,[]);near(a.maxDrawdownPct,-25);near(a.maxDrawdownInr,30);assert.equal(a.drawdownPeakDate,'2024-01-02');assert.equal(a.drawdownTroughDate,'2024-01-03');assert.equal(a.recoveryDate,'2024-01-05');assert.equal(a.drawdownDurationDays,3);
 near(computeDrawdownCurve(curve)[2].drawdownPct,-25);
});
test('unrecovered drawdown remains open',()=>{const a=advancedAnalytics(100,curve.slice(0,4),[]);assert.equal(a.recoveryDate,null);assert.equal(a.longestRecoveryDays,2);});
test('monthly returns follow actual month ends',()=>{
 const m=computeMonthlyReturns([{date:'2024-01-01',equity:100},{date:'2024-01-31',equity:110},{date:'2024-02-29',equity:99}],100);near(m[0].returnPct,10);near(m[1].returnPct,-10);
});
test('initial costs included in monthly return',()=>near(computeMonthlyReturns([{date:'2024-01-01',equity:90}],100)[0].returnPct,-10));
test('no trades, no volatility ratios are null and JSON-safe',()=>{const a=advancedAnalytics(100,[{date:'2024-01-01',equity:100},{date:'2024-01-02',equity:100}],[]);assert.equal(a.sharpeRatio,null);assert.equal(a.sortinoRatio,null);assert.equal(a.profitFactor,null);assert.equal(a.winRatePct,null);assert.equal(a.expectancy,null);assert.ok(!JSON.stringify(a).includes('NaN'));});
test('Sharpe uses sample deviation of periodic portfolio returns',()=>{
 const r=[0.2,-0.25,110/90-1,120/110-1],avg=r.reduce((a,b)=>a+b,0)/4,std=Math.sqrt(r.reduce((a,b)=>a+(b-avg)**2,0)/3);
 near(advancedAnalytics(100,curve,[]).sharpeRatio!,avg/std*Math.sqrt(252));
});
test('Sortino denominator is downside deviation across all periods',()=>{
 const r=[0.2,-0.25,110/90-1,120/110-1],avg=r.reduce((a,b)=>a+b,0)/4;
 near(advancedAnalytics(100,curve,[]).sortinoRatio!,avg/Math.sqrt(0.25**2/4)*Math.sqrt(252));
});
test('risk-free rate changes excess-return ratios',()=>{assert.ok(advancedAnalytics(100,curve,[],10).sharpeRatio!<advancedAnalytics(100,curve,[],0).sharpeRatio!);});
test('CAGR uses elapsed calendar years',()=>{const a=advancedAnalytics(100,[{date:'2023-01-01',equity:100},{date:'2024-01-01',equity:110}],[]);near(a.cagrPct!,(Math.pow(1.1,365.2425/365)-1)*100);});
