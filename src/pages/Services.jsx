import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Monitor, TrendingUp, Zap, Check, Users, Layers, Timer, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';

const SERVICES = [
  {
    id: 'branding',
    icon: Palette,
    label: 'Brand Identity',
    title: 'Make Your First Impression Unforgettable',
    description:
      'Your brand is the first thing people judge — and the last thing they forget. We design cohesive visual identities that communicate who you are before you say a word.',
    accent: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    includes: [
      'Logo design & wordmark variants',
      'Brand color palette system',
      'Typography pairing & hierarchy',
      'Brand guidelines document',
      'Business card & stationery',
      'Social media branding kit',
    ],
  },
  {
    id: 'web',
    icon: Monitor,
    label: 'Web Design & Dev',
    title: 'Websites That Actually Convert',
    description:
      'Beautiful isn\'t enough — your site needs to turn visitors into customers. We design and develop custom WordPress sites engineered for performance, clarity, and conversion.',
    accent: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    includes: [
      'Custom WordPress theme build',
      'Landing page & funnel design',
      'E-commerce setup (WooCommerce)',
      'Mobile-first responsive layout',
      'Performance & Core Web Vitals optimization',
      'Hosted & maintained by NETHOST',
    ],
  },
  {
    id: 'marketing',
    icon: TrendingUp,
    label: 'Digital Marketing',
    title: 'Get Found. Get Chosen. Get Results.',
    description:
      'Traffic without strategy is just noise. We run paid campaigns, optimize for search, and build funnels that turn clicks into customers — all backed by data.',
    accent: 'from-emerald-500/20 to-teal-600/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    includes: [
      'Google Search & Display Ads',
      'Meta Ads (Facebook & Instagram)',
      'Local SEO & Google Business Profile',
      'Lead generation funnel setup',
      'Email marketing campaigns',
      'Analytics & conversion tracking',
    ],
  },
  {
    id: 'ai',
    icon: Zap,
    label: 'AI & Automation',
    title: 'Let Your Business Run Itself',
    description:
      'Stop doing manually what a system can do automatically. We build AI-powered workflows that qualify leads, follow up with prospects, and keep your CRM clean — while you sleep.',
    accent: 'from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    includes: [
      'AI chatbots & virtual assistants',
      'Lead capture & qualification workflows',
      'CRM automation & pipeline management',
      'Automated follow-up sequences',
      'Reporting & analytics dashboards',
      'Zapier / Make.com integrations',
    ],
  },
];

const DIFFERENTIATORS = [
  {
    icon: Layers,
    title: 'One Partner for Everything',
    body: 'Hosting, design, marketing, and automation — all under one roof. No juggling agencies, no finger-pointing between vendors.',
  },
  {
    icon: Users,
    title: 'Human-Led, AI-Powered',
    body: 'Real strategists and designers backed by AI tools. You get the creativity of a boutique agency at a fraction of the cost.',
  },
  {
    icon: Timer,
    title: 'Built for Speed',
    body: 'No 6-month retainers to get started. We move fast, iterate quickly, and deliver work you can put in front of customers.',
  },
];

