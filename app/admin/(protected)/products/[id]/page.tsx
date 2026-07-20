import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductByIdAdmin } from "@/lib/catalog";
import type { ProductCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductByIdAdmin(params.id);
  if (!product) notFound();

  const initial = {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    category: product.category as ProductCategory,
    price: product.price,
    drop: product.drop,
    description: product.description,
    details: JSON.parse(product.details) as string[],
    printArea: JSON.parse(product.printArea) as { x: number; y: number; w: number; h: number },
    customizable: product.customizable,
    active: product.active,
    colors: product.colors.map((c) => ({
      name: c.name,
      hex: c.hex,
      fabric: c.fabric,
      printDefault: c.printDefault
    })),
    sizes: product.sizes.map((s) => s.label)
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Edit product</h1>
      <ProductForm mode="edit" productId={product.id} initial={initial} />
    </div>
  );
}
