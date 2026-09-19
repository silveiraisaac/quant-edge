import { BacktestSettings } from "@/lib/types";
import { ConfigSection, Field } from "./config-section";
import { CurrencyInput } from "./currency-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function CapitalSection({ settings, onChange }: Props) {
  return (
    <ConfigSection title="Capital">
      <Field label="Initial capital (₹)">
        <CurrencyInput
          value={settings.initialCapital}
          onChange={(v) => onChange({ ...settings, initialCapital: v })}
          min={1000}
        />
      </Field>
    </ConfigSection>
  );
}
