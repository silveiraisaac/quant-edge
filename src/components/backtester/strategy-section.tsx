import { BacktestSettings, StrategyConfig } from "@/lib/types";
import { STRATEGY_DEFINITIONS, getStrategyDefinition } from "@/lib/strategies";
import { ConfigSection, Field } from "./config-section";

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
            <input
              type="number"
              min={2}
              max={200}
              value={strategy.fastPeriod}
              onChange={(e) => updateStrategy({ ...strategy, fastPeriod: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Slow period">
            <input
              type="number"
              min={3}
              max={400}
              value={strategy.slowPeriod}
              onChange={(e) => updateStrategy({ ...strategy, slowPeriod: Number(e.target.value) })}
              className="input"
            />
          </Field>
        </div>
      )}

      {strategy.type === "RSI_MEAN_REVERSION" && (
        <div className="grid grid-cols-3 gap-3">
          <Field label="RSI period">
            <input
              type="number"
              min={2}
              max={100}
              value={strategy.period}
              onChange={(e) => updateStrategy({ ...strategy, period: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Oversold">
            <input
              type="number"
              min={1}
              max={49}
              value={strategy.oversold}
              onChange={(e) => updateStrategy({ ...strategy, oversold: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Overbought">
            <input
              type="number"
              min={51}
              max={99}
              value={strategy.overbought}
              onChange={(e) => updateStrategy({ ...strategy, overbought: Number(e.target.value) })}
              className="input"
            />
          </Field>
        </div>
      )}
    </ConfigSection>
  );
}
