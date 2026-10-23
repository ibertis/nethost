import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TOLERANCE_SECONDS = 300; // Stripe's default: reject events signed more than 5 minutes ago (replays)

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  let t = '';
  const v1s: string[] = []; // Stripe may send several v1 signatures during secret rotation
  for (const part of sigHeader.split(',')) {
    const [k, v] = part.split('=');
    if (k?.trim() === 't') t = v ?? '';
    if (k?.trim() === 'v1' && v) v1s.push(v);
  }
  if (!t || !v1s.length) return false;

  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return v1s.some((v1) => timingSafeEqual(v1, expected));
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
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subId = event.data.object.id;
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const newStatus = sub.status === 'active' ? 'active'
        : sub.status === 'past_due'   ? 'past_due'
        : sub.status === 'canceled'   ? 'cancelled'
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
