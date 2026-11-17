import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import Aurora from "@/components/Aurora";
import ScrollReveal from "@/components/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      {/* Manifesto hero — aurora wash + sparkles so the opening line lands with force. */}
      <section className="spotlight-ocean relative mb-12 overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 px-6 py-12 md:px-10 md:py-16">
        <Aurora
          blobs={[
            { color: "violet", size: 420, top: "-140px", left: "-120px", opacity: 0.55 },
            { color: "sky", size: 360, top: "-60px", right: "-80px", delay: 3, opacity: 0.45 },
            { color: "lime", size: 320, bottom: "-160px", left: "32%", delay: 6, opacity: 0.42, slow: true },
            { color: "peach", size: 300, bottom: "-120px", right: "-60px", delay: 9, opacity: 0.36, slow: true },
          ]}
        />
        <span aria-hidden className="pointer-events-none absolute left-[7%] top-[20%] text-2xl text-signal-violet/60 animate-float">✦</span>
        <span aria-hidden className="pointer-events-none absolute right-[9%] top-[30%] text-xl text-signal-coral/60 animate-float" style={{ animationDelay: "900ms" }}>✦</span>
        <span aria-hidden className="pointer-events-none absolute left-[55%] bottom-[18%] text-lg text-signal-limeInk/70 animate-float" style={{ animationDelay: "1800ms" }}>✦</span>
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Manifesto
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Clothing for the people <br />
            <span className="gradient-text">building it themselves.</span>
          </h1>
        </div>
      </section>

      <ScrollReveal>
        <div className="prose-styles space-y-6 text-lg leading-relaxed text-paper-700">
          <p>
            TheWearCo is not a fashion brand. It’s an{" "}
            <span className="text-paper-900">internet uniform</span> — quiet,
            identity-first clothing for founders, creators, freelancers and the
            terminally online.
          </p>
          <p>
            We design slowly, drop in small batches, and embed culture into every
            piece — from a chest typeline to a hidden QR on a sleeve that
            unlocks a private community.
          </p>
          <p>
            And if our drops don’t say what you’re trying to say, you can{" "}
            <Link href="/design" className="text-signal-limeInk underline-offset-4 hover:underline">
              print your own
            </Link>
            . That’s the whole point.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="card-feature aurora-border mt-14 p-6 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Members-only layer
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Every piece is a <span className="gradient-text">key.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-paper-700 md:text-base">
            Hidden QR on every hoodie, cap and badge. Scan it to unlock the
            founder Discord, monthly office hours and early access to every drop.
          </p>
          <div className="mt-5">
            <Link href="/community" className="btn-primary">
              See how the community works →
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <div className="mt-16" id="shipping">
        <h2 className="font-display text-2xl font-bold">Shipping & returns</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SHIPPING_FACTS.map((f, i) => (
            <ScrollReveal key={f.t} delay={i * 80}>
              <div className={`${f.surface} p-4`}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-limeInk">
                  {f.t}
                </div>
                <p className="mt-2 text-sm text-paper-800">{f.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <ScrollReveal delay={100}>
        <div className="mt-20">
          <div className="card-lime aurora-border overflow-hidden p-8 text-center md:p-14">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Drop alerts
            </div>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Be the first to wear it.
            </h3>
            <p className="mt-3 text-paper-600">No spam. New drops + community invites only.</p>
            <NewsletterForm variant="centered" buttonLabel="Join" />
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
    surface: "card-violet",
  },
  {
    t: "Standard delivery",
    d: "48 hours metro, 3–5 days elsewhere.",
    surface: "card-coral",
  },
  {
    t: "Custom prints",
    d: "Design Studio pieces ship in 5–7 working days.",
    surface: "card-lime",
  },
  {
    t: "Easy exchange",
    d: "7-day exchange on standard drops. Custom pieces are non-refundable.",
    surface: "card-sky",
  },
];
