import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "NETHOST launched our site in two weeks and handled everything — hosting, design, even our domain setup. I had zero stress throughout the whole process.",
    name: 'Daniel C.',
    role: 'Founder, HealthPlus',
    initials: 'DC',
  },
  {
    quote:
      "We went from a broken WordPress site to a fast, professional platform that actually converts. Our lead volume doubled in the first month.",
    name: 'Jessica L.',
    role: 'CEO, Style Fusion',
    initials: 'JL',
  },
  {
    quote:
      "The SEO and ongoing support have been game-changers. We rank on the first page for our core keywords now, which just wasn't happening before.",
    name: 'Michael T.',
    role: 'Owner, GreenGrocer',
    initials: 'MT',
  },
  {
    quote:
      "I tried three other agencies before NETHOST. Night and day difference. They actually understand small business needs and communicate clearly.",
    name: 'Emily C.',
    role: 'Director, FashionFlair',
    initials: 'EC',
  },
  {
    quote:
      "From branding to web hosting to paid ads — having it all in one place with one team that knows our business is incredibly valuable.",
    name: 'Kevin M.',
    role: 'Co-Founder, FitLife',
    initials: 'KM',
  },
  {
    quote:
      "NETHOST feels like having an in-house digital team without the overhead. Responsive, professional, and genuinely invested in our success.",
    name: 'Rachel A.',
    role: 'Founder, PureBeauty',
    initials: 'RA',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#050914]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            What Our Clients Say
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Real results from real businesses that trusted us with their online presence.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4 card-hover"
            >
              <Stars />
              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
