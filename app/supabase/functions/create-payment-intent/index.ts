import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_AMOUNTS: Record<string, number> = {
  Starter:  1900, // $19.00
  Business: 4900, // $49.00
  Pro:      9900, // $99.00
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { plan } = await req.json();
    if (!plan || !PLAN_AMOUNTS[plan]) {
      return new Response(JSON.stringify({ error: 'Valid plan required' }), { status: 400, headers: CORS });
    }

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const amount    = PLAN_AMOUNTS[plan];

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount:   String(amount),
        currency: 'usd',
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    const intent = await res.json();

    if (intent.error) {
      throw new Error(intent.error.message ?? 'Stripe error');
    }

    return new Response(
      JSON.stringify({ clientSecret: intent.client_secret }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
