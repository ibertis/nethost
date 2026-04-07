import { useState } from 'react';
import { Globe, Monitor, Palette, Server, User, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useWizard } from '../../context/WizardContext';
import { supabase } from '../../lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRICES = { Starter: 19, Business: 49, Pro: 99 };

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#f1f5f9',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '14px',
      '::placeholder': { color: '#475569' },
    },
    invalid: { color: '#f87171' },
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

function PaymentForm({ price }) {
  const stripe     = useStripe();
  const elements   = useElements();
  const { data, setStep, update } = useWizard();
  const [paying, setPaying]   = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setCardError('');

    try {
      // 0. Get user email to attach to Stripe Customer
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Create PaymentIntent server-side (also creates/retrieves Stripe Customer)
      const { data: intentData, error: intentError } = await supabase.functions.invoke(
        'create-payment-intent',
        { body: { plan: data.plan, email: user?.email } },
      );
      if (intentError || intentData?.error) {
        throw new Error(intentData?.error ?? intentError?.message ?? 'Payment setup failed');
      }

      // Store customerId in wizard state for use in Step 7 orders insert
      if (intentData.customerId) {
        update({ stripeCustomerId: intentData.customerId });
      }

      // 2. Confirm card payment client-side
      const { error: stripeError } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (stripeError) throw new Error(stripeError.message);

      // 3. Advance to provisioning
      setStep(7);
    } catch (err) {
      setCardError(err.message ?? 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Payment</p>
        <div className="bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3.5 focus-within:border-cyan-500 focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.12)] transition">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        {cardError && (
          <p className="text-red-400 text-xs mt-2">{cardError}</p>
        )}
        <p className="text-slate-600 text-xs mt-3 text-center flex items-center justify-center gap-1">
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

        {/* Stripe payment form */}
        <Elements stripe={stripePromise}>
          <PaymentForm price={price} />
        </Elements>
      </div>
    </div>
  );
}
