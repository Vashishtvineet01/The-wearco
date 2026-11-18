"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, type Product } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import { useCart } from "@/components/CartProvider";
import WishlistButton from "@/components/WishlistButton";
import SizeGuideModal from "@/components/SizeGuideModal";
import ProductExtras from "@/components/ProductExtras";
import { hasApparelSizing, priceMeta } from "@/lib/size-guide";

export default function ProductBuyPanel({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const colorIndex = Math.max(
    0,
    product.colors.findIndex((c) => c.name === color.name),
  );
  const { mrp, off } = priceMeta(product.price);
  const dealPrice = Math.round(product.price * 0.83);
  const socialProof = useMemo(
    () => 80 + (product.slug.length * 17) % 140,
    [product.slug],
  );

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
  const apparel = hasApparelSizing(product.category);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-paper-200 bg-[#f3f3f3]">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <span className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-paper-700 shadow-sm">
              {product.drop.split(/[—–-]/)[0].trim()}
            </span>
            {product.customizable && (
              <Link
                href={`/design?product=${product.slug}`}
                className="rounded-md bg-paper-900/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
              >
                Customize
              </Link>
            )}
          </div>
          <div className="relative grid min-h-[380px] place-items-center px-6 py-12 md:min-h-[520px]">
            <div className="w-full max-w-md transition-transform duration-500 hover:scale-[1.02]">
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
        </div>

        <div className="flex flex-wrap gap-2.5">
          {product.colors.map((c) => {
            const selected = color.name === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c.name}
                title={c.name}
                className={`relative h-[72px] w-[72px] overflow-hidden rounded-lg border-2 transition ${
                  selected
                    ? "border-paper-900"
                    : "border-transparent ring-1 ring-paper-200 hover:ring-paper-400"
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(145deg, ${c.hex}, ${c.fabric})`,
                  }}
                />
                {selected && (
                  <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-paper-900 text-white">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buy panel */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 sm:text-[1.75rem]">
              {formatINR(product.price)}
            </span>
            <span className="text-base text-paper-400 line-through">
              {formatINR(mrp)}
            </span>
            <span className="text-base font-semibold text-[#16a34a]">
              {off}% OFF
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 bg-white px-2.5 py-1 text-sm font-semibold text-paper-800">
            <span className="text-[#f59e0b]">★</span>
            4.5
            <span className="text-paper-300">|</span>
            <span className="font-medium text-paper-500">{socialProof + 300}</span>
          </div>
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper-900 sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-1.5 text-sm text-paper-600">{product.tagline}</p>

        <div className="mt-5 flex flex-col gap-2.5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3e8ff] px-3.5 py-1.5 text-sm font-medium text-[#6b21a8]">
            Get it for as low as {formatINR(dealPrice)}
            <span className="grid h-4 w-4 place-items-center rounded-full border border-[#6b21a8]/40 text-[10px]">
              i
            </span>
          </div>
          <div className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-[#dbeafe] to-white px-3.5 py-1.5 text-sm font-medium text-[#1d4ed8]">
            {socialProof} people bought this in the last 7 days
          </div>
          {product.details[0] && (
            <div className="inline-flex w-fit items-center rounded-full border border-paper-300 bg-white px-3.5 py-1.5 text-sm text-paper-700">
              {product.details[0]}
            </div>
          )}
        </div>

        <div className="mt-7">
          <div className="mb-3 text-sm font-semibold text-paper-900">
            Colour: <span className="font-medium">{color.name}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => {
              const selected = color.name === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`relative h-14 w-14 overflow-hidden rounded-md border-2 transition ${
                    selected
                      ? "border-paper-900"
                      : "border-transparent ring-1 ring-paper-200 hover:ring-paper-400"
                  }`}
                  aria-label={c.name}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(145deg, ${c.hex}, ${c.fabric})`,
                    }}
                  />
                  {selected && (
                    <span className="absolute bottom-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-paper-900 text-white">
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-paper-900">Select Size</span>
            {apparel && (
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="text-sm font-semibold text-[#0284c7] hover:underline"
              >
                Size guide &gt;
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((s) => {
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`grid h-12 min-w-[3rem] place-items-center rounded-md border px-3 text-sm font-semibold transition ${
                    selected
                      ? "border-paper-900 bg-paper-900 text-white"
                      : "border-paper-300 bg-white text-paper-800 hover:border-paper-900"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="text-sm text-paper-600">Qty</span>
          <div className="inline-flex items-center rounded-md border border-paper-300 bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-paper-700 hover:text-paper-900"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="px-3 py-2 text-paper-700 hover:text-paper-900"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-stretch gap-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#facc15] text-sm font-bold uppercase tracking-[0.06em] text-paper-900 transition hover:bg-[#f59e0b] active:scale-[0.99]"
          >
            <BagIcon />
            {added ? "Added to Bag" : "Add to Bag"}
          </button>
          <WishlistButton
            product={product}
            colorIndex={colorIndex}
            size="lg"
            className="!h-14 !w-14 !rounded-lg border-paper-300 shadow-none"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            handleAdd();
            router.push("/checkout");
          }}
          className="mt-3 w-full py-2 text-sm font-semibold text-paper-700 underline-offset-4 hover:text-paper-900 hover:underline"
        >
          Buy now
        </button>

        {product.customizable && (
          <button
            type="button"
            onClick={() => router.push(`/design?product=${product.slug}`)}
            className="mt-2 w-full rounded-lg border border-paper-300 py-3 text-sm font-semibold text-paper-800 transition hover:border-paper-900"
          >
            Customize in Design Studio →
          </button>
        )}
      </div>

      {guideOpen && (
        <SizeGuideModal
          product={product}
          color={color}
          size={size}
          onSelectSize={setSize}
          onAddToBag={handleAdd}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </div>
  );
}

export function ProductBelowFold({ product }: { product: Product }) {
  return <ProductExtras product={product} />;
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
