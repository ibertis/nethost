import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const pairs = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k.trim()] = v;
    return acc;
  }, {} as Record<string, string>);

  const { t, v1 } = pairs;
  if (!t || !v1) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return v1 === expected;
}

serve(async (req) => {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const sigHeader = req.headers.get('stripe-signature') ?? '';
  const payload = await req.text();

  const valid = await verifySignature(payload, sigHeader, webhookSecret);
  if (!valid) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const subId = event.data.object.subscription;
      if (subId) {
        await supabase
          .from('orders')
          .update({ status: 'active' })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const subId = event.data.object.subscription;
      if (subId) {
        await supabase
          .from('orders')
          .update({ status: 'payment_failed' })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subId = event.data.object.id;
      await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const newStatus = sub.status === 'active' ? 'active'
        : sub.status === 'past_due'   ? 'payment_failed'
        : sub.status === 'canceled'   ? 'canceled'
        : null;
      if (newStatus) {
        await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('stripe_subscription_id', sub.id);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
