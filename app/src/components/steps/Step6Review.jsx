import { Globe, Monitor, Palette, Server, User } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const PRICES = { Starter: 19, Business: 49, Pro: 99 };

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/[0.05] rounded-lg">
          <Icon size={14} className="text-slate-400" />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function Step6Review() {
  const { data } = useWizard();
  const price = PRICES[data.plan] || 49;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 6</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          Review & Launch
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Everything looks good? Let's go live.
        </p>

        {/* Summary card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Your Setup</p>
          <Row icon={Server}  label="Plan"        value={`${data.plan} — $${price}/mo`} />
          <Row icon={Globe}   label="Domain"      value={data.domain || '—'} />
          <Row icon={Monitor} label="Site Type"   value={data.siteType || '—'} />
          <Row icon={Palette} label="Template"    value={data.template || '—'} />
          <Row icon={User}    label="Business"    value={data.identity.name || '—'} />
        </div>

        {/* Price breakdown */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Billing</p>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{data.plan} Hosting</span>
            <span>${price}/mo</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400 mb-3">
            <span>Domain Registration</span>
            <span className="text-emerald-400">Free (1st year)</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-white/[0.07] pt-3">
            <span>Total today</span>
            <span>${price}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Payment</p>
          <div className="flex flex-col gap-3">
            <input className="input-field" placeholder="Card number" maxLength={19} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="MM / YY" maxLength={7} />
              <input className="input-field" placeholder="CVC" maxLength={4} />
            </div>
            <input className="input-field" placeholder="Name on card" />
          </div>
          <p className="text-slate-600 text-xs mt-3 text-center">
            🔒 Secured by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
