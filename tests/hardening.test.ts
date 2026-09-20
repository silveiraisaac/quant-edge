import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/backtest/route';
import { DELETE } from '../src/app/api/saved/route';
import { createLimiter } from '../src/lib/server/limits';
import { runBacktestEngine } from '../src/lib/backtest/engine';
import { settings,candles } from './fixtures';
test('API returns real report values without shipping source candle arrays',async()=>{const r=await POST(new Request('http://localhost/api/backtest',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(settings)}));assert.equal(r.status,200);const report=await r.json();assert.equal(report.summary.endingCapital,1542508.7499999993);assert.deepEqual(report.bars,[]);assert.ok(report.lowestOpenPrice>0);assert.ok(report.provenance.dataHash);});
test('API rejects malformed configuration without internal stack traces',async()=>{const r=await POST(new Request('http://localhost/api/backtest',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}));assert.equal(r.status,400);const text=await r.text();assert.ok(!text.includes('stack'));assert.ok(!text.includes('node_modules'));});
test('API rejects oversized input before running engine',async()=>{const r=await POST(new Request('http://localhost/api/backtest',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({padding:'x'.repeat(17000)})}));assert.equal(r.status,413);});
test('request limiter resets and returns a bounded failure',()=>{const limit=createLimiter(2,1000);limit(1000);limit(1001);assert.throws(()=>limit(1002),/limit reached/);limit(2001);});
test('intraday catastrophic decline still funds entry-basis STT',()=>{
 const b=candles([3,2,1,2,3,100]);b[5]={...b[5],open:100,high:100,low:0.0001,close:0.0001};
 const r=runBacktestEngine(b,{...settings,initialCapital:100000,strategy:{type:'SMA_CROSSOVER',fastPeriod:2,slowPeriod:3},positionSizing:{...settings.positionSizing,capitalPercent:100},costs:{preset:'ZERODHA_INTRADAY',slippagePct:0}});
 assert.ok(r.trades.length===1);assert.ok(r.equityCurve.at(-1)!.cash!>=0);
});
test('multiple overnight lots pay one DP fee per symbol per exit day',()=>{
 const b=candles([10,10,12,14,16,18,20,5]);
 const r=runBacktestEngine(b,{...settings,strategy:{type:'DONCHIAN',entryPeriod:2,exitPeriod:2},portfolio:{maxConcurrentPositions:3,maxCapitalAllocationPct:100},positionSizing:{...settings.positionSizing,mode:'FIXED_QUANTITY',fixedQuantity:10},costs:{preset:'ZERODHA_DELIVERY',slippagePct:0}});
 assert.equal(r.trades.length,3);assert.equal(r.trades.reduce((s,t)=>s+(t.costBreakdown?.dp??0),0),13);
});
test('same-day delivery exit has no DP and uses intraday brokerage',()=>{
 const r=runBacktestEngine(candles([3,2,1,2,3,10]),{...settings,strategy:{type:'SMA_CROSSOVER',fastPeriod:2,slowPeriod:3},costs:{preset:'ZERODHA_DELIVERY',slippagePct:0}});
 assert.equal(r.trades[0].costBreakdown!.dp,0);assert.ok(r.trades[0].costBreakdown!.brokerage>0);
 assert.ok(Math.abs(r.equityCurve.at(-1)!.equity-settings.initialCapital-r.trades[0].pnl)<1e-6);
});
test('cloud delete scopes both row ID and verified owner',async()=>{
 const old=fetch,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;process.env.SUPABASE_URL='https://fixture.supabase.co';process.env.SUPABASE_ANON_KEY='public-fixture';let deleted=false;
 globalThis.fetch=async input=>{const target=String(input);if(target.endsWith('/auth/v1/user'))return Response.json({id:'00000000-0000-4000-8000-000000000001'});assert.ok(target.includes('user_id=eq.00000000-0000-4000-8000-000000000001'));deleted=true;return new Response(null,{status:204});};
 try{const r=await DELETE(new Request('https://qe.example/api/saved?id=00000000-0000-4000-8000-000000000002&user_id=forged',{method:'DELETE',headers:{cookie:'qe_session=fixture',origin:'https://qe.example'}}));assert.equal(r.status,200);assert.ok(deleted);}finally{globalThis.fetch=old;if(url)process.env.SUPABASE_URL=url;else delete process.env.SUPABASE_URL;if(key)process.env.SUPABASE_ANON_KEY=key;else delete process.env.SUPABASE_ANON_KEY;}
});
