"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR, type Product } from "@/lib/products";
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

/**
 * Build the short label we actually print on the garment mockup.
 *
 * Product names like "Building… Oversized Tee" overflow the print area.
 * We want something that reads as a brand mark, not a wrapped sentence:
 *   - 1-word names ≤ 7 chars stay as-is ("v1.0", "Late", "QR", "Blank").
 *   - Longer first words get trimmed with no ellipsis ("Building…" → "BUILD").
 *   - Short category tokens get a 2-letter acronym when the first word
 *     itself is too long and has siblings ("Offline Mode Tee" → "OFL").
 */
function printLabelFor(product: Product): string {
  const first = (product.name || "").split(/\s+/)[0]?.replace(/[….]+$/g, "") ?? "";
  if (first.length <= 7) return first.toUpperCase();
  // Keep the first 5 chars for recognisability ("BUILD", "OFFLI", "FOUND").
  return first.slice(0, 5).toUpperCase();
}

/** Drop labels can be long ("Drop 01 — Founder Energy"). The chip only has
 * room for ~60% of the card width, so keep the part before the em dash. */
function shortDrop(drop: string): string {
  return drop.split(/[—–-]/)[0].trim();
}

export default function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-hover aurora-border group relative block p-4"
    >
      {/* Slim aurora accent bar at the top edge — always faintly on, expands on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-[3px] origin-left scale-x-50 rounded-full bg-signal-coral opacity-80 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100"
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
          // Light theme: LIGHT fabrics (bone, lime) get a soft midnight backdrop so
          // the garment silhouette pops. DARK fabrics (obsidian, graphite) get a soft
          // paper wash that still lets them read without putting black on white.
          background: isDarkFabric(color.fabric)
            ? "linear-gradient(180deg, rgba(234,234,226,0.9) 0%, rgba(214,212,201,0.9) 100%)"
            : "linear-gradient(180deg, rgba(28,24,58,0.92) 0%, rgba(15,13,26,0.95) 100%)",
          // Enable container queries so the mockup can size its print text
          // relative to the card width instead of the viewport width.
          containerType: "inline-size"
        }}
      >
        {/* Soft radial accent behind the mockup so it pops without a flat color block. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background: isDarkFabric(color.fabric)
              ? "radial-gradient(60% 50% at 50% 55%, rgba(225,29,46,0.2), transparent 70%)"
              : "radial-gradient(60% 50% at 50% 55%, rgba(245,158,11,0.22), transparent 70%)"
          }}
        />
        <div className="relative w-full transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.05]">
          <ProductMockup
            category={product.category}
            fabric={color.fabric}
            printArea={product.printArea}
            printShape={product.printShape}
            printText={printLabelFor(product)}
            printColor={color.printDefault}
            className="mx-auto max-w-[280px]"
          />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-paper-600">{product.tagline}</p>
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
