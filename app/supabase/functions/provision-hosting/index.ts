import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

  // Step 2: Get list of servers to pick first available
  const serversRes = await fetch('https://api.cloudways.com/api/v1/server', { headers: authHeaders });
  const { servers } = await serversRes.json();
  if (!servers?.length) throw new Error('No Cloudways servers available');
  const server = servers[0];

  // Step 3: Create WordPress application
  const wpUser = 'admin';
  const wpPass = generatePassword();
  const appRes = await fetch('https://api.cloudways.com/api/v1/app', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      server_id:    server.id,
      application:  'wordpress',
      app_label:    siteName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      project_name: domain,
    }),
  });
  const appData = await appRes.json();
  if (!appData?.app?.id) throw new Error('Cloudways app creation failed');

  const serverIp = server.public_ip ?? server.master_ip;

  await setDnsRecords(domain, serverIp);

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username:   wpUser,
    password:   wpPass,
    email:      `hello@${domain}`,
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
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  await setDnsRecords(domain, '76.13.118.227');

  return data;
}

// --- Main handler ---
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { plan, domain, siteName } = await req.json();
    if (!plan || !domain) {
      return new Response(JSON.stringify({ error: 'plan and domain required' }), { status: 400, headers: CORS });
    }

    let result;
    if (plan === 'Starter') {
      result = await provisionCyberPanel(domain);
    } else {
      // Business or Pro → Cloudways
      result = await provisionCloudways(domain, siteName ?? domain);
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
