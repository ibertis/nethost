import { ArrowLeft } from 'lucide-react';

const EFFECTIVE = 'May 22, 2026';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#050914]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition text-sm mb-10"
        >
          <ArrowLeft size={14} /> Back to Home
        </a>

        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE}</p>

        <div className="prose prose-invert max-w-none space-y-10 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Overview</h2>
            <p>
              NETHOST ("we," "us," or "our") is committed to protecting your personal information. This Privacy
              Policy explains what data we collect, how we use it, and your rights regarding that data. By using
              our services at nethost.co or app.nethost.co, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Information We Collect</h2>

            <h3 className="text-slate-200 font-semibold mb-2 mt-4">Account Information</h3>
            <p>When you create an account, we collect your email address and a password (hashed; we never store plaintext passwords).</p>

            <h3 className="text-slate-200 font-semibold mb-2 mt-4">Order and Billing Information</h3>
            <p>
              When you purchase a hosting plan, we collect your domain name, selected plan, and billing
              information. Payment card details are processed and stored exclusively by Stripe — we never
              receive or store your full card number, expiration date, or CVV.
            </p>

            <h3 className="text-slate-200 font-semibold mb-2 mt-4">Hosting Credentials</h3>
            <p>
              We store your WordPress admin username, email, and a system-generated password in your account
              dashboard so you can retrieve them at any time. These are protected behind your authenticated
              account and are not shared with third parties.
            </p>

            <h3 className="text-slate-200 font-semibold mb-2 mt-4">Usage and Technical Data</h3>
            <p>
              We may collect standard web analytics data including IP addresses, browser type, pages visited,
              and referring URLs via Google Analytics. This data is aggregated and used to improve our service.
            </p>

            <h3 className="text-slate-200 font-semibold mb-2 mt-4">Communications</h3>
            <p>
              If you contact us, we retain your email and the content of your message to provide support and
              improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provision and manage your hosting account</li>
              <li>To process payments and manage your subscription</li>
              <li>To send order confirmations, billing notifications, and service alerts</li>
              <li>To respond to support requests</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To improve our website and services</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to deliver our products. Each has its own privacy policy.</p>

            <div className="mt-4 space-y-4">
              {[
                {
                  name: 'Stripe',
                  role: 'Payment processing',
                  url: 'https://stripe.com/privacy',
                  note: 'Handles all credit card transactions. We share your email and billing details with Stripe to create a customer profile and process payments.',
                },
                {
                  name: 'Supabase',
                  role: 'Authentication and database',
                  url: 'https://supabase.com/privacy',
                  note: 'Stores your account credentials (email, hashed password) and order records in a secure, access-controlled database.',
                },
                {
                  name: 'Cloudways',
                  role: 'Managed hosting infrastructure (Business and Pro plans)',
                  url: 'https://www.cloudways.com/en/privacy.php',
                  note: 'Your domain and site are deployed on Cloudways-managed servers. Your domain name is passed to Cloudways during provisioning.',
                },
                {
                  name: 'Namecheap',
                  role: 'Domain registration',
                  url: 'https://www.namecheap.com/legal/general/privacy-policy/',
                  note: 'If you register a new domain through NETHOST, your domain and registrant contact information is submitted to Namecheap.',
                },
                {
                  name: 'Google Analytics',
                  role: 'Website analytics',
                  url: 'https://policies.google.com/privacy',
                  note: 'Collects anonymized browsing data on our public website to help us understand traffic and improve the service.',
                },
              ].map((sp) => (
                <div key={sp.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white font-semibold">{sp.name} <span className="text-slate-500 font-normal">— {sp.role}</span></p>
                  <p className="mt-1">{sp.note}</p>
                  <a
                    href={sp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition text-xs mt-1 inline-block"
                  >
                    Privacy Policy →
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Data Retention</h2>
            <p>
              We retain your account and order data for as long as your account is active. If you close your
              account, we may retain certain records for up to 7 years to comply with legal and tax obligations.
              Hosting credentials are deleted within 30 days of account closure.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Security</h2>
            <p>
              We use industry-standard measures to protect your data, including HTTPS/TLS encryption in
              transit, hashed passwords, and access-controlled databases. No method of transmission or storage
              is 100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-slate-300">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-slate-300">Correction:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-slate-300">Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
              <li><strong className="text-slate-300">Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-slate-300">Opt-out:</strong> Opt out of non-essential communications</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:text-cyan-300 transition">hello@nethost.co</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Cookies</h2>
            <p>
              Our website uses session cookies for authentication and anonymous analytics cookies via Google
              Analytics. You can disable cookies in your browser settings, though doing so may affect
              functionality of the account portal.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us with personal data, contact
              us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the effective
              date above and notify you via email for material changes. Continued use of our services
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">11. Contact</h2>
            <p>Questions or requests about this Privacy Policy can be directed to:</p>
            <div className="mt-3 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <p className="text-white font-semibold">NETHOST</p>
              <p>2719 Hollywood Blvd, Suite L-287</p>
              <p>Hollywood, FL 33020</p>
              <p>
                Email:{' '}
                <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:text-cyan-300 transition">hello@nethost.co</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
