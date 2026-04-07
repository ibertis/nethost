import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- NETHOST registrant info (used for all domain registrations) ---
const REGISTRANT = {
  FirstName:           'NETHOST',       // ← replace with NETHOST contact first name
  LastName:            'Admin',        // ← replace with NETHOST contact last name
  Address1:            '2719 Hollywood Blvd, L-287',      // ← replace with NETHOST business address
  City:                'Hollywood',            // ← replace with city
  StateProvince:       'FL',               // ← replace with state abbreviation
  PostalCode:          '33020',            // ← replace with zip code
  Country:             'US',
  EmailAddress:        'support@nethost.co', // ← replace with NETHOST contact email
  Phone:               '+1.8668076242',    // ← replace with phone in +1.XXXXXXXXXX format
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

    const params = new URLSearchParams({
      command:                    'Purchase',
      uid,
      pw,
      sld,
      tld,
      NumYears:                   '1',
      UseDNS:                     'default',
      responsetype:               'json',
      RegistrantFirstName:        REGISTRANT.FirstName,
      RegistrantLastName:         REGISTRANT.LastName,
      RegistrantAddress1:         REGISTRANT.Address1,
      RegistrantCity:             REGISTRANT.City,
      RegistrantStateProvince:    REGISTRANT.StateProvince,
      RegistrantPostalCode:       REGISTRANT.PostalCode,
      RegistrantCountry:          REGISTRANT.Country,
      RegistrantEmailAddress:     REGISTRANT.EmailAddress,
      RegistrantPhone:            REGISTRANT.Phone,
      // Tech contact (same as registrant)
      TechFirstName:              REGISTRANT.FirstName,
      TechLastName:               REGISTRANT.LastName,
      TechAddress1:               REGISTRANT.Address1,
      TechCity:                   REGISTRANT.City,
      TechStateProvince:          REGISTRANT.StateProvince,
      TechPostalCode:             REGISTRANT.PostalCode,
      TechCountry:                REGISTRANT.Country,
      TechEmailAddress:           REGISTRANT.EmailAddress,
      TechPhone:                  REGISTRANT.Phone,
    });

    const res = await fetch('https://reseller.enom.com/interface.asp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();

    // RRPCode 200 = success
    if (String(data.RRPCode) !== '200') {
      throw new Error(data.RRPText ?? data.ErrCount > 0 ? data.errors?.Err1 : 'Domain registration failed');
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
