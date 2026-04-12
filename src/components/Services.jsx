import { ShieldCheck, Zap, RefreshCw, Mail, Globe, Cloud, Server, Lock } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Blazing Fast Performance',
    description:
      'SSD storage, LiteSpeed web servers, and built-in caching deliver sub-second load times from day one.',
  },
  {
    icon: ShieldCheck,
    title: '99.9% Uptime Guarantee',
    description:
      'Enterprise-grade infrastructure with redundant systems and 24/7 automated monitoring so your site is always online.',
  },
  {
    icon: Lock,
    title: 'Free SSL & Security',
    description:
      'Every site gets a free SSL certificate, malware scanning, DDoS protection, and automatic security patches.',
  },
  {
    icon: RefreshCw,
    title: 'Daily Backups',
    description:
      'Automated daily backups with one-click restore. Your data is always safe — even if something goes wrong.',
  },
  {
    icon: Mail,
    title: 'Business Email Included',
    description:
      'Professional email at your domain (you@yourbusiness.com) — included with every hosting plan.',
  },
  {
    icon: Globe,
    title: 'Free Domain Registration',
    description:
      'Get a free domain for the first year with any hosting plan. .com, .net, .co, and more available.',
  },
  {
    icon: Cloud,
    title: 'Global CDN',
    description:
      'Powered by Cloudflare — your site loads fast for visitors anywhere in the world, every time.',
  },
  {
    icon: Server,
    title: 'Managed WordPress',
    description:
      'Auto-updates, staging environments, one-click installs, and performance tuning — all handled for you.',
  },
];

export default function Services() {
  return (
    <section id="features" className="py-24 bg-[#050914]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
            What's Included
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Everything Taken Care Of
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every NETHOST plan comes loaded with the features that keep your site fast, secure,
            and always online — with zero technical headaches.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 card-hover group"
            >
              <div className="p-2.5 bg-cyan-500/10 rounded-xl w-fit mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <Icon size={20} className="text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
