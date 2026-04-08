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

    const apikey       = Deno.env.get('PORKBUN_API_KEY')!;
    const secretapikey = Deno.env.get('PORKBUN_API_SECRET')!;

    // Fetch current price fresh from Porkbun to avoid stale price mismatch
    const checkRes = await fetch(`https://api.porkbun.com/api/json/v3/domain/checkDomain/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey }),
    });
    const checkData = await checkRes.json();
    if (checkData.status !== 'SUCCESS') throw new Error(`Price check failed: ${checkData.message}`);

    const livePriceDollars = parseFloat(checkData.response?.price);
    const cost = Math.round(livePriceDollars * 100);
    if (!Number.isFinite(cost) || cost <= 0) {
      throw new Error(`Invalid live price: ${checkData.response?.price}`);
    }

    const res = await fetch(`https://api.porkbun.com/api/json/v3/domain/create/${domain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey, years: 1, cost, agreeToTerms: 'yes' }),
    });
    const data = await res.json();

    if (data.status !== 'SUCCESS') {
      throw new Error(JSON.stringify(data));
    }

    return new Response(
      JSON.stringify({ success: true, domain }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Return 200 so supabase client populates data (not error) — actual message visible in UI
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
