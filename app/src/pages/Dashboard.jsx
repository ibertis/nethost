import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Plus, LogOut, User, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

function useSiteStatus(domain, enabled) {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(`https://${domain}`, { mode: 'no-cors', signal: controller.signal })
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'))
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, [domain, enabled]);
  return status;
}

const PLAN_COLORS = {
  Starter:  'bg-slate-500/15 text-slate-400',
  Business: 'bg-cyan-500/15 text-cyan-400',
  Pro:      'bg-violet-500/15 text-violet-400',
};

function CopyField({ label, value, mono }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-slate-500 text-xs mb-0.5">{label}</p>
        <p className={`text-white text-sm ${mono ? 'font-mono' : 'font-medium'} break-all`}>{value}</p>
      </div>
      <button
        onClick={copy}
        className="ml-3 shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition"
        title="Copy"
      >
        {copied ? <span className="text-emerald-400 text-xs font-semibold">Copied!</span> : <Copy size={13} />}
      </button>
    </div>
  );
}

function SiteCard({ order, onCancelled }) {
  const planClass = PLAN_COLORS[order.plan] ?? PLAN_COLORS.Business;
  const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const hoursSince = (Date.now() - new Date(order.created_at)) / 3_600_000;
  const dnsLikelyPending = hoursSince < 48;
  const [cancelling, setCancelling] = useState(false);
  const checkStatus = order.status === 'active' && !dnsLikelyPending;
  const siteStatus = useSiteStatus(order.domain, checkStatus);

  async function handleCancel() {
    if (!confirm(`Cancel hosting for ${order.domain}?\n\nYour site will remain active until the end of the current billing period.`)) return;
    setCancelling(true);
    const { error } = await supabase.functions.invoke('cancel-subscription', { body: { orderId: order.id } });
    setCancelling(false);
    if (error) { alert('Could not cancel. Please try again or contact support.'); return; }
    onCancelled();
  }

  const isProvisioning = order.status === 'provisioning';

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">{order.domain}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-500 text-xs">{isProvisioning ? `Order placed ${date}` : `Provisioned ${date}`}</p>
            {checkStatus && (
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  siteStatus === 'up'       ? 'bg-emerald-400' :
                  siteStatus === 'down'     ? 'bg-red-400' :
                                              'bg-slate-600 animate-pulse'
                }`} />
                <span className={`text-xs ${
                  siteStatus === 'up'   ? 'text-emerald-500/70' :
                  siteStatus === 'down' ? 'text-red-400/70' :
                                          'text-slate-600'
                }`}>
                  {siteStatus === 'up' ? 'Live' : siteStatus === 'down' ? 'Not responding' : 'Checking…'}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planClass}`}>{order.plan}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isProvisioning              ? 'bg-blue-500/15 text-blue-400' :
            order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
            order.status === 'past_due'  ? 'bg-yellow-500/15 text-yellow-400' :
                                           'bg-emerald-500/15 text-emerald-400'
          }`}>
            {isProvisioning ? 'Setting Up' : order.status === 'cancelled' ? 'Cancelled' : order.status === 'past_due' ? 'Past Due' : 'Active'}
          </span>
          {!isProvisioning && (
            <a
              href={order.wp_admin_url ?? `https://${order.domain}/wp-admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
            >
              WP Admin <ExternalLink size={11} />
            </a>
          )}
          {order.status === 'active' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-slate-600 hover:text-red-400 transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Provisioning in progress notice */}
      {isProvisioning && (
        <div className="flex items-start gap-3 bg-blue-500/[0.07] border border-blue-500/20 rounded-xl px-4 py-3 mb-4">
          <Loader2 size={14} className="text-blue-400 mt-0.5 shrink-0 animate-spin" />
          <div className="flex-1 min-w-0">
            <p className="text-blue-300 text-xs font-semibold mb-0.5">Setting up your site</p>
            <p className="text-blue-400/70 text-xs leading-relaxed">
              Your WordPress site is being provisioned. This usually completes within a few minutes.
              If it's been a while, <a href="mailto:hello@nethost.co" className="text-blue-300 hover:text-blue-200 transition">contact support</a> and we'll sort it out — your payment is safe.
            </p>
          </div>
        </div>
      )}

      {/* DNS propagation notice */}
      {!isProvisioning && dnsLikelyPending && (
        <div className="flex items-start gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
          <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 text-xs font-semibold mb-0.5">DNS propagating — up to 48 hours</p>
            <p className="text-amber-400/70 text-xs leading-relaxed">Your WordPress site is installed and ready on our servers. Your domain may not resolve yet while DNS changes propagate across the internet.</p>
          </div>
          <a
            href={`https://dnschecker.org/#A/${order.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold whitespace-nowrap transition shrink-0 mt-0.5"
          >
            Check DNS →
          </a>
        </div>
      )}

      {/* Credentials — only shown once provisioned */}
      {!isProvisioning && (
        <div className="bg-black/20 rounded-xl px-4 py-1">
          <CopyField label="Website"  value={`https://${order.domain}`} />
          {order.username && <CopyField label="Username" value={order.username} mono />}
          {order.password && <CopyField label="Password" value={order.password} mono />}
          {order.email    && <CopyField label="Email"    value={order.email} />}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onNewSite, onAccount }) {
  const { logout } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);

  async function handleManageBilling() {
    setBillingLoading(true);
    const { data, error } = await supabase.functions.invoke('create-portal-session');
    setBillingLoading(false);
    if (error || !data?.url) return;
    window.location.href = data.url;
  }

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.06] shrink-0">
        <a href="https://nethost.co">
          <img src="/nethost-logo.png" alt="NETHOST" className="h-6 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={onNewSite}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={13} /> Launch Another Site
          </button>
          <button
            onClick={handleManageBilling}
            disabled={billingLoading}
            className="text-slate-500 hover:text-slate-300 transition text-xs hidden sm:inline disabled:opacity-50"
          >
            {billingLoading ? 'Loading…' : 'Billing'}
          </button>
          <a
            href="mailto:hello@nethost.co"
            className="text-slate-600 hover:text-slate-400 transition text-xs hidden sm:inline"
          >
            Support
          </a>
          <button
            onClick={onAccount}
            title="Account"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition text-xs"
          >
            <User size={14} />
          </button>
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition text-xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-10 py-10 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-black text-white mb-1">My Sites</h1>
        <p className="text-slate-500 text-sm mb-8">All your provisioned websites and credentials.</p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-500 text-sm mb-4">No sites yet.</p>
            <button
              onClick={onNewSite}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              <Plus size={15} /> Launch Your First Site
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <SiteCard key={order.id} order={order} onCancelled={() => setOrders(o => o.map(x => x.id === order.id ? { ...x, status: 'cancelled' } : x))} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.05] py-5 text-center">
        <p className="text-slate-700 text-xs">
          <a href="https://nethost.co/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 transition">Terms</a>
          <span className="mx-2">·</span>
          <a href="https://nethost.co/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 transition">Privacy</a>
          <span className="mx-2">·</span>
          <a href="mailto:hello@nethost.co" className="hover:text-slate-500 transition">hello@nethost.co</a>
        </p>
      </footer>
    </div>
  );
}
