import { runBacktest } from '@/lib/backtest/run-backtest';
import { UserError } from '@/lib/validation';
export const runtime='nodejs';
export async function POST(request:Request) {
  try {
    const text=await request.text();
    if(text.length>16000)throw new UserError('Configuration is too large.',413);
    const result=await runBacktest(JSON.parse(text));
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    return Response.json({error:error instanceof UserError?error.message:error instanceof SyntaxError?'Invalid JSON configuration.':'Backtest could not be completed. Please try again.'},{status:error instanceof UserError?error.status:error instanceof SyntaxError?400:500});
  }
}
