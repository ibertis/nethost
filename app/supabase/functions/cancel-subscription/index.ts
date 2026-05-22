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
    if (!authHeader) throw new Error('Unauthorized');

    // Get the requesting user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { orderId } = await req.json();
    if (!orderId) throw new Error('orderId required');

    // Fetch order — RLS ensures it belongs to this user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, stripe_subscription_id, status')
      .eq('id', orderId)
      .single();
    if (orderError || !order) throw new Error('Order not found');
    if (order.status === 'cancelled') throw new Error('Subscription already cancelled');
    if (!order.stripe_subscription_id) throw new Error('No subscription found for this order');

    // Cancel Stripe subscription at period end
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${order.stripe_subscription_id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'cancel_at_period_end=true',
      },
    );
    const stripeData = await stripeRes.json();
    if (stripeData.error) throw new Error(stripeData.error.message);

    // Update order status
    const svcSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await svcSupabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
