import { createContext, useContext, useState } from 'react';

const WizardContext = createContext(null);

const DEFAULTS = {
  plan: 'Business',
  domain: '',
  tld: '.com',
  domainOption: 'register', // 'register' | 'connect'
  domainAvailable: null,
  siteType: '',
  template: '',
  identity: { name: '', tagline: '', logoUrl: '', color: '#0ea5e9' },
  provisionedCredentials: null, // set after Step 7 completes
};

export function WizardProvider({ children, onGoToDashboard, initialData = {} }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...DEFAULTS, ...initialData });

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const updateIdentity = (patch) =>
    setData((prev) => ({ ...prev, identity: { ...prev.identity, ...patch } }));

  const canAdvance = () => {
    if (step === 1) return !!data.plan;
    if (step === 2) return !!data.domain;
    if (step === 3) return !!data.siteType;
    if (step === 4) return !!data.template;
    if (step === 5) return !!data.identity.name;
    if (step === 6) return true;
    return true;
  };

  const goToDashboard = onGoToDashboard ?? (() => {});

  return (
    <WizardContext.Provider value={{ step, setStep, data, update, updateIdentity, canAdvance, goToDashboard }}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => useContext(WizardContext);
