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
  category: "Trend Following" | "Momentum" | "Mean Reversion" | "Breakout";
  label: string;
  shortDescription: string;
  howItWorks: string;
  defaultConfig: StrategyConfig;
}

export const STRATEGY_DEFINITIONS: StrategyDefinition[] = [
  {
    type: "SMA_CROSSOVER",
    category: "Trend Following",
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
    category: "Mean Reversion",
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
  {type:'EMA_CROSSOVER',label:'EMA Crossover',category:'Trend Following',shortDescription:'Fast EMA crosses slow EMA.',howItWorks:'SMAs seed exponential averages; buy on an upward cross and exit on a downward cross.',defaultConfig:{type:'EMA_CROSSOVER',fastPeriod:12,slowPeriod:26}},
  {type:'RSI_MOMENTUM',label:'RSI Momentum',category:'Momentum',shortDescription:'Trade strength above an RSI threshold.',howItWorks:'Enter when Wilder RSI crosses above the entry threshold; exit when it crosses below the exit threshold.',defaultConfig:{type:'RSI_MOMENTUM',period:14,entryThreshold:60,exitThreshold:40}},
  {type:'DONCHIAN',label:'Donchian Breakout',category:'Breakout',shortDescription:'Buy closes above the previous channel high.',howItWorks:'Enter above the preceding entry-period highs; exit below the preceding exit-period lows. Current candle is excluded from channels. Repeated breakouts can add lots if allowed.',defaultConfig:{type:'DONCHIAN',entryPeriod:20,exitPeriod:10}},
  {type:'ROC',label:'Rate-of-Change Momentum',category:'Momentum',shortDescription:'Trade a crossing of percentage price momentum.',howItWorks:'ROC is 100 × (close / close N bars ago − 1). Enter crossing above the positive threshold; exit crossing below its negative.',defaultConfig:{type:'ROC',period:20,threshold:2}},
  {type:'BOLLINGER',label:'Bollinger Mean Reversion',category:'Mean Reversion',shortDescription:'Buy recoveries above the lower band.',howItWorks:'Bands use SMA plus/minus population standard deviation. Enter when price crosses back above the lower band; exit crossing above the mean.',defaultConfig:{type:'BOLLINGER',period:20,deviations:2}},
  {type:'MACD',label:'MACD Trend',category:'Trend Following',shortDescription:'MACD line crosses its signal EMA.',howItWorks:'MACD is fast EMA minus slow EMA. Buy upward signal-line crosses and exit downward crosses. Each EMA is seeded with an SMA after its warmup.',defaultConfig:{type:'MACD',fastPeriod:12,slowPeriod:26,signalPeriod:9}},
];

export function getStrategyDefinition(type: StrategyConfig["type"]): StrategyDefinition {
  const def = STRATEGY_DEFINITIONS.find((s) => s.type === type);
  if (!def) throw new Error(`Unknown strategy type: ${type}`);
  return def;
}
