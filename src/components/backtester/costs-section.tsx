import { BacktestSettings } from '@/lib/types';
import { BrokerPreset, COST_PRESETS, CostModel, ZERO_MODEL } from '@/lib/costs/presets';
import { ConfigSection, Field } from './config-section';
import { NumericInput } from './numeric-input';
const labels: Record<keyof CostModel, string> = { brokeragePct: 'Brokerage (%)', brokerageCap: 'Brokerage cap per order (₹)', sttBuyPct: 'STT buy (%)', sttSellPct: 'STT sell (%)', exchangePct: 'Exchange (%)', sebiPct: 'SEBI (%)', ipftPct: 'IPFT (%)', gstPct: 'GST (%)', stampBuyPct: 'Stamp buy (%)', dpBase: 'DP per stock/day before GST (₹)' };
export function CostsSection({ settings, onChange }: { settings: BacktestSettings; onChange: (s: BacktestSettings) => void }) {
  const costs = settings.costs ?? { preset: 'ZERO', slippagePct: 0 };
  return <ConfigSection title="Costs & execution">
    <Field label="Cost preset"><select className="input" value={costs.preset} onChange={e => onChange({ ...settings, costs: { ...costs, preset: e.target.value as BrokerPreset, custom: costs.custom ?? ZERO_MODEL } })}>
      {Object.entries(COST_PRESETS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
    </select></Field>
    <Field label="Slippage per side (%)"><NumericInput value={costs.slippagePct} decimals={3} min={0} max={10} onChange={slippagePct => onChange({ ...settings, costs: { ...costs, slippagePct } })} /></Field>
    {costs.preset === 'CUSTOM' && <details><summary className="cursor-pointer text-sm">Custom charge components</summary><div className="mt-3 grid grid-cols-2 gap-3">
      {(Object.keys(labels) as (keyof CostModel)[]).map(key => <Field key={key} label={labels[key]}><NumericInput value={(costs.custom ?? ZERO_MODEL)[key]} decimals={7} min={0} onChange={v => onChange({ ...settings, costs: { ...costs, custom: { ...(costs.custom ?? ZERO_MODEL), [key]: v } } })} /></Field>)}
    </div></details>}
    <p className="text-xs text-slate-600">Current rates verified 20 Sep 2026. Estimated charges; historical tariffs and contract-note rounding can differ. Slippage changes fill prices.</p>
    {costs.preset === 'ZERODHA_INTRADAY' && <p className="text-xs text-amber-800">Positions close each day. Daily candles cannot model the broker’s exact square-off time.</p>}
  </ConfigSection>;
}
