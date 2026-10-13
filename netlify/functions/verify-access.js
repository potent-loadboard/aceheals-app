// Netlify function: verify-access
// Called after ?payment=success — verifies the Stripe session and returns paid status.
// Requires env vars: STRIPE_SECRET_KEY
const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function handler(event) {
  const sessionId = event.queryStringParameters?.session_id;
  if (!stripeKey || !sessionId) {
    return { statusCode: 200, body: JSON.stringify({ paid: false, reason: 'not-configured' }) };
  }
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    const s = await res.json();
    if (!res.ok) throw new Error(s.error?.message || 'Stripe error');
    const paid = s.payment_status === 'paid' || s.status === 'complete';
    return { statusCode: 200, body: JSON.stringify({ paid, plan: s.mode === 'subscription' ? 'monthly' : 'lifetime' }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ paid: false, error: e.message }) };
  }
}
