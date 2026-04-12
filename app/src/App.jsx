import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { WizardProvider, useWizard } from './context/WizardContext';
import WizardShell from './components/WizardShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Step1Plan from './components/steps/Step1Plan';
import Step2Domain from './components/steps/Step2Domain';
import Step3SiteType from './components/steps/Step3SiteType';
import Step4Template from './components/steps/Step4Template';
import Step5Identity from './components/steps/Step5Identity';
import Step6Review from './components/steps/Step6Review';
import Step7Provisioning from './components/steps/Step7Provisioning';
import Step8Done from './components/steps/Step8Done';

const STEPS = {
  1: Step1Plan,
  2: Step2Domain,
  3: Step3SiteType,
  4: Step4Template,
  5: Step5Identity,
  6: Step6Review,
  7: Step7Provisioning,
  8: Step8Done,
};

function WizardContent() {
  const { step } = useWizard();
  const StepComponent = STEPS[step];
  return (
    <WizardShell>
      <StepComponent />
    </WizardShell>
  );
}

function AppGate() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [view, setView] = useState('wizard'); // 'wizard' | 'dashboard' | 'account'

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#050914] flex items-center justify-center">
        <img src="/nethost-logo.png" alt="NETHOST" className="h-7 w-auto opacity-40 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  if (view === 'dashboard') {
    return <Dashboard onNewSite={() => setView('wizard')} onAccount={() => setView('account')} />;
  }

  if (view === 'account') {
    return <Account onBack={() => setView('dashboard')} />;
  }

  const params      = new URLSearchParams(window.location.search);
  const prefillName = params.get('domain');
  const prefillTld  = params.get('tld') ?? '.com';
  const initialData = prefillName
    ? { domain: `${prefillName}${prefillTld}`, tld: prefillTld, domainAvailable: true }
    : {};

  return (
    <WizardProvider onGoToDashboard={() => setView('dashboard')} initialData={initialData}>
      <WizardContent />
    </WizardProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
