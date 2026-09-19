import { Trade } from "@/lib/types";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";

function holdingDays(entryDate: string, exitDate: string): number {
  const ms = new Date(exitDate + "T00:00:00Z").getTime() - new Date(entryDate + "T00:00:00Z").getTime();
  return Math.round(ms / 86_400_000);
}

const EXIT_REASON_LABELS: Record<Trade["reason"], string> = {
  STRATEGY_EXIT: "Strategy Exit",
  STOP_LOSS: "Stop Loss",
  TARGET: "Target",
  TRAILING_STOP: "Trailing Stop",
  PERIOD_END: "Period End",
};

const EXIT_REASON_STYLES: Record<Trade["reason"], string> = {
  STRATEGY_EXIT: "text-slate-500",
  STOP_LOSS: "text-red-600 font-medium",
  TARGET: "text-emerald-600 font-medium",
  TRAILING_STOP: "text-amber-600 font-medium",
  PERIOD_END: "text-slate-400",
};

function exitReasonLabel(reason: Trade["reason"]): string {
  return EXIT_REASON_LABELS[reason];
}

export function TradeLogTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="qe-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Trade Log</h2>
        <span className="text-xs text-slate-400">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <p className="text-sm text-slate-400">
          No trades were triggered for this strategy and date range.
        </p>
      ) : (
        <div className="max-h-96 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[980px] text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-left font-medium text-slate-500">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Instrument</th>
                <th className="px-2 py-2">Entry date</th>
                <th className="px-2 py-2 text-right">Entry price</th>
                <th className="px-2 py-2">Exit date</th>
                <th className="px-2 py-2 text-right">Exit price</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-2 py-2 text-right">Gross P&L</th>
                <th className="px-2 py-2 text-right">Charges</th>
                <th className="px-2 py-2 text-right">Net P&L</th>
                <th className="px-2 py-2 text-right">Return %</th>
                <th className="px-2 py-2 text-right">Holding</th>
                <th className="px-2 py-2">Entry reason</th>
                <th className="px-2 py-2">Exit reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const netPnl = t.charges !== undefined ? t.pnl - t.charges : t.pnl;
                return (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-2 py-2 text-slate-500">{t.id}</td>
                    <td className="px-2 py-2 font-medium text-slate-700">{t.symbol}</td>
                    <td className="px-2 py-2 text-slate-700">{formatDate(t.entryDate)}</td>
                    <td className="qe-figure px-2 py-2 text-right text-slate-700">
                      {formatCurrency(t.entryPrice)}
                    </td>
                    <td className="px-2 py-2 text-slate-700">{formatDate(t.exitDate)}</td>
                    <td className="qe-figure px-2 py-2 text-right text-slate-700">
                      {formatCurrency(t.exitPrice)}
                    </td>
                    <td className="qe-figure px-2 py-2 text-right text-slate-700">{t.quantity}</td>
                    <td
                      className={`qe-figure px-2 py-2 text-right font-medium ${
                        t.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(t.pnl)}
                    </td>
                    <td className="qe-figure px-2 py-2 text-right text-slate-400">
                      {t.charges !== undefined ? formatCurrency(t.charges) : "—"}
                    </td>
                    <td
                      className={`qe-figure px-2 py-2 text-right font-medium ${
                        netPnl >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(netPnl)}
                    </td>
                    <td
                      className={`qe-figure px-2 py-2 text-right font-medium ${
                        t.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatPct(t.pnlPct)}
                    </td>
                    <td className="qe-figure px-2 py-2 text-right text-slate-500">
                      {holdingDays(t.entryDate, t.exitDate)}d
                    </td>
                    <td className="px-2 py-2 text-slate-400">{t.entryReason}</td>
                    <td className={`px-2 py-2 ${EXIT_REASON_STYLES[t.reason]}`}>
                      {exitReasonLabel(t.reason)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Charges are shown as &ldquo;—&rdquo; because the cost model (brokerage, slippage, taxes)
        is not yet implemented — Net P&L currently equals Gross P&L.
      </p>
    </div>
  );
}
