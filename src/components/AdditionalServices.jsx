import { Monitor, Search, Megaphone, Palette } from 'lucide-react';

const SERVICES = [
  {
    icon: Monitor,
    title: 'Website Design & Development',
    description: 'Custom, conversion-focused websites built and hosted all in one place.',
  },
  {
    icon: Search,
    title: 'SEO Optimization',
    description: 'On-page SEO, technical audits, and content strategy to help you get found.',
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    description: 'Paid ads, lead generation funnels, and marketing automation for growth.',
  },
  {
    icon: Palette,
    title: 'Branding & Identity',
    description: 'Logo design and visual identity systems that make your brand memorable.',
  },
];

export default function AdditionalServices({ onContactOpen }) {
  return (
    <section id="services" className="py-20 bg-[#050914]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 block">
            Also Available
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            More Ways We Can Help
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto">
            Beyond hosting, we offer a full suite of digital services for businesses that want
            to go further.
          </p>
        </div>

        {/* Cards — horizontal, compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 card-hover group"
            >
              <div className="p-2 bg-white/[0.05] rounded-lg w-fit mb-3 group-hover:bg-cyan-500/10 transition-colors">
                <Icon size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-slate-200 font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-sm mt-8">
          Interested in bundling services?{' '}
          <button onClick={onContactOpen} className="text-cyan-500/70 hover:text-cyan-400 transition-colors">
            Get in touch for a custom quote.
          </button>
        </p>
      </div>
    </section>
  );
}
