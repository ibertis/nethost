import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050914] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-white/[0.06] mb-2 select-none">404</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:opacity-90 transition"
          >
            <Home size={14} /> Back to Home
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 text-slate-300 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/10 transition"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
