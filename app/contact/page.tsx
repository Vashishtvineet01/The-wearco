import type { Metadata } from "next";
import Link from "next/link";
import Aurora from "@/components/Aurora";

export const metadata: Metadata = {
  title: "Contact — TheWearCo",
  description:
    "Reach the TheWearCo team for orders, bulk quotes, press and partnerships.",
};

export default function ContactPage() {
  return (
    <div className="relative mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-20">
      <section className="spotlight-violet relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 px-6 py-14 text-center md:px-10 md:py-20">
        <Aurora
          blobs={[
            { color: "violet", size: 420, top: "-140px", left: "-120px", opacity: 0.5 },
            { color: "coral", size: 360, top: "-60px", right: "-80px", delay: 3, opacity: 0.42 },
            { color: "lime", size: 320, bottom: "-140px", left: "32%", delay: 6, opacity: 0.38, slow: true },
          ]}
        />
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Contact
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Say <span className="gradient-text">hi.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-paper-700">
            Orders, bulk quotes, press, collabs, hiring — the whole team reads
            everything that lands in the inbox. We reply within one business day.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Channel
          eyebrow="// Orders & Returns"
          title="hi@thewearco.com"
          sub="For anything about an existing order, refund, exchange, or missing delivery."
          href="mailto:hi@thewearco.com?subject=Order%20query"
          cta="Email us"
        />
        <Channel
          eyebrow="// Bulk & Teams"
          title="hi@thewearco.com"
          sub="For 10+ pieces, launches, conferences and co-branded drops. We quote in 1 business day."
          href="/design?view=team"
          cta="Request a quote →"
        />
        <Channel
          eyebrow="// Press & Partnerships"
          title="hello@thewearco.com"
          sub="For PR, podcasts, creator collabs and press enquiries."
          href="mailto:hello@thewearco.com?subject=Press%20enquiry"
          cta="Email press"
        />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Office
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">TheWearCo HQ</h3>
          <p className="mt-2 text-sm text-paper-700">
            Bengaluru, Karnataka 560001<br />
            India
          </p>
          <p className="mt-3 text-xs text-paper-500">
            Appointment-only — we don&apos;t have a retail counter yet.
          </p>
        </div>
        <div className="card p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Hours
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">Mon–Sat · 10am to 7pm IST</h3>
          <p className="mt-2 text-sm text-paper-700">
            Email replies land within one business day. Weekend messages are
            answered first thing Monday.
          </p>
          <p className="mt-3 text-xs text-paper-500">
            For order status, the fastest check is{" "}
            <Link href="/track" className="text-signal-violetInk underline">
              /track
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Channel({
  eyebrow,
  title,
  sub,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="card flex h-full flex-col justify-between p-6">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          {eyebrow}
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold break-words">
          {title}
        </h3>
        <p className="mt-2 text-sm text-paper-700">{sub}</p>
      </div>
      <Link href={href} className="btn-ghost mt-5 self-start">
        {cta}
      </Link>
    </div>
  );
}
