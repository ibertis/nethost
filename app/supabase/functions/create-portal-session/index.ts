import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });
    }

    // Use user's JWT so RLS applies — only their own orders are visible
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Find the user's stripe_customer_id from their orders
    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('stripe_customer_id')
      .not('stripe_customer_id', 'is', null)
      .limit(1);

    if (dbError) throw new Error(dbError.message);
    if (!orders?.length || !orders[0].stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No billing account found' }), { status: 404, headers: CORS });
    }

    const customerId  = orders[0].stripe_customer_id;
    const secretKey   = Deno.env.get('STRIPE_SECRET_KEY')!;
    const returnUrl   = 'https://app.nethost.co';

    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ customer: customerId, return_url: returnUrl }),
    });

    const session = await res.json();
    if (!session.url) throw new Error(session.error?.message ?? 'Failed to create portal session');

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
