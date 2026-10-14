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
// Strips emojis/symbols first — screen readers read "glowing star" etc. out loud otherwise.
export function speak(text, rate = 0.85) {
  try {
    // Respect global audio settings
    try {
      const s = JSON.parse(localStorage.getItem('aceheals:audioSettings') || '{}');
      if (s.master === false) return;
      if (s.voice === false) return;
      if (s.mode === 'library' || s.mode === 'quiet') return;
    } catch {}
    if (!('speechSynthesis' in window)) { toast('🔇 Speech not supported on this device'); return; }
    // Remove emojis, pictographs, symbols, and variation selectors — keep words & punctuation
    const clean = String(text || '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    const synth = window.speechSynthesis;
    // Android/Chrome: voices load async — wait for them before speaking
    const doSpeak = () => {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = rate;
      // Small delay after cancel() — Android needs breathing room
      setTimeout(() => { try { synth.speak(u); } catch {} }, 50);
    };
    if (synth.getVoices().length === 0) {
      let done = false;
      const onVoices = () => { if (!done) { done = true; doSpeak(); } };
      synth.addEventListener('voiceschanged', onVoices, { once: true });
      setTimeout(() => { if (!done) { done = true; doSpeak(); } }, 500);
    } else {
      doSpeak();
    }
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
