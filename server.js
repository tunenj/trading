import 'dotenv/config';
import http from 'node:http';
import { startBot, stopBot } from './index.js';
import { getSignals, getStatus } from './history.js';
import { config } from './config.js';

const PORT = Number(process.env.PORT) || 3000;
// 127.0.0.1 = only this machine can open it. Use HOST=0.0.0.0 on a VPS/host.
const HOST = process.env.HOST || '127.0.0.1';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

function renderPage() {
  const status = getStatus();
  const rows = getSignals()
    .map((s) => {
      const rsi = Number.isFinite(s.rsi) ? s.rsi.toFixed(1) : '-';
      return `<tr>
        <td>${esc(s.time.replace('T', ' ').slice(0, 19))}</td>
        <td class="${s.type === 'BUY' ? 'buy' : 'sell'}">${esc(s.type)}</td>
        <td>${esc(s.symbol)}</td>
        <td>${esc(s.price)}</td>
        <td>${esc(rsi)}</td>
        <td>${esc(s.timeframe)}</td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="60">
<title>Trading Signals</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 760px; padding: 0 1rem; background: #0f172a; color: #e2e8f0; }
  h1 { margin-bottom: .25rem; }
  .meta { color: #94a3b8; font-size: .9rem; margin-bottom: 1.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: .5rem .6rem; border-bottom: 1px solid #1e293b; }
  th { color: #94a3b8; font-weight: 600; font-size: .85rem; }
  .buy { color: #22c55e; font-weight: 700; }
  .sell { color: #ef4444; font-weight: 700; }
  .empty { color: #94a3b8; padding: 1rem 0; }
  .note { color: #64748b; font-size: .8rem; margin-top: 2rem; }
</style>
</head>
<body>
<h1>Trading Signals</h1>
<div class="meta">
  Watching ${esc(config.symbols.join(', '))} on ${esc(config.timeframe)} |
  Uptime ${esc(status.uptimeSeconds)}s |
  Last check ${esc(status.lastCheck ?? 'not yet')}
</div>
${
  rows
    ? `<table>
  <thead><tr><th>Time (UTC)</th><th>Signal</th><th>Pair</th><th>Price</th><th>RSI</th><th>TF</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`
    : '<div class="empty">No signals yet since the bot started. Crossovers can take hours or days.</div>'
}
<div class="note">Not financial advice. Signals are rule-based and can be wrong. Page refreshes every 60 seconds.</div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];

  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' }).end('Method Not Allowed');
    return;
  }

  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStatus()));
  } else if (path === '/signals') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getSignals()));
  } else if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderPage());
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Dashboard: http://${HOST}:${PORT}  (JSON: /signals, /health)`);
  startBot();
});

function shutdown() {
  console.log('Shutting down...');
  stopBot();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);