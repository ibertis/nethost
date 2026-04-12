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

const ok  = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...CORS, 'Content-Type': 'application/json' } });
const err = (msg: string)   => new Response(JSON.stringify({ error: msg }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { plan, email } = await req.json();

    if (!plan || !PRICE_IDS[plan]) return err('Valid plan required');

    const priceId = PRICE_IDS[plan];
    if (!priceId) return err(`Price ID not configured for plan: ${plan}`);
    if (!email)   return err('Email required');

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const customerId = await getOrCreateCustomer(secretKey, email);

    // Reuse any existing incomplete subscription for this customer + price to avoid
    // Stripe concurrent-access errors from cancel + immediate recreate race conditions
    const existingRes = await fetch(
      `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=incomplete&limit=10`,
      { headers: { 'Authorization': `Bearer ${secretKey}` } },
    );
    const existingData = await existingRes.json();
    if (Array.isArray(existingData.data)) {
      for (const sub of existingData.data) {
        if (sub.items?.data?.[0]?.price?.id === priceId) {
          // Fetch with expanded PaymentIntent to get the clientSecret
          const expandedRes = await fetch(
            `https://api.stripe.com/v1/subscriptions/${sub.id}?expand[]=latest_invoice.payment_intent`,
            { headers: { 'Authorization': `Bearer ${secretKey}` } },
          );
          const expanded = await expandedRes.json();
          const clientSecret = expanded.latest_invoice?.payment_intent?.client_secret;
          if (clientSecret) {
            return ok({ clientSecret, customerId, subscriptionId: sub.id });
          }
        }
      }
    }

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
    if (subscription.error) return err(subscription.error.message ?? 'Stripe subscription error');

    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
    if (!clientSecret) return err('No client secret returned from Stripe');

    return ok({ clientSecret, customerId, subscriptionId: subscription.id });
  } catch (e) {
    return err(e.message ?? 'Unexpected error');
  }
});
