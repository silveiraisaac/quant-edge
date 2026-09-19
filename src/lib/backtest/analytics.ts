import { EquityPoint, Trade } from '../types';
const daysBetween=(a:string,b:string)=>(Date.parse(b)-Date.parse(a))/86400000;
const mean=(v:number[])=>v.length?v.reduce((a,b)=>a+b,0)/v.length:null;
export function advancedAnalytics(initial:number,curve:EquityPoint[],trades:Trade[],riskFreeRatePct=0,periodsPerYear=252) {
  const returns:number[]=[];
  let previous=initial;
  for(let i=0;i<curve.length;i++) {
    if(previous>0&&(i>0||curve[i].equity!==initial))returns.push(curve[i].equity/previous-1);
    previous=curve[i].equity;
  }
  const riskFree=Math.pow(1+riskFreeRatePct/100,1/periodsPerYear)-1;
  const average=mean(returns);
  const std=returns.length>1?Math.sqrt(returns.reduce((a,v)=>a+(v-average!)**2,0)/(returns.length-1)):null;
  const excess=returns.map(v=>v-riskFree), excessMean=mean(excess);
  const downside=excess.length?Math.sqrt(excess.reduce((a,v)=>a+Math.min(0,v)**2,0)/excess.length):null;
  let peak=initial,peakDate=curve[0]?.date??null,maxDrawdownPct=0,maxDrawdownInr=0;
  let drawdownPeakDate:string|null=null,drawdownTroughDate:string|null=null,recoveryDate:string|null=null;
  let maxPeak=initial,troughIndex=-1,episodeStart:string|null=null,longestRecoveryDays=0;
  for(let i=0;i<curve.length;i++) {
    const p=curve[i];
    if(p.equity>=peak){if(episodeStart)longestRecoveryDays=Math.max(longestRecoveryDays,daysBetween(episodeStart,p.date));episodeStart=null;peak=p.equity;peakDate=p.date;}
    else {episodeStart??=peakDate;const dd=(p.equity/peak-1)*100;maxDrawdownInr=Math.max(maxDrawdownInr,peak-p.equity);if(dd<maxDrawdownPct){maxDrawdownPct=dd;drawdownPeakDate=peakDate;drawdownTroughDate=p.date;maxPeak=peak;troughIndex=i;}}
  }
  if(episodeStart&&curve.length)longestRecoveryDays=Math.max(longestRecoveryDays,daysBetween(episodeStart,curve.at(-1)!.date));
  if(troughIndex>=0)recoveryDate=curve.slice(troughIndex+1).find(p=>p.equity>=maxPeak)?.date??null;
  const drawdownDurationDays=drawdownPeakDate?daysBetween(drawdownPeakDate,recoveryDate??curve.at(-1)!.date):0;
  const wins=trades.filter(t=>t.pnl>0),losses=trades.filter(t=>t.pnl<0);
  let winStreak=0,lossStreak=0,consecutiveWins=0,consecutiveLosses=0;
  for(const t of trades){winStreak=t.pnl>0?winStreak+1:0;lossStreak=t.pnl<0?lossStreak+1:0;consecutiveWins=Math.max(consecutiveWins,winStreak);consecutiveLosses=Math.max(consecutiveLosses,lossStreak);}
  const averageWin=mean(wins.map(t=>t.pnl)),averageLoss=mean(losses.map(t=>t.pnl));
  const exposed=curve.filter(p=>trades.some(t=>t.entryDate<=p.date&&t.exitDate>=p.date)).length;
  const years=curve.length>1?daysBetween(curve[0].date,curve.at(-1)!.date)/365.2425:0;
  const ending=curve.at(-1)?.equity??initial;
  return {
    cagrPct:years>0&&ending>0?(Math.pow(ending/initial,1/years)-1)*100:null,
    sharpeRatio:std&&excessMean!==null?excessMean/std*Math.sqrt(periodsPerYear):null,
    sortinoRatio:downside&&excessMean!==null?excessMean/downside*Math.sqrt(periodsPerYear):null,
    volatilityPct:std===null?null:std*Math.sqrt(periodsPerYear)*100,
    maxDrawdownPct,maxDrawdownInr,drawdownPeakDate,drawdownTroughDate,recoveryDate,drawdownDurationDays,longestRecoveryDays,
    winningTrades:wins.length,losingTrades:losses.length,breakevenTrades:trades.length-wins.length-losses.length,
    winRatePct:trades.length?wins.length/trades.length*100:null,
    averageWin,averageLoss,bestTrade:trades.length?Math.max(...trades.map(t=>t.pnl)):null,worstTrade:trades.length?Math.min(...trades.map(t=>t.pnl)):null,
    profitFactor:losses.length?wins.reduce((a,t)=>a+t.pnl,0)/-losses.reduce((a,t)=>a+t.pnl,0):null,
    riskReward:averageWin!==null&&averageLoss!==null?averageWin/-averageLoss:null,
    expectancy:mean(trades.map(t=>t.pnl)),consecutiveWins,consecutiveLosses,
    averageHoldingDays:mean(trades.map(t=>daysBetween(t.entryDate,t.exitDate))),
    exposurePct:curve.length?exposed/curve.length*100:null,
    turnover:trades.reduce((a,t)=>a+t.quantity*(t.entryPrice+t.exitPrice),0),
    totalTradingCosts:trades.reduce((a,t)=>a+(t.charges??0),0),
    grossPnl:trades.reduce((a,t)=>a+(t.grossPnl??t.pnl),0),
    slippageImpact:trades.reduce((a,t)=>a+(t.slippageImpact??0),0),
  };
}
