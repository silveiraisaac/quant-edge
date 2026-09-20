import { BacktestResult } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const MODE_DESCRIPTIONS: Record<string, string> = {
  CAPITAL_PERCENT: "the configured capital % per trade",
  FIXED_QUANTITY: "the configured fixed quantity",
  RISK_PERCENT: "the configured risk % per trade",
};

export function InsufficientCapitalWarning({ result }: { result: BacktestResult }) {
  const prices = result.bars.map((b) => b.open);
  const cheapestPrice = result.lowestOpenPrice ?? (prices.length > 0 ? Math.min(...prices) : 0);
  const modeDescription = MODE_DESCRIPTIONS[result.settings.positionSizing.mode] ?? "the configured sizing";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3">
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-orange-900">
        <span className="font-semibold">No trades were possible with this configuration.</span>{" "}
        The strategy generated entry signals, but {modeDescription} — combined with{" "}
        {formatCurrency(result.settings.initialCapital)} starting capital, position sizing,
        portfolio allocation, and available cash — couldn&apos;t buy even one unit of{" "}
        {result.settings.symbol}. The lowest price in this period was{" "}
        {formatCurrency(cheapestPrice)}. This isn&apos;t a bug: whole-share position sizing with
        no leverage genuinely can&apos;t open a position here. Try a larger capital, a different
        sizing mode or value, a higher max allocation %, or a lower-priced instrument.
      </p>
    </div>
  );
}
