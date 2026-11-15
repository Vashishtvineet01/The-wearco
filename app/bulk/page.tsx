import type { Metadata } from "next";
import BulkClient from "@/components/BulkClient";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk orders — TheWearCo",
  description:
    "Volume pricing for teams, conferences and launches. Tees, hoodies, mugs, pins, posters — printed with your artwork. From 10 units, discounts up to 50%."
};

export default async function BulkPage() {
  const products = await getActiveProducts();
  return <BulkClient products={products} />;
}
