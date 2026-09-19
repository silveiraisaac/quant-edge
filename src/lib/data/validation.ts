import { OHLCVBar } from '../types';
import { UserError, object, validDate } from '../validation';
export function validateBars(input: unknown): OHLCVBar[] {
  if(!Array.isArray(input)||input.length>4000) throw new UserError('Invalid or oversized market data.',502);
  let previous='';
  return input.map(raw=>{
    const b=object(raw);
    if(!validDate(b.date)||b.date<=previous) throw new UserError('Market data dates must be unique and increasing.',502);
    previous=b.date;
    for(const key of ['open','high','low','close','volume']) if(typeof b[key]!=='number'||!Number.isFinite(b[key])||Number(b[key])<(key==='volume'?0:0.00000001)) throw new UserError('Market data has missing or invalid prices/volume.',502);
    if(Number(b.high)<Math.max(Number(b.open),Number(b.close),Number(b.low))||Number(b.low)>Math.min(Number(b.open),Number(b.close))) throw new UserError('Market data OHLC relationships are invalid.',502);
    return {date:b.date,open:b.open,high:b.high,low:b.low,close:b.close,volume:b.volume} as OHLCVBar;
  });
}
export function normalizeKiteCandles(input: unknown): OHLCVBar[] {
  if(!Array.isArray(input)) throw new UserError('Provider returned invalid candles.',502);
  return validateBars(input.map(row=>{
    if(!Array.isArray(row)||row.length<6||typeof row[0]!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(row[0])||!Number.isFinite(Date.parse(row[0]))) throw new UserError('Provider returned invalid candle timestamps.',502);
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(row[0]));
    return {date,open:row[1],high:row[2],low:row[3],close:row[4],volume:row[5]};
  }));
}
