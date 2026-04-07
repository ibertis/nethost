import { ArrowRight, ShieldCheck, Clock, Headphones } from 'lucide-react';

const STATS = [
  { icon: ShieldCheck, label: '99.9% Uptime', sub: 'SLA Guaranteed' },
  { icon: Clock, label: '24/7 Monitoring', sub: 'Always Watching' },
  { icon: Headphones, label: 'Real Human Support', sub: 'No Ticket Queues' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050914] pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Emblem */}
        <div className="flex justify-center mb-6 mt-8 sm:mt-0">
          <img src="/NETHOST_emblem.png" alt="NETHOST" className="h-16 w-auto" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Managed hosting built for entrepreneurs & small business
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
          Your Website,{' '}
          <span className="text-gradient">Hosted &</span>
          <br />
          Handled.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Fast, secure, and fully managed web hosting — so you never have to think about
          servers, SSL, backups, or downtime again. We handle the tech. You run your business.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition text-sm"
          >
            View Hosting Plans <ArrowRight size={16} />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-sm"
          >
            What's Included
          </a>
        </div>

        {/* Floating stat badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {STATS.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3 animate-float"
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">{label}</div>
                <div className="text-slate-500 text-xs">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
