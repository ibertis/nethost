import { ArrowUpRight } from 'lucide-react';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';

const TOOLS = [
  {
    name: 'Premier Persona',
    url: 'https://premierpersona.com',
    display: 'premierpersona.com',
    description:
      'A brand intelligence platform built for real estate professionals — manage your identity, content, growth goals, and network in one place.',
    initials: 'PP',
    accent: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
  },
  {
    name: 'Permiana',
    url: 'https://permiana.com',
    display: 'permiana.com',
    description:
      'A digital publishing platform designed to streamline content operations and elevate the online presence of growing businesses.',
    initials: 'PM',
    accent: 'from-emerald-500/20 to-teal-600/20',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  {
    name: 'LogoSpark',
    url: 'https://logospark.ai',
    display: 'logospark.ai',
    description:
      'AI-powered logo generation — create professional, unique brand marks in seconds without a designer.',
    initials: 'LS',
    accent: 'from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
  },
  {
    name: 'LinkSpark',
    url: 'https://linkspark.app',
    display: 'linkspark.app',
    description:
      'A smart link-in-bio, link shortening, and URL management tool — consolidate your online presence into a single, shareable page.',
    initials: 'LK',
    accent: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
  },
];

export default function Toolkit({ onContactOpen }) {
  return (
    <>
      <main className="pt-32 pb-24 bg-[#050914]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
              Partner Tools
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Resources
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A curated suite of tools built to complement your web presence — from branding to
              marketing to business operations.
            </p>
          </div>

          {/* Grid */}
          <h2 className="sr-only">Partner Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4 card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.accent} border ${tool.border} flex items-center justify-center text-sm font-black shrink-0 ${tool.text}`}
                  >
                    {tool.initials}
                  </div>
                  {/* Visit label */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 border border-white/10 bg-white/[0.04] px-3 py-1.5 rounded-full shrink-0">
                    Visit <ArrowUpRight size={12} />
                  </span>
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{tool.name}</h3>
                  <p className={`text-xs font-medium mb-3 ${tool.text}`}>{tool.display}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{tool.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <CtaBanner onContactOpen={onContactOpen} />
      <Footer onContactOpen={onContactOpen} />
    </>
  );
}
