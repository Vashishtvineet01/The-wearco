import { corsPreflight, withCors } from "@/lib/api/cors";
import { calculatePricing } from "@/lib/api/handlers";
import type { ProductCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: ProductCategory[] = [
  "tee",
  "hoodie",
  "sweatshirt",
  "cap",
  "sleeve",
  "mug",
  "badge",
  "poster"
];

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const basePrice = Number(searchParams.get("basePrice"));
  const qty = Number(searchParams.get("qty"));

  if (!category || !VALID_CATEGORIES.includes(category as ProductCategory)) {
    return withCors({ error: "Invalid or missing category" }, { status: 400 });
  }
  if (!basePrice || basePrice <= 0) {
    return withCors({ error: "basePrice must be > 0" }, { status: 400 });
  }
  if (!qty || qty <= 0) {
    return withCors({ error: "qty must be > 0" }, { status: 400 });
  }

  const result = calculatePricing({
    category: category as ProductCategory,
    basePrice,
    qty
  });
  return withCors(result.body, { status: result.status });
}
