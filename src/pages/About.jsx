import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': 'Gabriel Ibertis',
  'jobTitle': 'Founder & CEO',
  'worksFor': {
    '@type': 'Organization',
    'name': 'NETHOST',
    'url': 'https://nethost.co',
  },
  'url': 'https://nethost.co/about',
  'image': 'https://nethost.co/gabriel-ibertis.png',
  'sameAs': ['https://gabrielibertis.com'],
};

export default function About({ onContactOpen }) {
  useEffect(() => {
    document.title = 'Gabriel Ibertis — Founder of NETHOST';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Gabriel Ibertis is the founder of NETHOST, a managed web hosting company built for entrepreneurs and small businesses.',
      );
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'person-schema';
    script.text = JSON.stringify(PERSON_SCHEMA);
    document.head.appendChild(script);

    return () => {
      document.title = 'NETHOST — Managed Web Hosting for Entrepreneurs & Small Businesses';
      if (meta) {
        meta.setAttribute(
          'content',
          'NETHOST provides fully managed web hosting, website design, and digital services for entrepreneurs and small businesses. Fast, secure, and handled — so you can focus on running your business.',
        );
      }
      document.getElementById('person-schema')?.remove();
    };
  }, []);

  return (
    <>
      <main className="pt-32 pb-24 bg-[#050914]">
        <div className="max-w-3xl mx-auto px-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-10">
            <img
              src="/gabriel-ibertis.png"
              alt="Gabriel Ibertis"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shrink-0 ring-1 ring-white/[0.1]"
            />
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
                Founder
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2">
                Gabriel Ibertis
              </h1>
              <p className="text-cyan-400 font-semibold text-lg">Founder &amp; CEO, NETHOST</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.07] mb-10" />

          <div className="space-y-6 text-slate-300 text-lg leading-relaxed mb-14">
            <p>
              I built NETHOST because I kept seeing the same problem: small business owners and
              entrepreneurs were either paying too much for agencies that moved slowly, or wrestling
              with DIY website tools that never quite delivered what they needed.
            </p>
            <p>
              NETHOST was designed to fill that gap with fully managed hosting and web services that
              give you the quality of an agency without the overhead. We handle the servers, SSL,
              backups, and everything in between so you can stay focused on running your business.
            </p>
            <p>
              With over 20 years of experience working alongside entrepreneurs and small business
              owners across industries, one thing remains constant: they need a reliable partner,
              not just a hosting plan. That's what NETHOST is built to be.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://app.nethost.co"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition text-sm"
            >
              Get Started with NETHOST
            </a>
            <a
              href="https://gabrielibertis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] transition font-semibold px-6 py-3 rounded-full text-sm"
            >
              gabrielibertis.com <ArrowUpRight size={14} />
            </a>
          </div>

        </div>
      </main>

      <CtaBanner onContactOpen={onContactOpen} />
      <Footer onContactOpen={onContactOpen} />
    </>
  );
}
