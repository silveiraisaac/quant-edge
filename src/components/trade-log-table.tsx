import { Trade } from "@/lib/types";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";

export function TradeLogTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Trade log</h2>
        <span className="text-xs text-slate-400">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <p className="text-sm text-slate-400">
          No trades were triggered for this strategy and date range.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-left font-medium text-slate-500">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Entry</th>
                <th className="px-2 py-2">Exit</th>
                <th className="px-2 py-2 text-right">Entry price</th>
                <th className="px-2 py-2 text-right">Exit price</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-2 py-2 text-right">P&L</th>
                <th className="px-2 py-2 text-right">P&L %</th>
                <th className="px-2 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-500">{t.id}</td>
                  <td className="px-2 py-2 text-slate-700">{formatDate(t.entryDate)}</td>
                  <td className="px-2 py-2 text-slate-700">{formatDate(t.exitDate)}</td>
                  <td className="px-2 py-2 text-right text-slate-700">
                    {formatCurrency(t.entryPrice)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-700">
                    {formatCurrency(t.exitPrice)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-700">{t.quantity}</td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      t.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(t.pnl)}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      t.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {formatPct(t.pnlPct)}
                  </td>
                  <td className="px-2 py-2 text-slate-400">
                    {t.reason === "SIGNAL_EXIT" ? "Signal exit" : "End of period"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
