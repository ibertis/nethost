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

// --- DNS: set A record via Enom after provisioning ---
async function setDnsRecords(domain: string, ip: string): Promise<void> {
  const uid = Deno.env.get('ENOM_USER')!;
  const pw  = Deno.env.get('ENOM_PASS')!;
  const dotIndex = domain.indexOf('.');
  const sld = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex + 1);

  const params = new URLSearchParams({
    command: 'SetHosts', uid, pw, SLD: sld, TLD: tld, responsetype: 'json',
    HostName1: '@',   RecordType1: 'A', Address1: ip, TTL1: '300',
    HostName2: 'www', RecordType2: 'A', Address2: ip, TTL2: '300',
  });
  // Fire-and-forget — DNS propagation is async; don't throw on failure
  await fetch('https://reseller.enom.com/interface.asp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  }).catch(() => {/* ignore */});
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

  const appId   = appData.app.id;
  const serverIp = server.public_ip ?? server.master_ip;

  await setDnsRecords(domain, serverIp);

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username:   wpUser,
    password:   wpPass,
    email:      `hello@${domain}`,
    serverIp,
    appId,
  };
}

// --- CyberPanel provisioning (Starter plan) ---
async function provisionCyberPanel(domain: string) {
  const cpUrl  = Deno.env.get('CYBERPANEL_URL')!;  // e.g. https://76.13.118.227:8090
  const cpUser = Deno.env.get('CYBERPANEL_USER') ?? 'admin';
  const cpPass = Deno.env.get('CYBERPANEL_PASS')!;

  const websiteOwner = domain.replace(/[^a-z0-9]/g, '').slice(0, 8) + Math.floor(Math.random() * 100);
  const ownerPassword = generatePassword();
  const wpPassword = generatePassword();
  const ownerEmail = `hello@${domain}`;

  // @ts-ignore — Deno-specific, bypasses self-signed cert on CyberPanel
  const httpClient = Deno.createHttpClient({ rejectUnauthorized: false });

  // Step 1: Create website
  const createRes = await fetch(`${cpUrl}/api/createWebsite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminUser: cpUser,
      adminPass: cpPass,
      domainName: domain,
      ownerEmail,
      websiteOwner,
      ownerPassword,
      packageName: 'Default',
    }),
    // @ts-ignore
    client: httpClient,
  });
  const createData = await createRes.json();
  if (createData.errorMessage && createData.errorMessage !== 'None') {
    throw new Error(`CyberPanel createWebsite failed: ${createData.errorMessage}`);
  }

  // Step 2: Install WordPress
  const wpRes = await fetch(`${cpUrl}/api/installWordPress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminUser: cpUser,
      adminPass: cpPass,
      domainName: domain,
      title: domain,
      adminEmail: ownerEmail,
      wploginUser: 'admin',
      wploginPass: wpPassword,
      wpType: '1',
    }),
    // @ts-ignore
    client: httpClient,
  });
  const wpData = await wpRes.json();
  if (wpData.errorMessage && wpData.errorMessage !== 'None') {
    throw new Error(`CyberPanel installWordPress failed: ${wpData.errorMessage}`);
  }

  const serverIp = new URL(cpUrl).hostname;
  await setDnsRecords(domain, serverIp);

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username: 'admin',
    password: wpPassword,
    email: ownerEmail,
  };
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
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
