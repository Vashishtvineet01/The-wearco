"use client";

import Link from "next/link";
import { formatINR } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";

export default function WishlistClient() {
  const { items, remove, clear, hydrated, count } = useWishlist();
  const { add } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-paper-200" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-paper-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-paper-900">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-paper-500">
            {count === 0
              ? "Nothing saved yet."
              : `${count} saved piece${count === 1 ? "" : "s"}`}
          </p>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-paper-600 underline-offset-4 hover:text-paper-900 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-paper-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff8eb] text-[#b45309]">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.8 5.6a4.6 4.6 0 0 0-6.5 0L12 7.9l-2.3-2.3a4.6 4.6 0 1 0-6.5 6.5l2.3 2.3L12 21l6.5-6.6 2.3-2.3a4.6 4.6 0 0 0 0-6.5Z" />
            </svg>
          </div>
          <p className="mx-auto mt-4 max-w-sm text-sm text-paper-600">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-12 items-center rounded-lg bg-paper-900 px-6 text-sm font-bold uppercase tracking-[0.06em] text-white"
          >
            Browse drops
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.slug}
              className="relative overflow-hidden rounded-xl border border-[#e8e8e8] bg-white"
            >
              <button
                type="button"
                onClick={() => remove(item.slug)}
                aria-label="Remove from wishlist"
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#f59e0b] bg-white text-[#b45309] shadow-sm transition hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20.8 5.6a4.6 4.6 0 0 0-6.5 0L12 7.9l-2.3-2.3a4.6 4.6 0 1 0-6.5 6.5l2.3 2.3L12 21l6.5-6.6 2.3-2.3a4.6 4.6 0 0 0 0-6.5Z" />
                </svg>
              </button>

              <Link href={`/product/${item.slug}`} className="block p-4">
                <div
                  className="grid min-h-[200px] place-items-center rounded-xl"
                  style={{
                    background:
                      isDark(item.fabricHex) ? "#eaeae2" : "#14110e",
                  }}
                >
                  <ProductMockup
                    category={(item.category as "tee") || "tee"}
                    fabric={item.fabricHex}
                    printArea={item.printArea}
                    printShape={item.printShape}
                    printText={(item.name || "WEAR").split(/\s+/)[0]?.toUpperCase()}
                    printColor={item.printDefault || "#fde68a"}
                    className="mx-auto max-w-[220px]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold text-paper-900">
                      {item.name}
                    </h2>
                    {item.tagline && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-paper-500">
                        {item.tagline}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 font-mono text-sm">
                    {formatINR(item.price)}
                  </div>
                </div>
              </Link>

              <div className="flex gap-2 border-t border-paper-100 p-3">
                <Link
                  href={`/product/${item.slug}`}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg border border-paper-300 text-sm font-semibold text-paper-800 transition hover:border-paper-900"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    add({
                      id: `${item.slug}-M-${item.colorName}-${Date.now()}`,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      qty: 1,
                      size: "M",
                      color: item.colorName,
                      colorHex: item.colorHex,
                      fabricHex: item.fabricHex,
                      category: item.category,
                    });
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg bg-paper-900 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:bg-paper-800"
                >
                  Add to bag
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 180;
}
