import { Suspense } from "react";
import StudioClient from "@/components/StudioClient";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Design Studio — TheWearCo",
  description: "Upload your art or type a line and print it on premium tees, hoodies and caps."
};

export default async function StudioPage() {
  const products = await getActiveProducts();
  const customizable = products.filter((p) => p.customizable);

  return (
    <Suspense fallback={<StudioFallback />}>
      <StudioClient products={customizable.length ? customizable : products} />
    </Suspense>
  );
}

function StudioFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32 text-center lg:px-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
        // Loading studio…
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight">
        Spinning up your canvas.
      </div>
    </div>
  );
}
