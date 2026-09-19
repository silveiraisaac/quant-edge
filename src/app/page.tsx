"use client";

import { useEffect, useState } from "react";
import { BacktestResult, BacktestSettings, SymbolInfo } from "@/lib/types";
import { DEFAULT_PROVIDER_ID, getProvider } from "@/lib/data/registry";
import { runBacktest } from "@/lib/backtest/run-backtest";
import { ConfigPanel } from "@/components/backtester/config-panel";
import { ResultsDashboard } from "@/components/results-dashboard";
import { DemoDataBanner } from "@/components/demo-data-banner";

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 3);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

const { startDate, endDate } = defaultDateRange();

const DEFAULT_SETTINGS: BacktestSettings = {
  providerId: DEFAULT_PROVIDER_ID,
  symbol: "DEMO-NIFTY50",
  startDate,
  endDate,
  initialCapital: 1_000_000,
  positionSizePct: 0.9,
  strategy: { type: "SMA_CROSSOVER", fastPeriod: 20, slowPeriod: 50 },
  // All disabled by default — existing backtests must be unaffected until
  // the user explicitly opts in. Percentages have sensible defaults ready
  // to go the moment a control is switched on.
  riskManagement: {
    stopLossEnabled: false,
    stopLossPct: 2,
    targetEnabled: false,
    targetPct: 5,
    trailingStopEnabled: false,
    trailingStopPct: 3,
  },
};

export default function HomePage() {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [settings, setSettings] = useState<BacktestSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProvider(settings.providerId)
      .listSymbols()
      .then(setSymbols)
      .catch(() => setSymbols([]));
    // Only needs to re-run if the provider changes; settings.providerId is stable for this stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRun() {
    setIsRunning(true);
    setError(null);
    if (!Number.isFinite(settings.initialCapital) || settings.initialCapital <= 0) {
      setError("Initial capital must be a valid number greater than zero.");
      setResult(null);
      setIsRunning(false);
      return;
    }
    try {
      const output = await runBacktest(settings);
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed unexpectedly.");
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-semibold text-slate-900">Strategy Backtester</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Configure a strategy, run it against demo market data, and review the results below.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <DemoDataBanner />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
          <div className="lg:sticky lg:top-[72px] lg:self-start">
            <ConfigPanel
              symbols={symbols}
              settings={settings}
              onChange={setSettings}
              onRun={handleRun}
              isRunning={isRunning}
            />
          </div>

          <div id="results" className="scroll-mt-20">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!result && !error && (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                Configure a strategy and click &quot;Run backtest&quot; to see results.
              </div>
            )}

            {result && <ResultsDashboard result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
