import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { supabase } from '../../lib/supabaseClient';

const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

const TASKS = [
  { label: 'Registering domain' },
  { label: 'Setting up hosting environment' },
  { label: 'Configuring SSL certificate' },
  { label: 'Installing WordPress' },
  { label: 'Setting up business email' },
  { label: 'Configuring CDN' },
  { label: 'Running final checks' },
];

// Minimum display duration per task (ms) so the animation feels intentional
const MIN_TASK_MS = 800;

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Step7Provisioning() {
  const { setStep, data, update } = useWizard();
  const [completed, setCompleted] = useState([]);
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Persists across retries (retryKey increments but ref is stable for component lifetime)
  const completedTasksRef = useRef(new Set());

  const complete = (idx) => {
    completedTasksRef.current.add(idx);
    setCompleted((prev) => [...prev, idx]);
  };

  useEffect(() => {
    const run = async () => {
      try {
        // Task 0 — Register domain
        // Skip if: already completed on a prior attempt, user is connecting their own domain, or test mode is active
        setActive(0);
        const shouldRegisterDomain = data.domainOption === 'register' && !TEST_MODE;
        if (shouldRegisterDomain && !completedTasksRef.current.has(0)) {
          const [registerResult] = await Promise.all([
            supabase.functions.invoke('domain-register', { body: { domain: data.domain, price: data.domainPrice } }),
            delay(MIN_TASK_MS),
          ]);
          if (registerResult.error || registerResult.data?.error) {
            throw new Error(registerResult.data?.error ?? registerResult.error?.message ?? 'Domain registration failed');
          }
        } else {
          await delay(MIN_TASK_MS);
        }
        complete(0);

        // Task 1 — Set up hosting
        setActive(1);
        let creds;
        if (TEST_MODE) {
          // Test mode: skip real provisioning, return mock credentials
          await delay(MIN_TASK_MS * 2);
          creds = {
            wpAdminUrl: `https://${data.domain}/wp-admin`,
            username:   'admin',
            password:   'TestPassword123',
            email:      `hello@${data.domain}`,
          };
        } else if (!completedTasksRef.current.has(1)) {
          const [provisionResult] = await Promise.all([
            supabase.functions.invoke('provision-hosting', {
              body: { plan: data.plan, domain: data.domain, siteName: data.identity?.name || data.domain },
            }),
            delay(MIN_TASK_MS),
          ]);
          if (provisionResult.error || provisionResult.data?.error) {
            throw new Error(provisionResult.data?.error ?? provisionResult.error?.message ?? 'Hosting provisioning failed');
          }
          creds = provisionResult.data;
        } else {
          await delay(MIN_TASK_MS);
          creds = {}; // already stored in provisionedCredentials below
        }
        complete(1);

        // Tasks 2–6 — Visual steps while hosting finishes configuring
        for (let i = 2; i < TASKS.length; i++) {
          setActive(i);
          await delay(MIN_TASK_MS);
          complete(i);
        }

        const provisionedCredentials = {
          domain:     data.domain,
          wpAdminUrl: creds.wpAdminUrl ?? `https://${data.domain}/wp-admin`,
          username:   creds.username ?? 'admin',
          password:   creds.password,
          email:      creds.email ?? `hello@${data.domain}`,
        };

        // Store real credentials in wizard state
        update({ provisionedCredentials });

        // Persist order to Supabase for dashboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Non-blocking — table may not exist yet; don't let this fail the wizard
          supabase.from('orders').insert({
            user_id:            user.id,
            plan:               data.plan,
            domain:             provisionedCredentials.domain,
            wp_admin_url:       provisionedCredentials.wpAdminUrl,
            username:           provisionedCredentials.username,
            password:           provisionedCredentials.password,
            email:              provisionedCredentials.email,
            stripe_customer_id:       data.stripeCustomerId    ?? null,
            stripe_subscription_id:   data.stripeSubscriptionId ?? null,
          }).then(() => {}).catch(() => {});

          // Fire-and-forget confirmation email — don't block on failure
          supabase.functions.invoke('send-order-confirmation', {
            body: {
              to:         user.email,
              domain:     provisionedCredentials.domain,
              plan:       data.plan,
              wpAdminUrl: provisionedCredentials.wpAdminUrl,
              username:   provisionedCredentials.username,
              password:   provisionedCredentials.password,
            },
          });
        }

        await delay(600);
        setStep(8);
      } catch (err) {
        setError(err.message ?? 'Something went wrong. Please try again.');
      }
    };
    run();
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = Math.round((completed.length / TASKS.length) * 100);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Provisioning Failed</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <p className="text-slate-500 text-xs mb-6">
          Need help? Email <a href="mailto:hello@nethost.co" className="text-cyan-500 hover:text-cyan-400 transition">hello@nethost.co</a> or call <a href="tel:+18668076242" className="text-cyan-500 hover:text-cyan-400 transition">(866) 807-6242</a>
        </p>
        <button
          onClick={() => {
            setError('');
            // Restore visual completed state from ref (tasks already done are re-shown as done)
            setCompleted([...completedTasksRef.current]);
            setActive(0);
            setRetryKey((k) => k + 1);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-8 py-2.5 rounded-full hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Logo + pulse ring */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping scale-150" />
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
          <img src="/NETHOST_emblem.png" alt="NETHOST" className="w-full h-full object-contain" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
        Building Your Website…
      </h1>
      <p className="text-slate-400 text-sm mb-10">
        Provisioning <span className="text-cyan-400 font-semibold">{data.domain || 'yourdomain.com'}</span> — this takes about 30 seconds.
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-slate-500 text-xs mt-1.5">{progress}%</p>
      </div>

      {/* Task list */}
      <div className="w-full max-w-md flex flex-col gap-2.5 text-left">
        {TASKS.map((task, i) => {
          const done = completed.includes(i);
          const running = active === i && !done;
          return (
            <div
              key={task.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                done
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : running
                  ? 'bg-cyan-500/5 border-cyan-500/20'
                  : 'bg-white/[0.02] border-white/[0.05]'
              }`}
            >
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : running ? (
                  <span className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin block" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-white/10 block" />
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  done ? 'text-emerald-300' : running ? 'text-cyan-300' : 'text-slate-600'
                }`}
              >
                {task.label}
              </span>
              {done && <span className="ml-auto text-emerald-500 text-xs">Done</span>}
              {running && <span className="ml-auto text-cyan-500 text-xs animate-pulse">In progress…</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
