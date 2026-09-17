import { BacktestSettings, SymbolInfo } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";

interface Props {
  symbols: SymbolInfo[];
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function MarketSection({ symbols, settings, onChange }: Props) {
  return (
    <ConfigSection title="Market">
      <Field label="Symbol / Instrument">
        <select
          value={settings.symbol}
          onChange={(e) => onChange({ ...settings, symbol: e.target.value })}
          className="input"
        >
          {symbols.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Exchange">
        <select disabled value="synthetic" className="input">
          <option value="synthetic">Synthetic Demo Data (no live exchange)</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date">
          <input
            type="date"
            value={settings.startDate}
            onChange={(e) => onChange({ ...settings, startDate: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={settings.endDate}
            onChange={(e) => onChange({ ...settings, endDate: e.target.value })}
            className="input"
          />
        </Field>
      </div>
    </ConfigSection>
  );
}
