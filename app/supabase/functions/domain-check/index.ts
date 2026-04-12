import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { domain } = await req.json();
    if (!domain) return new Response(JSON.stringify({ error: 'domain required' }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

    const proxyUrl    = Deno.env.get('PROXY_URL_CHECK')!;
    const proxySecret = Deno.env.get('PROXY_SECRET')!;

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Proxy-Secret': proxySecret },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return new Response(
      JSON.stringify(data),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
