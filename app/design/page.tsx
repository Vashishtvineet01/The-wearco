import type { Metadata } from "next";
import { Suspense } from "react";
import DesignHub from "@/components/DesignHub";
import BrandLoader from "@/components/BrandLoader";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design — TheWearCo",
  description:
    "Design and print on tees, hoodies, caps, mugs and more — one piece or a team order. Same premium fabric, same DTG print.",
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
