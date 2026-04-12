import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Globe, ChevronDown } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { supabase } from '../../lib/supabaseClient';

const TLDS = [
  { tld: '.com', free: true },
  { tld: '.co',  free: true },
  { tld: '.net', free: true },
  { tld: '.org', free: true },
  { tld: '.io',  free: false },
  { tld: '.app', free: false },
];
const MAX_FREE_DOMAIN_PRICE = 15.00; // domains above this are not eligible for the free first-year promotion

// Retail renewal prices (displayed to user). Namecheap wholesale price is returned from the domain-check API.
const RETAIL_PRICES = {
  '.com': 14.99,
  '.co':  12.99,
  '.net': 15.99,
  '.org': 13.99,
};

export default function Step2Domain() {
  const { data, update } = useWizard();
  const [input, setInput] = useState(data.domain.replace(data.tld, '') || '');
  const [tld, setTld] = useState(data.tld || '.com');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null); // null | 'available' | 'taken'
  const [alternatives, setAlternatives] = useState([]);
  const [checkError, setCheckError] = useState('');
  const [tldOpen, setTldOpen] = useState(false);
  const [existingDomain, setExistingDomain] = useState('');
  const [domainPrice, setDomainPrice] = useState(null);

  // If domain was pre-filled from a URL param (marketing site funnel), show it as available immediately
  useEffect(() => {
    if (data.domain && data.domainAvailable === true && !result) {
      setInput(data.domain.replace(data.tld, ''));
      setTld(data.tld);
      setResult('available');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAvailability = async () => {
    if (!input.trim()) return;
    setChecking(true);
    setResult(null);
    setCheckError('');
    const domain = `${input.trim()}${tld}`;
    const { data, error } = await supabase.functions.invoke('domain-check', {
      body: { domain },
    });
    if (error || data?.error) {
      setCheckError(error?.message ?? data?.error ?? 'Check failed. Try again.');
      setChecking(false);
      return;
    }
    const available = data.available;
    setAlternatives(data.alternatives ?? []);
    setResult(available ? 'available' : 'taken');
    if (available) {
      const price = parseFloat(data.price);
      const isFree = price <= MAX_FREE_DOMAIN_PRICE;
      update({ domain, tld, domainAvailable: isFree, domainPrice: data.price, domainIsFree: isFree });
      setDomainPrice(data.price);
    }
    setChecking(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 2</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          Claim Your Domain
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Your domain is included free for the first year.
        </p>

        {/* Tabs */}
        <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.07] p-1 mb-8">
          {['register', 'connect'].map((opt) => (
            <button
              key={opt}
              onClick={() => update({ domainOption: opt })}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                data.domainOption === opt
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt === 'register' ? 'Register New Domain' : 'I Have a Domain'}
            </button>
          ))}
        </div>

        {data.domainOption === 'register' ? (
          <div>
            {/* Search row */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center bg-white/[0.05] border border-white/[0.09] rounded-xl focus-within:border-cyan-500 focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.12)] transition">
                <Search size={15} className="text-slate-500 ml-4 shrink-0" />
                <input
                  className="flex-1 bg-transparent text-white placeholder-slate-600 px-3 py-3 text-sm outline-none"
                  placeholder="yourbusiness"
                  value={input}
                  onChange={(e) => { setInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setResult(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && checkAvailability()}
                />
                {/* TLD selector */}
                <div className="relative">
                  <button
                    onClick={() => setTldOpen(!tldOpen)}
                    className="flex items-center gap-1 px-3 py-3 text-sm text-cyan-400 font-semibold hover:text-cyan-300 border-l border-white/[0.07]"
                  >
                    {tld} <ChevronDown size={12} />
                  </button>
                  {tldOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-[#0d1220] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl min-w-[160px]">
                      {TLDS.map(({ tld: t, free }) => (
                        <button
                          key={t}
                          onClick={() => { setTld(t); setTldOpen(false); setResult(null); }}
                          className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition gap-4"
                        >
                          <span>{t}</span>
                          <span className={`text-xs font-medium ${free ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {free ? 'Free yr 1' : 'Not eligible'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={checkAvailability}
                disabled={!input.trim() || checking}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking
                  </span>
                ) : 'Check'}
              </button>
            </div>

            {/* Result */}
            {result === 'available' && domainPrice && (() => {
              const wholesalePrice = parseFloat(domainPrice);
              const isFree = wholesalePrice <= MAX_FREE_DOMAIN_PRICE;
              const retailPrice = RETAIL_PRICES[tld] ?? wholesalePrice;
              return (
                <div className="animate-[fade-up_0.3s_ease_forwards]">
                  {isFree ? (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-300 text-sm font-semibold">{input}{tld} is available!</span>
                      <span className="ml-auto text-right leading-tight">
                        <span className="block text-slate-500 text-xs line-through">${retailPrice.toFixed(2)}/yr</span>
                        <span className="block text-emerald-500 text-xs font-semibold">Free first year</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                      <XCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 text-sm font-semibold">{input}{tld} is available but not eligible for the free domain promotion.</p>
                        <p className="text-slate-400 text-xs mt-0.5">This domain costs ${price.toFixed(2)}/yr — above our $15 limit. Please choose a .com, .net, .org, or .co domain.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {checkError && (
              <div className="animate-[fade-up_0.3s_ease_forwards] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400">
                {checkError}
              </div>
            )}
            {result === 'taken' && (
              <div className="animate-[fade-up_0.3s_ease_forwards]">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <span className="text-red-300 text-sm font-semibold">{input}{tld} is taken.</span>
                </div>
                {alternatives.length > 0 && (
                  <>
                    <p className="text-slate-500 text-xs mb-2 font-medium">Alternatives available:</p>
                    <div className="flex flex-col gap-2">
                      {alternatives.map((altDomain) => (
                        <button
                          key={altDomain}
                          onClick={() => {
                            const parts = altDomain.split('.');
                            const altName = parts[0];
                            const altTld = '.' + parts.slice(1).join('.');
                            update({ domain: altDomain, tld: altTld, domainAvailable: true });
                            setResult('available');
                            setInput(altName);
                            setTld(altTld);
                          }}
                          className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 hover:border-cyan-500/40 transition"
                        >
                          <span className="text-slate-200 text-sm">{altDomain}</span>
                          <span className="text-cyan-400 text-xs font-semibold">Select →</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
              Your existing domain
            </label>
            <div className="flex items-center bg-white/[0.05] border border-white/[0.09] rounded-xl overflow-hidden focus-within:border-cyan-500 transition mb-4">
              <Globe size={15} className="text-slate-500 ml-4 shrink-0" />
              <input
                className="flex-1 bg-transparent text-white placeholder-slate-600 px-3 py-3 text-sm outline-none"
                placeholder="yourbusiness.com"
                value={existingDomain}
                onChange={(e) => { setExistingDomain(e.target.value); update({ domain: e.target.value, domainAvailable: true, domainOption: 'connect' }); }}
              />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-400 mb-1">DNS Setup (after checkout)</p>
              Point your domain's nameservers to:<br />
              <span className="text-cyan-500 font-mono">ns1.nethost.co</span> and <span className="text-cyan-500 font-mono">ns2.nethost.co</span>.<br />
              We'll walk you through this after your site is provisioned.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
