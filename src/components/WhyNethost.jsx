import { Users, Server, LifeBuoy, TrendingUp } from 'lucide-react';

const POINTS = [
  {
    icon: Server,
    title: 'We Handle the Technology',
    description:
      'Servers, SSL, updates, backups, security patches — all managed by us. You log in to your site, not a server panel.',
  },
  {
    icon: Users,
    title: 'Real People, Not Tickets',
    description:
      'When something needs attention, you talk to a real person who knows your account — not a chatbot or a queue.',
  },
  {
    icon: TrendingUp,
    title: 'Built to Scale With You',
    description:
      'Start on Starter, grow into Business or Pro. Upgrading is seamless — no migration headaches or surprise downtime.',
  },
  {
    icon: LifeBuoy,
    title: 'A Long-Term Partner',
    description:
      "We're not a one-and-done service. We monitor, maintain, and optimize your hosting as your business evolves.",
  },
];

export default function WhyNethost() {
  return (
    <section className="py-24 bg-[#07091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
              Why NETHOST
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Hosting That Works{' '}
              <span className="text-gradient">While You Work</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Most hosting companies sell you a server and disappear. NETHOST is different — we
              actively manage your hosting environment so it's always fast, always secure, and
              always on. No technical knowledge required.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-7 py-3 rounded-full hover:opacity-90 transition text-sm"
            >
              See Hosting Plans
            </a>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 items-start bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 card-hover"
              >
                <div className="p-2.5 bg-cyan-500/10 rounded-xl shrink-0 mt-0.5">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-sm">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
