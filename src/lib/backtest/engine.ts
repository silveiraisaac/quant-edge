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

export interface OpenPosition {
  quantity: number;
  entryPrice: number;
  entryDate: string;
  /** Fixed stop-loss price, set once at entry from settings.riskManagement.stopLossPct. Null when stop loss is disabled. */
  stopLossPrice: number | null;
  /** Fixed target price, set once at entry from settings.riskManagement.targetPct. Null when target is disabled. */
  targetPrice: number | null;
  /**
   * The highest close-of-bar-or-better price seen since entry, used to
   * compute the trailing stop. Starts at entryPrice (i.e. the trailing
   * stop begins at its worst/tightest level and only ever improves).
   * Null when trailing stop is disabled.
   */
  highestFavorablePrice: number | null;
  /** Current trailing stop price, derived from highestFavorablePrice. Null when trailing stop is disabled. */
  trailingStopPrice: number | null;
}

export interface ExitResult {
  price: number;
  reason: Trade["reason"];
}

/**
 * Decides whether an open position should exit *at this bar's open*
 * because the market gapped straight through a stop/target/trailing-stop
 * level before the bar even had a chance to trade at that level. Checked
 * before anything else in the bar, since a gap is knowable the instant the
 * bar opens — no lookahead, since we're using this bar's own open, not a
 * future bar's data.
 *
 * Returns null if no gap-exit applies (the common case).
 */
export function checkGapExit(position: OpenPosition, bar: OHLCVBar): ExitResult | null {
  // Effective stop = whichever of the fixed stop-loss and trailing stop is
  // currently tighter (higher, i.e. closer to the current price). This is
  // the price a falling market would reach first if both are enabled —
  // not merely a conservative choice, but the financially correct combined
  // behavior of running a fixed stop and a trailing stop simultaneously.
  const stopCandidates = [position.stopLossPrice, position.trailingStopPrice].filter(
    (p): p is number => p !== null,
  );
  const effectiveStopPrice = stopCandidates.length > 0 ? Math.max(...stopCandidates) : null;

  if (effectiveStopPrice !== null && bar.open <= effectiveStopPrice) {
    const isTrailing =
      position.trailingStopPrice !== null && position.trailingStopPrice >= effectiveStopPrice;
    return { price: bar.open, reason: isTrailing ? "TRAILING_STOP" : "STOP_LOSS" };
  }

  if (position.targetPrice !== null && bar.open >= position.targetPrice) {
    return { price: bar.open, reason: "TARGET" };
  }

  return null;
}

/**
 * Decides whether an open position's stop/target/trailing-stop was
 * touched *during* this bar (using its low/high), for a position that did
 * NOT already gap-exit at the open. Fill price is the exact level touched
 * (not the bar's extreme), since that's the price the resting order would
 * have filled at.
 *
 * When both the effective stop and the target are touched in the same
 * bar, OHLC data cannot tell us which happened first intrabar — per the
 * required conservative rule, the stop is assumed to have occurred first.
 */
export function checkIntrabarExit(position: OpenPosition, bar: OHLCVBar): ExitResult | null {
  const stopCandidates = [position.stopLossPrice, position.trailingStopPrice].filter(
    (p): p is number => p !== null,
  );
  const effectiveStopPrice = stopCandidates.length > 0 ? Math.max(...stopCandidates) : null;

  const stopTouched = effectiveStopPrice !== null && bar.low <= effectiveStopPrice;
  if (stopTouched) {
    const isTrailing =
      position.trailingStopPrice !== null && position.trailingStopPrice >= effectiveStopPrice!;
    // Conservative rule: if target was also touched this same bar, the
    // stop still wins — we simply never check target below in that case.
    return { price: effectiveStopPrice!, reason: isTrailing ? "TRAILING_STOP" : "STOP_LOSS" };
  }

  if (position.targetPrice !== null && bar.high >= position.targetPrice) {
    return { price: position.targetPrice, reason: "TARGET" };
  }

  return null;
}

/**
 * Raises the trailing stop using this bar's high — takes effect from the
 * NEXT bar onward. Must only ever be called AFTER this bar's exit
 * decision is final (see checkIntrabarExit above): calling it first would
 * let the same bar's high retroactively tighten the stop before deciding
 * whether that same bar hit the *previous* level, which is a subtle form
 * of lookahead. Mutates position in place; never lowers the trailing stop.
 */
