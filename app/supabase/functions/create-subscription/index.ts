import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS: Record<string, string> = {
  Starter:  Deno.env.get('STRIPE_PRICE_STARTER')  ?? '',
  Business: Deno.env.get('STRIPE_PRICE_BUSINESS') ?? '',
  Pro:      Deno.env.get('STRIPE_PRICE_PRO')       ?? '',
};

async function getOrCreateCustomer(secretKey: string, email: string): Promise<string> {
  const searchRes = await fetch(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { 'Authorization': `Bearer ${secretKey}` } },
  );
  const searchData = await searchRes.json();
  if (searchData.data?.length > 0) return searchData.data[0].id;

  const createRes = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ email }),
  });
  const customer = await createRes.json();
  if (!customer.id) throw new Error('Failed to create Stripe customer');
  return customer.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { plan, email } = await req.json();

    if (!plan || !PRICE_IDS[plan]) {
      return new Response(JSON.stringify({ error: 'Valid plan required' }), { status: 400, headers: CORS });
    }
    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Price ID not configured for plan: ${plan}` }), { status: 500, headers: CORS });
    }

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    // Create or retrieve Stripe Customer
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400, headers: CORS });
    }
    const customerId = await getOrCreateCustomer(secretKey, email);

    // Create subscription in "incomplete" state — requires payment confirmation client-side
    const subBody = new URLSearchParams({
      customer:                          customerId,
      'items[0][price]':                 priceId,
      payment_behavior:                  'default_incomplete',
      'payment_settings[save_default_payment_method]': 'on_subscription',
      'expand[0]':                       'latest_invoice.payment_intent',
    });

    const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: subBody,
    });

    const subscription = await subRes.json();
    if (subscription.error) throw new Error(subscription.error.message ?? 'Stripe subscription error');

    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
    if (!clientSecret) throw new Error('No client secret returned from Stripe');

    return new Response(
      JSON.stringify({ clientSecret, customerId, subscriptionId: subscription.id }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
