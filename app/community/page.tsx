import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Community — TheWearCo",
  description:
    "Optional member extras on select TheWearCo pieces. Scan the QR to unlock invites and early access — shopping and custom design work without it.",
};

export default function CommunityPage() {
  return (
    <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
      <section className="relative pb-10 pt-2 text-center md:pb-14">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 bg-paper-400" />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Member extras
          </div>
          <span aria-hidden className="h-px w-8 bg-paper-400" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper-900 md:text-6xl">
          Nice perks. <span className="gradient-text">Not required.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-paper-600 md:text-lg">
          Select pieces include a hidden QR. Scan it for invites and early access.
          You can shop and design without unlocking anything.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Browse the shop
          </Link>
          <Link href="/design" className="btn-ghost">
            Design your own
          </Link>
        </div>
        <div aria-hidden className="mx-auto mt-10 h-px max-w-md bg-paper-200" />
      </section>

      <div className="mt-14 grid gap-8 border-y border-paper-200 py-10 md:grid-cols-3 md:gap-10">
        {UNLOCK_STEPS.map((s, i) => (
          <ScrollReveal key={s.n} delay={i * 100}>
            <div>
              <div className="font-mono text-sm text-paper-400">{s.n}</div>
              <div className="mt-3 font-display text-xl font-semibold tracking-tight">
                {s.h}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-paper-600">{s.d}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
        <ScrollReveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Office hours
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            First Thursday <br />
            <span className="gradient-text">of every month.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper-600 md:text-base">
            Open call at 7pm IST for members who unlocked a QR piece. Bring a
            product or design question — keep it practical.
          </p>
        </ScrollReveal>
        <ul className="divide-y divide-paper-200 border-y border-paper-200">
          {OFFICE_HOUR_TOPICS.map((t, i) => (
            <ScrollReveal key={t.k} delay={i * 80}>
              <li className="flex items-baseline gap-4 py-4">
                <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-500">
                  {t.k}
                </span>
                <span className="text-sm text-paper-800">{t.v}</span>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>

      <div className="mt-16 border-y border-paper-200 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-lg text-sm text-paper-600">
            Looking for products or custom prints? Head to the shop or Design
            Studio — this page is only for unlock extras.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
            >
              Shop →
            </Link>
            <Link
              href="/#worn-by"
              className="text-sm font-semibold text-paper-700 underline-offset-4 hover:underline"
            >
              Customer stories →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-paper-200 pt-14 md:grid-cols-2 md:gap-16">
        <ScrollReveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Already own a QR piece?
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper-900">
            Find the QR, scan, unlock.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-paper-600">
            Hoodies: inside the hem. Caps: sweatband. Badges: on the back. Any
            camera opens the invite link.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
          >
            Browse QR-tagged pieces →
          </Link>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Drop alerts
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
            Just want new product news?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-paper-600">
            Get a heads-up when something new hits the shop. No spam.
          </p>
          <div className="mt-5 max-w-sm">
            <NewsletterForm variant="stacked" buttonLabel="Notify me" />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

const UNLOCK_STEPS = [
  {
    n: "01",
    h: "Scan the QR",
    d: "Hidden on the sleeve, hem or sweatband. Any camera app opens the invite link.",
  },
  {
    n: "02",
    h: "Verify ownership",
    d: "A one-tap handshake confirms the piece has not been unlocked before.",
  },
  {
    n: "03",
    h: "You're in",
    d: "Access member extras — invites, office hours, early looks at new drops.",
  },
];

const OFFICE_HOUR_TOPICS = [
  { k: "Product", v: "what to ship, what to cut" },
  { k: "Design", v: "artwork, print placement, bulk setups" },
  { k: "Orders", v: "sizing, timelines, exchanges" },
  { k: "Studio", v: "custom prints and team kits" },
];
