import { BacktestSettings } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";
import { CurrencyInput } from "./currency-input";
import { NumericInput } from "./numeric-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function CapitalSection({ settings, onChange }: Props) {
  return (
    <ConfigSection title="Capital & Position Sizing">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Initial capital (₹)">
          <CurrencyInput
            value={settings.initialCapital}
            onChange={(v) => onChange({ ...settings, initialCapital: v })}
            min={1000}
          />
        </Field>
        <Field label="Position size (% of capital)">
          <NumericInput
            min={1}
            max={100}
            value={Math.round(settings.positionSizePct * 100)}
            onChange={(v) => onChange({ ...settings, positionSizePct: v / 100 })}
          />
        </Field>
      </div>

      <Field label="Maximum concurrent positions">
        <input
          type="number"
          disabled
          value={1}
          className="input"
          title="The engine currently holds one position at a time — multi-position support is planned."
        />
      </Field>
      <p className="text-xs text-slate-400">
        The engine currently trades one position at a time. Multi-position sizing is planned for
        a future phase.
      </p>
    </ConfigSection>
  );
}
