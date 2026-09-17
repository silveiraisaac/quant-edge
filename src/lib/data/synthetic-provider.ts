import { DataProvider, OHLCVBar, SymbolInfo } from "@/lib/types";

/**
 * SYNTHETIC DATA PROVIDER
 * ------------------------------------------------------------------------
 * Generates deterministic (seeded), clearly-fake price series shaped like
 * Indian equity/index data so the rest of the app can be built and tested
 * before a real data source is connected. Every symbol is prefixed
 * "DEMO-" and every UI surface that touches this provider must show the
 * synthetic-data banner (see <DemoDataBanner />) — this is never to be
 * presented as real historical performance.
 *
 * To add a real provider later: implement the same `DataProvider`
 * interface (e.g. `NseDataProvider`) and register it in
 * `src/lib/data/registry.ts`. Nothing in the backtest engine or UI needs
 * to change.
 */

const DEMO_SYMBOLS: SymbolInfo[] = [
  { symbol: "DEMO-NIFTY50", name: "Demo Nifty 50 Index (synthetic)" },
  { symbol: "DEMO-BANKNIFTY", name: "Demo Bank Nifty Index (synthetic)" },
  { symbol: "DEMO-LARGECAP-A", name: "Demo Large Cap Stock A (synthetic)" },
  { symbol: "DEMO-LARGECAP-B", name: "Demo Large Cap Stock B (synthetic)" },
  { symbol: "DEMO-MIDCAP-A", name: "Demo Mid Cap Stock A (synthetic, higher volatility)" },
];

// Different seed + drift/volatility profile per symbol, so runs are
// reproducible but symbols still look distinct from one another.
const SYMBOL_PROFILES: Record<string, { seed: number; annualDrift: number; annualVol: number; startPrice: number }> = {
  "DEMO-NIFTY50": { seed: 42, annualDrift: 0.11, annualVol: 0.15, startPrice: 20000 },
  "DEMO-BANKNIFTY": { seed: 137, annualDrift: 0.12, annualVol: 0.19, startPrice: 45000 },
  "DEMO-LARGECAP-A": { seed: 7, annualDrift: 0.13, annualVol: 0.22, startPrice: 1500 },
  "DEMO-LARGECAP-B": { seed: 99, annualDrift: 0.09, annualVol: 0.2, startPrice: 800 },
  "DEMO-MIDCAP-A": { seed: 256, annualDrift: 0.15, annualVol: 0.32, startPrice: 450 },
};

/** Mulberry32 — small, fast, deterministic PRNG so backtests are reproducible. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMullerFactory(rng: () => number) {
  let spare: number | null = null;
  return function gaussian(): number {
    if (spare !== null) {
      const val = spare;
      spare = null;
      return val;
    }
    let u: number, v: number, s: number;
    do {
      u = rng() * 2 - 1;
      v = rng() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const mul = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * mul;
    return u * mul;
  };
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

function generateSeries(symbol: string, startDate: string, endDate: string): OHLCVBar[] {
  const profile = SYMBOL_PROFILES[symbol];
  if (!profile) return [];

  const rng = mulberry32(profile.seed);
  const gaussian = boxMullerFactory(rng);

  const dailyDrift = profile.annualDrift / 252;
  const dailyVol = profile.annualVol / Math.sqrt(252);

  const bars: OHLCVBar[] = [];
  let price = profile.startPrice;

  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (!isWeekday(d)) continue;

    // Geometric Brownian motion step for the close, with a small amount of
    // intraday range layered on for open/high/low so charts look plausible.
    const shock = gaussian();
    const dailyReturn = dailyDrift - 0.5 * dailyVol * dailyVol + dailyVol * shock;
    const close = price * Math.exp(dailyReturn);

    const open = price * (1 + (rng() - 0.5) * 0.006);
    const intradayRange = Math.abs(close - open) + price * dailyVol * 0.4 * rng();
    const high = Math.max(open, close) + intradayRange * rng();
    const low = Math.min(open, close) - intradayRange * rng();
    const volume = Math.round(1_000_000 + rng() * 4_000_000);

    bars.push({
      date: d.toISOString().slice(0, 10),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(Math.max(low, 0.01).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return bars;
}

export class SyntheticDataProvider implements DataProvider {
  readonly id = "synthetic";
  readonly label = "Synthetic Demo Data";
  readonly isSynthetic = true;

  async listSymbols(): Promise<SymbolInfo[]> {
    return DEMO_SYMBOLS;
  }

  async getBars(symbol: string, startDate: string, endDate: string): Promise<OHLCVBar[]> {
    return generateSeries(symbol, startDate, endDate);
  }
}
