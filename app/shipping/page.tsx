import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy — TheWearCo",
  description:
    "Delivery timelines, fees, tracking and international shipping for TheWearCo orders.",
};

const EFFECTIVE = "17 November 2026";

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Shipping
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Shipping &amp; Delivery
      </h1>
      <p className="mt-2 text-sm text-paper-600">Effective {EFFECTIVE}.</p>

      <div className="prose-styles mt-10 space-y-6 text-paper-800">
        <Section title="1. Delivery timelines (India)">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Drops</strong> (ready-to-ship pieces): dispatched within 48 hours. Delivered in 2-4 working days to metros, 3-7 days to the rest of India.</li>
            <li><strong>Custom prints</strong> (Design Studio): dispatched in 4-5 working days. Delivered within 5-7 working days of order.</li>
            <li><strong>Bulk orders</strong>: timelines are confirmed when your quote is accepted — typically 10-14 working days from artwork sign-off.</li>
          </ul>
        </Section>

        <Section title="2. Shipping fees">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Free</strong> standard shipping on all orders ≥ ₹1,499.</li>
            <li><strong>₹99</strong> flat shipping fee below ₹1,499.</li>
            <li><strong>₹49</strong> extra handling fee on Cash on Delivery (any order value).</li>
          </ul>
        </Section>

        <Section title="3. Tracking">
          <p>
            You&apos;ll get a dispatch email with the tracking URL as soon as the courier
            picks up your order. You can also check status any time at{" "}
            <a href="/track" className="text-signal-violetInk underline">/track</a>{" "}
            using your email + order number.
          </p>
        </Section>

        <Section title="4. Shipping partners">
          <p>
            We ship with Delhivery, Shiprocket (multi-carrier) and India Post
            depending on your pincode. Expedited delivery for metros is attempted
            where supported.
          </p>
        </Section>

        <Section title="5. Delays &amp; undelivered orders">
          <p>
            If your order hasn&apos;t arrived within 10 working days of dispatch, write
            to{" "}
            <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">
              hi@thewearco.com
            </a>{" "}
            with your order number and we&apos;ll chase the courier. If a package is
            returned to us as undelivered, we&apos;ll reach out to reschedule or refund.
          </p>
        </Section>

        <Section title="6. International shipping">
          <p>
            We don&apos;t ship outside India in v1. If you want to place a bulk order
            that ships internationally, open a{" "}
            <a href="/design?view=team" className="text-signal-violetInk underline">
              bulk quote
            </a>{" "}
            and mention the destination — we quote per-country.
          </p>
        </Section>

        <Section title="7. Address accuracy">
          <p>
            Please double-check your address and pincode before paying. We can&apos;t
            redirect a package once dispatched; any re-shipping costs for a wrong
            address are borne by the customer.
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
