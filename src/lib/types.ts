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
  exchange?: "NSE" | "BSE";
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
  getBars(symbol: string, startDate: string, endDate: string, exchange?: string): Promise<OHLCVBar[]>;
}

/* -------------------------------------------------------------------------- */
/* Strategy configuration                                                     */
/* -------------------------------------------------------------------------- */

export type StrategyConfig =
  | {type: 'EMA_CROSSOVER'; fastPeriod:number; slowPeriod:number}
  | {type: 'RSI_MOMENTUM'; period:number; entryThreshold:number; exitThreshold:number}
  | {type: 'DONCHIAN'; entryPeriod:number; exitPeriod:number}
  | {type: 'ROC'; period:number; threshold:number}
  | {type: 'BOLLINGER'; period:number; deviations:number}
  | {type: 'MACD'; fastPeriod:number; slowPeriod:number; signalPeriod:number}
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
  timeframe?: "day";
  costs?: import("./costs/presets").ExecutionCosts;
  exchange?: "NSE" | "BSE";
  riskFreeRatePct?: number;
  providerId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  strategy: StrategyConfig;
  riskManagement: RiskManagementConfig;
  positionSizing: PositionSizingConfig;
  portfolio: PortfolioConfig;
}

/**
 * All three controls default to disabled. When every control is disabled,
 * the engine's behavior must be identical to before this feature existed —
 * this is what makes that guarantee possible, since nothing here changes
 * the exit path unless a control is explicitly turned on.
 */
export interface RiskManagementConfig {
  stopLossEnabled: boolean;
  stopLossPct: number;
  targetEnabled: boolean;
  targetPct: number;
  trailingStopEnabled: boolean;
  trailingStopPct: number;
}

/* -------------------------------------------------------------------------- */
/* Position sizing & portfolio constraints (Phase 3.2)                       */
/* -------------------------------------------------------------------------- */

export type PositionSizingMode = "CAPITAL_PERCENT" | "FIXED_QUANTITY" | "RISK_PERCENT";

export interface PositionSizingConfig {
  mode: PositionSizingMode;
  /** Used when mode === "CAPITAL_PERCENT". This is what settings.positionSizePct used to be, generalized into one of three sizing modes. */
  capitalPercent: number;
  /** Used when mode === "FIXED_QUANTITY". Whole units. */
  fixedQuantity: number;
  /** Used when mode === "RISK_PERCENT". Requires riskManagement.stopLossEnabled — see calculatePositionQuantity. */
  riskPercent: number;
}

export interface PortfolioConfig {
  /** How many simultaneously open lots are allowed. 1 preserves the original one-position-at-a-time behavior exactly. */
  maxConcurrentPositions: number;
  /** Ceiling on total capital (cost basis) tied up in open positions at once, as a % of portfolio equity. 100 = unrestricted. */
  maxCapitalAllocationPct: number;
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
  /**
   * The actual reason this trade closed. STOP_LOSS/TARGET/TRAILING_STOP are
   * only ever produced when the corresponding control is enabled in
   * settings.riskManagement — a risk-based reason is never recorded for a
   * plain strategy exit, and vice versa.
   */
  reason: "STRATEGY_EXIT" | "PERIOD_END" | "STOP_LOSS" | "TARGET" | "TRAILING_STOP" | "SESSION_END";
  /**
   * Transaction charges (brokerage/slippage/taxes) for this trade.
   * Undefined means the cost model has not been implemented yet — this is
   * never defaulted to 0 or estimated, so the UI can tell "not modeled"
   * apart from "modeled and zero".
   */
  charges?: number;
  grossPnl?: number;
  costBreakdown?: import("./costs/engine").TradeCharges;
  slippageImpact?: number;
  /** Position value at entry (quantity × entryPrice) — the actual ₹ committed to this lot. */
  positionSizeValue: number;
  /** Which sizing mode produced this trade's quantity. */
  positionSizingMode: PositionSizingMode;
}

export interface EquityPoint {
  cash?: number;
  invested?: number;
  openPositions?: number;
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
  provenance?: {provider:string;symbol:string;exchange:string;timeframe:string;requestedStart:string;requestedEnd:string;actualStart:string;actualEnd:string;barCount:number;dataHash:string;retrievedAt:string;adjustmentPolicy:string};
  settings: BacktestSettings;
  isSynthetic: boolean;
  bars: OHLCVBar[];
  trades: Trade[];
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  monthlyReturns: MonthlyReturn[];
  summary: PerformanceSummary;
  /**
   * Set when the strategy generated at least one entry signal but every
   * single one was skipped because the configured capital × position size
   * couldn't afford even one whole unit at that bar's price. Lets the UI
   * distinguish "strategy never triggered" from "capital too small for
   * this instrument's price" instead of both looking like a silent zero.
   */
  insufficientCapitalWarning: boolean;
}
