import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { CORS, deny, getCaller, serviceClient, verifyPayment, checkOrderUsage, normalizeDomain } from '../_shared/payment.ts';

// Registers a domain on NETHOST's Namecheap account. Only for a signed-in customer with a paid
// subscription, and only once per subscription: the 'provisioning' order row created here marks
// the domain as registered, and provision-hosting reuses that row.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { domain: rawDomain, plan, stripeCustomerId, stripeSubscriptionId } = await req.json();
    const domain = normalizeDomain(rawDomain);
    if (!domain || !plan) return deny(400, 'A valid plan and domain are required.');

    const user = await getCaller(req);
    if (!user) return deny(401, 'Please sign in before registering a domain.');

    const payError = await verifyPayment(user.email ?? '', plan, stripeSubscriptionId);
    if (payError) return deny(402, payError);

    const svc = serviceClient();
    const usage = await checkOrderUsage(svc, user.id, domain, stripeSubscriptionId);
    if (usage.error) return deny(409, usage.error);

    // Already registered for this subscription on an earlier attempt
    if (usage.provisioningOrderId) {
      return new Response(
        JSON.stringify({ success: true, domain }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    // Claim the subscription before spending money at Namecheap (unique index on stripe_subscription_id)
    const { data: order, error: insertError } = await svc
      .from('orders')
      .insert({
        user_id:                user.id,
        plan,
        domain,
        stripe_customer_id:     stripeCustomerId ?? null,
        stripe_subscription_id: stripeSubscriptionId,
        status:                 'provisioning',
      })
      .select('id')
      .single();
    if (insertError || !order) return deny(409, 'This payment is already in use for another website.');

    const res = await fetch(Deno.env.get('PROXY_URL')!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Secret': Deno.env.get('PROXY_SECRET')!,
      },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json().catch(() => ({ error: 'Registration service unavailable' }));

    if (data.error) {
      // Release the claim so the customer can retry or pick another domain
      await svc.from('orders').delete().eq('id', order.id);
      console.error('domain-register failed', domain, data.error);
      return deny(502, 'Domain registration failed. Please try again or choose another domain.');
    }

    return new Response(
      JSON.stringify({ success: true, domain }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    console.error('domain-register error', err);
    return deny(500, 'Domain registration failed. Please try again.');
  }
});
