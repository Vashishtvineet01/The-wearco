"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  CATEGORY_PLURAL_LABELS,
  type Product,
  type ProductCategory
} from "@/lib/products";

const TABS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tee", label: CATEGORY_PLURAL_LABELS.tee },
  { id: "hoodie", label: CATEGORY_PLURAL_LABELS.hoodie },
  { id: "sweatshirt", label: CATEGORY_PLURAL_LABELS.sweatshirt },
  { id: "cap", label: CATEGORY_PLURAL_LABELS.cap },
  { id: "mug", label: CATEGORY_PLURAL_LABELS.mug },
  { id: "badge", label: CATEGORY_PLURAL_LABELS.badge },
  { id: "poster", label: CATEGORY_PLURAL_LABELS.poster }
];

export default function ShopClient({ products }: { products: Product[] }) {
  const search = useSearchParams();
  const router = useRouter();
  const initialCat = (search.get("cat") as ProductCategory | "all") || "all";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    TABS.some((t) => t.id === initialCat) ? initialCat : "all"
  );
  const [drop, setDrop] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

  useEffect(() => {
    const cat = search.get("cat") as ProductCategory | "all" | null;
    if (cat && TABS.some((t) => t.id === cat)) setTab(cat);
  }, [search]);

  const drops = useMemo(
    () => Array.from(new Set(products.map((p) => p.drop))),
    [products]
  );

  const list = useMemo(() => {
    let l = [...products];
    if (tab !== "all") l = l.filter((p) => p.category === tab);
    if (drop !== "all") l = l.filter((p) => p.drop === drop);
    if (sort === "low") l.sort((a, b) => a.price - b.price);
    if (sort === "high") l.sort((a, b) => b.price - a.price);
    return l;
  }, [products, tab, drop, sort]);

  const onTab = (id: (typeof TABS)[number]["id"]) => {
    setTab(id);
    const params = new URLSearchParams(search.toString());
    if (id === "all") params.delete("cat");
    else params.set("cat", id);
    const q = params.toString();
    router.replace(q ? `/shop?${q}` : "/shop", { scroll: false });
  };

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Catalog
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            {list.length} product{list.length === 1 ? "" : "s"}
          </h2>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-paper-200 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs transition ${
                tab === t.id
                  ? "bg-paper-900 text-paper-50"
                  : "text-paper-700 hover:bg-paper-100 hover:text-paper-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          className="rounded-full border border-paper-200 bg-paper-200 px-3 py-1.5 text-xs text-paper-800 outline-none"
        >
          <option value="all">All drops</option>
          {drops.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-xs text-paper-600">
          <span className="font-mono uppercase tracking-[0.18em]">sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-paper-200 bg-paper-200 px-3 py-1.5 text-paper-800 outline-none"
          >
            <option value="new">Newest</option>
            <option value="low">Price · Low to high</option>
            <option value="high">Price · High to low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p, i) => (
          <div
            key={p.slug}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="card p-10 text-center text-paper-600">
          Nothing here yet. Try another filter — or{" "}
          <Link href="/design" className="text-signal-limeInk">
            design your own
          </Link>
          .
        </div>
      )}
    </>
  );
}
