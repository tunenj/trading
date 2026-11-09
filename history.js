// In-memory record of recent signals and bot status (resets when the bot restarts)
const MAX_SIGNALS = 50;
const signals = [];
const startedAt = Date.now();
let lastCheck = null;

export function addSignal(sig) {
  signals.unshift({
    time: new Date().toISOString(),
    type: sig.type,
    symbol: sig.symbol,
    price: sig.price,
    rsi: sig.rsi,
    timeframe: sig.timeframe,
  });
  if (signals.length > MAX_SIGNALS) signals.pop();
}

export function getSignals() {
  return signals;
}

export function setLastCheck() {
  lastCheck = new Date().toISOString();
}

export function getStatus() {
  return {
    status: 'running',
    startedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    lastCheck,
  };
}