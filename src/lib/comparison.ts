import { BacktestResult } from './types';
export interface ComparisonRun {id:string;name:string;result:BacktestResult}
export function comparisonSeries(runs:ComparisonRun[]) {
  const dates=[...new Set(runs.flatMap(r=>r.result.equityCurve.map(p=>p.date)))].sort();
  const maps=runs.map(r=>new Map(r.result.equityCurve.map(p=>[p.date,(p.equity/r.result.settings.initialCapital-1)*100])));
  return dates.map(date=>Object.fromEntries([['date',date],...runs.map((r,i)=>[r.id,maps[i].get(date)??null])]));
}
export function comparisonWarnings(runs:ComparisonRun[]):string[] {
  const warnings:string[]=[];
  if(new Set(runs.map(r=>r.result.isSynthetic)).size>1)warnings.push('This comparison mixes synthetic and real data. Synthetic results are not historical performance.');
  if(new Set(runs.map(r=>`${r.result.settings.symbol}/${r.result.settings.startDate}/${r.result.settings.endDate}/${r.result.provenance?.dataHash}`)).size>1)warnings.push('Instruments, date ranges or data differ. The runs are not controlled like-for-like comparisons.');
  return warnings;
}
