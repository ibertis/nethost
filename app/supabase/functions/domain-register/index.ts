import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { domain, price } = await req.json();
    if (!domain) return new Response(JSON.stringify({ error: 'domain required' }), { status: 400, headers: CORS });
    if (!price)  return new Response(JSON.stringify({ error: 'price required' }),  { status: 400, headers: CORS });

    const apikey       = Deno.env.get('PORKBUN_API_KEY')!;
    const secretapikey = Deno.env.get('PORKBUN_API_SECRET')!;

    const cost = Math.round(parseFloat(price) * 100); // dollars → cents

    const res = await fetch(`https://api.porkbun.com/api/json/v3/domain/create/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey, cost, agreeToTerms: 'yes' }),
    });
    const data = await res.json();

    if (data.status !== 'SUCCESS') {
      throw new Error(data.message ?? `Domain registration failed: ${data.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, domain }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
