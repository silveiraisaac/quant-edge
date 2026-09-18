import { BacktestSettings, StrategyConfig } from "@/lib/types";
import { STRATEGY_DEFINITIONS, getStrategyDefinition } from "@/lib/strategies";
import { ConfigSection, Field } from "./config-section";
import { NumericInput } from "./numeric-input";

interface Props {
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
}

export function StrategySection({ settings, onChange }: Props) {
  const strategy = settings.strategy;
  const activeDef = getStrategyDefinition(strategy.type);

  function updateStrategy(next: StrategyConfig) {
    onChange({ ...settings, strategy: next });
  }

  return (
    <ConfigSection title="Strategy">
      <Field label="Strategy">
        <select
          value={strategy.type}
          onChange={(e) => {
            const def = getStrategyDefinition(e.target.value as StrategyConfig["type"]);
            updateStrategy(def.defaultConfig);
          }}
          className="input"
        >
          {STRATEGY_DEFINITIONS.map((def) => (
            <option key={def.type} value={def.type}>
              {def.label}
            </option>
          ))}
        </select>
      </Field>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
        {activeDef.shortDescription}
      </p>

      {strategy.type === "SMA_CROSSOVER" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fast period">
            <NumericInput
              min={2}
              max={200}
              value={strategy.fastPeriod}
              onChange={(v) => updateStrategy({ ...strategy, fastPeriod: v })}
            />
          </Field>
          <Field label="Slow period">
            <NumericInput
              min={3}
              max={400}
              value={strategy.slowPeriod}
              onChange={(v) => updateStrategy({ ...strategy, slowPeriod: v })}
            />
          </Field>
        </div>
      )}

      {strategy.type === "RSI_MEAN_REVERSION" && (
        <div className="grid grid-cols-3 gap-3">
          <Field label="RSI period">
            <NumericInput
              min={2}
              max={100}
              value={strategy.period}
              onChange={(v) => updateStrategy({ ...strategy, period: v })}
            />
          </Field>
          <Field label="Oversold">
            <NumericInput
              min={1}
              max={49}
              value={strategy.oversold}
              onChange={(v) => updateStrategy({ ...strategy, oversold: v })}
            />
          </Field>
          <Field label="Overbought">
            <NumericInput
              min={51}
              max={99}
              value={strategy.overbought}
              onChange={(v) => updateStrategy({ ...strategy, overbought: v })}
            />
          </Field>
        </div>
      )}
    </ConfigSection>
  );
}