export function updateTrailingStopForNextBar(position: OpenPosition, bar: OHLCVBar, trailingStopPct: number): void {
  if (position.highestFavorablePrice === null) return;
  position.highestFavorablePrice = Math.max(position.highestFavorablePrice, bar.high);
  position.trailingStopPrice = position.highestFavorablePrice * (1 - trailingStopPct / 100);
}

export function runBacktestEngine(bars: OHLCVBar[], settings: BacktestSettings): EngineOutput {
  const signals = computeSignals(bars, settings.strategy);
  const risk = settings.riskManagement;

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let cash = settings.initialCapital;
  let position: OpenPosition | null = null;
  let tradeId = 1;
  let pendingAction: Signal = null;
  let entrySignalsGenerated = 0;
  let entriesSkippedInsufficientCapital = 0;

  function closePosition(price: number, reason: Trade["reason"], exitDate: string) {
    if (!position) return;
    const proceeds = position.quantity * price;
    const cost = position.quantity * position.entryPrice;
    const pnl = proceeds - cost;
    trades.push({
      id: tradeId++,
      direction: "LONG",
      symbol: settings.symbol,
      entryDate: position.entryDate,
      entryPrice: position.entryPrice,
      exitDate,
      exitPrice: price,
      quantity: position.quantity,
      pnl,
      pnlPct: (pnl / cost) * 100,
      entryReason: "Strategy signal",
      reason,
    });
    cash += proceeds;
    position = null;
  }

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    // Snapshot at the START of this bar — a position that was already open
    // going into this bar will not re-enter on this same bar even if a
    // risk exit closes it mid-bar. This preserves the original one-trade-
    // per-signal-transition timing exactly, rather than inventing new
    // same-bar re-entry behavior.
    const positionOpenAtStartOfBar = position !== null;

    if (position) {
      // 1) Gap check at the open — knowable the instant the bar opens.
      const gapExit = checkGapExit(position, bar);
      if (gapExit) {
        closePosition(gapExit.price, gapExit.reason, bar.date);
      } else if (pendingAction === "EXIT") {
        // 2) No gap: the strategy's own exit signal executes at this
        // bar's open, exactly as before this feature existed.
        closePosition(bar.open, "STRATEGY_EXIT", bar.date);
      }
    }

    if (pendingAction === "ENTER" && !positionOpenAtStartOfBar && !position) {
      entrySignalsGenerated++;
      const allocation = cash * settings.positionSizePct;
      const quantity = Math.floor(allocation / bar.open);
      if (quantity > 0) {
        const entryPrice = bar.open;
        const stopLossPrice = risk.stopLossEnabled
          ? entryPrice * (1 - risk.stopLossPct / 100)
          : null;
        const targetPrice = risk.targetEnabled ? entryPrice * (1 + risk.targetPct / 100) : null;
        const highestFavorablePrice = risk.trailingStopEnabled ? entryPrice : null;
        const trailingStopPrice = risk.trailingStopEnabled
          ? entryPrice * (1 - risk.trailingStopPct / 100)
          : null;
        position = {
          quantity,
          entryPrice,
          entryDate: bar.date,
          stopLossPrice,
          targetPrice,
          highestFavorablePrice,
          trailingStopPrice,
        };
        cash -= quantity * entryPrice;
      } else {
        entriesSkippedInsufficientCapital++;
      }
    }

    // 3) Intrabar check — for a position still open at this point, whether
    // freshly entered this bar or carried in from an earlier bar. Uses
    // ONLY this bar's own low/high, evaluated against stop/target/trailing
    // levels as they stood *before* this bar's high is applied below —
    // never using this bar's high to retroactively improve the trailing
    // stop before deciding whether this same bar hit it.
    if (position) {
      const intrabarExit = checkIntrabarExit(position, bar);
      if (intrabarExit) {
        closePosition(intrabarExit.price, intrabarExit.reason, bar.date);
      } else if (position.highestFavorablePrice !== null) {
        // 4) Only now, after this bar's exit decision is final, raise the
        // trailing stop using this bar's high — takes effect from the
        // NEXT bar onward. Can only move up, per the spec.
        updateTrailingStopForNextBar(position, bar, risk.trailingStopPct);
      }
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
    closePosition(lastBar.close, "PERIOD_END", lastBar.date);
    if (equityCurve.length > 0) {
      equityCurve[equityCurve.length - 1] = { date: lastBar.date, equity: cash };
    }
  }

  return { trades, equityCurve, entrySignalsGenerated, entriesSkippedInsufficientCapital };
}
