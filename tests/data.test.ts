import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBars, normalizeKiteCandles } from '../src/lib/data/validation';
import { validateSettings } from '../src/lib/validation';
import { KiteDataProvider } from '../src/lib/data/kite-provider';
import { settings, candles } from './fixtures';
test('normalizes Kite dates in exchange timezone',()=>assert.deepEqual(normalizeKiteCandles([['2024-01-01T00:00:00+0530',100,110,90,105,2000]])[0],{date:'2024-01-01',open:100,high:110,low:90,close:105,volume:2000}));
for(const [label,rows] of [
 ['duplicate', [candles([10])[0],candles([10])[0]]],
 ['unordered', candles([10,11]).reverse()],
 ['negative price',candles([-1])],
 ['invalid high',[{...candles([10])[0],high:9}]],
 ['missing volume',[{...candles([10])[0],volume:undefined}]],
 ['NaN',[{...candles([10])[0],close:NaN}]],
] as const) test(`rejects ${label} candles`,()=>assert.throws(()=>validateBars(rows)));
test('missing sessions are not filled in',()=>{const b=candles([10,11,12]);b.splice(1,1);assert.equal(validateBars(b).length,2);});
test('malformed dates and reversed ranges rejected',()=>{for(const p of [{startDate:'2024-02-30'},{startDate:'2027-01-01'},{initialCapital:Infinity},{providerId:'unknown'},{strategy:{type:'SMA_CROSSOVER',fastPeriod:50,slowPeriod:20}}])assert.throws(()=>validateSettings({...settings,...p}));});
test('no real-provider credentials never returns demo data',async()=>{const before=process.env.KITE_API_KEY;delete process.env.KITE_API_KEY;try {await assert.rejects(()=>new KiteDataProvider().getBars('TEST','2024-01-01','2024-01-02'),/requires KITE/);}finally{if(before)process.env.KITE_API_KEY=before;}});
test('real adapter normalizes only provider response and credentials stay in request headers',async()=>{
 const original=fetch, old={key:process.env.KITE_API_KEY,token:process.env.KITE_ACCESS_TOKEN,instruments:process.env.KITE_INSTRUMENTS_JSON};
 process.env.KITE_API_KEY='fixture-key';process.env.KITE_ACCESS_TOKEN='fixture-token';process.env.KITE_INSTRUMENTS_JSON=JSON.stringify([{symbol:'TEST',name:'Test',exchange:'NSE',token:123}]);
 globalThis.fetch=async(input,init)=>{assert.ok(String(input).startsWith('https://api.kite.trade/instruments/historical/123/day'));assert.ok(!String(input).includes('fixture-key'));assert.equal(new Headers(init?.headers).get('Authorization'),'token fixture-key:fixture-token');return Response.json({status:'success',data:{candles:[['2024-01-01T00:00:00+0530',10,11,9,10,100]]}});};
 try {assert.equal((await new KiteDataProvider().getBars('TEST','2024-01-01','2024-01-02'))[0].close,10);}finally{globalThis.fetch=original;for(const [key,val] of Object.entries({KITE_API_KEY:old.key,KITE_ACCESS_TOKEN:old.token,KITE_INSTRUMENTS_JSON:old.instruments})) {if(val===undefined)delete process.env[key];else process.env[key]=val;}}
});
