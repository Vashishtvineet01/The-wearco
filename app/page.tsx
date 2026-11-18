import Link from "next/link";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import ProductMockup from "@/components/ProductMockup";
import ScrollReveal from "@/components/ScrollReveal";
import { getActiveProducts } from "@/lib/catalog";
import type { Product, ProductCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 4);
  const drops = Array.from(new Set(products.map((p) => p.drop)));

  return (
    <>
      <Hero />
      <Marquee
        items={[
          "BUILDING…",
          "LATE NIGHT SHIPPING",
          "v1.0",
          "OFFLINE MODE",
          "FOUNDER ENERGY",
          "INTERNET UNIFORM"
        ]}
      />
      <FeaturedProducts featured={featured} />
      <PrintYourOwnSection />
      <DropsTimeline drops={drops} />
      <CommunitySection />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-24">
        <div className="lg:col-span-7">
          <div className="mb-6 flex animate-fade-in-up items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-paper-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
              Drop 03 — live
            </span>
          </div>

          <h1
            className="animate-fade-in-up font-display text-5xl font-bold leading-[0.92] tracking-tight text-paper-900 md:text-7xl lg:text-[86px]"
            style={{ animationDelay: "120ms" }}
          >
            TheWearCo
            <br />
            <span className="gradient-text">Internet uniform.</span>
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-in-up text-base leading-relaxed text-paper-600 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Premium tees, hoodies and caps for founders and builders — or open
            the Design Studio and print your own line in 5–7 days. No minimums.
          </p>

          <p
            className="mt-3 animate-fade-in-up font-mono text-[11px] uppercase tracking-[0.18em] text-paper-500"
            style={{ animationDelay: "300ms" }}
          >
            Worn by 2,400+ founders · Free shipping over ₹1,499
          </p>

          <div
            className="mt-9 flex animate-fade-in-up flex-wrap items-center gap-3"
            style={{ animationDelay: "360ms" }}
          >
            <Link href="/shop" className="btn-primary">
              Shop the drops
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/design" className="btn-ghost">
              Design your own
            </Link>
          </div>

          <div
            className="mt-12 flex animate-fade-in-up items-center gap-8 border-t border-paper-200 pt-8 text-xs text-paper-600"
            style={{ animationDelay: "480ms" }}
          >
            <Stat label="Founders wearing" value="2,400+" />
            <Stat label="Drops sold out" value="07" />
            <Stat label="Avg. ship time" value="48h" />
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="absolute -inset-4 rounded-[2rem] bg-paper-100/70 md:-inset-6" aria-hidden />
          <div className="relative grid grid-cols-2 gap-4">
            <HeroCard fabric="#0e0e10" tagline="Building…" badge="Tee" tilt="-rotate-1" cat="tee" delay={200} />
            <HeroCard fabric="#ece7dd" tagline="v1.0" badge="Hoodie" tilt="rotate-2 mt-8" cat="hoodie" delay={320} />
            <HeroCard fabric="#0e0e10" tagline="Ship It" badge="Mug" tilt="rotate-1" cat="mug" shape="cylinder" delay={440} />
            <HeroCard fabric="#cfc0ab" tagline="v1" badge="Badge" tilt="-rotate-2" cat="badge" shape="circle" delay={560} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({
  fabric,
  tagline,
  badge,
  tilt,
  cat,
  shape,
  delay = 0
}: {
  fabric: string;
  tagline: string;
  badge: string;
  tilt: string;
  cat: ProductCategory;
  shape?: "rect" | "circle" | "cylinder" | "full";
  delay?: number;
}) {
  return (
    <div
      className={`relative animate-fade-in-up rounded-2xl border border-paper-200/80 bg-paper-50/90 p-3 transition-transform duration-500 ${tilt} hover:rotate-0 hover:-translate-y-2 hover:scale-[1.02]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute left-3 top-3 z-10 rounded-full border border-paper-300 bg-paper-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-700">
        {badge}
      </div>
      <div
        className="w-full animate-float-soft"
        style={{ animationDelay: `${delay % 600}ms` }}
      >
        <ProductMockup
          category={cat}
          fabric={fabric}
          printShape={shape}
          printText={tagline}
          printColor={isLight(fabric) ? "#0a0a0a" : "#f7f7f7"}
          className="mx-auto max-h-[260px]"
        />
      </div>
    </div>
  );
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative">
      <div className="font-display text-2xl font-bold text-paper-900">
        <span className="gradient-text">{value}</span>
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
        {label}
      </div>
    </div>
  );
}

function FeaturedProducts({ featured }: { featured: Product[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                Featured
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
                The current <span className="gradient-text">uniform</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm text-paper-700 transition hover:text-signal-limeInk md:inline"
            >
              View all →
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ScrollReveal key={p.slug} delay={i * 90}>
              <ProductCard product={p} />
            </ScrollReveal>
          ))}
        </div>
      </div>
      <div className="aurora-divider mx-auto mt-6 max-w-5xl" />
    </section>
  );
}

function PrintYourOwnSection() {
  return (
    <section className="relative overflow-hidden border-y border-paper-200 bg-white/40">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <ScrollReveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            The Design Studio
          </div>
          <h2 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Print your <span className="gradient-text">own</span> design.
            <br />
            Made in 5 minutes.
          </h2>
          <p className="mt-5 max-w-xl text-base text-paper-700 md:text-lg">
            Drop your artwork, type your line, pick the garment, position it on
            the canvas — and we print, ship and deliver. No minimums. No bullshit.
          </p>

          <ul className="mt-7 grid gap-3 text-sm text-paper-800">
            {[
              ["01", "Upload PNG, SVG, JPG — or just type text"],
              ["02", "Position, rotate, scale on the live mockup"],
              ["03", "Pick a tee, hoodie, sweatshirt, cap, mug, badge or poster"],
              ["04", "We DTG-print and ship in 5–7 days"]
            ].map(([n, t]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="font-mono text-xs text-signal-limeInk">{n}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/design" className="btn-primary">
              Start designing
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/product/blank-canvas-tee" className="btn-ghost">
              See the blank canvas
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="card-ink aurora-border relative p-6">
            <div className="absolute left-6 top-6 tag border-white/15 bg-white/10 text-paper-50">
              // preview.live
            </div>
            <div className="tag-aurora absolute right-6 top-6">Editing</div>
            <div className="mt-12 w-full animate-float">
              <ProductMockup
                category="tee"
                fabric="#0e0e10"
                printText="MY STARTUP"
                printColor="#d8ff36"
                showPrintArea
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">size</div>
                <div className="mt-1 font-display font-semibold text-paper-50">L</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">color</div>
                <div className="mt-1 flex justify-center">
                  <span className="h-4 w-4 rounded-full border border-white/30 bg-paper-100" />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">price</div>
                <div className="mt-1 font-display font-semibold text-signal-lime">₹999</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function DropsTimeline({ drops }: { drops: string[] }) {
  const tint = ["card-violet", "card-coral", "card-lime", "card-sky"] as const;
  return (
    <section className="band-ocean relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <ScrollReveal>
        <div className="mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Drops
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Limited drops, <span className="gradient-text">monthly.</span>
          </h2>
          <p className="mt-3 max-w-xl text-paper-700">
            Each drop is themed, AI-curated, and capped. When it&apos;s gone, it&apos;s gone.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid gap-4 lg:grid-cols-3">
        {drops.map((d, i) => (
          <ScrollReveal key={d} delay={i * 120}>
            <div className={`${tint[i % tint.length]} aurora-border group relative p-6`}>
              <div className="font-mono text-xs text-paper-500">
                DROP / {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 font-display text-2xl font-semibold">{d}</div>
              <p className="mt-2 text-sm text-paper-600">{dropDescription(d)}</p>
              <div className="mt-6 flex items-center gap-2 text-xs">
                <span
                  className={`tag ${
                    i === 2
                      ? "border-signal-lime/50 bg-signal-lime/20 text-signal-limeInk"
                      : i === 1
                        ? "border-signal-coral/40 bg-signal-coral/10 text-signal-coral"
                        : ""
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === 2 ? "animate-glow bg-signal-lime" : i === 1 ? "bg-signal-coral" : "bg-ink-300"
                    }`}
                  />
                  {i === 2 ? "Live now" : i === 1 ? "Sold out" : "Archived"}
                </span>
                <Link href="/shop" className="ml-auto text-paper-700 transition hover:text-signal-limeInk">
                  Browse →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
      </div>
    </section>
  );
}

function dropDescription(drop: string) {
  if (drop.includes("Founder")) return "For the operators. Heavyweight tees and hoodies with chest typelines.";
  if (drop.includes("Internet")) return "Quiet, minimal pieces. The default uniform of online builders.";
  if (drop.includes("QR")) return "Each piece carries a hidden QR. Scan to unlock playlists & community access.";
  if (drop.includes("Studio")) return "Your art, your line — printed on-demand by us.";
  return "";
}

function CommunitySection() {
  const perks = [
    { label: "Late Night Founders Discord", surface: "card-violet" },
    { label: "Monthly office hours", surface: "card-coral" },
    { label: "Early drops", surface: "card-lime" },
    { label: "AI-curated playlists", surface: "card-sky" },
  ] as const;

  return (
    <section className="band-violet relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <ScrollReveal>
          <div className="card-feature aurora-border relative grid gap-10 overflow-hidden p-8 md:p-14 lg:grid-cols-2">
            <div className="absolute -right-32 -top-32 h-72 w-72 animate-drift rounded-full bg-signal-violet/35 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-72 w-72 animate-drift-slow rounded-full bg-signal-coral/25 blur-3xl" />

            <div className="relative">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
                // Members only
              </div>
              <h3 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
                Every piece is a <span className="gradient-text">key.</span>
              </h3>
              <p className="mt-4 max-w-md text-paper-700">
                Scan the QR on your hoodie or cap to unlock the founder Discord,
                monthly office hours with builders we love, and early access to
                every drop.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/community" className="btn-primary">
                  Join the room
                </Link>
                <Link href="/shop" className="btn-ghost">
                  Find your key
                </Link>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-3">
              {perks.map((perk, i) => (
                <ScrollReveal key={perk.label} delay={i * 80}>
                  <div className={`${perk.surface} p-4`}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-limeInk">
                      PERK
                    </div>
                    <div className="mt-2 font-display text-base font-semibold">{perk.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
