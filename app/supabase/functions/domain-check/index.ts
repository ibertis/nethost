import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { domain } = await req.json();
    if (!domain) return new Response(JSON.stringify({ error: 'domain required' }), { status: 400, headers: CORS });

    // RDAP is a public standard protocol — no API key or IP whitelist required.
    // 404 = domain not registered (available), 200 = domain registered (taken).
    const rdapRes = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
    const available = rdapRes.status === 404;

    const namePart = domain.split('.')[0];
    const alternatives = available ? [] : [
      `${namePart}.co`,
      `${namePart}.net`,
      `${namePart}.io`,
    ].filter((a) => a !== domain);

    return new Response(
      JSON.stringify({ available, alternatives }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
