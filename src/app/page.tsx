"use client";

import { useEffect, useState } from "react";
import { BacktestResult, BacktestSettings, SymbolInfo } from "@/lib/types";
import { DATA_PROVIDERS, DEFAULT_PROVIDER_ID, getProvider } from "@/lib/data/registry";
import { runBacktest } from "@/lib/backtest/run-backtest";
import { StrategyConfigPanel } from "@/components/strategy-config-panel";
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Strategy Backtester</h1>
          <p className="text-sm text-slate-500">
            Configure a strategy and run it against{" "}
            {DATA_PROVIDERS.find((p) => p.id === settings.providerId)?.label.toLowerCase()}.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <DemoDataBanner />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <StrategyConfigPanel
              symbols={symbols}
              settings={settings}
              onChange={setSettings}
              onRun={handleRun}
              isRunning={isRunning}
            />
          </div>

          <div>
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
