export function DemoDataBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 ${compact ? "mb-0" : ""}`}>
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.598c.75 1.334-.213 2.986-1.743 2.986H3.484c-1.53 0-2.493-1.652-1.743-2.986L8.257 3.1zM10 8a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0110 8zm0 7a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm leading-5 text-amber-950">
        <span className="font-bold">Demo Dataset · Synthetic Market Data</span> · Demonstrates Quant Edge’s backtesting workflow and does not represent actual historical NSE or BSE market performance.
      </p>
    </div>
  );
}
