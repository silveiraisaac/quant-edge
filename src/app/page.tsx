"use client";



import { useEffect, useState, useRef } from "react";

import { BacktestResult, BacktestSettings, SymbolInfo } from "@/lib/types";

const DEFAULT_PROVIDER_ID = "synthetic";



import { ConfigPanel } from "@/components/backtester/config-panel";

import { ResultsDashboard } from "@/components/results-dashboard";

import { DemoDataBanner } from "@/components/demo-data-banner";



import { ComparisonPanel } from '@/components/comparison-panel';
import { ResultActions } from '@/components/result-actions';
import { ComparisonRun } from '@/lib/comparison';

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

  // Capital % at 90 is exactly what positionSizePct: 0.9 used to mean —

  // this default preserves every pre-Phase-3.2 result byte-for-byte.

  positionSizing: {

    mode: "CAPITAL_PERCENT",

    capitalPercent: 90,

    fixedQuantity: 10,

    riskPercent: 1,

  },

  // maxConcurrentPositions: 1 and maxCapitalAllocationPct: 100 are both

  // unrestricted in the sense that matters — with only one position ever

  // open and no allocation ceiling below 100%, neither constraint can

  // ever bind, so pre-Phase-3.2 behavior is preserved exactly by default.

  portfolio: {

    maxConcurrentPositions: 1,

    maxCapitalAllocationPct: 100,

  },

};



export default function HomePage() {

  const runLock = useRef(false);
  const [comparisons,setComparisons] = useState<ComparisonRun[]>([]);
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);

  const [settings, setSettings] = useState<BacktestSettings>(DEFAULT_SETTINGS);

  const [result, setResult] = useState<BacktestResult | null>(null);

  const [isRunning, setIsRunning] = useState(false);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    const controller = new AbortController();

    fetch(`/api/providers?id=${settings.providerId}`, {signal:controller.signal})

      .then(async r => {if(!r.ok) throw new Error('Could not load provider instruments.');return r.json();})

      .then(setSymbols).catch(e => {if(e.name !== 'AbortError') {setSymbols([]);setError(e.message);}});

    return () => controller.abort();

  }, [settings.providerId]);



  async function handleRun() {

    if(runLock.current)return;
    runLock.current=true;
    setIsRunning(true);

    setError(null);

    if (!Number.isFinite(settings.initialCapital) || settings.initialCapital <= 0) {

      setError("Initial capital must be a valid number greater than zero.");

      setResult(null);

      runLock.current=false;
      setIsRunning(false);

      return;

    }

    if (settings.positionSizing.mode === "RISK_PERCENT" && !settings.riskManagement.stopLossEnabled) {

      setError(

        "Risk % position sizing requires Stop Loss to be enabled (under Risk Management).",

      );

      setResult(null);

      runLock.current=false;
      setIsRunning(false);

      return;

    }

    try {

      const response = await fetch('/api/backtest', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(settings)});

      const output = await response.json();

      if(!response.ok) throw new Error(output.error ?? 'Backtest request failed.');

      setResult(output);

    } catch (err) {

      setError(err instanceof Error ? err.message : "Backtest failed unexpectedly.");

      setResult(null);

    } finally {

      runLock.current=false;
      setIsRunning(false);

    }

  }



  return (

    <div className="min-h-screen bg-slate-100">

      <div className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

          <h1 className="text-xl font-semibold text-slate-900">Strategy Backtester</h1>

          <p className="mt-0.5 text-sm text-slate-500">

            Configure a strategy, run it against demo or configured historical data, and review the results below.

          </p>

        </div>

      </div>



      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

        {settings.providerId === "synthetic" ? <DemoDataBanner /> : <div className="qe-card border-teal-300 p-4 text-sm text-teal-900">REAL HISTORICAL DATA — Kite Connect. Credentials and licensed instruments must be configured. No synthetic fallback.</div>}



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



          <div id="results" className="min-w-0 scroll-mt-20" aria-live="polite" aria-busy={isRunning}>

            {error && (

              <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>

            )}



            {!result && !error && (

              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">

                Configure a strategy and click &quot;Run backtest&quot; to see results.

              </div>

            )}



            {result && <><ResultActions result={result} disabled={comparisons.length>=4} onCompare={()=>setComparisons(prev=>prev.length>=4?prev:[...prev,{id:crypto.randomUUID(),name:`${result.settings.strategy.type} (${prev.length+1})`,result}])} /><ResultsDashboard result={result} /></>}
            <div className="mt-5"><ComparisonPanel runs={comparisons} onRemove={id=>setComparisons(prev=>prev.filter(r=>r.id!==id))} /></div>

          </div>

        </div>

      </div>

    </div>

  );

}

