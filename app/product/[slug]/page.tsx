import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import ProductBuyPanel from "@/components/ProductBuyPanel";
import { getActiveProducts, getProductBySlug } from "@/lib/catalog";
import { formatINR } from "@/lib/products";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found — TheWearCo" };
  return {
    title: `${product.name} — TheWearCo`,
    description: product.tagline,
    openGraph: {
      title: product.name,
      description: `${product.tagline} · ${formatINR(product.price)}`
    }
  };
}

export async function generateStaticParams() {
  try {
    const products = await getActiveProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const all = await getActiveProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <nav className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
        <Link href="/shop" className="hover:text-ink-100">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-200">{product.drop}</span>
      </nav>

      <ProductBuyPanel product={product} />

      <div className="mt-24">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">
          You might also wear
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
