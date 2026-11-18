import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollReveal from "@/components/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <section className="relative mb-12 pb-10 pt-2">
        <div className="flex items-center gap-3">
          <span aria-hidden className="hidden h-px w-8 bg-paper-400 sm:block" />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            About
          </div>
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper-900 md:text-6xl">
          A store for apparel &amp; prints.
          <br />
          <span className="gradient-text">Plus a studio to design your own.</span>
        </h1>
        <div aria-hidden className="mt-10 h-px max-w-3xl bg-paper-200" />
      </section>

      <ScrollReveal>
        <div className="prose-styles space-y-6 text-lg leading-relaxed text-paper-700">
          <p>
            TheWearCo is a shopping destination for premium tees, hoodies, caps,
            mugs, badges and posters — and a place to{" "}
            <span className="text-paper-900">print your own design</span> with
            no minimums.
          </p>
          <p>
            Browse ready-to-wear drops in the shop, or open the Design Studio:
            upload artwork, type a line, place it on a live mockup, and we print
            and ship in 5–7 days. Need ten or a hundred? Switch to team orders
            for volume pricing.
          </p>
          <p>
            Everything is printed and finished in small batches in India. Quality
            fabric, clean prints, guest checkout — and a members layer on select
            pieces if you want extras.
          </p>
          <p>
            Start in the{" "}
            <Link
              href="/shop"
              className="text-paper-900 underline underline-offset-4 hover:text-paper-700"
            >
              shop
            </Link>{" "}
            or jump straight into{" "}
            <Link
              href="/design"
              className="text-paper-900 underline underline-offset-4 hover:text-paper-700"
            >
              Design Studio
            </Link>
            .
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="mt-16 border-y border-paper-200 py-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Two ways to buy
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Ready-made <span className="gradient-text">or made by you.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-600 md:text-base">
            Shop limited editions as they drop, or customize any blank in the
            Design Studio. Same fabric, same print quality either way.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Browse the shop →
            </Link>
            <Link href="/design" className="btn-ghost">
              Design your own
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <div className="mt-16" id="shipping">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-paper-400" />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Logistics
          </div>
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Shipping & returns
        </h2>
        <dl className="mt-8 divide-y divide-paper-200 border-y border-paper-200">
          {SHIPPING_FACTS.map((f, i) => (
            <ScrollReveal key={f.t} delay={i * 60}>
              <div className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr] sm:gap-8">
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-500">
                  {f.t}
                </dt>
                <dd className="text-sm leading-relaxed text-paper-800 md:text-base">
                  {f.d}
                </dd>
              </div>
            </ScrollReveal>
          ))}
        </dl>
      </div>

      <ScrollReveal delay={100}>
        <div className="mt-20 border-t border-paper-200 pt-14 text-center">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-8 bg-paper-400" />
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
              Drop alerts
            </div>
            <span aria-hidden className="h-px w-8 bg-paper-400" />
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Be first when something <span className="gradient-text">new drops.</span>
          </h3>
          <p className="mx-auto mt-3 max-w-md text-paper-600">
            New products and studio updates. No spam.
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            <NewsletterForm variant="stacked" buttonLabel="Join the list" />
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

const SHIPPING_FACTS = [
  {
    t: "Free shipping",
    d: "Free shipping above ₹1,499 across India.",
  },
  {
    t: "Standard delivery",
    d: "48 hours metro, 3–5 days elsewhere.",
  },
  {
    t: "Custom prints",
    d: "Design Studio pieces ship in 5–7 working days.",
  },
  {
    t: "Easy exchange",
    d: "7-day exchange on standard drops. Custom pieces are non-refundable.",
  },
];
