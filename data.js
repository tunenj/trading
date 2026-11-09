import ccxt from 'ccxt';
import { config } from './config.js';

const exchange = new ccxt[config.exchange]({ enableRateLimit: true });

export function exchangeName() {
  return config.exchange;
}

/**
 * Returns closing prices of CLOSED candles only (oldest -> newest).
 * The last candle from the exchange is still forming, so it is dropped.
 */
export async function fetchCloses(symbol) {
  const candles = await exchange.fetchOHLCV(
    symbol,
    config.timeframe,
    undefined,
    config.candlesToFetch
  );
  candles.pop();
  return candles.map((c) => c[4]);
}