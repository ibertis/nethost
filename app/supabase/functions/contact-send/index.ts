import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'name, email, and message are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')!;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background:#050914;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050914;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="https://nethost.co/nethost-logo.png" alt="NETHOST" height="22" style="display:block;" />
            </td>
          </tr>

          <tr>
            <td style="background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.15);border-radius:16px;padding:32px;">
              <h2 style="margin:0 0 20px;color:#ffffff;font-size:18px;font-weight:800;">New Contact Form Submission</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Name</p>
                    <p style="margin:0;color:#ffffff;font-size:14px;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
                    <a href="mailto:${email}" style="color:#22d3ee;font-size:14px;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 6px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
                    <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;text-align:center;">
                <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(to right,#06b6d4,#2563eb);color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:999px;">
                  Reply to ${name} →
                </a>
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#334155;font-size:12px;">© 2026 NETHOST. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NETHOST <hello@nethost.co>',
        to: ['hello@nethost.co'],
        reply_to: email,
        subject: `New message from ${name} — nethost.co`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Resend API error');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
