import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

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

function SiteCard({ order }) {
  const planClass = PLAN_COLORS[order.plan] ?? PLAN_COLORS.Business;
  const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">{order.domain}</h3>
          <p className="text-slate-500 text-xs mt-0.5">Provisioned {date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planClass}`}>{order.plan}</span>
          <a
            href={order.wp_admin_url ?? `https://${order.domain}/wp-admin`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
          >
            WP Admin <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Credentials */}
      <div className="bg-black/20 rounded-xl px-4 py-1">
        <CopyField label="Website"  value={`https://${order.domain}`} />
        {order.username && <CopyField label="Username" value={order.username} mono />}
        {order.password && <CopyField label="Password" value={order.password} mono />}
        {order.email    && <CopyField label="Email"    value={order.email} />}
      </div>
    </div>
  );
}

export default function Dashboard({ onNewSite }) {
  const { logout } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

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
              <SiteCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
