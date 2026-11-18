import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Community — TheWearCo",
  description:
    "Every TheWearCo piece is a key. Scan the QR, unlock the founder Discord, monthly office hours, and early access to every drop.",
};

/**
 * Real community page — the old nav link labelled 'Community' used to
 * drop users on the Manifesto. This page is now actually about the member
 * layer: QR unlock flow, Discord, office hours, drop previews.
 */
export default function CommunityPage() {
  return (
    <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
      <section className="relative pb-10 pt-2 text-center md:pb-14">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 bg-paper-400" />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Community
          </div>
          <span aria-hidden className="h-px w-8 bg-paper-400" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper-900 md:text-6xl">
          Every piece is a <span className="gradient-text">key.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-paper-600 md:text-lg">
          A hidden QR on every hoodie, cap and badge. Scan it to unlock the
          founder Discord, monthly office hours and early access to every drop.
        </p>
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
            Open call at 7pm IST. Hosted by the TheWearCo team. Bring one question
            about the thing you&apos;re shipping. No pitch decks, no networking
            bingo — just operators talking to operators.
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
            Want the founder stories first? See who&apos;s wearing the drops on
            the homepage — this page stays focused on getting you in.
          </p>
          <Link
            href="/#worn-by"
            className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
          >
            See who&apos;s wearing it →
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-paper-200 pt-14 md:grid-cols-2 md:gap-16">
        <ScrollReveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Already own a piece?
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper-900">
            Find the QR, scan, unlock.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-paper-600">
            Every hoodie has it tucked inside the hem. Every cap, inside the
            sweatband. Every badge, on the back. Scan with any camera — the
            invite link opens in Discord.
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
            Not ready to join yet?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-paper-600">
            Get a heads-up when the next drop goes live. No spam, ever.
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
    d: "Hidden on the sleeve, hem or sweatband. Any camera app will open the invite link.",
  },
  {
    n: "02",
    h: "Prove you own it",
    d: "A one-tap verify handshake confirms the piece hasn't been unlocked before.",
  },
  {
    n: "03",
    h: "You're in",
    d: "Dropped straight into the founder Discord, with your member role waiting.",
  },
];

const OFFICE_HOUR_TOPICS = [
  { k: "Product", v: "what to ship, what to cut" },
  { k: "Distribution", v: "finding the first 100 real users" },
  { k: "Hiring", v: "founding team, contractors, when to pay" },
  { k: "Operations", v: "tools, bookkeeping, keeping sane" },
];
