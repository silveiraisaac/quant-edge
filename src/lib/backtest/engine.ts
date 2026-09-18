import { BacktestSettings, EquityPoint, OHLCVBar, StrategyConfig, Trade } from "@/lib/types";
import { relativeStrengthIndex, simpleMovingAverage } from "@/lib/backtest/indicators";

type Signal = "ENTER" | "EXIT" | null;

/**
 * Computes a per-bar entry/exit signal series for the given strategy.
 * Signals are evaluated using data available *as of* that bar's close —
 * the engine then executes on the *next* bar's open, so there's no
 * lookahead bias.
 */
function computeSignals(bars: OHLCVBar[], strategy: StrategyConfig): Signal[] {
  const closes = bars.map((b) => b.close);
  const signals: Signal[] = new Array(bars.length).fill(null);

  if (strategy.type === "SMA_CROSSOVER") {
    const fast = simpleMovingAverage(closes, strategy.fastPeriod);
    const slow = simpleMovingAverage(closes, strategy.slowPeriod);
    for (let i = 1; i < bars.length; i++) {
      const prevFast = fast[i - 1];
      const prevSlow = slow[i - 1];
      const curFast = fast[i];
      const curSlow = slow[i];
      if (prevFast === null || prevSlow === null || curFast === null || curSlow === null) continue;

      const crossedUp = prevFast <= prevSlow && curFast > curSlow;
      const crossedDown = prevFast >= prevSlow && curFast < curSlow;
      if (crossedUp) signals[i] = "ENTER";
      else if (crossedDown) signals[i] = "EXIT";
    }
    return signals;
  }

  // RSI_MEAN_REVERSION: enter when RSI recovers back above the oversold
  // line (a bounce signal), exit when RSI pushes above the overbought line.
  const rsi = relativeStrengthIndex(closes, strategy.period);
  for (let i = 1; i < bars.length; i++) {
    const prev = rsi[i - 1];
    const cur = rsi[i];
    if (prev === null || cur === null) continue;

    const recoveredFromOversold = prev <= strategy.oversold && cur > strategy.oversold;
    const pushedOverbought = prev < strategy.overbought && cur >= strategy.overbought;
    if (recoveredFromOversold) signals[i] = "ENTER";
    else if (pushedOverbought) signals[i] = "EXIT";
  }
  return signals;
}

export interface EngineOutput {
  trades: Trade[];
  equityCurve: EquityPoint[];
  /**
   * Diagnostics for the "zero trades" case. When entrySignalsGenerated > 0
   * but trades.length === 0, entriesSkippedInsufficientCapital tells the
   * caller *why*: every entry signal was skipped because the configured
   * capital × position size couldn't afford even one whole unit at that
   * bar's price. This is surfaced to the UI instead of silently returning
   * an unexplained empty result.
   */
  entrySignalsGenerated: number;
  entriesSkippedInsufficientCapital: number;
}

export function runBacktestEngine(bars: OHLCVBar[], settings: BacktestSettings): EngineOutput {
  const signals = computeSignals(bars, settings.strategy);

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let cash = settings.initialCapital;
  let position: { quantity: number; entryPrice: number; entryDate: string } | null = null;
  let tradeId = 1;
  let pendingAction: Signal = null;
  let entrySignalsGenerated = 0;
  let entriesSkippedInsufficientCapital = 0;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];

    // Execute any signal that was raised on the previous bar's close, at
    // this bar's open — this is what keeps the engine free of lookahead.
    if (pendingAction === "ENTER" && !position) {
      entrySignalsGenerated++;
      const allocation = cash * settings.positionSizePct;
      const quantity = Math.floor(allocation / bar.open);
      if (quantity > 0) {
        position = { quantity, entryPrice: bar.open, entryDate: bar.date };
        cash -= quantity * bar.open;
      } else {
        entriesSkippedInsufficientCapital++;
      }
    } else if (pendingAction === "EXIT" && position) {
      const proceeds = position.quantity * bar.open;
      const cost = position.quantity * position.entryPrice;
      const pnl = proceeds - cost;
      trades.push({
        id: tradeId++,
        direction: "LONG",
        symbol: settings.symbol,
        entryDate: position.entryDate,
        entryPrice: position.entryPrice,
        exitDate: bar.date,
        exitPrice: bar.open,
        quantity: position.quantity,
        pnl,
        pnlPct: (pnl / cost) * 100,
        entryReason: "Strategy signal",
        reason: "SIGNAL_EXIT",
      });
      cash += proceeds;
      position = null;
    }

    pendingAction = signals[i];

    // Mark-to-market at this bar's close for the equity curve.
    const markToMarket = position ? position.quantity * bar.close : 0;
    equityCurve.push({ date: bar.date, equity: cash + markToMarket });
  }

  // Close any still-open position at the final bar's close so the backtest
  // always ends fully in cash and every trade is accounted for.
  if (position && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    const proceeds = position.quantity * lastBar.close;
    const cost = position.quantity * position.entryPrice;
    const pnl = proceeds - cost;
    trades.push({
      id: tradeId++,
      direction: "LONG",
      symbol: settings.symbol,
      entryDate: position.entryDate,
      entryPrice: position.entryPrice,
      exitDate: lastBar.date,
      exitPrice: lastBar.close,
      quantity: position.quantity,
      pnl,
      pnlPct: (pnl / cost) * 100,
      entryReason: "Strategy signal",
      reason: "END_OF_PERIOD",
    });
    cash += proceeds;
    if (equityCurve.length > 0) {
      equityCurve[equityCurve.length - 1] = { date: lastBar.date, equity: cash };
    }
  }

  return { trades, equityCurve, entrySignalsGenerated, entriesSkippedInsufficientCapital };
}
