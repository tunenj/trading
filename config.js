import 'dotenv/config';

export const config = {
  exchange: process.env.EXCHANGE || 'binance',
  symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  timeframe: '1h',
  checkEveryMs: 60 * 1000,
  candlesToFetch: 200,

  strategy: {
    fastPeriod: 10,
    slowPeriod: 30,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
  },
};