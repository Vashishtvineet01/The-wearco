import { prisma } from "./prisma";
import { products as seedProducts, type Product, type ProductCategory, type ProductColor } from "./products";

/** Parse a DB product (with colors/sizes) into the storefront Product shape. */
export function mapDbProduct(p: {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  drop: string;
  description: string;
  details: string;
  printArea: string;
  customizable: boolean;
  colors: {
    name: string;
    hex: string;
    fabric: string;
    printDefault: string;
    sortOrder: number;
  }[];
  sizes: { label: string; sortOrder: number }[];
}): Product {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category as ProductCategory,
    price: p.price,
    drop: p.drop,
    description: p.description,
    details: JSON.parse(p.details) as string[],
    printArea: JSON.parse(p.printArea) as Product["printArea"],
    customizable: p.customizable,
    colors: [...p.colors]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(
        (c): ProductColor => ({
          name: c.name,
          hex: c.hex,
          fabric: c.fabric,
          printDefault: c.printDefault
        })
      ),
    sizes: [...p.sizes].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.label)
  };
}

const include = {
  colors: { orderBy: { sortOrder: "asc" as const } },
  sizes: { orderBy: { sortOrder: "asc" as const } }
};

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include,
      orderBy: { createdAt: "asc" }
    });
    if (rows.length > 0) return rows.map(mapDbProduct);
  } catch (e) {
    console.error("[catalog] getActiveProducts failed, using seed catalog", e);
  }
  return seedProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, active: true },
      include
    });
    if (row) return mapDbProduct(row);
  } catch (e) {
    console.error("[catalog] getProductBySlug failed, using seed catalog", e);
  }
  return seedProducts.find((p) => p.slug === slug) || null;
}

export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    include,
    orderBy: { createdAt: "desc" }
  });
}

export async function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include
  });
}
