import { load, save } from './store.js';

// Parent PIN: gates adult sections & exiting Kids Mode.
// Stored locally (hashed-ish — obfuscated, not encrypted; keeps honest kids out).
const KEY = 'parentPin';

function obfuscate(pin) {
  // Simple reversible obfuscation — not security, just keeps little eyes out.
  // Real account security lives in Supabase auth.
  return btoa('aceheals:' + pin).split('').reverse().join('');
}

export function hasPin() {
  return Boolean(load(KEY, null));
}

export function setPin(pin) {
  if (!/^\d{4}$/.test(pin)) return false;
  save(KEY, obfuscate(pin));
  return true;
}

export function verifyPin(pin) {
  const stored = load(KEY, null);
  if (!stored) return false;
  return stored === obfuscate(pin);
}

export function clearPin() {
  save(KEY, null);
}

// Tabs visible in Kids Mode (kid-safe only — no protocols, community, or payments)
export const KID_TABS = ['manny', 'maverick', 'music', 'potty'];
