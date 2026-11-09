import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { fetchCloses, exchangeName } from './data.js';
import { getSignal } from './strategy.js';
import { getLast, setLast } from './state.js';
import { addSignal, setLastCheck } from './history.js';
import { notifyAll, activeChannels } from './notifiers/index.js';

let timer = null;
let stopped = false;

async function checkSymbol(symbol) {
  const closes = await fetchCloses(symbol);
  const sig = getSignal(closes);

  if (sig.type === 'HOLD') return;
  if (getLast(symbol) === sig.type) return; // already alerted for this direction

  setLast(symbol, sig.type);

  const signal = {
    ...sig,
    symbol,
    timeframe: config.timeframe,
    text:
      `${sig.type} signal: ${symbol}\n` +
      `Price: ${sig.price}\n` +
      `RSI: ${sig.rsi.toFixed(1)}\n` +
      `Timeframe: ${config.timeframe}`,
  };

  addSignal(signal);
  await notifyAll(signal);
}

async function runOnce() {
  for (const symbol of config.symbols) {
    try {
      await checkSymbol(symbol);
    } catch (e) {
      console.error(`[${symbol}] check failed:`, e.message);
    }
  }
  setLastCheck();
}

export function startBot() {
  console.log(
    `Signal bot started on ${exchangeName()} | ${config.symbols.join(', ')} | ` +
      `${config.timeframe} | channels: ${activeChannels().join(', ')}`
  );

  // setTimeout loop (not setInterval) so a slow run never overlaps the next one
  const loop = async () => {
    if (stopped) return;
    await runOnce();
    if (!stopped) timer = setTimeout(loop, config.checkEveryMs);
  };
  loop();
}

export function stopBot() {
  stopped = true;
  if (timer) clearTimeout(timer);
}

// Still works when run directly: node index.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startBot();
}