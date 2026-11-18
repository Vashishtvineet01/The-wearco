"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatINR, type Product, type ProductColor } from "@/lib/products";
import ProductMockup from "./ProductMockup";

/** Perceptual-luminance check used to pick a contrasting backdrop per fabric. */
function isDarkFabric(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 180;
}

function printLabelFor(product: Product): string {
  const first = (product.name || "").split(/\s+/)[0]?.replace(/[….]+$/g, "") ?? "";
  if (first.length <= 7) return first.toUpperCase();
  return first.slice(0, 5).toUpperCase();
}

function shortDrop(drop: string): string {
  return drop.split(/[—–-]/)[0].trim();
}

export default function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState<ProductColor>(product.colors[0]);
  const [display, setDisplay] = useState<ProductColor>(product.colors[0]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (color.name === display.name) return;
    setFading(true);
    const id = window.setTimeout(() => {
      setDisplay(color);
      setFading(false);
    }, 160);
    return () => window.clearTimeout(id);
  }, [color, display.name]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-hover aurora-border group relative block p-4"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-[3px] origin-left scale-x-50 rounded-full bg-[#b45309] opacity-80 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100"
      />
      <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-2">
        <span className="tag max-w-[55%] min-w-0">
          <span className="truncate">{shortDrop(product.drop)}</span>
        </span>
        {product.customizable && (
          <span className="tag-aurora shrink-0">Printable</span>
        )}
      </div>

      <div
        className="relative mt-2 grid min-h-[220px] place-items-center overflow-hidden rounded-xl transition-all duration-500"
        style={{
          background: isDarkFabric(display.fabric) ? "#eaeae2" : "#14110e",
          containerType: "inline-size",
        }}
      >
        <div
          className={`relative w-full transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.05] ${
            fading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
          }`}
        >
          <ProductMockup
            category={product.category}
            fabric={display.fabric}
            printArea={product.printArea}
            printShape={product.printShape}
            printText={printLabelFor(product)}
            printColor={display.printDefault}
            className="mx-auto max-w-[280px]"
          />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0 translate-y-0.5 transition duration-300 group-hover:translate-y-0">
          <h3 className="truncate font-display text-base font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-paper-600">{product.tagline}</p>
        </div>
        <div className="shrink-0 translate-y-0.5 font-mono text-sm transition duration-300 group-hover:translate-y-0">
          {formatINR(product.price)}
        </div>
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
                ? "border-white ring-1 ring-[#b45309]/60"
                : "border-paper-300 hover:border-paper-500"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-paper-500">
          {product.sizes.length} sizes
        </span>
      </div>
    </Link>
  );
}
