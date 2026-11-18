"use client";

import { useWishlist } from "@/components/WishlistProvider";
import type { Product } from "@/lib/products";

export default function WishlistButton({
  product,
  colorIndex = 0,
  className = "",
  size = "md",
}: {
  product: Product;
  colorIndex?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { has, toggle, hydrated } = useWishlist();
  const saved = has(product.slug);
  const color = product.colors[colorIndex] || product.colors[0];

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      slug: product.slug,
      name: product.name,
      price: product.price,
      tagline: product.tagline,
      drop: product.drop,
      category: product.category,
      colorName: color.name,
      colorHex: color.hex,
      fabricHex: color.fabric,
      printDefault: color.printDefault,
      printArea: product.printArea,
      printShape: product.printShape,
      customizable: product.customizable,
    });
  };

  const dim =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!hydrated}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`grid ${dim} place-items-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 active:scale-95 ${
        saved
          ? "border-[#f59e0b] text-[#b45309]"
          : "border-paper-200 text-paper-700 hover:border-paper-400"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={icon}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20.8 5.6a4.6 4.6 0 0 0-6.5 0L12 7.9l-2.3-2.3a4.6 4.6 0 1 0-6.5 6.5l2.3 2.3L12 21l6.5-6.6 2.3-2.3a4.6 4.6 0 0 0 0-6.5Z" />
      </svg>
    </button>
  );
}
