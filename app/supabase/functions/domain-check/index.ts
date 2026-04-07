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

    const apikey       = Deno.env.get('PORKBUN_API_KEY')!;
    const secretapikey = Deno.env.get('PORKBUN_API_SECRET')!;

    const res = await fetch(`https://api.porkbun.com/api/json/v3/domain/checkDomain/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey }),
    });
    const data = await res.json();

    if (data.status !== 'SUCCESS') {
      throw new Error(data.message ?? `Porkbun error: ${data.status}`);
    }

    const available = data.response?.avail === 'yes';
    const price     = data.response?.price ?? null;

    const sld = domain.slice(0, domain.indexOf('.'));
    const alternatives = available ? [] : [
      `${sld}.co`,
      `${sld}.net`,
      `${sld}.io`,
    ].filter((a) => a !== domain);

    return new Response(
      JSON.stringify({ available, price, alternatives }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
