import { Suspense } from "react";
import Link from "next/link";
import ShopClient from "@/components/ShopClient";
import PageHero from "@/components/PageHero";
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
      <PageHero
        eyebrow="Shop"
        title={
          <>
            All drops, <span className="gradient-text">all uniforms</span>
          </>
        }
        subtitle={
          <>
            Limited edition pieces for founders, creators, freelancers and the
            terminally online. Or skip the catalog and{" "}
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
    </div>
  );
}
