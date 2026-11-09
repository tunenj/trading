export const name = 'telegram';

export function enabled() {
  return Boolean(process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function send(signal) {
  const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: signal.text }),
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
}