import { Suspense } from "react";
import Link from "next/link";
import ShopClient from "@/components/ShopClient";
import PageHero from "@/components/PageHero";
import ProductMockup from "@/components/ProductMockup";
import { getActiveProducts } from "@/lib/catalog";
import { formatINR } from "@/lib/products";
import { ANDROID_APP_URL } from "@/lib/android-app";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — TheWearCo",
  description:
    "Browse limited drops: tees, hoodies and caps for founders and creators.",
};

export default async function ShopPage() {
  const products = await getActiveProducts();
  const featured =
    products.find((p) => /qr|live|03/i.test(p.drop)) || products[0];

  return (
    <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <PageHero
        eyebrow="Shop all"
        title={
          <>
            Limited drops, <span className="gradient-text">live now.</span>
          </>
        }
        subtitle={
          <>
            Edition pieces for founders and builders — or skip the catalog and{" "}
            <Link
              href="/design"
              className="text-signal-limeInk underline-offset-4 hover:underline"
            >
              print your own
            </Link>
            .
          </>
        }
        spotlight="violet"
      />

      {featured && (
        <Link
          href={`/product/${featured.slug}`}
          className="group mt-10 grid overflow-hidden rounded-[28px] border border-paper-200 bg-[#0a0b0f] shadow-[0_24px_80px_-48px_rgba(10,11,15,0.55)] lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="relative min-h-[280px] overflow-hidden bg-[#0a0b0f] p-8 md:min-h-[340px]">
            <div className="absolute left-6 top-6 z-10 flex gap-2">
              <span className="rounded-full border border-signal-coral/40 bg-signal-coral/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-coral">
                Live now
              </span>
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/75">
                {featured.drop}
              </span>
            </div>
            <div className="relative mx-auto mt-8 max-w-sm transition-transform duration-500 group-hover:scale-[1.04]">
              <ProductMockup
                category={featured.category}
                fabric={featured.colors[0]?.fabric || "#1a1a1a"}
                printArea={featured.printArea}
                printShape={featured.printShape}
                printText={featured.name.split(" ")[0]}
                printColor={featured.colors[0]?.printDefault || "#f7f7f7"}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-white/10 p-8 text-paper-50 lg:border-l lg:border-t-0 lg:p-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime/90">
              // Featured
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {featured.name}
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/70">
              {featured.tagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-display text-2xl font-bold">
                {formatINR(featured.price)}
              </span>
              <span className="rounded-full bg-signal-coral px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition group-hover:shadow-[0_8px_28px_-8px_rgba(225,29,46,0.7)]">
                View piece →
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-12">
        <Suspense
          fallback={
            <div className="card p-10 text-center text-paper-600">
              Loading catalog…
            </div>
          }
        >
          <ShopClient products={products} />
        </Suspense>
      </div>

      <div className="mt-16 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[28px] border border-paper-200 bg-paper-50/80 p-6 md:flex-row md:items-center md:p-8">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Android
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Shop from the app
          </h3>
          <p className="mt-2 max-w-md text-sm text-paper-600">
            Browse drops, design studio, and QR unlocks on Android. Direct APK
            — no Play Store wait.
          </p>
        </div>
        <a
          href={ANDROID_APP_URL}
          download="thewearco-android.apk"
          className="btn-primary shrink-0"
        >
          Download Android app
        </a>
      </div>
    </div>
  );
}
