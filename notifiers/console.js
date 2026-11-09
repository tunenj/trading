export const name = 'console';

export function enabled() {
  return true;
}

export async function send(signal) {
  console.log(`[${new Date().toISOString()}]\n${signal.text}\n`);
}