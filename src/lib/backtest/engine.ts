import { BacktestSettings, EquityPoint, OHLCVBar, PositionSizingMode, StrategyConfig, Trade } from "@/lib/types";
import { relativeStrengthIndex, simpleMovingAverage } from "@/lib/backtest/indicators";
import { calculateAvailableAllocationCapacity, calculatePositionQuantity } from "@/lib/backtest/position-sizing";

import { resolveCostModel } from "@/lib/costs/presets";
import { affordableQuantity, calculateCharges, combineCharges, executionPrice, TradeCharges } from "@/lib/costs/engine";

import { extraSignals } from "./signals-extra";

type Signal = "ENTER" | "EXIT" | null;

/**
 * Computes a per-bar entry/exit signal series for the given strategy.
 * Signals are evaluated using data available *as of* that bar's close —
 * the engine then executes on the *next* bar's open, so there's no
 * lookahead bias.
 */
export function computeSignals(bars: OHLCVBar[], strategy: StrategyConfig): Signal[] {
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

  if (strategy.type !== "RSI_MEAN_REVERSION") return extraSignals(bars, strategy);

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
   * Diagnostics for the "zero trades" case. entrySignalsGenerated counts
   * every ENTER signal where a slot was actually available (i.e. NOT
   * blocked by maxConcurrentPositions) and sizing was attempted.
   * entriesSkippedInsufficientCapital counts how many of those were
   * rejected by calculatePositionQuantity — insufficient cash, insufficient
   * allocation headroom, or (for RISK_PERCENT mode) no active stop loss.
   * This is broader than "capital" in the literal sense now that sizing
   * has three modes, but the field name is kept for API stability; the
   * UI's warning message already speaks generically about sizing/capacity.
   */
  entrySignalsGenerated: number;
  entriesSkippedInsufficientCapital: number;
  /** ENTER signals that arrived while already at maxConcurrentPositions — a distinct, non-capital reason for a skipped entry. */
  entriesSkippedMaxPositions: number;
}

