import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import Aurora from "@/components/Aurora";

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
      {/* Hero — wrapped in an aurora bed so the Community lands with real colour. */}
      <section className="spotlight-sunrise relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 px-6 py-12 text-center md:px-10 md:py-16">
        <Aurora
          blobs={[
            { color: "coral", size: 440, top: "-160px", left: "-120px", opacity: 0.5 },
            { color: "violet", size: 380, top: "-80px", right: "-90px", delay: 3, opacity: 0.45 },
            { color: "lime", size: 320, bottom: "-160px", right: "28%", delay: 6, opacity: 0.4, slow: true },
            { color: "sky", size: 300, bottom: "-120px", left: "-60px", delay: 9, opacity: 0.35, slow: true },
          ]}
        />
        <span aria-hidden className="pointer-events-none absolute left-[9%] top-[22%] text-2xl text-signal-coral/60 animate-float">✦</span>
        <span aria-hidden className="pointer-events-none absolute right-[11%] top-[32%] text-xl text-signal-violet/60 animate-float" style={{ animationDelay: "900ms" }}>✦</span>
        <span aria-hidden className="pointer-events-none absolute left-[46%] bottom-[18%] text-lg text-signal-limeInk/70 animate-float" style={{ animationDelay: "1800ms" }}>✦</span>
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Community
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Every piece <span className="gradient-text">is a key.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-paper-700">
            A hidden QR on every hoodie, cap and badge. Scan it to unlock the
            founder Discord, monthly office hours and early access to every
            drop.
          </p>
        </div>
      </section>

      {/* QR unlock steps */}
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {UNLOCK_STEPS.map((s) => (
          <div key={s.n} className="card p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // {s.n}
            </div>
            <div className="mt-3 font-display text-xl font-semibold">
              {s.h}
            </div>
            <p className="mt-2 text-sm text-paper-600">{s.d}</p>
          </div>
        ))}
      </div>

      {/* Office hours card */}
      <div className="mt-14 overflow-hidden rounded-2xl border border-paper-200 bg-paper-100/50 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Office hours
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              First Thursday <br />
              <span className="text-paper-700">of every month.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-paper-600 md:text-base">
              Open call at 7pm IST. Hosted by the TheWearCo team. Bring one
              question about the thing you&apos;re shipping. No pitch decks, no
              networking bingo — just operators talking to operators.
            </p>
          </div>
          <div className="relative">
            <div className="grid gap-3">
              {OFFICE_HOUR_TOPICS.map((t) => (
                <div
                  key={t.k}
                  className="flex items-center gap-3 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-limeInk">
                    {t.k}
                  </span>
                  <span className="text-sm text-paper-800">{t.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members strip */}
      <div className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Members
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Shipping, live.
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-xs text-paper-600 md:block">
            Invites roll out as drops ship. The Discord stays small on purpose.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {MEMBERS.map((m) => (
            <div
              key={m.handle}
              className="card p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold text-ink-950"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-semibold">
                    {m.name}
                  </div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-wider text-paper-500">
                    {m.handle}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-paper-700">{m.shipping}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-paper-200 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-paper-600">
                <span className="h-1 w-1 rounded-full bg-signal-lime" />
                Wearing {m.piece}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values strip (moved from /about#community so About stays a true manifesto) */}
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.t} className="card p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // {v.t}
            </div>
            <div className="mt-3 font-display text-xl font-semibold">{v.h}</div>
            <p className="mt-2 text-sm text-paper-600">{v.d}</p>
          </div>
        ))}
      </div>

      {/* CTA: unlock via QR / newsletter */}
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col justify-between overflow-hidden p-8">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Already own a piece?
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
              Find the QR, scan, unlock.
            </h3>
            <p className="mt-3 text-sm text-paper-700">
              Every hoodie has it tucked inside the hem. Every cap, inside the
              sweatband. Every badge, on the back. Scan with any camera — the
              invite link opens in Discord.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/shop" className="btn-ghost">
              Browse QR-tagged pieces →
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden p-8 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Drop alerts
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
            Not ready to join yet?
          </h3>
          <p className="mt-3 text-sm text-paper-700">
            Get a heads-up when the next drop goes live. No spam, ever.
          </p>
          <NewsletterForm variant="centered" buttonLabel="Notify me" />
        </div>
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

const MEMBERS = [
  {
    initials: "KR",
    name: "Kavya Rao",
    handle: "@kavyabuilds",
    piece: "v1.0 Hoodie",
    shipping: "Payments infra for Indian freelancers. Shipped v1 last month.",
    color: "linear-gradient(135deg,#7c5cff,#ff5c3b)",
  },
  {
    initials: "AN",
    name: "Arjun Nair",
    handle: "@arjunwrites",
    piece: "Offline Mode Tee",
    shipping: "Weekly newsletter on operator mindset. 4,200 readers and climbing.",
    color: "linear-gradient(135deg,#ff5c3b,#d8ff36)",
  },
  {
    initials: "PM",
    name: "Priya Mehta",
    handle: "@priyacreates",
    piece: "QR Secret Hoodie",
    shipping: "A no-code studio for small restaurants. 30 customers, bootstrapped.",
    color: "linear-gradient(135deg,#d8ff36,#7cd0ff)",
  },
  {
    initials: "ZS",
    name: "Zaid Sheikh",
    handle: "@zaidbuilds",
    piece: "Late Night Cap",
    shipping: "AI code-review tool for small teams. 280 active devs on the beta.",
    color: "linear-gradient(135deg,#7cd0ff,#7c5cff)",
  },
];

const VALUES = [
  {
    t: "01",
    h: "Made in India",
    d: "All garments printed and stitched in small batches in Bengaluru and Tirupur.",
  },
  {
    t: "02",
    h: "Premium fabric only",
    d: "240–400 GSM combed cotton and brushed fleece. No fast-fashion shortcuts.",
  },
  {
    t: "03",
    h: "Members-only layer",
    d: "Every QR-tagged piece unlocks our founder Discord and monthly office hours.",
  },
];
