import { BacktestSettings, StrategyConfig } from "@/lib/types";
import { STRATEGY_DEFINITIONS, getStrategyDefinition } from "@/lib/strategies";
import { Field } from "./config-section";
import { NumericInput } from "./numeric-input";

const PARAMETER_LABELS: Record<string, string> = {
  fastPeriod: "Fast period", slowPeriod: "Slow period", period: "Lookback period",
  oversold: "Oversold level", overbought: "Overbought level", entryThreshold: "Entry threshold",
  exitThreshold: "Exit threshold", entryPeriod: "Entry channel", exitPeriod: "Exit channel",
  threshold: "ROC threshold (%)", deviations: "Band deviations", signalPeriod: "Signal period",
};

const CATEGORY_STYLES: Record<string, string> = {
  "Trend Following": "border-blue-200 bg-blue-50 text-blue-700",
  Momentum: "border-violet-200 bg-violet-50 text-violet-700",
  "Mean Reversion": "border-amber-200 bg-amber-50 text-amber-700",
  Breakout: "border-teal-200 bg-teal-50 text-teal-700",
};

export function StrategySection({ settings, onChange }: { settings: BacktestSettings; onChange: (settings: BacktestSettings) => void }) {
  const strategy = settings.strategy;
  const active = getStrategyDefinition(strategy.type);
  const updateStrategy = (next: StrategyConfig) => onChange({ ...settings, strategy: next });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {STRATEGY_DEFINITIONS.map((definition) => {
          const selected = definition.type === strategy.type;
          return <button key={definition.type} type="button" aria-pressed={selected} onClick={() => updateStrategy(definition.defaultConfig)} className={`min-h-0 rounded-xl border p-3 text-left transition ${selected ? "border-[var(--qe-accent-dark)] bg-[var(--qe-accent-soft)] shadow-[0_0_0_1px_var(--qe-accent-dark)]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
            <span className="flex items-start justify-between gap-2"><span className="text-xs font-bold text-slate-800">{definition.label}</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${CATEGORY_STYLES[definition.category]}`}>{definition.category}</span></span>
            <span className="mt-1.5 block text-[11px] leading-4 text-slate-500">{definition.shortDescription}</span>
          </button>;
        })}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <p className="text-xs font-bold text-slate-800">{active.label} parameters</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {Object.entries(strategy).filter(([key]) => key !== "type").map(([key, value]) => <Field key={key} label={PARAMETER_LABELS[key] ?? key}><NumericInput min={key === "threshold" ? 0 : 0.5} max={500} decimals={key === "deviations" || key === "threshold" ? 2 : 0} value={Number(value)} onChange={(next) => updateStrategy({ ...strategy, [key]: next } as StrategyConfig)} /></Field>)}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-500">{active.howItWorks}</p>
      </div>
    </div>
  );
}
