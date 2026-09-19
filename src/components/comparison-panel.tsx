'use client';
import { useMemo } from 'react';
import { ComparisonRun, comparisonSeries, comparisonWarnings } from '@/lib/comparison';
import { formatNumber } from '@/lib/format';
import { LineChart,Line,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer } from 'recharts';
const colors=['#0d9488','#2563eb','#9333ea','#ea580c'];
export function ComparisonPanel({runs,onRemove}:{runs:ComparisonRun[];onRemove:(id:string)=>void}) {
  const data=useMemo(()=>comparisonSeries(runs),[runs]);
  const keys=['totalReturnPct','cagrPct','maxDrawdownPct','sharpeRatio','sortinoRatio','winRatePct','profitFactor','totalTrades','turnover','totalTradingCosts'] as const;
  const labels=['Return %','CAGR %','Max drawdown %','Sharpe','Sortino','Win rate %','Profit factor','Trades','Turnover ₹','Charges ₹'];
  if(!runs.length)return null;
  return <section className="qe-card min-w-0 space-y-4 p-5" aria-label="Strategy comparison"><h2 className="font-semibold">Strategy comparison</h2>
    {comparisonWarnings(runs).map(w=><p className="text-xs text-amber-800" key={w}>{w}</p>)}
    <p className="text-xs text-slate-600">Equity is shown as return on each run’s initial capital. Missing dates remain gaps. No strategy is ranked as best.</p>
    <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-xs"><thead><tr><th className="p-2 text-left">Metric</th>{runs.map(r=><th key={r.id} className="p-2">{r.name}<span className="block font-normal">{r.result.isSynthetic?'DEMO':'REAL'} · {r.result.settings.symbol}</span><button className="mt-1 text-red-700 underline" onClick={()=>onRemove(r.id)} aria-label={`Remove ${r.name}`}>Remove</button></th>)}</tr></thead><tbody>{keys.map((key,i)=><tr key={key} className="border-t border-slate-100"><th className="p-2 text-left font-normal">{labels[i]}</th>{runs.map(r=><td className="p-2 text-center tabular-nums" key={r.id}>{formatNumber(r.result.summary[key],key==='totalTrades'?0:2)}</td>)}</tr>)}</tbody></table></div>
    <ResponsiveContainer width="100%" height={260}><LineChart data={data}><XAxis dataKey="date" minTickGap={50} tick={{fontSize:10}}/><YAxis tickFormatter={v=>`${v}%`} tick={{fontSize:10}}/><Tooltip/><Legend/>{runs.map((r,i)=><Line key={r.id} dataKey={r.id} name={r.name} stroke={colors[i]} dot={false} connectNulls={false} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer>
  </section>;
}
