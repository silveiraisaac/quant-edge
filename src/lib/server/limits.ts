import { UserError } from '../validation';
export function createLimiter(max:number,windowMs:number) {
  let count=0,start=0;
  return (now=Date.now())=>{if(now-start>=windowMs){start=now;count=0;}if(count>=max)throw new UserError('Request limit reached. Try again in a minute.',429);count++;};
}
export const limitBacktests=createLimiter(60,60000);
export const limitAuth=createLimiter(20,60000);
let active=0;
export async function withBacktestSlot<T>(run:()=>Promise<T>):Promise<T> {
  limitBacktests();if(active>=2)throw new UserError('Backtest workers are busy. Please try again shortly.',429);
  active++;try{return await run();}finally{active--;}
}
