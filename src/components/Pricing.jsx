import { CheckCircle2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    tagline: 'Get online fast and affordably.',
    features: [
      'Managed shared hosting',
      'Free domain (1st year)',
      'Free SSL certificate',
      '20 GB SSD storage',
      '5 business email accounts',
      'Daily backups',
      'Cloudflare CDN included',
      'Email support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Business',
    price: '$49',
    period: '/mo',
    tagline: 'For growing businesses that need more.',
    features: [
      'Managed WordPress hosting',
      'Free domain (1st year)',
      'Free SSL certificate',
      '50 GB SSD storage',
      'Unlimited business email',
      'Daily backups + 1-click restore',
      'Staging environment',
      'Priority support',
    ],
    cta: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    tagline: 'High-performance for serious businesses.',
    features: [
      'Managed VPS hosting',
      'Free domain (1st year)',
      'Free SSL certificate',
      '100 GB SSD storage',
      'Unlimited business email',
      'Hourly backups',
      'Dedicated resources',
      'Dedicated account manager',
    ],
    cta: 'Go Pro',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#07091a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
            Hosting Plans
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No hidden fees. No surprise invoices. Pick the plan that fits your business and
            get online today.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 transition-all duration-200 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-cyan-500/10 to-blue-600/5 border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(14,165,233,0.12)]'
                  : 'bg-white/[0.03] border border-white/[0.07] hover:border-white/20'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.tagline}</p>
                <div className="flex items-end gap-1">
                  <span className="text-white font-black text-5xl">{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-2">{plan.period}</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="https://app.nethost.co"
                className={`inline-flex items-center justify-center font-semibold text-sm px-6 py-3 rounded-xl transition ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90'
                    : 'bg-white/[0.06] border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        {/* Add-ons note */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            All plans include free SSL, daily backups, and Cloudflare CDN. &nbsp;
            <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:underline">
              Need a custom plan? Let's talk.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
