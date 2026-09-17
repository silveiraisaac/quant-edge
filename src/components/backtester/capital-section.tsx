import { BacktestSettings } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function CapitalSection({ settings, onChange }: Props) {
  return (
    <ConfigSection title="Capital & Position Sizing">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Initial capital (₹)">
          <input
            type="number"
            min={1000}
            step={1000}
            value={settings.initialCapital}
            onChange={(e) => onChange({ ...settings, initialCapital: Number(e.target.value) })}
            className="input"
          />
        </Field>
        <Field label="Position size (% of capital)">
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={Math.round(settings.positionSizePct * 100)}
            onChange={(e) =>
              onChange({ ...settings, positionSizePct: Number(e.target.value) / 100 })
            }
            className="input"
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
