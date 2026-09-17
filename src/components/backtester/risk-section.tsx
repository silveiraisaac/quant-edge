import { ConfigSection, Field } from "./config-section";

/**
 * All fields here are disabled placeholders. The backtest engine does not
 * yet implement stop-loss, target, trailing-stop, or max-drawdown-limit
 * logic — showing live-looking controls that silently did nothing would
 * be misleading, so these are visibly inert until the engine supports
 * them (tracked for a future phase).
 */
export function RiskManagementSection() {
  return (
    <ConfigSection title="Risk Management" badge="Coming soon">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stop loss (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
        <Field label="Target (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Trailing stop (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
        <Field label="Max drawdown limit (%)">
          <input type="number" disabled placeholder="Not yet supported" className="input" />
        </Field>
      </div>
      <p className="text-xs text-slate-400">
        These controls are placeholders for a future phase. The engine does not currently apply
        stop-loss, target, trailing-stop, or drawdown-limit exits.
      </p>
    </ConfigSection>
  );
}
