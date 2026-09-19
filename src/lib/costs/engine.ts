import { CostModel } from './presets';
export interface TradeCharges {
  brokerage: number; stt: number; exchange: number; sebi: number; ipft: number;
  gst: number; stamp: number; dp: number; total: number;
}
export function executionPrice(price: number, side: 'BUY' | 'SELL', slippagePct: number): number {
  return price * (1 + (side === 'BUY' ? 1 : -1) * slippagePct / 100);
}
// STT rounded to whole rupees per simulated order. Other components retain
// precision; contract-note aggregation can differ slightly (documented).
export function calculateCharges(model: CostModel, turnover: number, side: 'BUY' | 'SELL', dpEligible = false, sttTurnover = turnover, roundStt = true): TradeCharges {
  if (!Number.isFinite(turnover) || turnover < 0) throw new Error('Invalid turnover.');
  const brokerage = Math.min(turnover * model.brokeragePct / 100, model.brokerageCap);
  const rawStt = sttTurnover * (side === 'BUY' ? model.sttBuyPct : model.sttSellPct) / 100;
  const stt = roundStt ? Math.round(rawStt) : rawStt;
  const exchange = turnover * model.exchangePct / 100;
  const sebi = turnover * model.sebiPct / 100;
  const ipft = turnover * model.ipftPct / 100;
  const dp = side === 'SELL' && dpEligible ? model.dpBase : 0;
  const gst = (brokerage + exchange + sebi + ipft + dp) * model.gstPct / 100;
  const stamp = side === 'BUY' ? turnover * model.stampBuyPct / 100 : 0;
  return { brokerage, stt, exchange, sebi, ipft, dp, gst, stamp, total: brokerage + stt + exchange + sebi + ipft + dp + gst + stamp };
}
export function combineCharges(a: TradeCharges, b: TradeCharges): TradeCharges {
  return Object.fromEntries(Object.keys(a).map(k => [k, a[k as keyof TradeCharges] + b[k as keyof TradeCharges]])) as unknown as TradeCharges;
}
export function affordableQuantity(desired: number, price: number, cash: number, fees: (q: number) => number): number {
  let lo = 0, hi = desired;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (mid * price + fees(mid) <= cash) lo = mid; else hi = mid - 1;
  }
  return lo;
}
