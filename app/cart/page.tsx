"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatINR, getProduct, type ProductCategory } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";

export default function CartPage() {
  const { items, remove, updateQty, subtotal, count, clear } = useCart();

  const shipping = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
          // Empty
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Your cart&apos;s on offline mode.
        </h1>
        <p className="mt-3 text-ink-300">
          Pick up a drop or print your own line — your call.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Browse drops
          </Link>
          <Link href="/studio" className="btn-ghost">
            Open Design Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Cart
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {count} item{count !== 1 ? "s" : ""}
          </h1>
        </div>
        <button type="button" onClick={clear} className="text-xs text-ink-400 hover:text-signal-coral">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => {
            const product = getProduct(item.slug);
            const category = (item.category || product?.category || "tee") as ProductCategory;
            const printArea = product?.printArea || { x: 30, y: 28, w: 40, h: 30 };
            const printColor =
              product?.colors.find((c) => c.name === item.color)?.printDefault || "#f7f7f7";

            return (
              <div key={item.id} className="card flex gap-4 p-4 sm:p-5">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-ink-900 sm:h-36 sm:w-36">
                  <ProductMockup
                    category={category}
                    fabric={item.fabricHex}
                    printArea={printArea}
                    design={item.custom}
                    printText={!item.custom ? item.name.split(" ")[0] : undefined}
                    printColor={printColor}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-base font-semibold">{item.name}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                        {item.size} · {item.color}
                        {(item.custom?.imageUrl || item.custom?.imageDataUrl) && " · custom art"}
                        {item.custom?.text &&
                          !item.custom.imageUrl &&
                          !item.custom.imageDataUrl &&
                          ` · "${item.custom.text}"`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-xs text-ink-400 hover:text-signal-coral"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-white/10 bg-black/40">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-3 py-1.5 text-ink-200"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-xs">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-3 py-1.5 text-ink-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-mono text-base">{formatINR(item.price * item.qty)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="card sticky top-24 h-fit p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
            // Order summary
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-300">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-300">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            {subtotal < 1499 && (
              <div className="rounded-lg border border-signal-lime/20 bg-signal-lime/5 p-3 text-xs text-signal-lime">
                Add {formatINR(1499 - subtotal)} more for free shipping.
              </div>
            )}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-base font-semibold">Total</span>
                <span className="font-display text-2xl font-bold">{formatINR(total)}</span>
              </div>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/shop" className="mt-3 block text-center text-xs text-ink-300 hover:text-ink-100">
            Keep shopping
          </Link>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="card p-2 text-[10px]">Secure</div>
            <div className="card p-2 text-[10px]">7-day returns</div>
            <div className="card p-2 text-[10px]">India shipping</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
