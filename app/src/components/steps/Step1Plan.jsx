import { CheckCircle2 } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const PLANS = [
  {
    name: 'Starter',
    price: '$19',
    tagline: 'Get online fast.',
    features: ['Managed shared hosting', 'Free domain (1st year)', 'Free SSL + daily backups', '5 business email accounts'],
  },
  {
    name: 'Business',
    price: '$49',
    tagline: 'For growing businesses.',
    features: ['Managed WordPress hosting', 'Free domain (1st year)', 'Staging environment', 'Priority support'],
    popular: true,
  },
  {
    name: 'Pro',
    price: '$99',
    tagline: 'Maximum performance.',
    features: ['Managed VPS hosting', 'Free domain (1st year)', 'Dedicated resources', 'Dedicated account manager'],
  },
];

export default function Step1Plan() {
  const { data, update } = useWizard();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 1</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          Choose Your Hosting Plan
        </h1>
        <p className="text-slate-400 text-sm text-center mb-10">
          No long-term contracts. Cancel anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const selected = data.plan === plan.name;
            return (
              <button
                key={plan.name}
                onClick={() => update({ plan: plan.name })}
                className={`relative text-left rounded-2xl p-6 border transition-all duration-200 card-select ${
                  plan.popular
                    ? 'bg-white/[0.04] border-white/10'
                    : 'bg-white/[0.02] border-white/[0.07]'
                } ${selected ? 'selected' : ''}`}
              >
                {plan.popular && !selected && (
                  <span className="absolute -top-3 left-4 text-xs font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    Most Popular
                  </span>
                )}
                {selected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 size={18} className="text-cyan-400" />
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-white font-black text-3xl">{plan.price}</span>
                    <span className="text-slate-500 text-xs mb-1">/mo</span>
                  </div>
                  <p className="text-slate-500 text-xs">{plan.tagline}</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={12} className="text-cyan-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-slate-600 text-xs">or</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
        <p className="mt-4 text-center text-slate-500 text-sm">
          Need a fully managed, done-for-you experience?{' '}
          <a
            href="mailto:hello@nethost.co"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Talk to us about white-glove setup →
          </a>
        </p>
      </div>
    </div>
  );
}
