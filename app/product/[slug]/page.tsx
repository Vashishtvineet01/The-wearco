"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatINR, getProduct, products } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { add } = useCart();

  const product = useMemo(() => getProduct(params.slug), [params.slug]);
  const [color, setColor] = useState(product?.colors[0]);
  const [size, setSize] = useState(product?.sizes[1] ?? product?.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product || !color || !size) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-signal-lime">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const handleAdd = () => {
    add({
      id: `${product.slug}-${size}-${color.name}-${Date.now()}`,
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty,
      size,
      color: color.name,
      colorHex: color.hex,
      fabricHex: color.fabric
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <nav className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
        <Link href="/shop" className="hover:text-ink-100">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-200">{product.drop}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="card sticky top-24 self-start overflow-hidden p-6">
          <div className="absolute left-6 top-6 z-10 tag">{product.drop}</div>
          {product.customizable && (
            <div className="absolute right-6 top-6 z-10">
              <Link
                href="/studio"
                className="tag border-signal-lime/40 bg-signal-lime/10 text-signal-lime hover:bg-signal-lime/20"
              >
                Customize this →
              </Link>
            </div>
          )}
          <ProductMockup
            category={product.category}
            fabric={color.fabric}
            printArea={product.printArea}
            printText={product.name.split(" ")[0]}
            printColor={color.printDefault}
          />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                className={`card aspect-square overflow-hidden p-1 transition ${
                  color.name === c.name ? "ring-1 ring-signal-lime" : ""
                }`}
              >
                <ProductMockup
                  category={product.category}
                  fabric={c.fabric}
                  printArea={product.printArea}
                  printText={product.name.split(" ")[0]}
                  printColor={c.printDefault}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-ink-300">{product.tagline}</p>
          <div className="mt-4 font-mono text-2xl">{formatINR(product.price)}</div>

          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
                Color · {color.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                    color.name === c.name
                      ? "border-signal-lime bg-signal-lime/10 text-signal-lime"
                      : "border-white/10 bg-white/[0.02] text-ink-100 hover:border-white/30"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
                Size · {size}
              </span>
              <a href="#sizing" className="text-xs text-ink-300 hover:text-ink-100">
                Size guide
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[48px] rounded-full border px-4 py-1.5 text-xs transition ${
                    size === s
                      ? "border-signal-lime bg-signal-lime/10 text-signal-lime"
                      : "border-white/10 bg-white/[0.02] text-ink-100 hover:border-white/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.02]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-ink-200 hover:text-ink-50"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-ink-200 hover:text-ink-50"
                aria-label="Increase"
              >
                +
              </button>
            </div>

            <button onClick={handleAdd} className="btn-primary flex-1">
              {added ? "Added ✓" : `Add to cart — ${formatINR(product.price * qty)}`}
            </button>
          </div>

          {product.customizable && (
            <div className="mt-4">
              <button
                onClick={() => router.push(`/studio?product=${product.slug}`)}
                className="btn-ghost w-full"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                </svg>
                Print my own design instead
              </button>
            </div>
          )}

          <div className="mt-10 grid gap-4">
            <div className="card p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
                Description
              </div>
              <p className="mt-2 text-sm text-ink-100">{product.description}</p>
              <ul className="mt-4 grid gap-2 text-sm text-ink-200">
                {product.details.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-signal-lime" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5" id="sizing">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
                Shipping
              </div>
              <p className="mt-2 text-sm text-ink-100">
                Free shipping over ₹1,499 across India. Average delivery in 48
                hours metro, 5–7 days for custom prints.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">You might also wear</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
