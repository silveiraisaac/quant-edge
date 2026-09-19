/**
 * Indicator series are indexed 1:1 with the input bars array; positions
 * before enough data exists to compute a value are `null`.
 */

export function simpleMovingAverage(values: number[], period: number): (number | null)[] {
  validatePeriod(period);
  const result: (number | null)[] = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

export function relativeStrengthIndex(values: number[], period: number): (number | null)[] {
  validatePeriod(period);
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length <= period) return result;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) gainSum += change;
    else lossSum -= change;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  result[period] = rsiFromAverages(avgGain, avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = rsiFromAverages(avgGain, avgLoss);
  }

  return result;
}

function rsiFromAverages(avgGain: number, avgLoss: number): number {
  if (avgGain === 0 && avgLoss === 0) return 50;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function validatePeriod(period:number) {
  if(!Number.isInteger(period)||period<1)throw new Error('Indicator period must be a positive integer.');
}
export function exponentialMovingAverage(values:number[],period:number):(number|null)[] {
  validatePeriod(period);
  const result:(number|null)[]=Array(values.length).fill(null);
  if(values.length<period)return result;
  let value=values.slice(0,period).reduce((a,b)=>a+b,0)/period;
  result[period-1]=value;
  for(let i=period;i<values.length;i++){value+=(values[i]-value)*2/(period+1);result[i]=value;}
  return result;
}