export interface OpenPosition {
  entryCharges?: TradeCharges;
  entryIntendedPrice?: number;
  exitReserve?: number;
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
  /** ₹ committed to this lot at entry (quantity × entryPrice) — carried onto the Trade at close. */
  positionSizeValue: number;
  /** Which sizing mode produced this lot's quantity — carried onto the Trade at close. */
  positionSizingMode: PositionSizingMode;
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

/** cash + market value (current bar's close) of every open lot. */
export function computePortfolioEquity(cash: number, positions: OpenPosition[], markPrice: number): number {
  const marketValue = positions.reduce((sum, p) => sum + p.quantity * markPrice, 0);
  return cash + marketValue;
}

/** Cost basis (quantity × entryPrice) of every open lot — see calculateAvailableAllocationCapacity for why this, not market value, is used for the allocation cap. */
export function computeAllocatedCostBasis(positions: OpenPosition[]): number {
  return positions.reduce((sum, p) => sum + p.quantity * p.entryPrice, 0);
}

export function runBacktestEngine(bars: OHLCVBar[], settings: BacktestSettings): EngineOutput {
  const costs = settings.costs ?? { preset: "ZERO", slippagePct: 0 };
  const model = resolveCostModel(costs, settings.exchange);
  const intradayModel = resolveCostModel({ ...costs, preset: "ZERODHA_INTRADAY" }, settings.exchange);
  const dpDays = new Set<string>();
  const roundStt = costs.preset !== "CUSTOM";
  const charge = (turnover: number, side: "BUY" | "SELL", dp = false) => calculateCharges(model, turnover, side, dp, turnover, roundStt);
  const signals = computeSignals(bars, settings.strategy);
  const risk = settings.riskManagement;
  const sizing = settings.positionSizing;
  const portfolioConfig = settings.portfolio;

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let cash = settings.initialCapital;
  // Multiple simultaneously open lots of the SAME symbol (pyramiding),
  // capped by portfolio.maxConcurrentPositions. This generalizes naturally
  // to a future multi-symbol engine (positions would simply carry their
  // own symbol), without changing anything about how each lot's own
  // risk-exit mechanics work — those remain entirely per-position.
  let positions: OpenPosition[] = [];
  let tradeId = 1;
  let pendingAction: Signal = null;
  let entrySignalsGenerated = 0;
  let entriesSkippedInsufficientCapital = 0;
  let entriesSkippedMaxPositions = 0;
  // Equity as of the END of the previous bar's processing. Used to size a
  // NEW entry's allocation cap — never today's still-unknown mark, which
  // would be lookahead. Same "use yesterday's known value" pattern as the
  // trailing-stop update in Phase 3.1.
  let portfolioEquityAsOfLastClose = settings.initialCapital;

  function closePosition(pos: OpenPosition, price: number, reason: Trade["reason"], exitDate: string) {
    const intendedExit = price;
    price = executionPrice(price, "SELL", costs.slippagePct);
    const proceeds = pos.quantity * price;
    const cost = pos.quantity * pos.entryPrice;
    let entryCharges = pos.entryCharges ?? charge(cost, "BUY");
    const sameDay = pos.entryDate === exitDate;
    const reclassify = costs.preset === "ZERODHA_DELIVERY" && sameDay;
    if (reclassify) {
      const actualEntry = calculateCharges(intradayModel, cost, "BUY");
      cash += entryCharges.total - actualEntry.total;
      entryCharges = actualEntry;
    }
    const dpEligible = !sameDay && !dpDays.has(exitDate);
    const exitModel = reclassify ? intradayModel : model;
    const sttTurnover = (reclassify || costs.preset === "ZERODHA_INTRADAY") ? (cost + proceeds) / 2 : proceeds;
    const exitCharges = calculateCharges(exitModel, proceeds, "SELL", dpEligible, sttTurnover, roundStt);
    if (dpEligible && exitCharges.dp > 0) dpDays.add(exitDate);
    const breakdown = combineCharges(entryCharges, exitCharges);
    const grossPnl = proceeds - cost;
    const pnl = grossPnl - breakdown.total;
    trades.push({
      id: tradeId++,
      direction: "LONG",
      symbol: settings.symbol,
      entryDate: pos.entryDate,
      entryPrice: pos.entryPrice,
      exitDate,
      exitPrice: price,
      quantity: pos.quantity,
      pnl,
      grossPnl,
      charges: breakdown.total,
      costBreakdown: breakdown,
      slippageImpact: pos.quantity * ((pos.entryPrice - (pos.entryIntendedPrice ?? pos.entryPrice)) + intendedExit - price),
      pnlPct: (pnl / cost) * 100,
      entryReason: "Strategy signal",
      reason,
      positionSizeValue: pos.positionSizeValue,
      positionSizingMode: pos.positionSizingMode,
    });
    cash += proceeds - exitCharges.total;
    positions = positions.filter((p) => p !== pos);
  }

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    // Snapshot at the START of this bar — positions already open going
    // into this bar will not free up a slot for a new entry on this same
    // bar even if a risk exit closes them mid-bar. This generalizes the
    // original single-position "no same-bar re-entry" rule from Phase 3.1
    // to the multi-position case exactly.
    const openCountAtStartOfBar = positions.length;

    // 1) Gap check + strategy EXIT, evaluated per-position (each lot has
    // its own entry price and therefore its own stop/target levels). A
    // strategy EXIT signal is not lot-specific — the strategy considers
    // itself flat once it signals exit, so it closes every currently open
    // lot, each still checked for its own gap first.
    for (const pos of [...positions]) {
      const gapExit = checkGapExit(pos, bar);
      if (gapExit) {
        closePosition(pos, gapExit.price, gapExit.reason, bar.date);
      } else if (pendingAction === "EXIT") {
        closePosition(pos, bar.open, "STRATEGY_EXIT", bar.date);
      }
    }

    if (pendingAction === "ENTER" && openCountAtStartOfBar < portfolioConfig.maxConcurrentPositions) {
      if (positions.length < portfolioConfig.maxConcurrentPositions) {
        entrySignalsGenerated++;
        const entryPrice = executionPrice(bar.open, "BUY", costs.slippagePct);
        const initialStopLossPrice = risk.stopLossEnabled
          ? entryPrice * (1 - risk.stopLossPct / 100)
          : null;

        const allocatedCostBasis = computeAllocatedCostBasis(positions);
        const maxAllocationCapacity = calculateAvailableAllocationCapacity(
          portfolioEquityAsOfLastClose,
          portfolioConfig.maxCapitalAllocationPct,
          allocatedCostBasis,
        );

        const availableCash = cash - positions.reduce((sum, p) => sum + (p.exitReserve ?? 0), 0);
        const sizingResult = calculatePositionQuantity({
          config: sizing,
          availableCash,
          entryPrice,
          initialStopLossPrice,
          maxAllocationCapacity,
        });

        const exitReserve = model.dpBase * (1 + model.gstPct / 100) + (model.sttSellPct > 0 && roundStt ? 1 : 0);
        const entryFees = (q: number) => {
          const regular = charge(q * entryPrice, "BUY").total;
          const sameDay = costs.preset === "ZERODHA_DELIVERY" ? calculateCharges(intradayModel, q * entryPrice, "BUY").total : regular;
          return Math.max(regular, sameDay) + exitReserve;
        };
        const quantity = affordableQuantity(sizingResult.quantity, entryPrice, Math.max(0, availableCash), entryFees);
        if (!sizingResult.rejected && quantity > 0) {
          const targetPrice = risk.targetEnabled ? entryPrice * (1 + risk.targetPct / 100) : null;
          const highestFavorablePrice = risk.trailingStopEnabled ? entryPrice : null;
          const trailingStopPrice = risk.trailingStopEnabled
            ? entryPrice * (1 - risk.trailingStopPct / 100)
            : null;
          positions.push({
            quantity,
            entryCharges: charge(quantity * entryPrice, "BUY"),
            entryIntendedPrice: bar.open,
            exitReserve,
            entryPrice,
            entryDate: bar.date,
            stopLossPrice: initialStopLossPrice,
            targetPrice,
            highestFavorablePrice,
            trailingStopPrice,
            positionSizeValue: quantity * entryPrice,
            positionSizingMode: sizing.mode,
          });
          cash -= quantity * entryPrice + charge(quantity * entryPrice, "BUY").total;
        } else {
          entriesSkippedInsufficientCapital++;
        }
      }
    } else if (pendingAction === "ENTER") {
      entriesSkippedMaxPositions++;
    }

    // 2) Intrabar check — for every position still open at this point,
    // whether freshly entered this bar or carried in from an earlier bar.
    // Uses ONLY this bar's own low/high, evaluated against stop/target/
    // trailing levels as they stood *before* this bar's high is applied
    // below — never using this bar's high to retroactively improve the
    // trailing stop before deciding whether this same bar hit it.
    for (const pos of [...positions]) {
      const intrabarExit = checkIntrabarExit(pos, bar);
      if (intrabarExit) {
        closePosition(pos, intrabarExit.price, intrabarExit.reason, bar.date);
      } else if (pos.highestFavorablePrice !== null) {
        // 3) Only now, after this bar's exit decision is final, raise the
        // trailing stop using this bar's high — takes effect from the
        // NEXT bar onward. Can only move up, per Phase 3.1.
        updateTrailingStopForNextBar(pos, bar, risk.trailingStopPct);
      }
    }

    if (costs.preset === "ZERODHA_INTRADAY") {
      for (const pos of [...positions]) closePosition(pos, bar.close, "SESSION_END", bar.date);
    }
    pendingAction = signals[i];

    // Mark-to-market at this bar's close for the equity curve, and record
    // it as "as of last close" for sizing decisions on the NEXT bar.
    const equity = computePortfolioEquity(cash, positions, bar.close);
    equityCurve.push({ date: bar.date, equity, cash, invested: positions.reduce((s, p) => s + p.quantity * bar.close, 0), openPositions: positions.length });
    portfolioEquityAsOfLastClose = equity;
  }

  // Close any still-open positions at the final bar's close so the
  // backtest always ends fully in cash and every trade is accounted for.
  if (positions.length > 0 && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    for (const pos of [...positions]) {
      closePosition(pos, lastBar.close, "PERIOD_END", lastBar.date);
    }
    if (equityCurve.length > 0) {
      equityCurve[equityCurve.length - 1] = { date: lastBar.date, equity: cash, cash, invested: 0, openPositions: 0 };
    }
  }

  return {
    trades,
    equityCurve,
    entrySignalsGenerated,
    entriesSkippedInsufficientCapital,
    entriesSkippedMaxPositions,
  };
}
