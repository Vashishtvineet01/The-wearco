"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product, ProductCategory } from "@/lib/products";

const TABS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tee", label: "Tees" },
  { id: "hoodie", label: "Hoodies" },
  { id: "cap", label: "Caps" }
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
      <div className="card mb-8 flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-1 rounded-full bg-black/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
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
    </>
  );
}
