"use client";

import { useEffect, useState } from "react";
import { formatINR, type Product } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import {
  fitCopy,
  hasApparelSizing,
  priceMeta,
  sizeChartFor,
  toCm,
} from "@/lib/size-guide";

type Tab = "chart" | "measure" | "reviews";
type Unit = "in" | "cm";

export default function SizeGuideModal({
  product,
  color,
  size,
  onSelectSize,
  onAddToBag,
  onClose,
}: {
  product: Product;
  color: Product["colors"][number];
  size: string;
  onSelectSize: (s: string) => void;
  onAddToBag: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("chart");
  const [unit, setUnit] = useState<Unit>("in");
  const { mrp, off } = priceMeta(product.price);
  const chart = sizeChartFor(product.category).filter((r) =>
    product.sizes.includes(r.size) ||
    product.sizes.includes(r.size.replace("XXL", "2XL")),
  );
  // Map XXL ↔ 2XL for display alignment with Bewakoof-style charts.
  const rows = (chart.length ? chart : product.sizes.map((s) => ({
    size: s,
    chest: 0,
    frontLength: 0,
    sleeveLength: 0,
  }))).map((r) => ({
    ...r,
    size: product.sizes.includes(r.size)
      ? r.size
      : r.size === "XXL" && product.sizes.includes("2XL")
        ? "2XL"
        : r.size,
  }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const fmt = (n: number) => {
    if (!n) return "—";
    return unit === "cm" ? String(toCm(n)) : String(n);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Size Guide"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-paper-100 px-5 py-4">
          <h2 className="text-lg font-bold text-paper-900">Size Guide</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-paper-600 hover:bg-paper-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-4 pt-4">
          <div className="flex gap-3">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper-100">
              <ProductMockup
                category={product.category}
                fabric={color.fabric}
                printArea={product.printArea}
                printShape={product.printShape}
                printText={product.name.split(" ")[0]}
                printColor={color.printDefault}
                className="max-h-[72px] max-w-[72px]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base font-bold text-paper-900">
                  {formatINR(product.price).replace("₹", "₹")}
                </span>
                <span className="text-sm text-paper-400 line-through">
                  {formatINR(mrp)}
                </span>
                <span className="text-sm font-semibold text-[#16a34a]">
                  {off}% OFF
                </span>
              </div>
              <div className="mt-0.5 truncate text-sm font-semibold text-paper-900">
                {product.name}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-paper-500">
                {product.tagline}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#facc15] px-1.5 py-0.5 text-[11px] font-bold text-paper-900">
                <StarIcon />
                4.5
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-5 border-b border-paper-200">
            {(
              [
                ["chart", "Size Chart"],
                ["measure", "How to measure"],
                ["reviews", "Reviews"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative pb-2.5 text-sm font-semibold transition ${
                  tab === id ? "text-paper-900" : "text-paper-500 hover:text-paper-800"
                }`}
              >
                {label}
                {tab === id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#f59e0b]" />
                )}
              </button>
            ))}
          </div>

          {tab === "chart" && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-paper-800">{fitCopy(product.category)}</p>
                {hasApparelSizing(product.category) && (
                  <div className="inline-flex overflow-hidden rounded-full border border-paper-300 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setUnit("in")}
                      className={`rounded-full px-3 py-1.5 transition ${
                        unit === "in"
                          ? "border border-[#f59e0b] bg-[#fff8eb] text-paper-900"
                          : "text-paper-600"
                      }`}
                    >
                      Inches
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("cm")}
                      className={`rounded-full px-3 py-1.5 transition ${
                        unit === "cm"
                          ? "border border-[#f59e0b] bg-[#fff8eb] text-paper-900"
                          : "text-paper-600"
                      }`}
                    >
                      Cms
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 overflow-x-auto rounded-lg border border-paper-200">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="bg-paper-50 text-xs font-medium text-paper-500">
                      <th className="px-3 py-2.5 font-medium">Size</th>
                      <th className="px-3 py-2.5 font-medium">Chest</th>
                      <th className="px-3 py-2.5 font-medium">Front Length</th>
                      <th className="px-3 py-2.5 font-medium">Sleeve Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const selected = size === row.size;
                      const available = product.sizes.includes(row.size);
                      return (
                        <tr
                          key={row.size}
                          onClick={() => available && onSelectSize(row.size)}
                          className={`cursor-pointer border-t border-paper-100 transition ${
                            !available
                              ? "cursor-not-allowed opacity-40"
                              : selected
                                ? "bg-[#fffbeb]"
                                : "hover:bg-paper-50"
                          }`}
                        >
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-2 font-semibold text-paper-900">
                              <span
                                className={`grid h-4 w-4 place-items-center rounded-full border ${
                                  selected
                                    ? "border-[#f59e0b] bg-[#f59e0b]"
                                    : "border-paper-400"
                                }`}
                              >
                                {selected && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>
                              {row.size}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-paper-700">{fmt(row.chest)}</td>
                          <td className="px-3 py-3 text-paper-700">
                            {fmt(row.frontLength)}
                          </td>
                          <td className="px-3 py-3 text-paper-700">
                            {fmt(row.sleeveLength)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "measure" && (
            <div className="mt-5 space-y-4 text-sm text-paper-700">
              <MeasureStep
                title="Chest"
                body="Measure around the fullest part of your chest, keeping the tape horizontal."
              />
              <MeasureStep
                title="Front Length"
                body="Measure from the highest point of the shoulder down to the hem."
              />
              <MeasureStep
                title="Sleeve Length"
                body="Measure from the shoulder seam to the end of the sleeve."
              />
              <p className="text-xs text-paper-500">
                Tip: If you&apos;re between sizes, size up for an oversized look.
              </p>
            </div>
          )}

          {tab === "reviews" && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-[#fff8eb] px-4 py-3">
                <div className="text-3xl font-bold text-paper-900">4.5</div>
                <div>
                  <div className="flex gap-0.5 text-[#f59e0b]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < 4} />
                    ))}
                  </div>
                  <div className="mt-0.5 text-xs text-paper-500">
                    Based on recent WearCo drops
                  </div>
                </div>
              </div>
              {[
                {
                  name: "Aarav",
                  text: "Fit is true to size. Fabric feels premium — sizing chart nailed it.",
                },
                {
                  name: "Meera",
                  text: "Went one size up for oversized. Length matched the chart.",
                },
              ].map((r) => (
                <div
                  key={r.name}
                  className="rounded-xl border border-paper-200 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-paper-900">{r.name}</div>
                  <p className="mt-1 text-sm text-paper-600">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-paper-100 bg-white p-4">
          <button
            type="button"
            onClick={() => {
              onAddToBag();
              onClose();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#facc15] text-sm font-bold uppercase tracking-[0.06em] text-paper-900 transition hover:bg-[#f59e0b]"
          >
            <BagIcon />
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}

function MeasureStep({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="font-semibold text-paper-900">{title}</div>
      <p className="mt-1 text-paper-600">{body}</p>
    </div>
  );
}

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="m12 3 2.6 5.6L21 9.3l-4.5 4.2L17.8 21 12 17.8 6.2 21l1.3-7.5L3 9.3l6.4-.7L12 3Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
