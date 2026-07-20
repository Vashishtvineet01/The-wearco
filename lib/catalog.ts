import { prisma } from "./prisma";
import type { Product, ProductCategory, ProductColor } from "./products";

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
  const rows = await prisma.product.findMany({
    where: { active: true },
    include,
    orderBy: { createdAt: "asc" }
  });
  return rows.map(mapDbProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { slug, active: true },
    include
  });
  return row ? mapDbProduct(row) : null;
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
