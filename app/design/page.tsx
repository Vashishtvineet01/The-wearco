import type { Metadata } from "next";
import { Suspense } from "react";
import DesignHub from "@/components/DesignHub";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design — TheWearCo",
  description:
    "Print your idea on anything — one piece for yourself in the Studio, or kit out your team with bulk pricing. Same premium fabric, same DTG print.",
};

export default async function DesignPage() {
  const products = await getActiveProducts();
  return (
    <Suspense fallback={<DesignFallback />}>
      <DesignHub products={products} />
    </Suspense>
  );
}

function DesignFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32 text-center lg:px-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Loading design hub…
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight">
        Spinning up your canvas.
      </div>
    </div>
  );
}
