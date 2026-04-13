import { useState } from 'react';
import { Search, CheckCircle2, XCircle, ArrowRight, ChevronDown } from 'lucide-react';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const TLDS = ['.com', '.co', '.net', '.org'];

export default function DomainSearch() {
  const [input, setInput]       = useState('');
  const [tld, setTld]           = useState('.com');
  const [tldOpen, setTldOpen]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult]     = useState(null); // null | 'available' | 'taken'
  const [error, setError]       = useState('');

  const check = async () => {
    const name = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!name) return;
    setChecking(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/domain-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({ domain: `${name}${tld}` }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.available ? 'available' : 'taken');
    } catch (e) {
      setError(e.message ?? 'Check failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const domain = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

  return (
    <section className="py-16 bg-[#050914]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
          Domain Search
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Find Your Perfect Domain
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Check availability — domains included free for the first year with any hosting plan.
        </p>

        {/* Search bar */}
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              placeholder="yourname"
              className="w-full bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition domain-input-glow"
            />
          </div>

          {/* TLD picker */}
          <div className="relative">
            <button
              onClick={() => setTldOpen((o) => !o)}
              className="h-full flex items-center gap-1.5 bg-white/[0.05] border border-white/10 text-slate-300 rounded-xl px-3 text-sm hover:bg-white/10 transition whitespace-nowrap"
            >
              {tld} <ChevronDown size={13} />
            </button>
            {tldOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#0d1120] border border-white/10 rounded-xl overflow-hidden z-20 w-28 shadow-xl">
                {TLDS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTld(t); setTldOpen(false); setResult(null); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${tld === t ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:bg-white/[0.05]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={check}
            disabled={checking || !input.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
          >
            {checking ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Check
          </button>
        </div>

        {/* Result */}
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        {result === 'available' && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">{domain}{tld}</p>
                <p className="text-emerald-400 text-xs">Available — free for your first year</p>
              </div>
            </div>
            <a
              href={`https://app.nethost.co?domain=${encodeURIComponent(domain)}&tld=${encodeURIComponent(tld)}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition whitespace-nowrap"
            >
              Get Started <ArrowRight size={14} />
            </a>
          </div>
        )}

        {result === 'taken' && (
          <div className="mt-5 flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-2xl px-5 py-4">
            <XCircle size={20} className="text-red-400 shrink-0" />
            <div className="text-left">
              <p className="text-white font-bold text-sm">{domain}{tld}</p>
              <p className="text-red-400 text-xs">Already taken — try a different name or extension</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
