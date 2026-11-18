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
      {/* Flat hero — cream card, no mesh gradient */}
      <section className="relative overflow-hidden rounded-3xl border border-paper-200 bg-white px-6 py-12 text-center md:px-10 md:py-16">
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
            // Community
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-paper-900 md:text-6xl">
            Every piece is a <span className="text-signal-coral">key.</span>
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
        {UNLOCK_STEPS.map((s, i) => (
          <ScrollReveal key={s.n} delay={i * 100}>
            <div className="card p-6">
              <div className={s.chip}>{s.n}</div>
              <div className="mt-4 font-display text-xl font-semibold">{s.h}</div>
              <p className="mt-2 text-sm text-paper-600">{s.d}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Office hours card */}
      <div className="band-sunrise mt-14 overflow-hidden rounded-3xl border border-paper-200/80 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <ScrollReveal>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
                // Office hours
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                First Thursday <br />
                <span className="text-signal-coral">of every month.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm text-paper-600 md:text-base">
                Open call at 7pm IST. Hosted by the TheWearCo team. Bring one
                question about the thing you&apos;re shipping. No pitch decks, no
                networking bingo — just operators talking to operators.
              </p>
            </div>
          </ScrollReveal>
          <div className="relative">
            <div className="grid gap-3">
              {OFFICE_HOUR_TOPICS.map((t, i) => (
                <ScrollReveal key={t.k} delay={i * 80}>
                  <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${t.surface}`}
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-coral">
                      {t.k}
                    </span>
                    <span className="text-sm text-paper-800">{t.v}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members strip */}
      <div className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
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
          {MEMBERS.map((m, i) => (
            <ScrollReveal key={m.handle} delay={i * 90}>
              <div className={`${m.surface} p-4`}>
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(225,29,46,0.4)]"
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
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-paper-200/80 bg-white/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-paper-700 backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-lime" />
                  Wearing {m.piece}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Values strip */}
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {VALUES.map((v, i) => (
          <ScrollReveal key={v.t} delay={i * 100}>
            <div className={`${v.surface} aurora-border p-6`}>
              <div className={v.chip}>{v.t}</div>
              <div className="mt-4 font-display text-xl font-semibold">{v.h}</div>
              <p className="mt-2 text-sm text-paper-600">{v.d}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* CTA: unlock via QR / newsletter */}
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <ScrollReveal>
          <div className="card-ink aurora-border flex h-full flex-col justify-between overflow-hidden p-8">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
                // Already own a piece?
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper-50">
                Find the QR, scan, unlock.
              </h3>
              <p className="mt-3 text-sm text-paper-50/70">
                Every hoodie has it tucked inside the hem. Every cap, inside the
                sweatband. Every badge, on the back. Scan with any camera — the
                invite link opens in Discord.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/shop" className="btn-ghost border-white/20 bg-white/10 text-paper-50 hover:bg-white/20">
                Browse QR-tagged pieces →
              </Link>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <div className="card-lime aurora-border flex h-full flex-col justify-between overflow-hidden p-8 text-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
                // Drop alerts
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                Not ready to join yet?
              </h3>
              <p className="mt-3 text-sm text-paper-700">
                Get a heads-up when the next drop goes live. No spam, ever.
              </p>
            </div>
            <NewsletterForm variant="centered" buttonLabel="Notify me" />
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
    surface: "card-violet",
    chip: "chip-violet",
  },
  {
    n: "02",
    h: "Prove you own it",
    d: "A one-tap verify handshake confirms the piece hasn't been unlocked before.",
    surface: "card-coral",
    chip: "chip-coral",
  },
  {
    n: "03",
    h: "You're in",
    d: "Dropped straight into the founder Discord, with your member role waiting.",
    surface: "card-lime",
    chip: "chip-lime",
  },
];

const OFFICE_HOUR_TOPICS = [
  { k: "Product", v: "what to ship, what to cut", surface: "card-violet" },
  { k: "Distribution", v: "finding the first 100 real users", surface: "card-coral" },
  { k: "Hiring", v: "founding team, contractors, when to pay", surface: "card-lime" },
  { k: "Operations", v: "tools, bookkeeping, keeping sane", surface: "card-sky" },
];

const MEMBERS = [
  {
    initials: "KR",
    name: "Kavya Rao",
    handle: "@kavyabuilds",
    piece: "v1.0 Hoodie",
    shipping: "Payments infra for Indian freelancers. Shipped v1 last month.",
    color: "#e11d2e",
    surface: "card-violet",
  },
  {
    initials: "AN",
    name: "Arjun Nair",
    handle: "@arjunwrites",
    piece: "Offline Mode Tee",
    shipping: "Weekly newsletter on operator mindset. 4,200 readers and climbing.",
    color: "#c41626",
    surface: "card-coral",
  },
  {
    initials: "PM",
    name: "Priya Mehta",
    handle: "@priyacreates",
    piece: "QR Secret Hoodie",
    shipping: "A no-code studio for small restaurants. 30 customers, bootstrapped.",
    color: "#b45309",
    surface: "card-lime",
  },
  {
    initials: "ZS",
    name: "Zaid Sheikh",
    handle: "@zaidbuilds",
    piece: "Late Night Cap",
    shipping: "AI code-review tool for small teams. 280 active devs on the beta.",
    color: "#0369a1",
    surface: "card-sky",
  },
];

const VALUES = [
  {
    t: "01",
    h: "Made in India",
    d: "All garments printed and stitched in small batches in Bengaluru and Tirupur.",
    surface: "card-violet",
    chip: "chip-violet",
  },
  {
    t: "02",
    h: "Premium fabric only",
    d: "240–400 GSM combed cotton and brushed fleece. No fast-fashion shortcuts.",
    surface: "card-coral",
    chip: "chip-coral",
  },
  {
    t: "03",
    h: "Members-only layer",
    d: "Every QR-tagged piece unlocks our founder Discord and monthly office hours.",
    surface: "card-lime",
    chip: "chip-lime",
  },
];
