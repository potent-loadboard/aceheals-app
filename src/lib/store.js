import { useState, useEffect, useCallback } from 'react';

// Persistent local state (offline-first). Namespaced under aceheals:.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem('aceheals:' + key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key, val) {
  try {
    localStorage.setItem('aceheals:' + key, JSON.stringify(val));
  } catch { /* storage full / private mode — app keeps working in memory */ }
}

export function useStored(key, initial) {
  const [val, setVal] = useState(() => load(key, initial));
  const set = useCallback((v) => {
    setVal((prev) => {
      const next = typeof v === 'function' ? v(prev) : v;
      save(key, next);
      return next;
    });
  }, [key]);
  return [val, set];
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// Consecutive-day streak counter
export function useStreak() {
  const [streak, setStreak] = useStored('streak', { count: 0, last: null });
  useEffect(() => {
    const t = todayKey();
    if (streak.last === t) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    setStreak({ count: streak.last === y ? streak.count + 1 : 1, last: t });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return streak.count;
}

// Tiny toast helper (event-based so any component can fire one)
export function toast(msg) {
  window.dispatchEvent(new CustomEvent('aceheals:toast', { detail: msg }));
}

// Text-to-speech (AAC board, stories, read-aloud)
export function speak(text, rate = 0.85) {
  try {
    if (!('speechSynthesis' in window)) { toast('🔇 Speech not supported on this device'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch {
    toast('🔇 Could not play speech');
  }
}

export function stopSpeak() {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
}

// Vibrate when available (used in deaf/HOH mode as a visual/tactile cue)
export function buzz(pattern = [60]) {
  try { navigator.vibrate && navigator.vibrate(pattern); } catch {}
}
