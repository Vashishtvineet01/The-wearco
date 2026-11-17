import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — TheWearCo",
  description:
    "How TheWearCo collects, uses and protects your personal information.",
};

const EFFECTIVE = "17 November 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Privacy
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-paper-600">Effective {EFFECTIVE}.</p>

      <div className="prose-styles mt-10 space-y-6 text-paper-800">
        <Section title="1. Who we are">
          <p>
            TheWearCo (&quot;we&quot;, &quot;us&quot;) is an Indian direct-to-consumer apparel
            brand operated from Bengaluru. This policy describes how we collect
            and use personal information when you visit{" "}
            <Link href="/" className="text-signal-violetInk underline">the-wearco.vercel.app</Link>{" "}
            or purchase from us.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Order data</strong> — name, shipping address, email, phone, GST number (if provided), items ordered, uploaded design artwork.</li>
            <li><strong>Payment metadata</strong> — Razorpay order and payment IDs. We never see or store full card numbers, UPI PINs or CVVs.</li>
            <li><strong>Account data</strong> (if you create one) — email and your saved addresses.</li>
            <li><strong>Technical data</strong> — anonymised page analytics and error logs to debug and improve the site.</li>
          </ul>
        </Section>

        <Section title="3. How we use it">
          <ul className="list-disc space-y-2 pl-6">
            <li>To accept orders, process payments and ship your products.</li>
            <li>To send transactional email (order confirmation, dispatch and delivery updates).</li>
            <li>To respond to support requests and improve the product.</li>
            <li>To send marketing email only if you explicitly subscribe. You can unsubscribe at any time.</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Razorpay</strong> — for payment processing.</li>
            <li><strong>Shipping partners</strong> (Delhivery, Shiprocket, India Post) — your delivery address only.</li>
            <li><strong>Resend</strong> — email delivery (order confirmations, dispatch updates).</li>
            <li><strong>Hosting</strong> — Vercel (website) and encrypted storage for uploaded design files.</li>
          </ul>
          <p>We do not sell your data to third parties. Ever.</p>
        </Section>

        <Section title="5. How long we keep it">
          <p>
            Order records are retained for 7 years to meet Indian tax and consumer-law
            obligations. Uploaded design artwork is kept for 90 days after dispatch,
            then deleted. Account data is kept until you ask us to delete it.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            You can request access to, correction of, or deletion of your personal
            data by emailing{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>
            . We respond within 30 days.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use strictly-necessary cookies (session + cart) and lightweight,
            privacy-respecting analytics. We do not use third-party advertising
            cookies.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            We update this policy when our practices change. The &quot;Effective&quot; date
            at the top reflects the current version.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Grievance officer: TheWearCo, Bengaluru, Karnataka, India ·{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-paper-900">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed md:text-base">{children}</div>
    </section>
  );
}
