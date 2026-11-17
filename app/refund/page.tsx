import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — TheWearCo",
  description:
    "Our refund, exchange and cancellation policy for drops and custom prints.",
};

const EFFECTIVE = "17 November 2026";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Refund policy
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Refund &amp; Cancellation
      </h1>
      <p className="mt-2 text-sm text-paper-600">Effective {EFFECTIVE}.</p>

      <div className="prose-styles mt-10 space-y-6 text-paper-800">
        <Section title="1. Cancellations before dispatch">
          <p>
            You can cancel a drop order any time before it has been dispatched for
            a full refund — just reply to your order confirmation email or write to{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>{" "}
            with your order number.
          </p>
          <p>
            <strong>Custom prints</strong> are made-to-order and enter production
            within 24 hours. Once production has started we cannot cancel or refund
            them.
          </p>
        </Section>

        <Section title="2. 7-day exchange on drops">
          <p>
            We offer a 7-day easy exchange on standard drop pieces (unworn,
            unwashed, with original tags). Reach out within 7 days of delivery and
            we&apos;ll arrange a reverse pickup.
          </p>
        </Section>

        <Section title="3. Refunds for defects or wrong items">
          <p>
            If a piece arrives damaged, defective, or is different from what you
            ordered, we&apos;ll replace it at our cost or issue a full refund — your
            choice. Just email us within 48 hours of delivery with photos.
          </p>
        </Section>

        <Section title="4. How refunds are issued">
          <ul className="list-disc space-y-2 pl-6">
            <li>UPI, cards, netbanking — refunded to the original payment method via Razorpay, usually within 5-7 working days.</li>
            <li>Cash on Delivery — refunded via UPI to a number you confirm.</li>
            <li>COD handling fee (₹49) is non-refundable on cancellations after dispatch.</li>
          </ul>
        </Section>

        <Section title="5. What&apos;s not eligible">
          <ul className="list-disc space-y-2 pl-6">
            <li>Custom prints (except for defects or wrong prints).</li>
            <li>Items that have been worn, washed or had tags removed.</li>
            <li>Requests made more than 7 days after delivery (48 hours for defects).</li>
          </ul>
        </Section>

        <Section title="6. Contact">
          <p>
            All exchange and refund requests go to{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>{" "}
            with your order number in the subject line.{" "}
            <Link href="/track" className="text-signal-violetInk underline">
              Track your order
            </Link>{" "}
            if you&apos;ve lost the number.
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
