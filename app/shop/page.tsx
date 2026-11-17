import { Suspense } from "react";
import Link from "next/link";
import ShopClient from "@/components/ShopClient";
import Aurora from "@/components/Aurora";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — TheWearCo",
  description: "Browse limited drops: tees, hoodies and caps for founders and creators."
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <section className="spotlight-violet relative mb-12 overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 px-6 py-10 md:px-10 md:py-14">
        <Aurora
          blobs={[
            { color: "violet", size: 380, top: "-120px", left: "-100px", opacity: 0.5 },
            { color: "lime", size: 340, top: "-80px", right: "-80px", delay: 3, opacity: 0.42 },
            { color: "coral", size: 300, bottom: "-140px", right: "28%", delay: 6, opacity: 0.4, slow: true },
          ]}
        />
        <span aria-hidden className="pointer-events-none absolute left-[7%] top-[18%] text-2xl text-signal-violet/55 animate-float">✦</span>
        <span aria-hidden className="pointer-events-none absolute right-[11%] top-[30%] text-xl text-signal-coral/60 animate-float" style={{ animationDelay: "900ms" }}>✦</span>
        <header className="relative flex animate-fade-in-up flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Shop
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">
              All drops, <span className="gradient-text">all uniforms</span>
            </h1>
            <p className="mt-3 max-w-xl text-paper-700">
              Limited edition pieces for founders, creators, freelancers and the
              terminally online. Or skip the catalog and{" "}
              <Link href="/design" className="text-signal-limeInk underline-offset-4 hover:underline">
                print your own
              </Link>
              .
            </p>
          </div>
        </header>
      </section>

      <Suspense fallback={<div className="card p-10 text-center text-paper-600">Loading catalog…</div>}>
        <ShopClient products={products} />
      </Suspense>
    </div>
  );
}
