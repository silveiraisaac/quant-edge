import { ConfigSection, Field } from "./config-section";

/**
 * Disabled placeholders. The engine currently computes P&L with zero
 * transaction costs — no brokerage, slippage, or tax model exists yet, so
 * these inputs are visibly inert rather than silently ignored.
 */
export function CostsSection() {
  return (
    <ConfigSection title="Costs" badge="Coming soon">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brokerage (per trade)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
        <Field label="Slippage (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Transaction charges (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
        <Field label="Taxes / STT (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
      </div>
      <p className="text-xs text-slate-400">
        Results currently reflect zero transaction costs. A cost model is planned for a future
        phase and will be applied transparently, not estimated after the fact.
      </p>
    </ConfigSection>
  );
}
