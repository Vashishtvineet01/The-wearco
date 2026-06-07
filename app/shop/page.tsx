"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products, type ProductCategory } from "@/lib/products";

const TABS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tee", label: "Tees" },
  { id: "hoodie", label: "Hoodies" },
  { id: "cap", label: "Caps" }
];

export default function ShopPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [drop, setDrop] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

  const drops = useMemo(
    () => Array.from(new Set(products.map((p) => p.drop))),
    []
  );

  const list = useMemo(() => {
    let l = [...products];
    if (tab !== "all") l = l.filter((p) => p.category === tab);
    if (drop !== "all") l = l.filter((p) => p.drop === drop);
    if (sort === "low") l.sort((a, b) => a.price - b.price);
    if (sort === "high") l.sort((a, b) => b.price - a.price);
    return l;
  }, [tab, drop, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Shop
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">
            All drops, all uniforms
          </h1>
          <p className="mt-3 max-w-xl text-ink-200">
            Limited edition pieces for founders, creators, freelancers and the
            terminally online. Or skip the catalog and{" "}
            <Link href="/studio" className="text-signal-lime underline-offset-4 hover:underline">
              print your own
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="card mb-8 flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-1 rounded-full bg-black/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs transition ${
                tab === t.id
                  ? "bg-signal-lime text-ink-950"
                  : "text-ink-200 hover:text-ink-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-ink-100 outline-none"
        >
          <option value="all">All drops</option>
          {drops.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-xs text-ink-300">
          <span className="font-mono uppercase tracking-[0.18em]">sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-ink-100 outline-none"
          >
            <option value="new">Newest</option>
            <option value="low">Price · Low to high</option>
            <option value="high">Price · High to low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="card p-10 text-center text-ink-300">
          Nothing here yet. Try another filter — or{" "}
          <Link href="/studio" className="text-signal-lime">
            design your own
          </Link>
          .
        </div>
      )}
    </div>
  );
}
