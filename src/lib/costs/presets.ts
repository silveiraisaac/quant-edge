export type BrokerPreset = 'ZERO' | 'ZERODHA_INTRADAY' | 'ZERODHA_DELIVERY' | 'CUSTOM';
export interface CostModel {
  brokeragePct: number; brokerageCap: number;
  sttBuyPct: number; sttSellPct: number;
  exchangePct: number; sebiPct: number; ipftPct: number;
  gstPct: number; stampBuyPct: number; dpBase: number;
}
export interface ExecutionCosts {
  preset: BrokerPreset; slippagePct: number; custom?: CostModel;
}
export const ZERO_MODEL: CostModel = { brokeragePct: 0, brokerageCap: 0, sttBuyPct: 0, sttSellPct: 0, exchangePct: 0, sebiPct: 0, ipftPct: 0, gstPct: 0, stampBuyPct: 0, dpBase: 0 };
export const COST_PRESETS: Record<BrokerPreset, string> = {
  ZERO: 'Zero Costs', ZERODHA_INTRADAY: 'Zerodha Equity Intraday', ZERODHA_DELIVERY: 'Zerodha Equity Delivery', CUSTOM: 'Custom Costs',
};
export const COST_RATE_VERSION = 'zerodha-2026-09-20';
// Resident individual, NSE cash equities; BSE standard group rate only.
// Source: https://zerodha.com/charges (verified 2026-09-20).
export function resolveCostModel(costs: ExecutionCosts = { preset: 'ZERO', slippagePct: 0 }, exchange = 'NSE'): CostModel {
  if (costs.preset === 'ZERO') return ZERO_MODEL;
  if (costs.preset === 'CUSTOM') {
    if (!costs.custom) throw new Error('Custom cost configuration is required.');
    return costs.custom;
  }
  const delivery = costs.preset === 'ZERODHA_DELIVERY';
  return { brokeragePct: delivery ? 0 : 0.03, brokerageCap: delivery ? 0 : 20,
    sttBuyPct: delivery ? 0.1 : 0, sttSellPct: delivery ? 0.1 : 0.025,
    exchangePct: exchange === 'BSE' ? 0.00375 : 0.00307, sebiPct: 0.0001,
    ipftPct: exchange === 'BSE' ? 0 : 0.0000001, gstPct: 18,
    stampBuyPct: delivery ? 0.015 : 0.003, dpBase: delivery ? 13 : 0 };
}
