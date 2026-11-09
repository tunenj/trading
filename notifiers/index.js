import * as consoleChannel from './console.js';
import * as telegram from './telegram.js';

// Add or remove channels here. Each one needs: name, enabled(), send(signal)
const channels = [consoleChannel, telegram];

export function activeChannels() {
  return channels.filter((c) => c.enabled()).map((c) => c.name);
}

export async function notifyAll(signal) {
  for (const channel of channels) {
    if (!channel.enabled()) continue;
    try {
      await channel.send(signal);
    } catch (e) {
      // one failing channel must not stop the others
      console.error(`[${channel.name}] failed:`, e.message);
    }
  }
}