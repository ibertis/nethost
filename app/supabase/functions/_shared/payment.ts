// Shared auth + payment gate for the paid wizard steps (domain-register, provision-hosting).
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const deny = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  Starter:  Deno.env.get('STRIPE_PRICE_STARTER'),
  Business: Deno.env.get('STRIPE_PRICE_BUSINESS'),
  Pro:      Deno.env.get('STRIPE_PRICE_PRO'),
};

const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeDomain(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const d = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  return DOMAIN_RE.test(d) ? d : null;
}

// Identify the caller from their JWT (never trust a userId from the request body)
export async function getCaller(req: Request): Promise<User | null> {
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  );
  const { data: { user } } = await authClient.auth.getUser();
  return user ?? null;
}

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

// Returns an error message, or null when the subscription is paid, owned by the caller and matches the plan.
export async function verifyPayment(
  userEmail: string,
  plan: string,
  subscriptionId: string | null | undefined,
): Promise<string | null> {
  const unpaid = 'No active subscription found. Please complete payment before launching your website.';
  if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) return unpaid;

  const expectedPrice = PLAN_PRICE_IDS[plan];
  if (!expectedPrice) return `Plan not available: ${plan}`;

  // The first invoice can take a moment to settle after confirmPayment, so retry briefly
  let sub;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}?expand[]=customer&expand[]=latest_invoice`,
      { headers: { 'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')!}` } },
    );
    sub = await res.json();
    if (!res.ok) return unpaid;
    const paid = ['active', 'trialing'].includes(sub.status) || sub.latest_invoice?.status === 'paid';
    if (paid) break;
    if (sub.status !== 'incomplete' || attempt === 4) return unpaid;
    await new Promise((r) => setTimeout(r, 2000));
  }

  if ((sub.customer?.email ?? '').toLowerCase() !== userEmail.toLowerCase()) return unpaid;
  if (sub.items?.data?.[0]?.price?.id !== expectedPrice) return 'Your payment does not match the selected plan.';
  return null;
}

// One subscription pays for one site, and a domain belongs to one customer.
// Returns the caller's in-progress order id for this subscription + domain (if any), or an error.
export async function checkOrderUsage(
  svc: SupabaseClient,
  userId: string,
  domain: string,
  subscriptionId: string,
): Promise<{ error: string | null; provisioningOrderId: string | null }> {
  const { data: bySub } = await svc
    .from('orders')
    .select('id, domain, status')
    .eq('stripe_subscription_id', subscriptionId);
  for (const o of bySub ?? []) {
    if (o.domain !== domain) return { error: 'This payment is already in use for another website.', provisioningOrderId: null };
    if (o.status !== 'provisioning') return { error: 'This website has already been set up.', provisioningOrderId: null };
  }

  const { data: byDomain } = await svc
    .from('orders')
    .select('id, user_id')
    .eq('domain', domain)
    .neq('user_id', userId)
    .limit(1);
  if (byDomain?.length) return { error: 'This domain is already in use by another account.', provisioningOrderId: null };

  return { error: null, provisioningOrderId: bySub?.[0]?.id ?? null };
}
