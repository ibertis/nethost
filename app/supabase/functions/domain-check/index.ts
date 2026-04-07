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

    const uid = Deno.env.get('ENOM_USER')!;
    const pw  = Deno.env.get('ENOM_PASS')!;

    const dotIndex = domain.indexOf('.');
    const sld = domain.slice(0, dotIndex);
    const tld = domain.slice(dotIndex + 1);

    const url = `https://reseller.enom.com/interface.asp?command=Check&sld=${encodeURIComponent(sld)}&tld=${encodeURIComponent(tld)}&uid=${encodeURIComponent(uid)}&pw=${encodeURIComponent(pw)}&responsetype=json`;
    const res = await fetch(url);
    const data = await res.json();

    // RRPCode 210 = available, 211 = not available
    const available = String(data.RRPCode) === '210';

    const alternatives = available ? [] : [
      `${sld}.co`,
      `${sld}.net`,
      `${sld}.io`,
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
