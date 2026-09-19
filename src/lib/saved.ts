import { BacktestResult, BacktestSettings, PerformanceSummary } from './types';
import { validateSettings } from './validation';
export interface SavedRun {id:string;name:string;settings:BacktestSettings;summary:PerformanceSummary;created_at:string;is_synthetic:boolean;provenance?:BacktestResult['provenance']}
export const LOCAL_KEY='quant-edge.saved.v1';
export function parseLocalSaves(raw:string|null):SavedRun[] {
  if(!raw)return [];
  const rows:unknown=JSON.parse(raw);
  if(!Array.isArray(rows)||rows.length>100)throw new Error('Saved history is invalid or too large. Export your browser data before resetting it.');
  return rows.map(r=>{
    if(!r||typeof r.id!=='string'||typeof r.name!=='string'||!r.summary||!Number.isFinite(r.summary.endingCapital)||typeof r.is_synthetic!=='boolean')throw new Error('Saved history is malformed.');
    return {...r,settings:validateSettings(r.settings)};
  });
}
