"use client";

import { BacktestSettings, SymbolInfo } from "@/lib/types";
import { getStrategyDefinition } from "@/lib/strategies";
import { COST_PRESETS } from "@/lib/costs/presets";
import { CapitalSection } from "./capital-section";
import { CostsSection } from "./costs-section";
import { MarketSection } from "./market-section";
import { PortfolioConstraintsSection } from "./portfolio-constraints-section";
import { PositionSizingSection } from "./position-sizing-section";
import { RiskManagementSection } from "./risk-section";
import { StrategySection } from "./strategy-section";

interface Props {
  symbols: SymbolInfo[];
  settings: BacktestSettings;
  onChange: (settings: BacktestSettings) => void;
  onRun: () => void;
  isRunning: boolean;
}

function Step({ number, title, description, children, open = true }: { number: number; title: string; description: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-slate-200 last:border-b-0" open={open}>
      <summary className="flex list-none items-start gap-3 px-4 py-4 marker:content-none sm:px-5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--qe-accent-soft)] text-xs font-bold text-[var(--qe-accent-dark)]">{number}</span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span>
        <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.19l3.71-3.96a.75.75 0 1 1 1.1 1.02l-4.25 4.54a.75.75 0 0 1-1.1 0L5.21 8.25a.75.75 0 0 1 .02-1.04Z" clipRule="evenodd" /></svg>
      </summary>
      <div className="px-4 pb-5 sm:px-5">{children}</div>
    </details>
  );
}

export function ConfigPanel({ symbols, settings, onChange, onRun, isRunning }: Props) {
  const strategy = getStrategyDefinition(settings.strategy.type);
  const riskEnabled = [settings.riskManagement.stopLossEnabled, settings.riskManagement.targetEnabled, settings.riskManagement.trailingStopEnabled].filter(Boolean).length;
  return (
    <aside className="qe-card overflow-hidden xl:sticky xl:top-20" aria-label="Backtest builder">
      <div className="border-b border-slate-200 bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-4"><div><p className="qe-eyebrow">Backtest builder</p><h2 className="qe-title mt-1 text-xl">Research configuration</h2></div><span className="qe-pill">6 steps</span></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Core choices stay visible; advanced risk and execution assumptions can be reviewed when needed.</p>
      </div>
      <Step number={1} title="Market & data" description="Source, instrument, exchange, and research window"><MarketSection symbols={symbols} settings={settings} onChange={onChange} /></Step>
      <Step number={2} title="Strategy" description={`${strategy.category} · ${strategy.label}`}><StrategySection settings={settings} onChange={onChange} /></Step>
      <Step number={3} title="Capital & position sizing" description="Starting cash, sizing method, and allocation limits"><div className="space-y-5"><CapitalSection settings={settings} onChange={onChange} /><PositionSizingSection settings={settings} onChange={onChange} /><PortfolioConstraintsSection settings={settings} onChange={onChange} /></div></Step>
      <Step number={4} title="Risk management" description={riskEnabled ? `${riskEnabled} protective control${riskEnabled > 1 ? "s" : ""} enabled` : "Strategy exits only"} open={false}><RiskManagementSection settings={settings} onChange={onChange} /></Step>
      <Step number={5} title="Costs & execution" description={`${COST_PRESETS[settings.costs?.preset ?? "ZERO"]} · ${settings.costs?.slippagePct ?? 0}% slippage`} open={false}><div className="space-y-4"><CostsSection settings={settings} onChange={onChange} /><label className="block text-xs font-semibold text-slate-600">Annual risk-free rate (%)<input className="input mt-1.5" type="number" min={-50} max={100} step="0.1" value={settings.riskFreeRatePct ?? 0} onChange={(event) => onChange({ ...settings, riskFreeRatePct: Number(event.target.value) })} /><span className="mt-1.5 block font-normal leading-5 text-slate-500">Used for Sharpe and Sortino excess-return calculations.</span></label></div></Step>
      <div className="bg-slate-50 px-4 py-5 sm:px-5">
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-slate-500">Instrument</p><p className="mt-1 truncate font-bold text-slate-800">{settings.symbol || "Not selected"}</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-slate-500">Starting capital</p><p className="qe-figure mt-1 font-bold text-slate-800">₹{new Intl.NumberFormat("en-IN").format(settings.initialCapital || 0)}</p></div></div>
        <button onClick={onRun} disabled={isRunning || !settings.symbol} className="qe-btn-primary w-full">{isRunning ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> Analyzing strategy…</> : <>Run backtest <span aria-hidden="true">→</span></>}</button>
        <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">Signals execute at the next open. No live orders are placed.</p>
      </div>
    </aside>
  );
}
