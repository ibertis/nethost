import { useEffect, useState } from 'react';
import { Copy, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const CONFETTI_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#fff'];

function Confetti() {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: '40%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confetti ${0.9 + Math.random() * 0.8}s ease forwards`,
            animationDelay: `${Math.random() * 0.4}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function CredRow({ label, value, mono }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-slate-500 text-xs mb-0.5">{label}</p>
        <p className={`text-white text-sm ${mono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
      </div>
      <button
        onClick={copy}
        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition"
        title="Copy"
      >
        {copied ? <span className="text-emerald-400 text-xs font-semibold">Copied!</span> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function Step8Done() {
  const { data, goToDashboard } = useWizard();
  const [show, setShow] = useState(false);

  const creds = data.provisionedCredentials;
  const domain      = creds?.domain      ?? data.domain ?? 'yourdomain.com';
  const wpAdminUrl  = creds?.wpAdminUrl  ?? `https://${domain}/wp-admin`;
  const username    = creds?.username    ?? 'admin';
  const password    = creds?.password    ?? 'Nh#9mX2kP!';
  const email       = creds?.email       ?? `hello@${domain}`;

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`flex-1 flex flex-col items-center justify-center px-6 py-16 text-center relative transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <Confetti />

      {/* Animated check */}
      <div className="relative mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="rgba(14,165,233,0.15)"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="226"
            strokeDashoffset="226"
            style={{ animation: 'draw-circle 0.8s ease 0.2s forwards', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
          <path
            d="M26 40 l10 10 l18 -18"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="50"
            strokeDashoffset="50"
            style={{ animation: 'draw-circle 0.4s ease 0.9s forwards' }}
          />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
        Your website is live.
      </h1>
      <p className="text-slate-400 text-sm mb-10 max-w-sm">
        <span className="text-cyan-400 font-semibold">{domain}</span> is up and running. Here are your access credentials — save these somewhere safe.
      </p>

      {/* Credentials card */}
      <div className="w-full max-w-sm bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] rounded-2xl p-5 mb-8 text-left shadow-[0_0_40px_rgba(14,165,233,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Your Credentials</p>
        <CredRow label="Website URL"        value={`https://${domain}`} />
        <CredRow label="WordPress Admin"    value={wpAdminUrl} />
        <CredRow label="Admin Username"     value={username} mono />
        <CredRow label="Temporary Password" value={password} mono />
        <CredRow label="Business Email"     value={email} />
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          Visit Your Website <ExternalLink size={14} />
        </a>
        <button
          onClick={goToDashboard}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 text-slate-300 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition"
        >
          <LayoutDashboard size={14} /> Go to Dashboard
        </button>
      </div>

      <p className="text-slate-600 text-xs mt-6">
        Need help? Email us at <a href="mailto:hello@nethost.co" className="text-cyan-500/70 hover:text-cyan-400 transition">hello@nethost.co</a> or call <a href="tel:+18668076242" className="text-cyan-500/70 hover:text-cyan-400 transition">(866) 807-6242</a>
      </p>
    </div>
  );
}
