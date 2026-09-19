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

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(strategy).filter(([key])=>key!=='type').map(([key,value])=><Field key={key} label={key.replace(/([A-Z])/g,' $1')}><NumericInput min={key==='threshold'?0:0.5} max={500} decimals={key==='deviations'||key==='threshold'?2:0} value={Number(value)} onChange={v=>updateStrategy({...strategy,[key]:v} as StrategyConfig)} /></Field>)}
      </div>
      <p className="text-xs text-slate-600">{activeDef.category} · Signals execute at the next open.</p>
    </ConfigSection>
  );
}
