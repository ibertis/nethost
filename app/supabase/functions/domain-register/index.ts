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
    const secretapikey = Deno.env.get('PORKBUN_SECRET_KEY')!;

    const res = await fetch('https://porkbun.com/api/json/v3/domain/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey, domain, years: 1 }),
    });

    const data = await res.json();

    // Porkbun returns { status: "SUCCESS" } on success
    if (data.status !== 'SUCCESS') {
      throw new Error(data.message ?? 'Domain registration failed');
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
