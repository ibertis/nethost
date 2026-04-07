import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const TASKS = [
  { label: 'Registering domain',           duration: 900 },
  { label: 'Setting up hosting environment', duration: 1300 },
  { label: 'Configuring SSL certificate',   duration: 1000 },
  { label: 'Installing WordPress',          duration: 1600 },
  { label: 'Setting up business email',     duration: 900 },
  { label: 'Configuring CDN',               duration: 800 },
  { label: 'Running final checks',          duration: 1100 },
];

export default function Step7Provisioning() {
  const { setStep, data } = useWizard();
  const [completed, setCompleted] = useState([]);   // indices done
  const [active, setActive] = useState(0);          // current running index

  useEffect(() => {
    let idx = 0;
    const run = () => {
      if (idx >= TASKS.length) {
        setTimeout(() => setStep(8), 600);
        return;
      }
      setActive(idx);
      setTimeout(() => {
        setCompleted((prev) => [...prev, idx]);
        idx++;
        run();
      }, TASKS[idx].duration);
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = Math.round((completed.length / TASKS.length) * 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Logo + pulse ring */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping scale-150" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
          <img src="/nethost-logo.png" alt="NETHOST" className="h-6 w-auto" />
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
