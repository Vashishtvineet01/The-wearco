import Link from "next/link";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import ProductMockup from "@/components/ProductMockup";
import { products } from "@/lib/products";

export default function HomePage() {
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
    <section className="grid-bg noise relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-signal-lime/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-12 lg:px-8 lg:py-28">
        <div className="lg:col-span-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-lime" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200">
              Drop 03 — QR Layer is live
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[88px]">
            Internet uniform <br />
            for the people <br />
            <span className="text-signal-lime">building it themselves.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-ink-200 md:text-lg">
            Premium tees, hoodies and caps for founders, creators and freelancers.
            Or skip our drops entirely — open the Design Studio and print your own.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn-primary">
              Shop the drops
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/studio" className="btn-ghost">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
              Open Design Studio
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-8 text-xs text-ink-300">
            <Stat label="Founders wearing" value="2,400+" />
            <Stat label="Drops sold out" value="07" />
            <Stat label="Avg. ship time" value="48h" />
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative grid grid-cols-2 gap-3">
            <HeroCard fabric="#0e0e10" tagline="Building…" badge="Tee" tilt="-rotate-2" cat="tee" />
            <HeroCard fabric="#ece7dd" tagline="v1.0" badge="Hoodie" tilt="rotate-3 mt-10" cat="hoodie" />
            <HeroCard fabric="#2a2a2d" tagline="Offline" badge="Cap" tilt="rotate-1 -mt-4" cat="cap" />
            <HeroCard fabric="#d8ff36" tagline="Founder" badge="Tee" tilt="-rotate-3" cat="tee" />
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
  cat
}: {
  fabric: string;
  tagline: string;
  badge: string;
  tilt: string;
  cat: "tee" | "hoodie" | "cap";
}) {
  return (
    <div
      className={`card relative ${tilt} transition hover:translate-y-[-4px] hover:rotate-0`}
    >
      <div className="absolute left-3 top-3 z-10 tag">{badge}</div>
      <ProductMockup
        category={cat}
        fabric={fabric}
        printText={tagline}
        printColor={isLight(fabric) ? "#0a0a0a" : "#f7f7f7"}
        className="max-h-[260px]"
      />
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
    <div>
      <div className="font-display text-xl font-semibold text-ink-50">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
        {label}
      </div>
    </div>
  );
}

function FeaturedProducts({ featured }: { featured: typeof products }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Featured
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
            The current uniform
          </h2>
        </div>
        <Link href="/shop" className="hidden text-sm text-ink-200 hover:text-signal-lime md:inline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

function PrintYourOwnSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-gradient-to-b from-ink-900 to-ink-950">
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-signal-lime/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // The Design Studio
          </div>
          <h2 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Print your <span className="text-signal-lime">own</span> design.
            <br />
            Made in 5 minutes.
          </h2>
          <p className="mt-5 max-w-xl text-base text-ink-200 md:text-lg">
            Drop your artwork, type your line, pick the garment, position it on
            the canvas — and we print, ship and deliver. No minimums. No bullshit.
          </p>

          <ul className="mt-7 grid gap-3 text-sm text-ink-100">
            {[
              ["01", "Upload PNG, SVG, JPG — or just type text"],
              ["02", "Position, rotate, scale on the live mockup"],
              ["03", "Choose tee, hoodie or cap + color + size"],
              ["04", "We DTG-print and ship in 5–7 days"]
            ].map(([n, t]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="font-mono text-xs text-signal-lime">{n}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio" className="btn-primary">
              Start designing
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/product/blank-canvas-tee" className="btn-ghost">
              See the blank canvas
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="card relative p-6">
            <div className="absolute left-6 top-6 tag">// preview.live</div>
            <div className="absolute right-6 top-6 tag border-signal-lime/40 bg-signal-lime/10 text-signal-lime">
              Editing
            </div>
            <div className="mt-12">
              <ProductMockup
                category="tee"
                fabric="#0e0e10"
                printText="MY STARTUP"
                printColor="#d8ff36"
                showPrintArea
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="card p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-ink-400">size</div>
                <div className="mt-1 font-display font-semibold">L</div>
              </div>
              <div className="card p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-ink-400">color</div>
                <div className="mt-1 flex justify-center">
                  <span className="h-4 w-4 rounded-full border border-white/30 bg-ink-900" />
                </div>
              </div>
              <div className="card p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-ink-400">price</div>
                <div className="mt-1 font-display font-semibold">₹999</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DropsTimeline({ drops }: { drops: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
          // Drops
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
          Limited drops, monthly.
        </h2>
        <p className="mt-3 max-w-xl text-ink-200">
          Each drop is themed, AI-curated, and capped. When it’s gone, it’s gone.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {drops.map((d, i) => (
          <div key={d} className="card group relative p-6 transition hover:border-white/30">
            <div className="font-mono text-xs text-ink-400">DROP / {String(i + 1).padStart(2, "0")}</div>
            <div className="mt-2 font-display text-2xl font-semibold">{d}</div>
            <p className="mt-2 text-sm text-ink-300">
              {dropDescription(d)}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="tag">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === 2 ? "animate-glow bg-signal-lime" : "bg-ink-300"
                  }`}
                />
                {i === 2 ? "Live now" : i === 1 ? "Sold out" : "Archived"}
              </span>
              <Link href="/shop" className="ml-auto text-ink-200 hover:text-signal-lime">
                Browse →
              </Link>
            </div>
          </div>
        ))}
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
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="card relative grid gap-10 p-8 md:p-14 lg:grid-cols-2">
          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-signal-violet/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-signal-lime/10 blur-3xl" />

          <div className="relative">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
              // Members only
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Every piece is a key.
            </h3>
            <p className="mt-4 max-w-md text-ink-200">
              Scan the QR on your hoodie or cap to unlock the founder Discord,
              monthly office hours with builders we love, and early access to
              every drop.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about#community" className="btn-primary">Join the room</Link>
              <Link href="/shop" className="btn-ghost">Find your key</Link>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            {["Late Night Founders Discord", "Monthly office hours", "Early drops", "AI-curated playlists"].map(
              (perk) => (
                <div
                  key={perk}
                  className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime">
                    PERK
                  </div>
                  <div className="mt-2 font-display text-base font-semibold">{perk}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
