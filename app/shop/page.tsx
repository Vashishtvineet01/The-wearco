import { Suspense } from "react";
import Link from "next/link";
import ShopClient from "@/components/ShopClient";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — TheWearCo",
  description: "Browse limited drops: tees, hoodies and caps for founders and creators."
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Shop
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">
            All drops, all uniforms
          </h1>
          <p className="mt-3 max-w-xl text-ink-200">
            Limited edition pieces for founders, creators, freelancers and the
            terminally online. Or skip the catalog and{" "}
            <Link href="/studio" className="text-signal-lime underline-offset-4 hover:underline">
              print your own
            </Link>
            .
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="card p-10 text-center text-ink-300">Loading catalog…</div>}>
        <ShopClient products={products} />
      </Suspense>
    </div>
  );
}
