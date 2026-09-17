"use client";

import { BacktestSettings, StrategyConfig, SymbolInfo } from "@/lib/types";

interface Props {
  symbols: SymbolInfo[];
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
  onRun: () => void;
  isRunning: boolean;
}

export function StrategyConfigPanel({ symbols, settings, onChange, onRun, isRunning }: Props) {
  const strategy = settings.strategy;

  function updateStrategy(next: StrategyConfig) {
    onChange({ ...settings, strategy: next });
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">Strategy configuration</h2>

      <Field label="Symbol">
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

      <Field label="Strategy">
        <select
          value={strategy.type}
          onChange={(e) => {
            const type = e.target.value as StrategyConfig["type"];
            if (type === "SMA_CROSSOVER") {
              updateStrategy({ type, fastPeriod: 20, slowPeriod: 50 });
            } else {
              updateStrategy({ type, period: 14, oversold: 30, overbought: 70 });
            }
          }}
          className="input"
        >
          <option value="SMA_CROSSOVER">Moving Average Crossover</option>
          <option value="RSI_MEAN_REVERSION">RSI Mean Reversion</option>
        </select>
      </Field>

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

      <button
        onClick={onRun}
        disabled={isRunning}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isRunning ? "Running backtest..." : "Run backtest"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
