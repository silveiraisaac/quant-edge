'use client';
import { BacktestResult } from '@/lib/types';
import { tradeCsv,summaryJson } from '@/lib/exports';
export function downloadFile(name:string,content:string,type:string) {
  const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function ResultActions({result,onCompare,disabled}:{result:BacktestResult;onCompare:()=>void;disabled:boolean}) {
  const cls='rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50';
  return <div className="mb-4 flex flex-wrap gap-2"><button className={cls} disabled={disabled} onClick={onCompare}>Add to comparison {disabled?'(4 maximum)':''}</button><button className={cls} onClick={()=>downloadFile('quant-edge-trades.csv',tradeCsv(result),'text/csv;charset=utf-8')}>Export trade CSV</button><button className={cls} onClick={()=>downloadFile('quant-edge-summary.json',summaryJson(result),'application/json')}>Export summary</button></div>;
}
