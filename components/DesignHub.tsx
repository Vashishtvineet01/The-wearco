"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import StudioClient from "./StudioClient";
import BulkClient from "./BulkClient";

/**
 * Design hub — merges the old /studio (Just for me) and /bulk (For my team)
 * flows into a single page with a tab toggle.
 *
 * - "Just for me" (default) → full Studio flow, exactly as before
 * - "For my team"           → full Bulk quote flow, exactly as before
 *
 * The active tab is reflected in the URL (?view=me|team) so deep links
 * continue to work and the /studio + /bulk redirects land on the right tab.
 */
type View = "me" | "team";

export default function DesignHub({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const initial: View = params.get("view") === "team" ? "team" : "me";
  const [view, setView] = useState<View>(initial);

  // When the user toggles, reflect the choice in the URL. Replace (not push)
  // so the browser back button still returns them to wherever they came from.
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
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 lg:px-8 lg:pt-12">
      {/* Hero */}
      <div className="mb-8 text-center md:mb-12">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          // Design
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
          Print your idea <span className="gradient-text">on anything.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-paper-700">
          Two paths — print one for yourself, or kit out the whole team. Same
          premium fabric, same DTG print, same 5–7 day turnaround.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex justify-center">
        <div
          role="tablist"
          aria-label="Design mode"
          className="inline-flex items-center gap-1 rounded-full border border-paper-200 bg-paper-100/60 p-1 shadow-sm"
        >
          <TabButton
            active={view === "me"}
            onClick={() => setView("me")}
            label="Just for me"
            sub="1+ piece"
          />
          <TabButton
            active={view === "team"}
            onClick={() => setView("team")}
            label="For my team"
            sub="10+ pieces"
          />
        </div>
      </div>

      {/* Active view */}
      <div aria-live="polite">
        {view === "me" ? (
          <StudioClient products={studioProducts} />
        ) : (
          <BulkClient products={products} />
        )}
      </div>

      {/* Cross-link strip */}
      <div className="mt-20 rounded-2xl border border-paper-200 bg-paper-100/40 p-6 text-center md:p-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          // Also worth knowing
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {view === "me" ? "Need 25 or more?" : "Just testing one piece?"}
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-paper-600 md:text-base">
          {view === "me"
            ? "Volume pricing kicks in at 10 units, with up to 50% off at 100+. Switch to the team view to see tier breakdowns."
            : "Try a single piece in the Studio first — same print, same fabric. If it looks right on one, it'll look right on a hundred."}
        </p>
        <div className="mt-5">
          <button
            onClick={() => setView(view === "me" ? "team" : "me")}
            className="btn-ghost"
          >
            {view === "me" ? "Switch to team view →" : "Switch to solo view →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition md:px-6 md:py-3 ${
        active
          ? "bg-gradient-aurora text-ink-950 shadow-[0_6px_20px_-6px_rgba(124,92,255,0.55)]"
          : "text-paper-700 hover:text-paper-900"
      }`}
    >
      <span className="block leading-none">{label}</span>
      <span
        className={`mt-1 block font-mono text-[9px] uppercase tracking-[0.18em] ${
          active ? "text-ink-800/70" : "text-paper-500"
        }`}
      >
        {sub}
      </span>
    </button>
  );
}
