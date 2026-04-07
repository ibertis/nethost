import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

const PRESETS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Step5Identity() {
  const { data, updateIdentity } = useWizard();
  const { identity } = data;
  const fileRef = useRef();

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateIdentity({ logoUrl: url });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateIdentity({ logoUrl: url });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl animate-[fade-up_0.4s_ease_forwards]">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 text-center">Step 5</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight mb-2">
          Tell Us About Your Business
        </h1>
        <p className="text-slate-400 text-sm text-center mb-10">
          This gets your site started. You can refine everything once you're in.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Business Name <span className="text-cyan-500">*</span>
              </label>
              <input
                className="input-field"
                placeholder="Acme Co."
                value={identity.name}
                onChange={(e) => updateIdentity({ name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Tagline</label>
              <input
                className="input-field"
                placeholder="We help people do amazing things."
                value={identity.tagline}
                onChange={(e) => updateIdentity({ tagline: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Logo</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current.click()}
                className="border border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-cyan-500/40 hover:bg-white/[0.02] transition group"
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                {identity.logoUrl ? (
                  <img src={identity.logoUrl} alt="Logo" className="max-h-12 mx-auto object-contain" />
                ) : (
                  <>
                    <Upload size={18} className="text-slate-600 mx-auto mb-2 group-hover:text-cyan-500 transition-colors" />
                    <p className="text-slate-600 text-xs">Drop your logo here or <span className="text-cyan-500">browse</span></p>
                    <p className="text-slate-700 text-xs mt-0.5">PNG, SVG, JPG up to 2MB</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Brand Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateIdentity({ color: c })}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: identity.color === c ? '#fff' : 'transparent',
                      boxShadow: identity.color === c ? `0 0 0 2px ${c}` : 'none',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={identity.color}
                  onChange={(e) => updateIdentity({ color: e.target.value })}
                  className="w-7 h-7 rounded-full cursor-pointer border border-white/10 bg-transparent"
                  title="Custom color"
                />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-xl">
            {/* Mock browser chrome */}
            <div className="bg-[#0d1220] px-3 py-2 flex items-center gap-1.5 border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-3 bg-white/[0.05] rounded px-2 py-0.5 text-xs text-slate-600 text-center truncate">
                {data.domain || 'yourdomain.com'}
              </div>
            </div>
            {/* Mock hero */}
            <div className="bg-[#080d1a] p-6 min-h-[180px] flex flex-col justify-center" style={{ borderTop: `3px solid ${identity.color}` }}>
              {identity.logoUrl ? (
                <img src={identity.logoUrl} alt="Logo" className="max-h-8 mb-4 object-contain object-left" />
              ) : (
                <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-white font-black text-sm" style={{ background: identity.color }}>
                  {identity.name?.[0] || 'N'}
                </div>
              )}
              <p className="text-white font-black text-lg leading-tight mb-1">
                {identity.name || 'Your Business Name'}
              </p>
              <p className="text-slate-500 text-xs">
                {identity.tagline || 'Your tagline goes here'}
              </p>
              <div className="mt-4 inline-flex">
                <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: identity.color }}>
                  Get Started
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
