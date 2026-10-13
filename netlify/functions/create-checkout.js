// Netlify function: create-checkout
// Creates a Stripe Checkout Session for $79 lifetime or $12.99/mo.
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_LIFETIME, STRIPE_PRICE_MONTHLY, SITE_URL
const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!stripeKey) {
    return { statusCode: 501, body: JSON.stringify({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY in Netlify env vars.' }) };
  }
  try {
    const { plan, email } = JSON.parse(event.body || '{}');
    const price = plan === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_LIFETIME;
    if (!price) {
      return { statusCode: 501, body: JSON.stringify({ error: 'Price IDs not configured. Add STRIPE_PRICE_LIFETIME / STRIPE_PRICE_MONTHLY.' }) };
    }
    const params = new URLSearchParams({
      'payment_method_types[0]': 'card',
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      success_url: `${process.env.SITE_URL || 'https://aceheals.app'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'https://aceheals.app'}/?payment=cancelled`,
      ...(email ? { customer_email: email } : {}),
    });
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || 'Stripe error');
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
