"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import ProductMockup from "@/components/ProductMockup";
import type { ProductCategory, PrintShape } from "@/lib/products";

type Card = {
  fabric: string;
  tagline: string;
  badge: string;
  tilt: string;
  cat: ProductCategory;
  shape?: PrintShape;
  delay: number;
};

const CARDS: Card[] = [
  { fabric: "#0e0e10", tagline: "Shop", badge: "Tee", tilt: "-rotate-1", cat: "tee", delay: 200 },
  { fabric: "#ece7dd", tagline: "Design", badge: "Hoodie", tilt: "rotate-2 mt-8", cat: "hoodie", delay: 320 },
  { fabric: "#0e0e10", tagline: "Print", badge: "Mug", tilt: "rotate-1", cat: "mug", shape: "cylinder", delay: 440 },
  { fabric: "#ece7dd", tagline: "ART", badge: "Poster", tilt: "-rotate-2", cat: "poster", shape: "full", delay: 560 },
];

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/** Hero 2×2 mockup grid with light pointer parallax (±8px). */
export default function HeroMockups() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: nx * 8, y: ny * 8 });
  }, []);

  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <div className="relative lg:col-span-5">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-paper-100/70 md:-inset-6"
        aria-hidden
      />
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative grid grid-cols-2 gap-4 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        {CARDS.map((card) => (
          <div
            key={card.badge}
            className={`relative animate-fade-in-up rounded-2xl border border-paper-200/80 bg-paper-50/90 p-3 transition-transform duration-500 ${card.tilt} hover:rotate-0 hover:-translate-y-2 hover:scale-[1.02]`}
            style={{ animationDelay: `${card.delay}ms` }}
          >
            <div className="absolute left-3 top-3 z-10 rounded-full border border-paper-300 bg-paper-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-700">
              {card.badge}
            </div>
            <div
              className="w-full animate-float-soft"
              style={{ animationDelay: `${card.delay % 600}ms` }}
            >
              <ProductMockup
                category={card.cat}
                fabric={card.fabric}
                printShape={card.shape}
                printText={card.tagline}
                printColor={isLight(card.fabric) ? "#0a0a0a" : "#f7f7f7"}
                className="mx-auto max-h-[260px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
