import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const TEMPLATES = [
  { id: 'Bold', gradient: 'from-zinc-800 to-black', accent: '#ffffff', desc: 'Strong typography, high contrast.', preview: 'https://template.nethost.co' },
  { id: 'Minimal', gradient: 'from-slate-600 to-slate-900', accent: '#94a3b8', desc: 'Clean lines, generous whitespace.', preview: 'https://template-minimal.nethost.co' },
  { id: 'Corporate', gradient: 'from-blue-700 to-blue-900', accent: '#60a5fa', desc: 'Professional, structured, trustworthy.', preview: 'https://template-corporate.nethost.co' },
  { id: 'Blank', gradient: 'from-gray-700 to-gray-900', accent: '#6b7280', desc: 'Empty canvas — build from scratch.', preview: null },
];

function PreviewModal({ template, onClose, onSelect }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050914]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">{template.id}</span>
          <span className="text-slate-500 text-xs">{template.desc}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onSelect(template.id); onClose(); }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition"
          >
            Select This Template
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.06]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* iframe */}
      <iframe
        src={template.preview}
        title={`${template.id} template preview`}
        className="flex-1 w-full border-0"
        loading="lazy"
      />
    </div>
  );
}

function TemplateThumbnail({ template, selected, onClick, onPreview }) {
  return (
    <button
      onClick={onClick}
      className={`card-select relative rounded-2xl overflow-hidden border bg-white/[0.02] border-white/[0.07] group ${selected ? 'selected' : ''}`}
    >
      {/* Preview block */}
      <div className={`bg-gradient-to-br ${template.gradient} h-28 w-full relative`}>
        {template.id === 'Blank' ? (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-4 h-4 rounded border border-white/40" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
              <div className="w-6 h-1.5 rounded-full bg-white/40" />
              <div className="ml-auto flex gap-1">
                <div className="w-4 h-1 rounded-full bg-white/20" />
                <div className="w-4 h-1 rounded-full bg-white/20" />
                <div className="w-6 h-1 rounded-full" style={{ background: template.accent + '99' }} />
              </div>
            </div>
            <div className="absolute bottom-4 left-3">
              <div className="w-20 h-2.5 rounded-full bg-white/60 mb-1.5" />
              <div className="w-14 h-1.5 rounded-full bg-white/30" />
            </div>
          </>
        )}
        {/* Preview button — appears on hover */}
        {template.preview && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 hover:bg-black/80 transition"
            >
              Preview
            </button>
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
              <Check size={14} className="text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 text-left">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-sm font-bold ${selected ? 'text-cyan-400' : 'text-slate-200'}`}>{template.id}</p>
          {template.preview && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="text-[10px] font-semibold text-cyan-500 hover:text-cyan-300 transition shrink-0"
            >
              Preview →
            </button>
          )}
        </div>
        <p className="text-slate-500 text-xs">{template.desc}</p>
      </div>
    </button>
  );
}

export default function Step4Template() {
  const { data, update } = useWizard();
  const [previewTemplate, setPreviewTemplate] = useState(null);

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl animate-[fade-up_0.4s_ease_forwards]">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 2</p>
          <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
            Pick a Starting Style
          </h1>
          <p className="text-slate-400 text-sm text-center mb-10">
            Choose a visual direction. You can customize everything later.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <TemplateThumbnail
                key={t.id}
                template={t}
                selected={data.template === t.id}
                onClick={() => update({ template: t.id })}
                onPreview={() => setPreviewTemplate(t)}
              />
            ))}
          </div>
        </div>
      </div>

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(id) => update({ template: id })}
        />
      )}
    </>
  );
}
