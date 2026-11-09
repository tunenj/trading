import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', 'data', 'state.json');

let state = {};

try {
  state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {
  state = {}; // first run or unreadable file
}

export function getLast(symbol) {
  return state[symbol];
}

export function setLast(symbol, type) {
  state[symbol] = type;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Could not save state:', e.message);
  }
}