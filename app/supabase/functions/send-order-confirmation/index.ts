import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCaller, serviceClient, normalizeDomain } from '../_shared/payment.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function buildHtml(rawPlan: string, rawDomain: string, rawWpAdminUrl: string, rawUsername: string): string {
  const [plan, domain, wpAdminUrl, username] = [rawPlan, rawDomain, rawWpAdminUrl, rawUsername].map(esc);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your NETHOST website is live</title>
</head>
<body style="margin:0;padding:0;background:#050914;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050914;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://nethost.co/nethost-logo.png" alt="NETHOST" height="24" style="display:block;" />
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(14,165,233,0.1),rgba(37,99,235,0.05));border:1px solid rgba(14,165,233,0.2);border-radius:16px;padding:36px 32px;text-align:center;">
              <div style="width:56px;height:56px;background:rgba(14,165,233,0.1);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">✅</span>
              </div>
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                Your website is live!
              </h1>
              <p style="margin:0;color:#94a3b8;font-size:15px;">
                <strong style="color:#22d3ee;">${domain}</strong> is up and running on the <strong style="color:#ffffff;">${plan}</strong> plan.
              </p>
            </td>
          </tr>

          <!-- Credentials -->
          <tr>
            <td style="padding-top:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Your Credentials</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;">Website URL</p>
                    <a href="https://${domain}" style="color:#22d3ee;font-size:14px;font-weight:600;text-decoration:none;">https://${domain}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;">WordPress Admin</p>
                    <a href="${wpAdminUrl}" style="color:#22d3ee;font-size:14px;font-weight:600;text-decoration:none;">${wpAdminUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 2px;color:#64748b;font-size:11px;">Admin Username</p>
                    <p style="margin:0;color:#ffffff;font-size:14px;font-family:monospace;">${username}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <a href="${wpAdminUrl}" style="display:inline-block;background:linear-gradient(to right,#06b6d4,#2563eb);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;">
                Go to WordPress Admin →
              </a>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding-top:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;">
                <tr>
                  <td>
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                      🔒 <strong style="color:#94a3b8;">Your temporary login credentials</strong> were displayed during setup. Visit your WordPress admin and change your password after your first login.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td align="center" style="padding-top:32px;padding-bottom:8px;">
              <p style="margin:0;color:#475569;font-size:13px;">
                Questions? We're here to help.<br />
                <a href="mailto:hello@nethost.co" style="color:#22d3ee;text-decoration:none;">hello@nethost.co</a>
                &nbsp;·&nbsp;
                <a href="tel:+18668076242" style="color:#22d3ee;text-decoration:none;">(866) 807-6242</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;color:#334155;font-size:12px;">© 2026 NETHOST. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // Recipient and order details come from the caller's own order, never from the request body
    const user = await getCaller(req);
    if (!user?.email) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });

    const { domain: rawDomain } = await req.json();
    const requested = normalizeDomain(rawDomain);
    if (!requested) return new Response(JSON.stringify({ error: 'domain required' }), { status: 400, headers: CORS });

    const { data: order } = await serviceClient()
      .from('orders')
      .select('domain, plan, wp_admin_url, username')
      .eq('user_id', user.id)
      .eq('domain', requested)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: CORS });

    const to = user.email;
    const { domain, plan } = order;
    const wpAdminUrl = order.wp_admin_url;
    const username = order.username;

    const apiKey = Deno.env.get('RESEND_API_KEY')!;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NETHOST <hello@nethost.co>',
        to: [to],
        subject: `Your NETHOST website is live — ${domain}`,
        html: buildHtml(plan, domain, wpAdminUrl ?? `https://${domain}/wp-admin`, username ?? 'admin'),
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
