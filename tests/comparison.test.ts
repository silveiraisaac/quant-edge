import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparisonSeries,comparisonWarnings } from '../src/lib/comparison';
import { tradeCsv,summaryJson } from '../src/lib/exports';
import { runBacktest } from '../src/lib/backtest/run-backtest';
import { settings } from './fixtures';
test('comparison normalizes initial capital and never fills missing dates',async()=>{
 const r=await runBacktest(settings);r.equityCurve=[{date:'2024-01-01',equity:1000000},{date:'2024-01-03',equity:1100000}];
 const second={...r,equityCurve:[{date:'2024-01-02',equity:900000}]};
 const series=comparisonSeries([{id:'a',name:'A',result:r},{id:'b',name:'B',result:second}]);assert.equal(series[1].a,null);assert.equal(series[0].b,null);assert.ok(Math.abs(Number(series[2].a)-10)<1e-8);
});
test('comparison warns when mixing demo and real',async()=>{const r=await runBacktest(settings);assert.ok(comparisonWarnings([{id:'a',name:'A',result:r},{id:'b',name:'B',result:{...r,isSynthetic:false}}]).some(s=>s.includes('mixes')));});
test('exports contain actual net data and prevent formula injection',async()=>{
 const r=await runBacktest(settings);r.trades[0].symbol='=DANGEROUS()';const csv=tradeCsv(r);assert.ok(csv.includes("'=DANGEROUS()"));assert.ok(csv.includes(String(r.trades[0].pnl)));assert.equal(JSON.parse(summaryJson(r)).summary.endingCapital,r.summary.endingCapital);
});
