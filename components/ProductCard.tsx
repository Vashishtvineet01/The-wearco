"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR, type Product } from "@/lib/products";
import ProductMockup from "./ProductMockup";

export default function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 transition hover:border-white/20"
    >
      <div className="absolute left-4 top-4 z-10">
        <span className="tag">{product.drop}</span>
      </div>
      {product.customizable && (
        <div className="absolute right-4 top-4 z-10">
          <span className="tag border-signal-lime/40 bg-signal-lime/10 text-signal-lime">
            Printable
          </span>
        </div>
      )}

      <div className="relative mt-2 grid place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-ink-900 to-ink-950 transition group-hover:from-ink-800">
        <ProductMockup
          category={product.category}
          fabric={color.fabric}
          printArea={product.printArea}
          printText={product.name.split(" ")[0]}
          printColor={color.printDefault}
          className="max-w-[280px]"
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-ink-300">{product.tagline}</p>
        </div>
        <div className="shrink-0 font-mono text-sm">{formatINR(product.price)}</div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {product.colors.map((c) => (
          <button
            key={c.name}
            onClick={(e) => {
              e.preventDefault();
              setColor(c);
            }}
            aria-label={c.name}
            className={`h-4 w-4 rounded-full border transition ${
              color.name === c.name
                ? "border-white"
                : "border-white/20 hover:border-white/50"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-400">
          {product.sizes.length} sizes
        </span>
      </div>
    </Link>
  );
}
