import { StrategyConfig } from "@/lib/types";

/**
 * Central strategy registry. The config panel, the Strategies info page,
 * and (eventually) any strategy-specific validation all read from this
 * file rather than hardcoding strategy metadata in multiple places — to
 * add a new strategy: add its type to `StrategyConfig` in `types.ts`,
 * implement its signal logic in `engine.ts`, then add one entry here.
 */
export interface StrategyDefinition {
  type: StrategyConfig["type"];
  label: string;
  shortDescription: string;
  howItWorks: string;
  defaultConfig: StrategyConfig;
}

export const STRATEGY_DEFINITIONS: StrategyDefinition[] = [
  {
    type: "SMA_CROSSOVER",
    label: "Moving Average Crossover",
    shortDescription: "Trend-following: goes long when a fast average crosses above a slow average.",
    howItWorks:
      "Tracks two simple moving averages of closing price — a fast one and a slow one. " +
      "When the fast average crosses above the slow average, that's read as the start of an " +
      "uptrend and a long position is opened. When the fast average crosses back below the " +
      "slow average, the position is closed. Works best in trending markets and tends to " +
      "whipsaw (enter and exit repeatedly at a small loss) in sideways/choppy conditions.",
    defaultConfig: { type: "SMA_CROSSOVER", fastPeriod: 20, slowPeriod: 50 },
  },
  {
    type: "RSI_MEAN_REVERSION",
    label: "RSI Mean Reversion",
    shortDescription: "Counter-trend: buys oversold bounces, exits on overbought readings.",
    howItWorks:
      "Tracks the Relative Strength Index (RSI), a momentum oscillator from 0–100. " +
      "When RSI drops below the oversold threshold and then recovers back above it, that " +
      "bounce is read as a buying opportunity and a long position is opened. The position is " +
      "closed once RSI pushes up into the overbought zone. Works best in range-bound markets " +
      "and can underperform in strong sustained trends.",
    defaultConfig: { type: "RSI_MEAN_REVERSION", period: 14, oversold: 30, overbought: 70 },
  },
];

export function getStrategyDefinition(type: StrategyConfig["type"]): StrategyDefinition {
  const def = STRATEGY_DEFINITIONS.find((s) => s.type === type);
  if (!def) throw new Error(`Unknown strategy type: ${type}`);
  return def;
}
