import 'server-only';
import { DataProvider, SymbolInfo } from '../types';
import { UserError, object } from '../validation';
import { normalizeKiteCandles } from './validation';
import { setTimeout as delay } from 'node:timers/promises';
export function kiteInstruments(): (SymbolInfo & {token:number;exchange:'NSE'|'BSE'})[] {
  if(!process.env.KITE_INSTRUMENTS_JSON) return [];
  try {
    const rows: unknown=JSON.parse(process.env.KITE_INSTRUMENTS_JSON);
    if(!Array.isArray(rows)||rows.length>1000) throw new Error();
    return rows.map(raw=>{ const r=object(raw);if(typeof r.symbol!=='string'||typeof r.name!=='string'||!['NSE','BSE'].includes(String(r.exchange))||!Number.isSafeInteger(r.token)||Number(r.token)<=0)throw new Error();return r as unknown as SymbolInfo & {token:number;exchange:'NSE'|'BSE'}; });
  } catch {throw new UserError('Market-data instrument configuration is invalid. Contact the operator.',503);}
}
export class KiteDataProvider implements DataProvider {
  readonly id='kite'; readonly label='Kite Connect — real historical data'; readonly isSynthetic=false;
  async listSymbols() {return kiteInstruments().map(({symbol,name,exchange})=>({symbol,name,exchange}));}
  async getBars(symbol:string,startDate:string,endDate:string,exchange='NSE') {
    const key=process.env.KITE_API_KEY, token=process.env.KITE_ACCESS_TOKEN;
    if(!key||!token)throw new UserError('Real historical data requires KITE_API_KEY, KITE_ACCESS_TOKEN and configured instruments. Demo data was not substituted.',503);
    const instrument=kiteInstruments().find(i=>i.symbol===symbol&&i.exchange===exchange);
    if(!instrument)throw new UserError('This symbol/exchange is not configured for the historical provider.');
    const bars=[];
    // Conservative 365-day chunks, disjoint dates; no invented missing sessions.
    for(let from=Date.parse(startDate);from<=Date.parse(endDate);from+=365*86400000) {
      if(from>Date.parse(startDate))await delay(400);
      const to=Math.min(from+364*86400000,Date.parse(endDate));
      const url=new URL(`https://api.kite.trade/instruments/historical/${instrument.token}/day`);
      url.searchParams.set('from',new Date(from).toISOString().slice(0,10)+' 00:00:00');url.searchParams.set('to',new Date(to).toISOString().slice(0,10)+' 23:59:59');
      let response:Response;
      try {response=await fetch(url,{headers:{'X-Kite-Version':'3',Authorization:`token ${key}:${token}`},cache:'no-store',signal:AbortSignal.timeout(15000),redirect:'error'});} catch {throw new UserError('Historical data provider is unavailable or timed out. Try again later.',502);}
      if(!response.ok)throw new UserError(response.status===429?'Historical provider rate limit reached. Try again later.':response.status===403||response.status===401?'Historical provider credentials expired or access is not enabled.':'Historical provider request failed.',response.status===429?429:502);
      const payload=object(await response.json());
      if(payload.status!=='success')throw new UserError('Historical provider returned an error.',502);
      bars.push(...normalizeKiteCandles(object(payload.data).candles));
    }
    return bars;
  }
}
