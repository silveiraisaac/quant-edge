import { PositionSizingConfig } from "@/lib/types";

export interface PositionSizingResult {
  quantity: number;
  /** quantity × entryPrice — the actual ₹ committed, 0 if rejected. */
  positionValue: number;
  rejected: boolean;
  /** Present only when rejected, for diagnostics/UI messaging. */
  rejectionReason?: string;
}

export interface CalculatePositionQuantityInput {
  config: PositionSizingConfig;
  /** Cash actually free to deploy right now (not total equity — money already tied up in other open lots is excluded). */
  availableCash: number;
  entryPrice: number;
  /**
   * The position's INITIAL fixed stop-loss price, if stop loss is enabled —
   * never the trailing stop, and never a value from any bar after entry.
   * Risk-based sizing is defined entirely in terms of this initial risk;
   * using the trailing stop here would size the position off information
   * that doesn't exist yet at entry time.
   */
  initialStopLossPrice: number | null;
  /**
   * Remaining room under the max-capital-allocation cap, in ₹. Computed by
   * calculateAvailableAllocationCapacity below. Always a finite number —
   * pass a very large number (not Infinity, to keep downstream math
   * simple) when the cap is effectively unrestricted (100%).
   */
  maxAllocationCapacity: number;
}

/**
 * Determines how many whole units to buy, applying the configured sizing
 * mode and then capping the result by whichever of (available cash, max
 * allocation capacity) is more restrictive. Never returns a fractional
 * quantity, never a quantity that would spend more cash than is available,
 * and never a quantity that would exceed the allocation cap.
 */
export function calculatePositionQuantity(input: CalculatePositionQuantityInput): PositionSizingResult {
  const { config, availableCash, entryPrice, initialStopLossPrice, maxAllocationCapacity } = input;

  if (entryPrice <= 0) {
    return { quantity: 0, positionValue: 0, rejected: true, rejectionReason: "Invalid entry price." };
  }

  let desiredQuantity: number;

  if (config.mode === "FIXED_QUANTITY") {
    desiredQuantity = Math.floor(Math.max(0, config.fixedQuantity));
  } else if (config.mode === "CAPITAL_PERCENT") {
    const desiredValue = availableCash * (config.capitalPercent / 100);
    desiredQuantity = Math.floor(desiredValue / entryPrice);
  } else {
    // RISK_PERCENT
    if (initialStopLossPrice === null) {
      return {
        quantity: 0,
        positionValue: 0,
        rejected: true,
        rejectionReason: "Risk % sizing requires an active Stop Loss.",
      };
    }
    const riskPerShare = entryPrice - initialStopLossPrice;
    if (riskPerShare <= 0) {
      return {
        quantity: 0,
        positionValue: 0,
        rejected: true,
        rejectionReason: "Stop loss must be below entry price for risk-based sizing.",
      };
    }
    const maxMonetaryRisk = availableCash * (config.riskPercent / 100);
    desiredQuantity = Math.floor(maxMonetaryRisk / riskPerShare);
  }

  // Apply the two portfolio-level caps — whichever is more restrictive wins.
  // Never negative cash, never over the allocation cap, regardless of what
  // the sizing mode alone would have requested.
  const maxAffordableQuantity = Math.floor(availableCash / entryPrice);
  const maxAllocationQuantity = Math.floor(maxAllocationCapacity / entryPrice);
  const finalQuantity = Math.max(
    0,
    Math.min(desiredQuantity, maxAffordableQuantity, maxAllocationQuantity),
  );

  if (finalQuantity <= 0) {
    return {
      quantity: 0,
      positionValue: 0,
      rejected: true,
      rejectionReason: "Insufficient capital or allocation capacity to buy even one unit.",
    };
  }

  return { quantity: finalQuantity, positionValue: finalQuantity * entryPrice, rejected: false };
}

/**
 * How much more (in ₹) can be committed to new positions right now without
 * breaching the max-capital-allocation limit.
 *
 * "Capital allocated to open positions" is cost basis — the cash actually
 * deducted at each open lot's entry — not a fluctuating current market
 * value. This keeps the allocation cap predictable (it doesn't shrink or
 * grow on its own as prices move) and matches "capital allocated" as a
 * cash-management concept distinct from portfolio equity, which DOES use
 * market value (see computePortfolioEquity).
 */
export function calculateAvailableAllocationCapacity(
  portfolioEquity: number,
  maxCapitalAllocationPct: number,
  currentlyAllocatedCostBasis: number,
): number {
  const maxAllowedInvested = portfolioEquity * (maxCapitalAllocationPct / 100);
  return Math.max(0, maxAllowedInvested - currentlyAllocatedCostBasis);
}
