import type { Metadata } from "next";
import { Suspense } from "react";
import DesignHub from "@/components/DesignHub";
import BrandLoader from "@/components/BrandLoader";
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
    <Suspense
      fallback={
        <BrandLoader
          eyebrow="Loading design hub"
          title="Spinning up your canvas."
        />
      }
    >
      <DesignHub products={products} />
    </Suspense>
  );
}
