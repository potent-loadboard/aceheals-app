// Netlify function: stripe-webhook
// Receives Stripe events and syncs payment status -> Supabase users.paid.
// Requires env vars: STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import crypto from 'crypto';

// Lazy-load Supabase client inside handler (top-level await breaks Netlify's CJS bundling)
let _createClient = null;
async function getClient() {
  if (!_createClient) {
    try {
      const mod = await import('@supabase/supabase-js');
      _createClient = mod.createClient;
    } catch { _createClient = () => null; }
  }
  return _createClient;
}

function verify(sig, raw, secret) {
  // Minimal Stripe signature check (t=...,v1=...)
  try {
    const parts = Object.fromEntries(sig.split(',').map((p) => p.split('=')));
    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
  } catch { return false; }
}

export async function handler(event) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return { statusCode: 501, body: 'Webhook not configured' };
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!verify(sig || '', event.body || '', secret)) {
    return { statusCode: 400, body: 'Bad signature' };
  }
  let evt;
  try { evt = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  try {
    const createClient = await getClient();
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (evt.type === 'checkout.session.completed') {
      const s = evt.data.object;
      const email = s.customer_email || s.customer_details?.email;
      const plan = s.mode === 'subscription' ? 'monthly' : 'lifetime';
      if (email) {
        await supabase.from('users').upsert(
          { email, paid: true, plan, stripe_customer_id: typeof s.customer === 'string' ? s.customer : null },
          { onConflict: 'email' }
        );
      }
    }
    if (evt.type === 'invoice.payment_failed') {
      const email = evt.data.object.customer_email;
      if (email) {
        // 3-day grace period before blocking (per spec)
        await supabase.from('users').update({
          grace_until: new Date(Date.now() + 3 * 864e5).toISOString(),
        }).eq('email', email);
      }
    }
    if (evt.type === 'customer.subscription.deleted') {
      const email = evt.data.object.customer_email;
      if (email) await supabase.from('users').update({ paid: false }).eq('email', email);
    }
  } catch (e) {
    console.error('webhook sync failed', e.message);
  }
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}
