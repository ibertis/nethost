const STEPS = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'We start by understanding your business, goals, and audience — so everything we build is aligned from day one.',
  },
  {
    number: '02',
    title: 'Design',
    description:
      'We craft a visual identity and site structure that reflects your brand and guides visitors toward action.',
  },
  {
    number: '03',
    title: 'Development',
    description:
      'Your site is built fast, clean, and optimized — for performance, SEO, and mobile from the ground up.',
  },
  {
    number: '04',
    title: 'Launch',
    description:
      'We deploy, configure hosting, and run final checks. Then we hand it off — with full support going forward.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-[#050914]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
            How We Work
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Our Process
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A clear, four-step process that keeps you informed and in control at every stage.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Number circle */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-5">
                <span className="text-cyan-400 font-black text-lg">{step.number}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
