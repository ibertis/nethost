import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const EFFECTIVE = 'May 22, 2026';

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service | NETHOST';
  }, []);
  return (
    <main className="min-h-screen bg-[#050914]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition text-sm mb-10"
        >
          <ArrowLeft size={14} /> Back to Home
        </a>

        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE}</p>

        <div className="prose prose-invert max-w-none space-y-10 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Agreement to Terms</h2>
            <p>
              By signing up for or using any service provided by NETHOST ("we," "us," or "our"), you agree to
              be bound by these Terms of Service. If you do not agree, do not use our services. These terms
              apply to all visitors, customers, and users of nethost.co and app.nethost.co.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Services</h2>
            <p>
              NETHOST provides fully managed web hosting, WordPress installation, domain registration, SSL
              certificates, and related digital services. Services are delivered on a subscription basis and
              provisioned upon successful payment.
            </p>
            <p className="mt-3">
              Service availability is provided on a best-effort basis. While we target high uptime, we do not
              guarantee uninterrupted service and are not liable for downtime caused by factors outside our
              reasonable control, including third-party infrastructure, DNS propagation, or force majeure events.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Subscriptions and Billing</h2>
            <p>
              All hosting plans are billed on a monthly recurring basis. Your subscription renews automatically
              at the end of each billing period unless you cancel before the renewal date.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Payment is processed securely through Stripe. We do not store credit card numbers.</li>
              <li>Prices are in USD. Applicable taxes may be added depending on your location.</li>
              <li>Failed payments may result in service suspension after a grace period.</li>
              <li>Plan pricing is subject to change with 30 days' notice to your registered email address.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Cancellations and Refunds</h2>
            <p>
              You may cancel your subscription at any time from your account dashboard. Upon cancellation, your
              service will remain active through the end of the current billing period. No prorated refunds are
              issued for unused time.
            </p>
            <p className="mt-3">
              If you experience a provisioning failure — that is, you were charged but your website was not
              successfully set up — please contact us at{' '}
              <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:text-cyan-300 transition">hello@nethost.co</a>.
              We will either complete provisioning or issue a full refund at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Acceptable Use</h2>
            <p>You agree not to use NETHOST services to host or transmit content that:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains malware, ransomware, phishing, or other malicious code</li>
              <li>Sends unsolicited bulk email (spam)</li>
              <li>Engages in cryptocurrency mining or other resource-abusive activities</li>
              <li>Threatens, harasses, or abuses any person</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these standards without prior
              notice. Repeated or egregious violations will result in permanent termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials, including
              your WordPress admin password. You agree to notify us immediately at{' '}
              <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:text-cyan-300 transition">hello@nethost.co</a>{' '}
              if you suspect unauthorized access to your account.
            </p>
            <p className="mt-3">
              NETHOST is not liable for losses arising from unauthorized account access caused by your failure
              to safeguard your credentials.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Data and Backups</h2>
            <p>
              We perform regular backups of hosted sites as part of our managed hosting service. However, you
              are ultimately responsible for maintaining independent backups of your own data. NETHOST is not
              liable for data loss under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Intellectual Property</h2>
            <p>
              You retain ownership of all content you publish on your hosted website. By using our services,
              you grant NETHOST a limited license to host, cache, and serve your content as necessary to
              provide the service.
            </p>
            <p className="mt-3">
              The NETHOST name, logo, and all related marks are trademarks of NETHOST. You may not use our
              marks without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, NETHOST and its officers, employees, and agents shall
              not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, or business opportunities.
            </p>
            <p className="mt-3">
              Our total liability to you for any claim arising out of or relating to these terms or our
              services shall not exceed the total amount you paid to us in the three months preceding the
              claim.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and service for any violation of these
              terms, non-payment, or for any other reason at our sole discretion, with or without notice.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by cancelling your subscription and ceasing use of
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">11. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. When we do, we will update the effective date above
              and notify you via email at least 14 days before material changes take effect. Continued use of
              our services after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">12. Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Florida, without regard to its conflict of
              law provisions. Any disputes shall be resolved in the courts of Broward County, Florida.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">13. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <p className="text-white font-semibold">NETHOST</p>
              <p>2719 Hollywood Blvd, Suite L-287</p>
              <p>Hollywood, FL 33020</p>
              <p>
                Email:{' '}
                <a href="mailto:hello@nethost.co" className="text-cyan-400 hover:text-cyan-300 transition">hello@nethost.co</a>
              </p>
              <p>
                Phone:{' '}
                <a href="tel:+18668076242" className="text-cyan-400 hover:text-cyan-300 transition">(866) 807-6242</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
