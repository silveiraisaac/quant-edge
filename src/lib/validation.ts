import { BacktestSettings } from './types';
import { COST_PRESETS, ZERO_MODEL } from './costs/presets';
export class UserError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new UserError('Expected a configuration object.');
  return value as Record<string, unknown>;
}
export function number(value: unknown, label: string, min: number, max: number, integer = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new UserError(`${label} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
  return value;
}
export function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function validateStrategy(value: unknown) {
  const s=object(value);
  if(s.type==='SMA_CROSSOVER') {
    number(s.fastPeriod,'Fast period',2,400,true);number(s.slowPeriod,'Slow period',3,500,true);
    if(Number(s.fastPeriod)>=Number(s.slowPeriod)) throw new UserError('Fast period must be smaller than slow period.');
  } else if(s.type==='RSI_MEAN_REVERSION') {
    number(s.period,'RSI period',2,400,true);number(s.oversold,'Oversold',1,99);number(s.overbought,'Overbought',1,99);
    if(Number(s.oversold)>=Number(s.overbought)) throw new UserError('Oversold must be below overbought.');
  } else throw new UserError('Unknown strategy.');
}
export function validateSettings(input: unknown): BacktestSettings {
  const s=object(input);
  if(!['synthetic','kite'].includes(String(s.providerId))) throw new UserError('Unknown data provider.');
  if(typeof s.symbol!=='string' || !/^[A-Z0-9][A-Z0-9&_. -]{0,49}$/.test(s.symbol)) throw new UserError('Invalid symbol.');
  if(!validDate(s.startDate)||!validDate(s.endDate)||s.startDate>s.endDate) throw new UserError('Use valid dates with start on or before end.');
  if(Date.parse(s.endDate)-Date.parse(s.startDate)>366*10*86400000) throw new UserError('Maximum backtest range is 10 years.');
  if(s.timeframe!==undefined && s.timeframe!=='day') throw new UserError('Only daily candles are supported.');
  if(s.exchange!==undefined && !['NSE','BSE'].includes(String(s.exchange))) throw new UserError('Exchange must be NSE or BSE.');
  number(s.initialCapital,'Initial capital',1,1e10);
  validateStrategy(s.strategy);
  const r=object(s.riskManagement), p=object(s.positionSizing), limits=object(s.portfolio);
  for(const [flag,pct] of [['stopLossEnabled','stopLossPct'],['targetEnabled','targetPct'],['trailingStopEnabled','trailingStopPct']]) {
    if(typeof r[flag]!=='boolean') throw new UserError('Risk toggles must be boolean.');
    number(r[pct],pct,0.01,90);
  }
  if(!['CAPITAL_PERCENT','FIXED_QUANTITY','RISK_PERCENT'].includes(String(p.mode))) throw new UserError('Unknown sizing mode.');
  number(p.capitalPercent,'Capital percentage',0.01,100);number(p.fixedQuantity,'Quantity',1,1e8,true);number(p.riskPercent,'Risk percentage',0.01,100);
  if(p.mode==='RISK_PERCENT'&&!r.stopLossEnabled) throw new UserError('Risk % sizing requires an enabled stop loss.');
  number(limits.maxConcurrentPositions,'Maximum positions',1,20,true);number(limits.maxCapitalAllocationPct,'Allocation',0.01,100);
  if(s.riskFreeRatePct!==undefined) number(s.riskFreeRatePct,'Risk-free rate',-50,100);
  if(s.costs!==undefined) {
    const c=object(s.costs);
    if(typeof c.preset!=='string'||!Object.hasOwn(COST_PRESETS,c.preset)) throw new UserError('Unknown cost preset.');
    number(c.slippagePct,'Slippage',0,10);
    if(c.preset==='CUSTOM') {
      const m=object(c.custom);
      for(const key of Object.keys(ZERO_MODEL)) number(m[key],key,0,key==='gstPct'?100:key==='brokerageCap'||key==='dpBase'?10000:1);
    }
  }
  // Only known settings are retained; client user IDs/plan flags never propagate.
  return {providerId:s.providerId,symbol:s.symbol,startDate:s.startDate,endDate:s.endDate,initialCapital:s.initialCapital,strategy:s.strategy,riskManagement:r,positionSizing:p,portfolio:limits,costs:s.costs,exchange:s.exchange??'NSE',timeframe:'day',riskFreeRatePct:s.riskFreeRatePct??0} as BacktestSettings;
}
