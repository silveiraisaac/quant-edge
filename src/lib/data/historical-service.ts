import 'server-only';
import { COST_RATE_VERSION } from '../costs/presets';
import { createHash } from 'node:crypto';
import { BacktestSettings } from '../types';
import { getProvider } from './registry';
import { validateBars } from './validation';
import { UserError } from '../validation';
export async function historicalData(settings:BacktestSettings) {
  const provider=getProvider(settings.providerId);
  const bars=validateBars(await provider.getBars(settings.symbol,settings.startDate,settings.endDate,settings.exchange));
  if(!bars.length)throw new UserError('No price data is available for this symbol and date range.');
  if(bars.some(b=>b.date<settings.startDate||b.date>settings.endDate))throw new UserError('Provider returned candles outside the requested date range.',502);
  if(!provider.isSynthetic) {
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(bars.some(b=>b.date>=today))throw new UserError('Use completed historical sessions ending before today in Asia/Kolkata.');
  }
  return {bars,isSynthetic:provider.isSynthetic,provenance:{engineVersion:"quant-edge-1",costRateVersion:settings.costs?.preset?.startsWith("ZERODHA")?COST_RATE_VERSION:settings.costs?.preset??"ZERO",provider:provider.label,symbol:settings.symbol,exchange:provider.isSynthetic?'SYNTHETIC':settings.exchange??'NSE',timeframe:'day',requestedStart:settings.startDate,requestedEnd:settings.endDate,actualStart:bars[0].date,actualEnd:bars.at(-1)!.date,barCount:bars.length,dataHash:createHash('sha256').update(JSON.stringify(bars)).digest('hex'),retrievedAt:new Date().toISOString(),adjustmentPolicy:provider.isSynthetic?'Seeded demo, no corporate actions':'Provider OHLC as supplied; dividends and corporate actions are not independently adjusted'}};
}
