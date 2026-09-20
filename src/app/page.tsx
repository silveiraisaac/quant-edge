"use client";

import { useEffect, useRef, useState } from "react";
import { ConfigPanel } from "@/components/backtester/config-panel";
import { ComparisonPanel } from "@/components/comparison-panel";
import { DemoDataBanner } from "@/components/demo-data-banner";
import { ResultsDashboard } from "@/components/results-dashboard";
import { ResultsPlaceholder } from "@/components/results-placeholder";
import { SavedWorkspace } from "@/components/saved-workspace";
import { WorkspaceHero } from "@/components/workspace-hero";
import { ComparisonRun } from "@/lib/comparison";
import { getEntitlements } from "@/lib/entitlements";
import { BacktestResult, BacktestSettings, SymbolInfo } from "@/lib/types";

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 3);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

const { startDate, endDate } = defaultDateRange();
const DEFAULT_SETTINGS: BacktestSettings = {
  providerId: "synthetic",
  symbol: "DEMO-NIFTY50",
  startDate,
  endDate,
  initialCapital: 1_000_000,
  strategy: { type: "SMA_CROSSOVER", fastPeriod: 20, slowPeriod: 50 },
  riskManagement: { stopLossEnabled: false, stopLossPct: 2, targetEnabled: false, targetPct: 5, trailingStopEnabled: false, trailingStopPct: 3 },
  positionSizing: { mode: "CAPITAL_PERCENT", capitalPercent: 90, fixedQuantity: 10, riskPercent: 1 },
  portfolio: { maxConcurrentPositions: 1, maxCapitalAllocationPct: 100 },
};

export default function HomePage() {
  const runLock = useRef(false);
  const [comparisons, setComparisons] = useState<ComparisonRun[]>([]);
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [settings, setSettings] = useState<BacktestSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/providers?id=${settings.providerId}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load provider instruments.");
        return response.json();
      })
      .then(setSymbols)
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") { setSymbols([]); setError(reason.message); }
      });
    return () => controller.abort();
  }, [settings.providerId]);

  async function handleRun() {
    if (runLock.current) return;
    runLock.current = true;
    setIsRunning(true);
    setError(null);
    setResult(null);

    if (!Number.isFinite(settings.initialCapital) || settings.initialCapital <= 0) {
      setError("Initial capital must be a valid number greater than zero.");
      setResult(null); runLock.current = false; setIsRunning(false); return;
    }
    if (settings.positionSizing.mode === "RISK_PERCENT" && !settings.riskManagement.stopLossEnabled) {
      setError("Risk % position sizing requires Stop Loss to be enabled under Risk Management.");
      setResult(null); runLock.current = false; setIsRunning(false); return;
    }

    try {
      const response = await fetch("/api/backtest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings), signal: AbortSignal.timeout(120_000) });
      const output = await response.json();
      if (!response.ok) throw new Error(output.error ?? "Backtest request failed.");
      setResult(output);
      requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Backtest failed unexpectedly.");
      setResult(null);
    } finally {
      runLock.current = false;
      setIsRunning(false);
    }
  }

  return (
    <main>
      <WorkspaceHero />
      <section id="builder" className="scroll-mt-20 py-8 sm:py-10">
        <div className="qe-container">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="qe-eyebrow">Research workspace</p>
              <h2 className="qe-title mt-1 text-2xl sm:text-3xl">Build and evaluate a strategy</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Configure assumptions on the left. The report keeps performance, risk, costs, provenance, and trades together.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> Engine ready · Daily bars · Long only</div>
          </div>

          {settings.providerId === "synthetic" ? <DemoDataBanner compact /> : <div className="mb-5 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900"><span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Real historical data · Kite Connect · No synthetic fallback</div>}

          <div className="mt-5 grid min-w-0 gap-6 xl:grid-cols-[430px_minmax(0,1fr)] xl:items-start">
            <ConfigPanel symbols={symbols} settings={settings} onChange={setSettings} onRun={handleRun} isRunning={isRunning} />
            <div id="results" className="min-w-0 scroll-mt-24" aria-live="polite" aria-busy={isRunning}>
              {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span className="mt-0.5 font-bold" aria-hidden="true">!</span><div><p className="font-semibold">The backtest could not run</p><p className="mt-1">{error}</p><p className="mt-1 text-xs text-red-700">Review the highlighted configuration and try again. Your saved work is unchanged.</p></div></div>}
              {!result && !error && <ResultsPlaceholder isRunning={isRunning} />}
              {result && <ResultsDashboard result={result} />}
              <div className="mt-6"><ComparisonPanel runs={comparisons} currentResult={result} comparisonLimit={getEntitlements("FREE").maxComparisonRuns} onCompare={() => result && setComparisons((previous) => previous.length >= getEntitlements("FREE").maxComparisonRuns ? previous : [...previous, { id: crypto.randomUUID(), name: `${result.settings.strategy.type} (${previous.length + 1})`, result }])} onRemove={(id) => setComparisons((previous) => previous.filter((run) => run.id !== id))} /></div>
              <div className="mt-6"><SavedWorkspace result={result} onOpen={(savedSettings) => { setSettings(savedSettings); setResult(null); setError(null); document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" }); }} /></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