export default function ServicesPage({ onContactOpen }) {
  const titles = useMemo(() => ['Branded.', 'Marketed.', 'Automated.'], []);
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2200);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  useEffect(() => {
    document.title = 'Digital Services — Brand, Web, Marketing & AI | NETHOST';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'NETHOST offers professional brand identity design, custom website development, digital marketing, and AI automation services for small businesses and entrepreneurs.',
      );
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://nethost.co/services';

    return () => {
      document.title = 'NETHOST — Managed Web Hosting for Entrepreneurs & Small Businesses';
      if (meta) {
        meta.setAttribute(
          'content',
          'NETHOST provides fully managed web hosting, website design, and digital services for entrepreneurs and small businesses. Fast, secure, and handled — so you can focus on running your business.',
        );
      }
      if (canonical) canonical.href = 'https://nethost.co/';
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050914]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'hue-rotate(215deg) saturate(1.2) brightness(0.85)' }}
          src="https://videos.pexels.com/video-files/18526841/uhd_30fps.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* NETHOST-tinted dark overlay */}
        <div className="absolute inset-0 bg-[#050914]/85 z-10" />
        {/* Subtle cyan glow from below to blend into the rest of the page */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050914] to-transparent z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center text-center">

          {/* Emblem */}
          <div className="flex justify-center mb-6 mt-8 sm:mt-0">
            <img src="/NETHOST_emblem.png" alt="NETHOST" className="h-16 w-auto" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.12] text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Digital Services
          </div>

          {/* Animated headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
            Your Business,
            <span className="relative flex w-full justify-center overflow-hidden md:pb-4 md:pt-1 mt-1" style={{ height: '1.15em' }}>
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute text-gradient drop-shadow-[0_0_30px_rgba(14,165,233,0.45)]"
                  initial={{ opacity: 0, y: -80 }}
                  transition={{ type: 'spring', stiffness: 55, damping: 14 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -120 : 120, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-3xl">
            Beyond hosting, NETHOST offers a full suite of digital services — brand identity,
            custom websites, performance marketing, and AI-powered automation.
            One partner. Everything you need to compete and grow.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <button
              onClick={onContactOpen}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition text-sm"
            >
              Start a Project <ArrowRight size={15} />
            </button>
            <a
              href="#services-list"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.08] border border-white/[0.12] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/[0.14] transition text-sm"
            >
              Explore Services
            </a>
          </div>

          {/* Service category pills */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {SERVICES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-2 bg-white/[0.05] border ${s.border} rounded-full px-4 py-2 hover:bg-white/[0.09] transition group`}
              >
                <s.icon size={13} className={s.iconColor} />
                <span className="text-slate-300 text-xs font-semibold group-hover:text-white transition">
                  {s.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Sections ── */}
      <div id="services-list">
        {SERVICES.map((service, i) => (
          <section
            key={service.id}
            id={service.id}
            className={`py-20 ${i % 2 === 0 ? 'bg-[#050914]' : 'bg-[#07091a]'}`}
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Text side */}
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`inline-flex items-center gap-2.5 ${service.iconBg} border ${service.border} rounded-xl px-3 py-2 mb-5`}>
                    <service.icon size={16} className={service.iconColor} />
                    <span className={`text-xs font-semibold ${service.iconColor}`}>{service.label}</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                    {service.title}
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-8">
                    {service.description}
                  </p>

                  <button
                    onClick={onContactOpen}
                    className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition"
                  >
                    Get a Quote <ArrowRight size={14} />
                  </button>
                </div>

                {/* Includes card */}
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
                      What's Included
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${service.accent} border ${service.border} flex items-center justify-center`}>
                            <Check size={9} className={service.iconColor} strokeWidth={3} />
                          </span>
                          <span className="text-slate-300 text-sm leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── Differentiators ── */}
      <section className="py-20 bg-[#050914] border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
              Why NETHOST
            </span>
            <h2 className="text-4xl font-black text-white tracking-tight mb-4">
              One Partner. All the Pieces.
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">
              Most agencies specialize in one thing. NETHOST handles it all — from the server your
              site lives on to the ads that drive traffic to it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 card-hover">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl w-fit mb-4">
                  <Icon size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-[#07091a] border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
            Let's Build Together
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">
            Ready to Start Your Project?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Tell us what you're building. We'll put together a custom plan with no obligations and
            no fluff — just a clear path forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onContactOpen}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition text-sm"
            >
              Start a Project <ArrowRight size={15} />
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.06] border border-white/10 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-sm"
            >
              Back to Hosting
            </a>
          </div>
        </div>
      </section>

      <Footer onContactOpen={onContactOpen} />
    </main>
  );
}
