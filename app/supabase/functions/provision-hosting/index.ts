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

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username:   wpUser,
    password:   wpPass,
    email:      `hello@${domain}`,
    serverIp,
    appId,
  };
}

// --- cPanel WHM provisioning (Starter plan) ---
async function provisionWHM(domain: string) {
  const whmHost = Deno.env.get('WHM_HOST')!;
  const whmToken = Deno.env.get('WHM_API_TOKEN')!;

  const username = domain.replace(/[^a-z0-9]/g, '').slice(0, 8) + Math.floor(Math.random() * 100);
  const password = generatePassword();

  const params = new URLSearchParams({
    username,
    domain,
    password,
    plan: 'default',
    contactemail: `hello@${domain}`,
  });

  const res = await fetch(
    `https://${whmHost}:2087/json-api/createacct?${params}`,
    {
      headers: {
        'Authorization': `whm root:${whmToken}`,
      },
    },
  );

  const data = await res.json();
  const result = data?.result?.[0];
  if (!result?.status) {
    throw new Error(result?.statusmsg ?? 'cPanel account creation failed');
  }

  return {
    wpAdminUrl: `https://${domain}/wp-admin`,
    username,
    password,
    email: `hello@${domain}`,
    cpanelUrl: `https://${whmHost}:2083`,
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
      result = await provisionWHM(domain);
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
