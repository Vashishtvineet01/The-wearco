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
      className="card-hover group relative block p-4"
    >
      <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-2">
        <span className="tag max-w-[60%] truncate">{product.drop}</span>
        {product.customizable && (
          <span className="tag-aurora shrink-0">Printable</span>
        )}
      </div>

      <div className="relative mt-2 grid place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-ink-900 to-ink-950 transition-all duration-500 group-hover:from-ink-800">
        <div className="w-full transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03]">
          <ProductMockup
            category={product.category}
            fabric={color.fabric}
            printArea={product.printArea}
            printShape={product.printShape}
            printText={product.name.split(" ")[0]}
            printColor={color.printDefault}
            className="mx-auto max-w-[280px]"
          />
        </div>
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
