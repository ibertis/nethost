import { useState, useEffect } from 'react';
import { Globe, Monitor, Palette, Server, User, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useWizard } from '../../context/WizardContext';
import { supabase } from '../../lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRICES = { Starter: 19, Business: 49, Pro: 99 };

const ELEMENTS_OPTIONS = {
  appearance: {
    theme: 'night',
    variables: {
      colorPrimary:        '#06b6d4',
      colorBackground:     '#0f172a',
      colorText:           '#f1f5f9',
      colorDanger:         '#f87171',
      fontFamily:          'ui-sans-serif, system-ui, sans-serif',
      borderRadius:        '12px',
      spacingUnit:         '4px',
    },
    rules: {
      '.Input': { border: '1px solid rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.05)' },
      '.Input:focus': { border: '1px solid #06b6d4', boxShadow: '0 0 0 3px rgba(6,182,212,0.12)' },
      '.Label': { color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' },
    },
  },
};

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

function PaymentForm({ price, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying]     = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setCardError('');

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setCardError(error.message ?? 'Payment failed. Please try again.');
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Payment</p>
        <PaymentElement options={{ wallets: { applePay: 'auto', googlePay: 'auto', link: 'never' } }} />
        {cardError && (
          <p className="text-red-400 text-xs mt-3">{cardError}</p>
        )}
        <p className="text-slate-600 text-xs mt-4 text-center flex items-center justify-center gap-1">
          <Lock size={10} /> Secured by Stripe. Cancel anytime.
        </p>
      </div>

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          `Launch My Website — $${price}/mo →`
        )}
      </button>
    </form>
  );
}

export default function Step6Review() {
  const { data, setStep, update } = useWizard();
  const price = PRICES[data.plan] || 49;
  const [clientSecret, setClientSecret] = useState(data.stripeClientSecret ?? '');
  const [initError, setInitError]       = useState('');

  useEffect(() => {
    if (clientSecret) return; // already fetched on a prior render of this step
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: subData, error: subError } = await supabase.functions.invoke(
          'create-subscription',
          { body: { plan: data.plan, email: user?.email, testMode: import.meta.env.VITE_TEST_MODE === 'true' } },
        );
        if (subError) {
          let msg = subError.message;
          try { const b = await subError.context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
          throw new Error(msg);
        }
        if (subData?.error) throw new Error(subData.error);
        update({
          stripeClientSecret:   subData.clientSecret,
          stripeCustomerId:     subData.customerId,
          stripeSubscriptionId: subData.subscriptionId,
        });
        setClientSecret(subData.clientSecret);
      } catch (err) {
        setInitError(err.message ?? 'Failed to initialize payment. Please try again.');
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <Row icon={Server}  label="Plan"      value={`${data.plan} — $${price}/mo`} />
          <Row icon={Globe}   label="Domain"    value={data.domain || '—'} />
          <Row icon={Monitor} label="Site Type" value={data.siteType || '—'} />
          <Row icon={Palette} label="Template"  value={data.template || '—'} />
          <Row icon={User}    label="Business"  value={data.identity.name || '—'} />
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

        {/* Stripe PaymentElement */}
        {initError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <p className="text-red-400 text-sm">{initError}</p>
          </div>
        ) : !clientSecret ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret, ...ELEMENTS_OPTIONS }}>
            <PaymentForm price={price} onSuccess={() => setStep(7)} />
          </Elements>
        )}
      </div>
    </div>
  );
}
