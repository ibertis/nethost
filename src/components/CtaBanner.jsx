import { ArrowRight, Calendar } from 'lucide-react';

export default function CtaBanner({ onContactOpen }) {
  return (
    <section className="py-24 bg-[#07091a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-[1.1]">
          Ready to Build Your{' '}
          <span className="text-gradient">Online Presence?</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Let's talk about your goals. No pressure, no jargon — just a straightforward
          conversation about what you need and how we can help.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:+18668076242"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition text-sm"
          >
            <Calendar size={16} />
            Schedule a Free Call
          </a>
          <button
            onClick={onContactOpen}
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-sm"
          >
            hello@nethost.co <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
