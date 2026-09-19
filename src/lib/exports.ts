import { BacktestResult } from './types';
function cell(v:unknown):string {
  // Neutralize spreadsheet formulas in user/provider-controlled text.
  const s=v===null||v===undefined?'':String(v);
  const safe=typeof v==='string'&&/^[\s]*[=+\-@\t\r]/.test(s)?`'${s}`:s;
  return `"${safe.replace(/"/g,'""')}"`;
}
export function tradeCsv(r:BacktestResult):string {
  const header=['Trade','Data mode','Provider','Symbol','Entry date','Entry fill','Exit date','Exit fill','Quantity','Position value INR','Sizing','Gross P&L INR','Charges INR','Net P&L INR','Return %','Holding days','Entry reason','Exit reason','Slippage impact INR','Brokerage','STT','Exchange','SEBI','IPFT','GST','Stamp','DP'];
  return '\uFEFF'+[header,...r.trades.map(t=>[t.id,r.isSynthetic?'SYNTHETIC':'REAL',r.provenance?.provider,t.symbol,t.entryDate,t.entryPrice,t.exitDate,t.exitPrice,t.quantity,t.positionSizeValue,t.positionSizingMode,t.grossPnl??t.pnl,t.charges??0,t.pnl,t.pnlPct,(Date.parse(t.exitDate)-Date.parse(t.entryDate))/86400000,t.entryReason,t.reason,t.slippageImpact??0,...['brokerage','stt','exchange','sebi','ipft','gst','stamp','dp'].map(k=>t.costBreakdown?.[k as keyof NonNullable<typeof t.costBreakdown>]??0)])].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function summaryJson(r:BacktestResult):string {
  return JSON.stringify({formatVersion:1,isSynthetic:r.isSynthetic,settings:r.settings,summary:r.summary,provenance:r.provenance,assumptions:'Long-only daily candles; close signals execute next open; current cost rates; backtested performance does not guarantee future results.'},null,2);
}
