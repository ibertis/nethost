const BRANDS = [
  'Launchpad Co.',
  'NovaBuild',
  'Crescent Media',
  'UrbanRoots',
  'Stackly',
  'OrizonGroup',
  'PureFlow',
  'Gista',
];

export default function TrustedBy() {
  return (
    <section className="py-16 border-y border-white/[0.06] bg-[#050914]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-10">
          Trusted by startups, creatives, and suits alike
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {BRANDS.map((name) => (
            <span
              key={name}
              className="text-slate-600 hover:text-slate-300 transition-colors text-sm font-semibold tracking-wide select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
