import { Mail, Phone, Globe } from 'lucide-react';

const LINKS = {
  Services: [
    { label: 'Web Hosting', href: '#services' },
    { label: 'Website Design', href: '#services' },
    { label: 'SEO Optimization', href: '#services' },
    { label: 'Digital Marketing', href: '#services' },
    { label: 'Branding & Identity', href: '#services' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Process', href: '#process' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: null },
  ],
};

export default function Footer({ onContactOpen }) {
  return (
    <footer className="bg-[#030610] border-t border-white/[0.06] pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center mb-3">
              <img src="/nethost-logo.png" alt="NETHOST" className="h-6 w-auto" />
            </a>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Fully managed web hosting for entrepreneurs and small businesses. We handle the
              servers, SSL, and uptime — letting you focus on running your business.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:hello@nethost.co"
                className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-sm"
              >
                <Mail size={14} /> hello@nethost.co
              </a>
              <a
                href="tel:+18668076242"
                className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-sm"
              >
                <Phone size={14} /> (866) 807-6242
              </a>
              <a
                href="https://nethost.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-sm"
              >
                <Globe size={14} /> nethost.co
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.label === 'Contact' ? (
                      <button
                        onClick={onContactOpen}
                        className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact CTA */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Start a Project</h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Ready to get online? Let's build something great together.
            </p>
            <a
              href="https://app.nethost.co"
              className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">© 2026 NETHOST. All rights reserved.</p>
          <p className="text-slate-700 text-xs">
            Professional web hosting & digital services.
          </p>
        </div>
      </div>
    </footer>
  );
}
