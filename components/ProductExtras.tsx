"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import {
  estimateDeliveryLabel,
  highlightsFor,
  offersFor,
  reviewsFor,
} from "@/lib/product-meta";

export default function ProductExtras({ product }: { product: Product }) {
  const highlights = highlightsFor(product);
  const offers = offersFor(product);
  const reviews = reviewsFor(product);
  const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <div className="mt-10 space-y-8 lg:col-span-2">
      <OffersRow offers={offers} />
      <DeliveryCheck />
      <KeyHighlights items={highlights} />
      <InfoAccordions product={product} />
      <TrustBadges />
      <ReviewsBlock reviews={reviews} average={avg} />
      <TopButton />
    </div>
  );
}

function OffersRow({
  offers,
}: {
  offers: { title: string; code: string }[];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h2 className="text-base font-bold text-paper-900">Offers</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {offers.map((o) => (
          <div
            key={o.code}
            className="flex gap-3 rounded-xl border border-paper-200 bg-white p-3.5 shadow-[0_4px_16px_-12px_rgba(20,17,14,0.35)]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fff8eb] text-[#b45309]">
              <GiftIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-paper-800">{o.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-dashed border-paper-400 px-2 py-0.5 text-xs font-bold tracking-wide text-paper-900">
                  {o.code}
                </span>
                <button
                  type="button"
                  onClick={() => copy(o.code)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#16a34a] hover:underline"
                >
                  <CopyIcon />
                  {copied === o.code ? "Copied" : "Copy code"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryCheck() {
  const [pin, setPin] = useState("110001");
  const [checked, setChecked] = useState("110001");
  const label = useMemo(() => estimateDeliveryLabel(checked), [checked]);

  const onCheck = () => {
    const clean = pin.replace(/\D/g, "").slice(0, 6);
    setPin(clean);
    setChecked(clean);
  };

  return (
    <div>
      <h2 className="text-base font-bold text-paper-900">
        Check for Delivery Details
      </h2>
      <div className="relative mt-3">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && onCheck()}
          placeholder="Enter pincode"
          className="h-12 w-full rounded-lg border border-paper-300 bg-white px-4 pr-20 text-sm outline-none transition focus:border-paper-900"
          aria-label="Pincode"
        />
        <button
          type="button"
          onClick={onCheck}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0284c7] hover:underline"
        >
          Check
        </button>
      </div>

      {label && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper-100 text-paper-600">
              <TruckIcon />
            </div>
            <div>
              <p className="text-sm text-paper-800">
                Expected delivery by{" "}
                <span className="font-semibold text-[#16a34a]">{label}</span>
              </p>
              <p className="mt-0.5 text-xs text-paper-500">
                Final delivery based on items in bag
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper-100 text-paper-600">
              <CashIcon />
            </div>
            <p className="pt-2 text-sm text-paper-800">
              Cash on Delivery is available
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#dbeafe] px-3.5 py-2.5 text-sm font-medium text-[#1d4ed8]">
            <TruckIcon />
            This product is eligible for FREE SHIPPING
          </div>
        </div>
      )}

      {checked.length === 6 && !label && (
        <p className="mt-3 text-sm text-[#c2410c]">Enter a valid 6-digit pincode.</p>
      )}
    </div>
  );
}

function KeyHighlights({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const rows: { label: string; value: string }[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <div>
      <h2 className="text-base font-bold text-paper-900">Key Highlights</h2>
      <div className="mt-3">
        {rows.map((pair, idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 gap-4 border-b border-paper-200 py-3.5 last:border-b-0"
          >
            {pair.map((item) => (
              <div key={item.label}>
                <div className="text-xs text-paper-500">{item.label}</div>
                <div className="mt-1 text-sm font-bold text-paper-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoAccordions({ product }: { product: Product }) {
  const [open, setOpen] = useState<"desc" | "returns" | null>("desc");

  return (
    <div className="overflow-hidden rounded-xl border border-paper-200 bg-white">
      <AccordionRow
        open={open === "desc"}
        onToggle={() => setOpen(open === "desc" ? null : "desc")}
        icon={<ListIcon />}
        title="Product Description"
        subtitle="Manufacture, Care and Fit"
      >
        <p className="text-sm leading-relaxed text-paper-700">
          {product.description}
        </p>
        <div className="mt-4 space-y-2 text-sm text-paper-700">
          <MetaLine label="Country of Origin" value="India" />
          <MetaLine
            label="Manufactured By"
            value="TheWearCo · India"
          />
          <MetaLine label="Packed By" value="TheWearCo · India" />
          <MetaLine
            label="Commodity"
            value={product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          />
        </div>
        <div className="mt-5">
          <div className="text-sm font-bold text-paper-900">
            Product Specifications
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-paper-700">
            {product.details.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-paper-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </AccordionRow>

      <div className="border-t border-paper-200" />

      <AccordionRow
        open={open === "returns"}
        onToggle={() => setOpen(open === "returns" ? null : "returns")}
        icon={<ReturnIcon />}
        title="7 Days Returns & Exchange"
        subtitle="Know about return & exchange policy"
      >
        <p className="text-sm leading-relaxed text-paper-700">
          Easy returns and exchanges within 7 days of delivery for unused items
          with tags intact. Custom Design Studio prints are final sale unless
          defective.
        </p>
        <Link
          href="/refund"
          className="mt-3 inline-block text-sm font-semibold text-[#0284c7] hover:underline"
        >
          Read full policy →
        </Link>
      </AccordionRow>
    </div>
  );
}

function AccordionRow({
  open,
  onToggle,
  icon,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-paper-50"
        aria-expanded={open}
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-100 text-paper-700">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-paper-900">{title}</span>
          <span className="mt-0.5 block text-xs text-paper-500">{subtitle}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`mt-1 h-5 w-5 shrink-0 text-paper-500 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-4 pb-5 pl-[3.75rem]">{children}</div>}
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-paper-500">{label}: </span>
      <span className="font-medium text-paper-800">{value}</span>
    </div>
  );
}

function TrustBadges() {
  const items = [
    { title: "100% Genuine Product", icon: "genuine" },
    { title: "100% Secure Payment", icon: "secure" },
    { title: "Easy Returns & Instant Refunds", icon: "returns" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3 border-y border-paper-200 py-6 sm:gap-6">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center">
          <TrustIcon name={item.icon} />
          <p className="mt-2 max-w-[120px] text-[11px] font-semibold leading-snug text-paper-800 sm:text-xs">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}

function ReviewsBlock({
  reviews,
  average,
}: {
  reviews: ReturnType<typeof reviewsFor>;
  average: number;
}) {
  return (
    <div id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-paper-900">Product Reviews</h2>
          <p className="mt-1 text-sm text-paper-500">
            What WearCo customers are saying
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff8eb] px-3 py-2">
          <span className="text-xl font-bold text-paper-900">
            {average.toFixed(1)}
          </span>
          <div>
            <div className="flex text-[#f59e0b]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} filled={i < Math.round(average)} />
              ))}
            </div>
            <div className="text-[11px] text-paper-500">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {reviews.map((r) => (
          <li
            key={`${r.name}-${r.date}`}
            className="rounded-xl border border-paper-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#facc15] text-sm font-bold text-paper-900">
                  {r.name.slice(0, 1)}
                </span>
                <div>
                  <div className="text-sm font-semibold text-paper-900">
                    {r.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-paper-500">
                    <span className="flex text-[#f59e0b]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < r.rating} />
                      ))}
                    </span>
                    {r.verified && (
                      <span className="font-medium text-[#16a34a]">
                        Verified purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-paper-400">{r.date}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-paper-700">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-5 z-40 grid h-14 w-14 place-items-center rounded-xl bg-[#3f3f46] text-white shadow-lg transition hover:bg-paper-900 sm:right-8"
      aria-label="Back to top"
    >
      <span className="flex flex-col items-center leading-none">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 14 6-6 6 6" />
        </svg>
        <span className="mt-0.5 text-[10px] font-bold tracking-wide">TOP</span>
      </span>
    </button>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m12 3 2.6 5.6L21 9.3l-4.5 4.2L17.8 21 12 17.8 6.2 21l1.3-7.5L3 9.3l6.4-.7L12 3Z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18" />
      <path d="M12 8c-2-3-5-3-5-1s2 2 5 1Z" />
      <path d="M12 8c2-3 5-3 5-1s-2 2-5 1Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10h11a5 5 0 0 1 0 10H9" />
      <path d="m7 6-4 4 4 4" />
    </svg>
  );
}

function TrustIcon({ name }: { name: "genuine" | "secure" | "returns" }) {
  const cls = "h-10 w-10 text-paper-600";
  if (name === "genuine") {
    return (
      <svg viewBox="0 0 48 48" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M24 4 28 10l7-1 1 7 7 1-1 7 5 5-5 5 1 7-7 1-1 7-7-1-4 6-4-6-7 1-1-7-7-1 1-7-5-5 5-5-1-7 7-1 1-7 7 1 4-6Z" />
        <path d="m16 24 5 5 11-12" stroke="#f59e0b" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name === "secure") {
    return (
      <svg viewBox="0 0 48 48" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 16h22l4 8v12H10V16Z" />
        <path d="M14 16V12a6 6 0 0 1 12 0v4" />
        <circle cx="34" cy="14" r="7" fill="#facc15" stroke="none" />
        <path d="m31 14 2 2 4-4" stroke="#0a0a0a" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="14" y="16" width="20" height="16" rx="2" />
      <path d="M18 16v-2a6 6 0 0 1 12 0v2" />
      <path d="M8 28c2 8 10 12 16 12s14-4 16-12" stroke="#f59e0b" />
    </svg>
  );
}
