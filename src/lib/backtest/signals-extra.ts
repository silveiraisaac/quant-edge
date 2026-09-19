import { OHLCVBar, StrategyConfig } from '../types';
import { exponentialMovingAverage as ema, relativeStrengthIndex as rsi, simpleMovingAverage as sma } from './indicators';
export type Signal='ENTER'|'EXIT'|null;
export function extraSignals(bars:OHLCVBar[],s:StrategyConfig):Signal[] {
  const closes=bars.map(b=>b.close), out:Signal[]=Array(bars.length).fill(null);
  const cross=(a:(number|null)[],b:(number|null)[])=>{
    for(let i=1;i<out.length;i++) {
      const [ap,bp,ac,bc]=[a[i-1],b[i-1],a[i],b[i]];
      if(ap===null||bp===null||ac===null||bc===null)continue;
      if(ap<=bp&&ac>bc)out[i]='ENTER';else if(ap>=bp&&ac<bc)out[i]='EXIT';
    }
  };
  if(s.type==='EMA_CROSSOVER')cross(ema(closes,s.fastPeriod),ema(closes,s.slowPeriod));
  if(s.type==='MACD') {
    const fast=ema(closes,s.fastPeriod),slow=ema(closes,s.slowPeriod);
    const line=closes.map((_,i)=>fast[i]===null||slow[i]===null?null:fast[i]!-slow[i]!);
    const warmup=s.slowPeriod-1;
    const signal=[...Array(warmup).fill(null),...ema(line.slice(warmup) as number[],s.signalPeriod)];
    cross(line,signal);
  }
  if(s.type==='RSI_MOMENTUM') {
    const values=rsi(closes,s.period);
    for(let i=1;i<out.length;i++){const prev=values[i-1],cur=values[i];if(prev===null||cur===null)continue;if(prev<=s.entryThreshold&&cur>s.entryThreshold)out[i]='ENTER';else if(prev>=s.exitThreshold&&cur<s.exitThreshold)out[i]='EXIT';}
  }
  if(s.type==='DONCHIAN') {
    for(let i=Math.max(s.entryPeriod,s.exitPeriod);i<out.length;i++) {
      // The current candle is explicitly excluded from both breakout channels.
      const high=Math.max(...bars.slice(i-s.entryPeriod,i).map(b=>b.high));
      const low=Math.min(...bars.slice(i-s.exitPeriod,i).map(b=>b.low));
      if(closes[i]>high)out[i]='ENTER';else if(closes[i]<low)out[i]='EXIT';
    }
  }
  if(s.type==='ROC') {
    const roc=closes.map((v,i)=>i<s.period?null:(v/closes[i-s.period]-1)*100);
    for(let i=s.period+1;i<out.length;i++){if(roc[i-1]!<=s.threshold&&roc[i]!>s.threshold)out[i]='ENTER';else if(roc[i-1]!>=-s.threshold&&roc[i]!< -s.threshold)out[i]='EXIT';}
  }
  if(s.type==='BOLLINGER') {
    const mid=sma(closes,s.period);
    const lower=mid.map((mean,i)=>mean===null?null:mean-s.deviations*Math.sqrt(closes.slice(i-s.period+1,i+1).reduce((a,v)=>a+(v-mean)**2,0)/s.period));
    for(let i=s.period;i<out.length;i++){if(closes[i-1]<=lower[i-1]!&&closes[i]>lower[i]!)out[i]='ENTER';else if(closes[i-1]<mid[i-1]!&&closes[i]>=mid[i]!)out[i]='EXIT';}
  }
  return out;
}
