import { SMA, RSI } from 'technicalindicators';
import { config } from './config.js';

/**
 * Pure function: closes in, signal out. Easy to test and to backtest later.
 * Returns { type: 'BUY' | 'SELL' | 'HOLD', price, rsi }
 */
export function getSignal(closes) {
  const { fastPeriod, slowPeriod, rsiPeriod, rsiOverbought, rsiOversold } =
    config.strategy;

  if (closes.length < slowPeriod + 2) {
    return { type: 'HOLD', price: closes.at(-1), rsi: NaN };
  }

  const fast = SMA.calculate({ period: fastPeriod, values: closes });
  const slow = SMA.calculate({ period: slowPeriod, values: closes });
  const rsi = RSI.calculate({ period: rsiPeriod, values: closes });

  const f = fast.at(-1), fPrev = fast.at(-2);
  const s = slow.at(-1), sPrev = slow.at(-2);
  const r = rsi.at(-1);
  const price = closes.at(-1);

  // BUY: fast crosses above slow, RSI not already overbought
  if (fPrev <= sPrev && f > s && r < rsiOverbought) {
    return { type: 'BUY', price, rsi: r };
  }
  // SELL: fast crosses below slow, RSI not already oversold
  if (fPrev >= sPrev && f < s && r > rsiOversold) {
    return { type: 'SELL', price, rsi: r };
  }
  return { type: 'HOLD', price, rsi: r };
}