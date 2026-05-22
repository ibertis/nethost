import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pass = '';
  // Use crypto.getRandomValues for secure generation
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    pass += chars[byte % chars.length];
  }
  return pass;
}

// --- DNS: set A records via Namecheap after provisioning ---
async function setDnsRecords(domain: string, ip: string): Promise<void> {
  const apiUser = Deno.env.get('NAMECHEAP_API_USER')!;
  const apiKey  = Deno.env.get('NAMECHEAP_API_KEY')!;
  const dot     = domain.indexOf('.');
  const sld     = domain.slice(0, dot);
  const tld     = domain.slice(dot + 1);
  const params  = new URLSearchParams({
    ApiUser:     apiUser,
    ApiKey:      apiKey,
    UserName:    apiUser,
    ClientIp:    '76.13.118.227',
    Command:     'namecheap.domains.dns.setHosts',
    SLD:         sld,
    TLD:         tld,
    HostName1:   '@',
    RecordType1: 'A',
    Address1:    ip,
    TTL1:        '300',
    HostName2:   'www',
    RecordType2: 'A',
    Address2:    ip,
    TTL2:        '300',
  });
  // Fire-and-forget — DNS propagation is async; don't throw on failure
  fetch(`https://api.namecheap.com/xml.response?${params}`).catch(() => {/* ignore */});
}

// --- Cloudways provisioning (Business / Pro plans) ---
async function provisionCloudways(domain: string, siteName: string) {
  const email  = Deno.env.get('CLOUDWAYS_EMAIL')!;
  const apiKey = Deno.env.get('CLOUDWAYS_API_KEY')!;

  // Step 1: Get OAuth token
  const tokenRes = await fetch('https://api.cloudways.com/api/v1/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, api_key: apiKey }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error('Cloudways auth failed');

  const authHeaders = {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  };

  // Step 2: Get list of servers — pick first available
  const serversRes = await fetch('https://api.cloudways.com/api/v1/server', { headers: authHeaders });
  const { servers } = await serversRes.json();
  if (!servers?.length) throw new Error('No Cloudways servers available');
  const server = servers[0];
  const serverIp = server.public_ip ?? server.master_ip;

  // Step 3: Create WordPress application
  const appLabel = siteName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase().slice(0, 30);
  const appRes = await fetch('https://api.cloudways.com/api/v1/app', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      server_id:    server.id,
      application:  'wordpress',
      app_label:    appLabel,
      project_name: domain,
    }),
  });
  const appData = await appRes.json();
  // Cloudways returns {status:true, operation_id:"..."} on success — no app object yet
  if (!appData?.status) throw new Error(`Cloudways app creation failed: ${JSON.stringify(appData)}`);

  // Step 4: Poll app list until our new app appears with credentials (max ~150s)
  // Initial 30s wait — app creation is async and WP install takes time
  await new Promise(r => setTimeout(r, 30000));
  let wpCreds: { username?: string; password?: string } = {};
  for (let i = 0; i < 12; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 10000));
    // Poll /server — each server object includes its apps array with credentials
    const serverListRes = await fetch('https://api.cloudways.com/api/v1/server', { headers: authHeaders });
    const serverListRaw = await serverListRes.text();
    let serverListData: any;
    try { serverListData = JSON.parse(serverListRaw); } catch {
      throw new Error(`Cloudways server list non-JSON (HTTP ${serverListRes.status}): ${serverListRaw.slice(0, 300)}`);
    }
    const servers = serverListData?.servers ?? [];
    const ourServer = servers.find((s: any) => s.id == server.id);
    const apps = ourServer?.apps ?? [];
    const app = apps.find((a: any) =>
      a.label === appLabel || a.project_name === domain || a.app_fqdn?.includes(appLabel)
    );
    if (app) {
      const c = app.creds?.[0] ?? app.app_credentials?.[0] ?? {};
      const user = c.username ?? c.user ?? c.wp_user ?? app.wp_user ?? app.sys_user ?? app.username;
      const pass = c.password ?? c.pass ?? c.wp_password ?? app.wp_password ?? app.sys_password ?? app.password;
      if (user && pass) { wpCreds = { username: user, password: pass }; break; }
    }
  }

  if (!wpCreds.username) throw new Error('Cloudways app deployed but could not retrieve WP credentials');

  await setDnsRecords(domain, serverIp);

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username:   wpCreds.username,
    password:   wpCreds.password!,
    email:      `hello@${domain}`,
    serverIp,
  };
}

// --- CyberPanel provisioning (Starter plan) ---
async function provisionCyberPanel(domain: string) {
  const proxyUrl    = Deno.env.get('PROXY_URL_CYBERPANEL')!;
  const proxySecret = Deno.env.get('PROXY_SECRET')!;

  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Proxy-Secret': proxySecret },
    body: JSON.stringify({ domain }),
  });
  const raw = await res.text();
  if (!raw) throw new Error(`PHP proxy empty response — HTTP ${res.status}`);
  let data: any;
  try { data = JSON.parse(raw); } catch {
    throw new Error(`PHP proxy non-JSON (HTTP ${res.status}): ${raw.slice(0, 400)}`);
  }
  if (data.error) throw new Error(data.error);

  await setDnsRecords(domain, '76.13.118.227');

  return { ...data, serverIp: '76.13.118.227' };
}

// --- Main handler ---
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { plan, domain, siteName, userId, stripeCustomerId, stripeSubscriptionId } = await req.json();
    if (!plan || !domain) {
      return new Response(JSON.stringify({ error: 'plan and domain required' }), { status: 400, headers: CORS });
    }

    // Verify the Stripe subscription is in a payable state before provisioning
    if (stripeSubscriptionId) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
      const subRes = await fetch(
        `https://api.stripe.com/v1/subscriptions/${stripeSubscriptionId}`,
        { headers: { 'Authorization': `Bearer ${stripeKey}` } },
      );
      const sub = await subRes.json();
      if (!['active', 'trialing', 'incomplete'].includes(sub.status)) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found. Please complete payment before provisioning.' }),
          { status: 402, headers: CORS },
        );
      }
    }

    // Service-role client — used for order tracking; bypasses RLS
    const svcSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Ensure a 'provisioning' order row exists immediately so the user's payment is always
    // traceable even if provisioning fails mid-flight (e.g. browser closes, server error).
    // On retry, reuse the existing provisioning row rather than inserting a duplicate.
    let orderId: string | null = null;
    if (userId) {
      const { data: existing } = await svcSupabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('domain', domain)
        .eq('status', 'provisioning')
        .maybeSingle();

      if (existing?.id) {
        orderId = existing.id;
      } else {
        const { data: newOrder } = await svcSupabase
          .from('orders')
          .insert({
            user_id:                userId,
            plan,
            domain,
            stripe_customer_id:     stripeCustomerId   ?? null,
            stripe_subscription_id: stripeSubscriptionId ?? null,
            status:                 'provisioning',
          })
          .select('id')
          .single();
        orderId = newOrder?.id ?? null;
      }
    }

    let result;
    if (plan === 'Starter') {
      result = await provisionCyberPanel(domain);
    } else {
      // Business or Pro → Cloudways
      result = await provisionCloudways(domain, siteName ?? domain);
    }

    // Update the order row with credentials and mark active
    if (orderId) {
      await svcSupabase
        .from('orders')
        .update({
          wp_admin_url: result.wpAdminUrl,
          username:     result.username,
          password:     result.password,
          email:        result.email,
          status:       'active',
        })
        .eq('id', orderId);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
