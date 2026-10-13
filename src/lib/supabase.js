import { createClient } from '@supabase/supabase-js';

// Wired via env vars. If not configured, the app runs fully on localStorage
// (offline-first) and Supabase features degrade gracefully with friendly messages.
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

export const supabase = supabaseConfigured
  ? createClient(url, anon)
  : null;

// Safe wrappers: every network call in try/catch with friendly errors (per spec).
export async function sb(fn, fallback = null) {
  if (!supabaseConfigured) return fallback;
  try {
    return await fn(supabase);
  } catch (e) {
    console.warn('[AceHeals] Supabase call failed:', e?.message || e);
    return fallback;
  }
}
