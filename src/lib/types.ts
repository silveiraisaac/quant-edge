/**
 * Core domain types shared across the data layer, backtest engine, and UI.
 * Keeping these in one place is what lets the synthetic data provider be
 * swapped for a real NSE/BSE provider later without touching the engine
 * or any UI component — everything downstream only depends on this file.
 */

export interface OHLCVBar {
  date: string; // ISO date, YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
}

/**
 * Any data source — synthetic today, a real market-data API later — must
 * implement this. The engine and UI only ever talk to this interface.
 */
export interface DataProvider {
  readonly id: string;
  readonly label: string;
  /** Whether this provider's data is synthetic/demo and must be labelled as such in the UI. */
  readonly isSynthetic: boolean;
  listSymbols(): Promise<SymbolInfo[]>;
  getBars(symbol: string, startDate: string, endDate: string): Promise<OHLCVBar[]>;
}

/* -------------------------------------------------------------------------- */
/* Strategy configuration                                                     */
/* -------------------------------------------------------------------------- */

export type StrategyConfig =
  | {
      type: "SMA_CROSSOVER";
      fastPeriod: number;
      slowPeriod: number;
    }
  | {
      type: "RSI_MEAN_REVERSION";
      period: number;
      oversold: number;
      overbought: number;
    };

export interface BacktestSettings {
  providerId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  // Fraction of capital risked per trade (position sizing kept simple for this stage).
  positionSizePct: number;
  strategy: StrategyConfig;
}

/* -------------------------------------------------------------------------- */
/* Backtest results                                                           */
/* -------------------------------------------------------------------------- */

export interface Trade {
  id: number;
  direction: "LONG";
  symbol: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  /** All entries in this engine are strategy-signal driven; kept as an explicit field so future entry types (e.g. manual) can be distinguished. */
  entryReason: "Strategy signal";
  reason: "SIGNAL_EXIT" | "END_OF_PERIOD";
  /**
   * Transaction charges (brokerage/slippage/taxes) for this trade.
   * Undefined means the cost model has not been implemented yet — this is
   * never defaulted to 0 or estimated, so the UI can tell "not modeled"
   * apart from "modeled and zero".
   */
  charges?: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

export interface DrawdownPoint {
  date: string;
  drawdownPct: number; // negative or zero
}

export interface MonthlyReturn {
  year: number;
  month: number; // 1-12
  returnPct: number;
}

export interface PerformanceSummary {
  startingCapital: number;
  endingCapital: number;
  netPnl: number;
  totalReturnPct: number;
  cagrPct: number;
  maxDrawdownPct: number;
  totalTrades: number;
  winRatePct: number;
  avgWinPct: number;
  avgLossPct: number;
  profitFactor: number;
  sharpeRatio: number;
}

export interface BacktestResult {
  settings: BacktestSettings;
  isSynthetic: boolean;
  bars: OHLCVBar[];
  trades: Trade[];
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  monthlyReturns: MonthlyReturn[];
  summary: PerformanceSummary;
}
