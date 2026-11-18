import Link from "next/link";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import ProductMockup from "@/components/ProductMockup";
import ScrollReveal from "@/components/ScrollReveal";
import { getActiveProducts } from "@/lib/catalog";
import {
  CATEGORY_PLURAL_LABELS,
  type Product,
  type ProductCategory,
  type PrintShape,
} from "@/lib/products";

export const dynamic = "force-dynamic";

const HOME_CATEGORIES: {
  id: ProductCategory;
  fabric: string;
  print: string;
  shape?: PrintShape;
  sample: string;
}[] = [
  { id: "tee", fabric: "#0e0e10", print: "#f7f7f7", sample: "TEE" },
  { id: "hoodie", fabric: "#ece7dd", print: "#0a0a0a", sample: "v1" },
  { id: "sweatshirt", fabric: "#2a2a2d", print: "#f7f7f7", sample: "CREW" },
  { id: "cap", fabric: "#0e0e10", print: "#d8ff36", sample: "CAP" },
  { id: "mug", fabric: "#ece7dd", print: "#0a0a0a", shape: "cylinder", sample: "MUG" },
  { id: "badge", fabric: "#0e0e10", print: "#d8ff36", shape: "circle", sample: "PIN" },
  { id: "poster", fabric: "#ece7dd", print: "#0a0a0a", shape: "full", sample: "ART" },
];

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 4);
  const drops = Array.from(new Set(products.map((p) => p.drop)));

  return (
    <>
      <Hero />
      <Marquee
        items={[
          "CUSTOM PRINT",
          "TEES",
          "HOODIES",
          "POSTERS",
          "NO MINIMUMS",
          "5–7 DAY PRINT",
          "CAPS",
          "MUGS",
        ]}
      />
      <CategoryPosters />
      <FeaturedProducts featured={featured} />
      <PrintYourOwnSection />
      <StudioStories />
      <DropsTimeline drops={drops} />
      <CommunityBand />
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
              Shop · Design · Wear
            </span>
          </div>

          <h1
            className="animate-fade-in-up font-display text-5xl font-bold leading-[0.92] tracking-tight text-paper-900 md:text-7xl lg:text-[86px]"
            style={{ animationDelay: "120ms" }}
          >
            TheWearCo
            <br />
            <span className="gradient-text">Shop it. Design it.</span>
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-in-up text-base leading-relaxed text-paper-600 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Premium tees, hoodies, caps, mugs and posters — ready to buy, or open
            the Design Studio and print your own. No minimums. Ships in 5–7 days.
          </p>

          <p
            className="mt-3 animate-fade-in-up font-mono text-[11px] uppercase tracking-[0.18em] text-paper-500"
            style={{ animationDelay: "300ms" }}
          >
            Free shipping over ₹1,499 · Guest checkout
          </p>

          <div
            className="mt-9 flex animate-fade-in-up flex-wrap items-center gap-3"
            style={{ animationDelay: "360ms" }}
          >
            <Link href="/shop" className="btn-primary">
              Shop now
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
            <Stat label="Categories" value="07+" />
            <Stat label="Custom print" value="5–7d" />
            <Stat label="Min. order" value="1" />
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="absolute -inset-4 rounded-[2rem] bg-paper-100/70 md:-inset-6" aria-hidden />
          <div className="relative grid grid-cols-2 gap-4">
            <HeroCard fabric="#0e0e10" tagline="Shop" badge="Tee" tilt="-rotate-1" cat="tee" delay={200} />
            <HeroCard fabric="#ece7dd" tagline="Design" badge="Hoodie" tilt="rotate-2 mt-8" cat="hoodie" delay={320} />
            <HeroCard fabric="#0e0e10" tagline="Print" badge="Mug" tilt="rotate-1" cat="mug" shape="cylinder" delay={440} />
            <HeroCard fabric="#ece7dd" tagline="ART" badge="Poster" tilt="-rotate-2" cat="poster" shape="full" delay={560} />
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
  delay = 0,
}: {
  fabric: string;
  tagline: string;
  badge: string;
  tilt: string;
  cat: ProductCategory;
  shape?: PrintShape;
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
      <div className="w-full animate-float-soft" style={{ animationDelay: `${delay % 600}ms` }}>
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

function CategoryPosters() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-paper-400" />
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                  Shop by category
                </div>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Everything you can <span className="gradient-text">wear &amp; print.</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
            >
              View all products →
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {HOME_CATEGORIES.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 50}>
              <Link
                href={`/shop?cat=${cat.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-paper-200 bg-paper-50/80 transition hover:border-paper-400"
              >
                <div
                  className="relative grid min-h-[140px] place-items-center px-3 pt-6 sm:min-h-[160px]"
                  style={{ background: isLight(cat.fabric) ? "#efe7db" : "#1a1511" }}
                >
                  <ProductMockup
                    category={cat.id}
                    fabric={cat.fabric}
                    printShape={cat.shape}
                    printText={cat.sample}
                    printColor={cat.print}
                    className="mx-auto max-h-[130px] transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-paper-200 px-4 py-3">
                  <span className="font-display text-sm font-semibold text-paper-900 sm:text-base">
                    {CATEGORY_PLURAL_LABELS[cat.id]}
                  </span>
                  <span className="text-xs text-paper-500 transition group-hover:text-paper-900">
                    Shop →
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ featured }: { featured: Product[] }) {
  return (
    <section className="relative overflow-hidden border-y border-paper-200">
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                In the shop now
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
                Bestsellers &amp; <span className="gradient-text">new arrivals.</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm font-semibold text-paper-900 underline-offset-4 hover:underline md:inline"
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
    </section>
  );
}

function PrintYourOwnSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Design Studio
          </div>
          <h2 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Design your <span className="gradient-text">own</span> piece.
          </h2>
          <p className="mt-5 max-w-xl text-base text-paper-600 md:text-lg">
            Upload art, type a line, place it on a live mockup — we print and ship.
            One piece or a team order. Same premium blanks.
          </p>

          <ul className="mt-7 grid gap-3 text-sm text-paper-800">
            {[
              ["01", "Upload PNG, SVG, JPG — or just type text"],
              ["02", "Position it on the live mockup"],
              ["03", "Tee, hoodie, sweatshirt, cap, mug, badge or poster"],
              ["04", "We print and ship in 5–7 days"],
            ].map(([n, t]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="font-mono text-xs text-paper-500">{n}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/design" className="btn-primary">
              Start designing
            </Link>
            <Link href="/design?view=team" className="btn-ghost">
              Team / bulk orders
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="relative rounded-2xl border border-paper-200 bg-paper-900 p-6 text-paper-50">
            <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
              Live preview
            </div>
            <div className="mt-12 w-full">
              <ProductMockup
                category="tee"
                fabric="#0e0e10"
                printText="YOUR ART"
                printColor="#fde68a"
                showPrintArea
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">size</div>
                <div className="mt-1 font-display font-semibold">L</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">color</div>
                <div className="mt-1 flex justify-center">
                  <span className="h-4 w-4 rounded-full border border-white/30 bg-paper-100" />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="font-mono text-[10px] uppercase text-paper-50/50">from</div>
                <div className="mt-1 font-display font-semibold text-[#fde68a]">₹999</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function StudioStories() {
  return (
    <section id="worn-by" className="relative overflow-hidden border-y border-paper-200">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-paper-400" />
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                  Made with Design Studio
                </div>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Real customers. <span className="gradient-text">Real prints.</span>
              </h2>
              <p className="mt-3 text-sm text-paper-600 md:text-base">
                People using the shop and studio for everyday wear, teams and walls.
              </p>
            </div>
            <Link
              href="/design"
              className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
            >
              Start your design →
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-x-10 gap-y-8 border-t border-paper-200 pt-10 sm:grid-cols-2">
          {STUDIO_STORIES.map((f, i) => (
            <ScrollReveal key={f.handle} delay={i * 70}>
              <blockquote className="flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-[#fff8eb]"
                    style={{ background: f.tone }}
                  >
                    {f.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-paper-900">{f.name}</div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-paper-500">
                      {f.handle} · {f.role}
                    </div>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-base leading-relaxed text-paper-800 md:text-[17px]">
                  “{f.quote}”
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-paper-200 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500">
                    Ordered
                  </span>
                  <span className="font-semibold text-paper-900">{f.piece}</span>
                </div>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STUDIO_STORIES = [
  {
    initials: "KR",
    name: "Kavya Rao",
    handle: "@kavyabuilds",
    role: "Team order",
    piece: "Custom hoodies × 24",
    tone: "#b45309",
    quote:
      "Ordered branded hoodies for the launch team. Studio mockup made approvals easy — they landed in a week.",
  },
  {
    initials: "AN",
    name: "Arjun Nair",
    handle: "@arjunwrites",
    role: "Solo print",
    piece: "Offline Mode Tee",
    tone: "#92400e",
    quote:
      "Bought a ready tee from the shop, then customized a second one with my newsletter logo. Both feel premium.",
  },
  {
    initials: "PM",
    name: "Priya Mehta",
    handle: "@priyacreates",
    role: "Poster drop",
    piece: "Studio Print Poster",
    tone: "#6b4f35",
    quote:
      "Printed menu art as posters for the restaurant. Uploaded the file, picked A2, done.",
  },
  {
    initials: "ZS",
    name: "Zaid Sheikh",
    handle: "@zaidbuilds",
    role: "Merch pack",
    piece: "Caps + badges",
    tone: "#5a4e42",
    quote:
      "Mixed caps and badges for a beta meetup. Guest checkout was quick; tracking was clear.",
  },
];

function DropsTimeline({ drops }: { drops: string[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-paper-400" />
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                  Limited editions
                </div>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Drops in the <span className="gradient-text">shop.</span>
              </h2>
              <p className="mt-3 text-sm text-paper-600 md:text-base">
                Themed, capped runs. When a drop sells out, it&apos;s gone — customize anytime in studio.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
            >
              Browse the shop →
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {drops.map((d, i) => {
            const status =
              i === 2 ? "Live now" : i === 1 ? "Sold out" : "In shop";
            const live = status === "Live now";
            return (
              <ScrollReveal key={d} delay={i * 70}>
                <Link
                  href="/shop"
                  className={`group flex h-full flex-col rounded-2xl border p-5 transition ${
                    live
                      ? "border-paper-900 bg-paper-900 text-paper-50"
                      : "border-paper-200 bg-paper-50/70 hover:border-paper-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-xs ${
                        live ? "text-paper-50/50" : "text-paper-400"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
                        live ? "text-[#fde68a]" : "text-paper-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          live ? "animate-pulse bg-[#fde68a]" : "bg-paper-300"
                        }`}
                      />
                      {status}
                    </span>
                  </div>
                  <h3
                    className={`mt-5 font-display text-lg font-semibold leading-snug tracking-tight ${
                      live ? "text-paper-50" : "text-paper-900"
                    }`}
                  >
                    {shortDropName(d)}
                  </h3>
                  <p
                    className={`mt-2 flex-1 text-sm leading-relaxed ${
                      live ? "text-paper-50/70" : "text-paper-600"
                    }`}
                  >
                    {dropDescription(d)}
                  </p>
                  <div
                    className={`mt-5 text-sm font-semibold transition ${
                      live
                        ? "text-[#fde68a] group-hover:underline"
                        : "text-paper-900 group-hover:underline"
                    }`}
                  >
                    Shop →
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function shortDropName(drop: string) {
  const parts = drop.split("—").map((s) => s.trim());
  return parts.length > 1 ? parts[1] : drop;
}

function dropDescription(drop: string) {
  if (drop.includes("Late Night"))
    return "Heavyweight tees and hoodies — limited edition staples.";
  if (drop.includes("Essentials"))
    return "Everyday pieces: tees, caps, mugs and badges.";
  if (drop.includes("QR"))
    return "Select pieces with a hidden QR for member extras.";
  if (drop.includes("Studio"))
    return "Blanks and prints made for custom Design Studio orders.";
  return "Limited run available in the shop.";
}

function CommunityBand() {
  return (
    <section className="relative overflow-hidden border-t border-paper-200">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 md:flex-row md:items-center lg:px-8">
        <div className="max-w-xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Optional extras
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Some pieces unlock <span className="gradient-text">member perks.</span>
          </h3>
          <p className="mt-2 text-sm text-paper-600">
            QR-tagged items can open invites and early access. Nice to have — not
            required to shop or design.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/community" className="btn-ghost">
            How it works
          </Link>
          <Link href="/shop" className="btn-primary">
            Back to shop
          </Link>
        </div>
      </div>
    </section>
  );
}
