import { Check, LogOut } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { useAuth } from '../lib/AuthContext';

const STEPS = [
  'Plan',
  'Domain',
  'Site Type',
  'Template',
  'Identity',
  'Review',
  'Launch',
  'Done',
];

export default function WizardShell({ children }) {
  const { step, setStep, canAdvance } = useWizard();
  const { logout } = useAuth();

  const isProvisioning = step === 7;
  const isDone = step === 8;
  const hideNav = isProvisioning || isDone;

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.06] shrink-0">
        <a href="https://nethost.co">
          <img src="/nethost-logo.png" alt="NETHOST" className="h-6 w-auto" />
        </a>
        <div className="flex items-center gap-4">
          {!isProvisioning && !isDone && (
            <span className="text-slate-500 text-xs font-medium">
              Step {step} of 6
            </span>
          )}
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition text-xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Step progress (hidden on provisioning/done) */}
      {!hideNav && (
        <div className="px-6 md:px-10 pt-6 pb-2 shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5">
              {STEPS.slice(0, 6).map((label, i) => {
                const num = i + 1;
                const isComplete = step > num;
                const isActive = step === num;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full h-1 rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-cyan-500'
                          : isActive
                          ? 'bg-cyan-500/60'
                          : 'bg-white/[0.08]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium hidden sm:block transition-colors ${
                        isComplete || isActive ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    >
                      {isComplete ? (
                        <span className="flex items-center gap-0.5">
                          <Check size={9} /> {label}
                        </span>
                      ) : (
                        label
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col">{children}</div>
      </main>

      {/* Bottom nav */}
      {!hideNav && (
        <footer className="border-t border-white/[0.06] px-6 md:px-10 py-4 shrink-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-8 py-2.5 rounded-full hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === 6 ? 'Launch My Website →' : 'Continue →'}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
