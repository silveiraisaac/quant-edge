export function ResultsPlaceholder({ isRunning }: { isRunning: boolean }) {
  if (isRunning) {
    return (
      <div className="qe-card overflow-hidden" role="status" aria-label="Backtest analysis in progress">
        <div className="border-b border-slate-200 bg-[var(--qe-navy-900)] px-5 py-5 text-white sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--qe-accent)]">Analysis in progress</p>
          <h2 className="mt-1 text-lg font-semibold">Running the strategy against validated candles</h2>
          <p className="mt-1 text-sm text-slate-300">Applying execution chronology, risk controls, costs, and portfolio accounting.</p>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }
  return (
    <div className="qe-empty">
      <span className="qe-icon-box mb-4" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path d="M3 19h18"/></svg></span>
      <h2 className="qe-title text-lg">Your research report will appear here</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Choose a market, strategy, sizing approach, and execution assumptions. Quant Edge will generate actual performance, risk, cost, and trade analytics.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-slate-500"><span className="qe-pill">No fabricated results</span><span className="qe-pill">Net performance</span><span className="qe-pill">Data provenance</span></div>
    </div>
  );
}
