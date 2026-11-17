import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Terms of Service — TheWearCo",
  description:
    "Terms and conditions for purchasing and using thewearco.com.",
};

const EFFECTIVE = "17 November 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
      <PageHero
        eyebrow="Terms"
        title="Terms of Service"
        subtitle={`Effective ${EFFECTIVE}.`}
        spotlight="lime"
        compact
      />

      <div className="card mt-8 space-y-6 p-6 md:p-8">
        <Section title="1. The deal">
          <p>
            By placing an order on TheWearCo you agree to these terms. If you don&apos;t
            agree, please don&apos;t use the site.
          </p>
        </Section>

        <Section title="2. Who can order">
          <p>
            You must be at least 18 years old (or ordering with a parent/guardian&apos;s
            consent) and able to form a binding contract under Indian law.
          </p>
        </Section>

        <Section title="3. Prices & taxes">
          <p>
            All prices are in Indian Rupees and inclusive of GST where applicable.
            Shipping is free above ₹1,499; a ₹99 flat fee applies otherwise.
            Cash-on-Delivery adds a ₹49 handling fee.
          </p>
        </Section>

        <Section title="4. Payment">
          <p>
            Payment is processed by{" "}
            <a href="https://razorpay.com" rel="noreferrer" target="_blank" className="text-signal-violetInk underline">
              Razorpay
            </a>
            . We accept UPI, debit/credit cards, netbanking and Cash on Delivery.
            Your order is confirmed only when payment is captured (or on dispatch
            for COD).
          </p>
        </Section>

        <Section title="5. Custom prints">
          <p>
            Pieces designed in the <Link href="/design" className="text-signal-violetInk underline">Design Studio</Link>{" "}
            are made-to-order. You are responsible for ensuring you have the rights
            to any artwork you upload. We may refuse or cancel (with a full refund)
            any order that contains illegal, hateful, or infringing material.
          </p>
        </Section>

        <Section title="6. Shipping">
          <p>
            See our <Link href="/shipping" className="text-signal-violetInk underline">Shipping Policy</Link>{" "}
            for delivery timelines and fees.
          </p>
        </Section>

        <Section title="7. Returns & refunds">
          <p>
            See our <Link href="/refund" className="text-signal-violetInk underline">Refund &amp; Cancellation Policy</Link>{" "}
            for the full details.
          </p>
        </Section>

        <Section title="8. Intellectual property">
          <p>
            All TheWearCo branding, drop designs, product photography and site
            content are owned by us. You may not reproduce them without written
            permission. You retain full ownership of artwork you upload for custom
            prints; you grant us a limited licence only to print and ship your order.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, our liability for any claim
            arising from your use of the site or purchase of our products is limited
            to the amount you paid for the specific order in question.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These terms are governed by the laws of India. Any disputes are subject
            to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>
        </Section>

        <Section title="11. Changes">
          <p>
            We may update these terms from time to time. Continued use of the site
            after a change means you accept the new terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions? Write to{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>
            .
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
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-paper-800 md:text-base">{children}</div>
    </section>
  );
}
