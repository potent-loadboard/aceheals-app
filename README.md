# 🌿 AceHeals

Family wellness support app — built by a parent, for parents.
**Sponsored by POTENT ['PRÄDƏKT]®**

> "Built by a parent, for parents. Real tools, not $500 PDFs."

## Stack
- React 18 + Vite
- Supabase (Auth + PostgreSQL + Realtime)
- Netlify (hosting + serverless functions)
- Stripe (web checkout — no app store)

## Quick start

```bash
npm install
cp .env.example .env   # add your Supabase URL + anon key
npm run dev            # http://localhost:5173
npm run build          # production build -> dist/
```

Without Supabase env vars the app runs in **local mode** (localStorage, offline-first) —
auth gate is skipped and everything works on-device.

## Supabase setup
1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL Editor (tables + RLS + Realtime)
3. Enable Google OAuth in Auth → Providers (optional)
4. Add URL + anon key to `.env` (and Netlify env vars)

## Stripe setup (Netlify env vars)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_LIFETIME` (price for $79 one-time)
- `STRIPE_PRICE_MONTHLY` (price for $12.99/mo)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (webhook sync)
- `SITE_URL` (e.g. https://aceheals.app)

Functions live in `netlify/functions/`: `create-checkout`, `stripe-webhook`, `verify-access`, `ai-recipe`.

## PWA
`public/manifest.json` + `public/sw.js` — installable, offline-first for core tools
(AAC board, Calm Down Corner, Visual Schedule). No app store — web only.

## Project map
- `src/tabs/` — the 8 tabs + Settings (Home, Heal, Maverick, Manny, Potty, Music, Recipes, Together)
- `src/data/` — AAC words (120), recipes (105), 22 games, social stories, content
- `src/lib/` — supabase client, localStorage store, paywall/trial logic, disclaimers, Web Audio engine
- `src/components/ui.jsx` — shared glossy UI (buttons, cards, modals, paywall, confetti…)

## Legal
The exact medical disclaimer (see `src/lib/disclaimer.js`) is shown word-for-word
via a footer link on every screen. The app never makes medical claims.
