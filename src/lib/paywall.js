import { load, save } from './store.js';
import { sb } from './supabase.js';

// Pricing per spec: $79 lifetime (featured), $12.99/mo, 24h free trial no card.
export const PLANS = {
  lifetime: { id: 'lifetime', name: 'Lifetime Access', price: 79, label: '$79 one-time', note: 'Pay once, own forever. No renewals.' },
  monthly: { id: 'monthly', name: 'Monthly', price: 12.99, label: '$12.99/month', note: 'Cancel anytime.' },
};

// access = { paid: bool, plan: 'lifetime'|'monthly'|null, trialStart: ts, graceUntil: ts|null }
export function getAccess() {
  const a = load('access', null);
  if (a) return a;
  const fresh = { paid: false, plan: null, trialStart: Date.now(), graceUntil: null };
  save('access', fresh);
  return fresh;
}
export function setAccess(a) { save('access', a); }

export function trialHoursLeft() {
  const a = getAccess();
  if (a.paid) return Infinity;
  const end = a.trialStart + 24 * 3600e3;
  return Math.max(0, (end - Date.now()) / 3600e3);
}
export function trialActive() {
  const a = getAccess();
  return !a.paid && trialHoursLeft() > 0;
}
export function isPaid() {
  const a = getAccess();
  if (a.paid) return true;
  // 3-day grace period on failed payments before blocking (per spec)
  if (a.graceUntil && Date.now() < a.graceUntil) return true;
  return false;
}
export function hasAccess() { return trialActive() || isPaid(); }

// Per-tab trial limits after 24h unpaid (per spec)
export const TRIAL_LIMITS = {
  home: 'accessible-with-paywall',
  scanner: { scansPerDay: 3 },
  aac: { categories: 2 },           // first 2 categories only
  potty: 'paywall',
  music: 'paywall',
  recipes: { max: 5, noAI: true },   // 5 recipes only, no AI generator
  community: 'read-only',
};

export function scansToday() {
  const k = 'scans:' + new Date().toISOString().slice(0, 10);
  return load(k, 0);
}
export function bumpScans() {
  const k = 'scans:' + new Date().toISOString().slice(0, 10);
  const n = load(k, 0) + 1;
  save(k, n);
  return n;
}

// Restore purchase: manual Supabase check (per spec). Falls back gracefully offline.
export async function restorePurchase(userId) {
  const row = await sb(async (s) => {
    const { data, error } = await s.from('users').select('paid, plan').eq('id', userId).single();
    if (error) throw error;
    return data;
  }, null);
  if (row && row.paid) {
    setAccess({ paid: true, plan: row.plan || 'lifetime', trialStart: getAccess().trialStart, graceUntil: null });
    return true;
  }
  return false;
}

// Start Stripe Checkout via Netlify function (stub until keys are configured).
export async function startCheckout(planId, email) {
  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, email }),
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; return; }
    throw new Error(data.error || 'Checkout not configured yet');
  } catch (e) {
    throw new Error('Payments are not connected yet. ' + (e.message || ''));
  }
}

// ?payment=success handler — auto-verify and unlock (per spec).
export async function handlePaymentReturn() {
  const q = new URLSearchParams(window.location.search);
  if (q.get('payment') !== 'success') return false;
  const sessionId = q.get('session_id');
  try {
    const res = await fetch('/.netlify/functions/verify-access?session_id=' + encodeURIComponent(sessionId || ''));
    const data = await res.json();
    if (data.paid) {
      setAccess({ paid: true, plan: data.plan || 'lifetime', trialStart: getAccess().trialStart, graceUntil: null });
    }
  } catch { /* offline — keep trial state, user can hit Restore Purchase later */ }
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}
