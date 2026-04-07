import { Briefcase, User, BookOpen, ShoppingBag } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const TYPES = [
  { id: 'Business', icon: Briefcase, description: 'Services, agencies, local businesses, and professional firms.' },
  { id: 'Portfolio', icon: User, description: 'Showcase your work, projects, and creative expertise.' },
  { id: 'Blog', icon: BookOpen, description: 'Share ideas, publish content, and grow an audience.' },
  { id: 'E-commerce', icon: ShoppingBag, description: 'Sell products online with a full storefront.' },
];

export default function Step3SiteType() {
  const { data, update } = useWizard();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 3</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          What Kind of Site?
        </h1>
        <p className="text-slate-400 text-sm text-center mb-10">
          We'll pre-configure your setup to match your use case.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {TYPES.map(({ id, icon: Icon, description }) => {
            const selected = data.siteType === id;
            return (
              <button
                key={id}
                onClick={() => update({ siteType: id })}
                className={`card-select text-left rounded-2xl p-5 border bg-white/[0.03] border-white/[0.07] ${selected ? 'selected' : ''}`}
              >
                <div className={`p-2.5 rounded-xl w-fit mb-3 transition-colors ${selected ? 'bg-cyan-500/20' : 'bg-white/[0.06]'}`}>
                  <Icon size={20} className={selected ? 'text-cyan-400' : 'text-slate-400'} />
                </div>
                <p className={`font-bold text-sm mb-1 ${selected ? 'text-white' : 'text-slate-200'}`}>{id}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
