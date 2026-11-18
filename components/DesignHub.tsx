"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import StudioClient from "./StudioClient";
import BulkClient from "./BulkClient";

/**
 * Design hub — merges /studio (Just for me) and /bulk (For my team)
 * into one page. Active path is in the URL (?view=me|team).
 */
type View = "me" | "team";

export default function DesignHub({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const initial: View = params.get("view") === "team" ? "team" : "me";
  const [view, setView] = useState<View>(initial);

  useEffect(() => {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (view === "me") next.delete("view");
    else next.set("view", view);
    const qs = next.toString();
    router.replace(qs ? `/design?${qs}` : "/design", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const customizable = products.filter((p) => p.customizable);
  const studioProducts = customizable.length ? customizable : products;

  return (
    <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 lg:px-8 lg:pt-12">
      <section className="relative mb-10 pb-8 pt-2 text-center md:mb-12">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 bg-paper-400" />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Design
          </div>
          <span aria-hidden className="h-px w-8 bg-paper-400" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper-900 md:text-6xl">
          Design &amp; print <span className="gradient-text">on anything.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-paper-600 md:text-lg">
          Customize a single piece or kit out a team. Same premium blanks, same
          DTG print, same 5–7 day turnaround — then shop ready-mades anytime.
        </p>
      </section>

      {/* Clear two-path chooser — no clipped pill toggle */}
      <div
        role="tablist"
        aria-label="Design mode"
        className="mx-auto mb-12 grid max-w-3xl gap-3 sm:grid-cols-2"
      >
        <PathCard
          active={view === "me"}
          onClick={() => setView("me")}
          eyebrow="Solo"
          title="Just for me"
          detail="1+ piece · design & buy now"
        />
        <PathCard
          active={view === "team"}
          onClick={() => setView("team")}
          eyebrow="Bulk"
          title="For my team"
          detail="10+ pieces · volume quote"
        />
      </div>

      <div aria-live="polite">
        {view === "me" ? (
          <StudioClient products={studioProducts} embedded />
        ) : (
          <BulkClient products={products} embedded />
        )}
      </div>

      <div className="mt-16 border-t border-paper-200 pt-10 text-center">
        <p className="text-sm text-paper-600">
          {view === "me"
            ? "Need 10 or more? Volume pricing starts at 10 units."
            : "Want to test one piece first? Same print and fabric in solo mode."}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setView(view === "me" ? "team" : "me")}
            className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
          >
            {view === "me" ? "Switch to team orders →" : "Switch to solo design →"}
          </button>
          <Link
            href="/shop"
            className="text-sm font-semibold text-paper-700 underline-offset-4 hover:underline"
          >
            Or browse the shop →
          </Link>
        </div>
      </div>
    </div>
  );
}

function PathCard({
  active,
  onClick,
  eyebrow,
  title,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-2xl border px-5 py-5 text-left transition ${
        active
          ? "border-paper-900 bg-paper-900 text-paper-50"
          : "border-paper-300 bg-transparent text-paper-800 hover:border-paper-500"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
          active ? "text-paper-50/60" : "text-paper-500"
        }`}
      >
        {eyebrow}
      </div>
      <div className="mt-2 font-display text-xl font-semibold tracking-tight">
        {title}
      </div>
      <div
        className={`mt-1 text-sm ${active ? "text-paper-50/75" : "text-paper-600"}`}
      >
        {detail}
      </div>
    </button>
  );
}
