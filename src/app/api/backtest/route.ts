import { runBacktest } from '@/lib/backtest/run-backtest';
import { readJson,errorResponse } from '@/lib/server/http';
import { withBacktestSlot } from '@/lib/server/limits';
export const runtime='nodejs';
export async function POST(request:Request) {
  try {
    const body=await readJson(request);
    const result=await withBacktestSlot(()=>runBacktest(body as Parameters<typeof runBacktest>[0]));
    // Reports need equity/trades/provenance, not a second client copy of OHLCV.
    return Response.json({...result,bars:[]},{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    return errorResponse(error);
  }
}
