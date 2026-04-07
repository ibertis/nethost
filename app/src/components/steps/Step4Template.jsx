import { Check } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const TEMPLATES = [
  { id: 'Minimal', gradient: 'from-slate-700 to-slate-900', accent: '#94a3b8', desc: 'Clean lines, generous whitespace.' },
  { id: 'Bold', gradient: 'from-violet-700 to-purple-900', accent: '#a78bfa', desc: 'Strong typography, high contrast.' },
  { id: 'Corporate', gradient: 'from-blue-700 to-blue-900', accent: '#60a5fa', desc: 'Professional, structured, trustworthy.' },
  { id: 'Creative', gradient: 'from-rose-600 to-orange-700', accent: '#fb923c', desc: 'Expressive, colorful, memorable.' },
  { id: 'Modern', gradient: 'from-cyan-600 to-teal-800', accent: '#22d3ee', desc: 'Tech-forward, dynamic layout.' },
  { id: 'Classic', gradient: 'from-amber-700 to-stone-800', accent: '#fbbf24', desc: 'Timeless, warm, editorial feel.' },
];

function TemplateThumbnail({ template, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`card-select relative rounded-2xl overflow-hidden border bg-white/[0.02] border-white/[0.07] group ${selected ? 'selected' : ''}`}
    >
      {/* Preview block */}
      <div className={`bg-gradient-to-br ${template.gradient} h-28 w-full relative`}>
        {/* Fake nav */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-white/40" />
          <div className="ml-auto flex gap-1">
            <div className="w-4 h-1 rounded-full bg-white/20" />
            <div className="w-4 h-1 rounded-full bg-white/20" />
            <div className="w-6 h-1 rounded-full" style={{ background: template.accent + '99' }} />
          </div>
        </div>
        {/* Fake hero text */}
        <div className="absolute bottom-4 left-3">
          <div className="w-20 h-2.5 rounded-full bg-white/60 mb-1.5" />
          <div className="w-14 h-1.5 rounded-full bg-white/30" />
        </div>
        {/* Selected overlay */}
        {selected && (
          <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
              <Check size={14} className="text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 text-left">
        <p className={`text-sm font-bold mb-0.5 ${selected ? 'text-cyan-400' : 'text-slate-200'}`}>{template.id}</p>
        <p className="text-slate-500 text-xs">{template.desc}</p>
      </div>
    </button>
  );
}

export default function Step4Template() {
  const { data, update } = useWizard();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 4</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          Pick a Starting Style
        </h1>
        <p className="text-slate-400 text-sm text-center mb-10">
          Choose a visual direction. You can customize everything later.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <TemplateThumbnail
              key={t.id}
              template={t}
              selected={data.template === t.id}
              onClick={() => update({ template: t.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
