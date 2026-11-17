"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, type Product } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import { useCart } from "@/components/CartProvider";
import { ANDROID_APP_URL } from "@/lib/android-app";

export default function ProductBuyPanel({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

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
      fabricHex: color.fabric,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const printWord = product.name.split(" ")[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      {/* Viewer stage */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[28px] border border-paper-200 bg-[#12141a] shadow-[0_24px_80px_-40px_rgba(124,92,255,0.55)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 50% at 50% 45%, rgba(124,92,255,0.35), transparent 70%), radial-gradient(40% 35% at 80% 20%, rgba(255,92,59,0.18), transparent 60%)",
            }}
          />
          <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
              {product.drop}
            </span>
            {product.customizable && (
              <Link
                href={`/design?product=${product.slug}`}
                className="rounded-full border border-signal-lime/40 bg-signal-lime/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime backdrop-blur"
              >
                Customize
              </Link>
            )}
          </div>
          <div className="absolute right-5 top-5 z-10 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 sm:block">
            [scale · 1:1]
          </div>
          <div className="relative grid min-h-[360px] place-items-center px-6 py-14 md:min-h-[460px]">
            <div className="w-full max-w-md transition-transform duration-500 hover:scale-[1.03]">
              <ProductMockup
                category={product.category}
                fabric={color.fabric}
                printArea={product.printArea}
                printShape={product.printShape}
                printText={printWord}
                printColor={color.printDefault}
              />
            </div>
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-signal-lime/35 bg-signal-lime/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime">
              QR layer · members key
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Drag-free preview
            </span>
          </div>
        </div>

        {/* Color thumbs */}
        <div className="flex flex-wrap gap-3">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c)}
              className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition ${
                color.name === c.name
                  ? "border-signal-violetInk shadow-[0_0_0_3px_rgba(124,92,255,0.25)]"
                  : "border-paper-200 hover:border-paper-400"
              }`}
              aria-label={c.name}
              title={c.name}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(145deg, ${c.hex}, ${c.fabric})`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Spec / buy panel */}
      <div className="rounded-[28px] border border-paper-200 bg-paper-50/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,13,10,0.35)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
            // Sys.spec · {product.slug}
          </div>
          <span className="rounded-full border border-signal-coral/30 bg-signal-coral/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-signal-coral">
            Limited drop
          </span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm text-paper-600 md:text-base">{product.tagline}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <div className="font-display text-3xl font-bold">
            {formatINR(product.price)}
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-500">
            / {product.drop}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
            Colorway · {color.name}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                  color.name === c.name
                    ? "border-signal-violetInk/50 bg-signal-violet/10 text-signal-violetInk"
                    : "border-paper-200 bg-white text-paper-800 hover:border-paper-400"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-paper-300"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
              Size · {size}
            </span>
            <a
              href="#sizing"
              className="text-xs text-paper-500 underline-offset-2 hover:text-paper-800 hover:underline"
            >
              Size guide
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`grid h-12 min-w-12 place-items-center rounded-full border text-sm font-semibold transition ${
                  size === s
                    ? "border-transparent bg-gradient-aurora text-ink-950 shadow-[0_8px_24px_-10px_rgba(124,92,255,0.7)]"
                    : "border-paper-200 bg-white text-paper-800 hover:border-paper-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-paper-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-3 text-paper-700 hover:text-paper-900"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="px-4 py-3 text-paper-700 hover:text-paper-900"
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary flex-1 py-3.5"
          >
            {added
              ? "Added to bag"
              : `Add to bag — ${formatINR(product.price * qty)}`}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            handleAdd();
            router.push("/checkout");
          }}
          className="btn-ghost mt-3 w-full py-3"
        >
          Fast checkout
        </button>

        {product.customizable && (
          <button
            type="button"
            onClick={() => router.push(`/design?product=${product.slug}`)}
            className="mt-3 w-full text-center text-sm text-signal-violetInk underline underline-offset-4"
          >
            Or print your own design on this piece →
          </button>
        )}

        <div className="mt-8 rounded-2xl border border-paper-200 bg-paper-100/80 p-4">
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-lime/20 text-signal-limeInk">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                <path d="M8 8V6a4 4 0 018 0v2" />
              </svg>
            </span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-limeInk">
                // QR unlock
              </div>
              <p className="mt-1 text-xs leading-relaxed text-paper-700">
                Hidden QR on every piece unlocks founder Discord + office hours.
                Scan with any phone — or use the Android app.
              </p>
              <a
                href={ANDROID_APP_URL}
                download="thewearco-android.apk"
                className="mt-2 inline-flex text-xs font-semibold text-signal-violetInk underline underline-offset-2"
              >
                Download Android app →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-[0.16em] text-paper-500">
          <span>Free ship ≥ ₹1,499</span>
          <span>·</span>
          <span>India dispatch</span>
          <span>·</span>
          <span>7-day exchange</span>
        </div>
      </div>

      {/* Details band */}
      <div className="lg:col-span-2">
        <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-signal-violetInk">
          // Fabric & build
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Hardware & textile notes
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-6" id="sizing">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
              Description
            </div>
            <p className="mt-3 text-sm leading-relaxed text-paper-800">
              {product.description}
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-paper-700">
              {product.details.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-lime" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
              Shipping
            </div>
            <p className="mt-3 text-sm leading-relaxed text-paper-800">
              Free shipping over ₹1,499 across India. Average delivery in 48
              hours metro, 5–7 days for custom Design Studio prints.
            </p>
            <Link
              href="/shipping"
              className="mt-4 inline-block text-sm text-signal-violetInk underline underline-offset-2"
            >
              Full shipping policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
