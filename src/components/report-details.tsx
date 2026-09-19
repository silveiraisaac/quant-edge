import { BacktestResult } from '@/lib/types';
import { formatCurrency, formatNumber, formatPct } from '@/lib/format';
import { COST_PRESETS } from '@/lib/costs/presets';
export function ReportDetails({result:r}:{result:BacktestResult}) {
  const s=r.summary;
  const metrics:[string,string][]=[['Initial capital',formatCurrency(s.startingCapital)],['Gross P&L',formatCurrency(s.grossPnl)],['Trading charges',formatCurrency(s.totalTradingCosts)],['Slippage impact (already in fills)',formatCurrency(s.slippageImpact)],['Average win (₹)',formatCurrency(s.averageWin)],['Average loss (₹)',formatCurrency(s.averageLoss)],['Best trade',formatCurrency(s.bestTrade)],['Worst trade',formatCurrency(s.worstTrade)],['Expectancy per trade',formatCurrency(s.expectancy)],['Risk/reward',formatNumber(s.riskReward)],['Winning / losing / breakeven',`${s.winningTrades} / ${s.losingTrades} / ${s.breakevenTrades}`],['Consecutive wins / losses',`${s.consecutiveWins} / ${s.consecutiveLosses}`],['Average holding days',formatNumber(s.averageHoldingDays,1)],['Exposure (sessions)',formatPct(s.exposurePct)],['Turnover (buy + sell)',formatCurrency(s.turnover)],['Maximum drawdown (₹)',formatCurrency(s.maxDrawdownInr)],['Drawdown peak',s.drawdownPeakDate??'N/A'],['Drawdown trough',s.drawdownTroughDate??'N/A'],['Recovery',s.recoveryDate??(s.drawdownPeakDate?'Not recovered':'N/A')],['Drawdown duration (days)',String(s.drawdownDurationDays)],['Longest recovery / ongoing (days)',String(s.longestRecoveryDays)]];
  return <>
    <details className="qe-card p-5" open><summary className="cursor-pointer text-sm font-semibold">Performance, risk & costs</summary><dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">{metrics.map(([name,value])=><div key={name} className="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt className="text-slate-600">{name}</dt><dd className="text-right font-medium tabular-nums">{value}</dd></div>)}</dl></details>
    <details className="qe-card p-5"><summary className="cursor-pointer text-sm font-semibold">Configuration & data source</summary><div className="mt-3 space-y-2 text-xs text-slate-600">
      <p className="font-semibold">{r.isSynthetic?'DEMO / SYNTHETIC':'REAL HISTORICAL DATA'}</p>
      <p>{r.provenance?.provider} · {r.settings.symbol} · {r.provenance?.exchange} · Daily candles</p>
      <p>Requested: {r.settings.startDate} — {r.settings.endDate}. Available: {r.provenance?.actualStart} — {r.provenance?.actualEnd} ({r.provenance?.barCount} bars).</p>
      <p>{r.provenance?.adjustmentPolicy}</p><p className="break-all">Data SHA-256: {r.provenance?.dataHash}</p>
      <p>{COST_PRESETS[r.settings.costs?.preset??'ZERO']} · Slippage {r.settings.costs?.slippagePct??0}% per side · Risk-free rate {r.settings.riskFreeRatePct??0}%.</p>
      <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-3">{JSON.stringify(r.settings,null,2)}</pre>
    </div></details>
    <p className="text-xs text-slate-600">Backtested performance does not guarantee future results. Demo/synthetic results are not historical market performance. N/A means the metric is undefined. See Docs for calculation assumptions.</p>
  </>;
}
