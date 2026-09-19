"use client";

import { BacktestSettings, SymbolInfo } from "@/lib/types";
import { MarketSection } from "./market-section";
import { CapitalSection } from "./capital-section";
import { PositionSizingSection } from "./position-sizing-section";
import { PortfolioConstraintsSection } from "./portfolio-constraints-section";
import { StrategySection } from "./strategy-section";
import { RiskManagementSection } from "./risk-section";
import { CostsSection } from "./costs-section";

interface Props {
  symbols: SymbolInfo[];
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
  onRun: () => void;
  isRunning: boolean;
}

export function ConfigPanel({ symbols, settings, onChange, onRun, isRunning }: Props) {
  return (
    <div className="qe-card space-y-4 p-5">
      <h2 className="text-sm font-semibold text-slate-900">Configuration</h2>

      <MarketSection symbols={symbols} settings={settings} onChange={onChange} />
      <CapitalSection settings={settings} onChange={onChange} />
      <PositionSizingSection settings={settings} onChange={onChange} />
      <PortfolioConstraintsSection settings={settings} onChange={onChange} />
      <StrategySection settings={settings} onChange={onChange} />
      <RiskManagementSection settings={settings} onChange={onChange} />
      <CostsSection />

      <button
        onClick={onRun}
        disabled={isRunning}
        className="w-full rounded-lg bg-[var(--qe-accent-dark)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isRunning ? "Running backtest..." : "Run backtest"}
      </button>
    </div>
  );
}
