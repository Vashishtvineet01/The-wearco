"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatINR } from "@/lib/products";

type TrackResponse = {
  ok: boolean;
  order?: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    paidAt: string | null;
    total: number;
    shipping: number;
    subtotal: number;
    name: string;
    address: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    } | null;
    items: {
      name: string;
      qty: number;
      size: string;
      color: string;
      price: number;
      customDesign: boolean;
    }[];
  };
  error?: string;
};

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-paper-600">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}

function TrackInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackResponse | null>(null);

  async function lookup(o: string, e: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/track?order=${encodeURIComponent(o)}&email=${encodeURIComponent(e)}`
      );
      const json = (await res.json()) as TrackResponse;
      setData(json);
    } catch {
      setData({ ok: false, error: "Could not reach the server. Try again." });
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup if the URL already has both params (deep-link from emails).
  useEffect(() => {
    const o = params.get("order")?.trim();
    const e = params.get("email")?.trim();
    if (o && e) lookup(o, e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const next = new URLSearchParams();
    next.set("order", orderNumber);
    next.set("email", email);
    router.replace(`/track?${next.toString()}`);
    lookup(orderNumber, email);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Track order
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        Where&apos;s my order?
      </h1>
      <p className="mt-3 max-w-xl text-paper-700">
        Enter the order number from your confirmation email + the email you
        placed the order with. No account needed.
      </p>

      <form
        onSubmit={onSubmit}
        className="card mt-8 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"
      >
        <label className="block">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
            Order number
          </div>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="TWC-XXXX-XXXX"
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-violetInk/40"
          />
        </label>
        <label className="block">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
            Email
          </div>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.in"
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-violetInk/40"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary self-end disabled:opacity-60"
        >
          {loading ? "Looking…" : "Track"}
        </button>
      </form>

      {data && <ResultCard data={data} />}
    </div>
  );
}

function ResultCard({ data }: { data: TrackResponse }) {
  if (!data.ok || !data.order) {
    return (
      <div className="card mt-8 p-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
          // Not found
        </div>
        <p className="mt-2 text-sm text-paper-700">
          {data.error ||
            "We couldn't find an order with that combination. Double-check the order number from your confirmation email."}
        </p>
        <Link href="mailto:hi@thewearco.com" className="btn-ghost mt-4 inline-flex">
          Email support
        </Link>
      </div>
    );
  }

  const o = data.order;
  const addr = o.address;
  const steps = statusSteps(o.status);

  return (
    <div className="card mt-8 overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
            Order
          </div>
          <div className="mt-1 font-display text-xl font-bold">
            {o.orderNumber}
          </div>
          <div className="mt-1 text-xs text-paper-500">
            Placed {new Date(o.createdAt).toLocaleString("en-IN")}
          </div>
        </div>
        <span
          className={`tag ${
            o.paymentStatus === "paid"
              ? "border-signal-lime/50 bg-signal-lime/10 text-signal-limeInk"
              : o.paymentStatus === "failed"
                ? "border-signal-coral/50 bg-signal-coral/10 text-signal-coral"
                : ""
          }`}
        >
          {prettyPay(o.paymentStatus, o.paymentMethod)}
        </span>
      </div>

      {/* Status timeline */}
      <div className="mt-6 flex items-center">
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center">
            <div
              className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${
                s.active
                  ? "bg-signal-lime text-ink-950"
                  : "border border-paper-200 bg-paper-100 text-paper-500"
              }`}
            >
              {i + 1}
            </div>
            <div className="ml-2">
              <div
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                  s.active ? "text-paper-900" : "text-paper-500"
                }`}
              >
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 ${
                  steps[i + 1].active ? "bg-signal-lime" : "bg-paper-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mt-6 divide-y divide-paper-200 rounded-xl border border-paper-200">
        {o.items.map((it, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 p-3 text-sm"
          >
            <div className="min-w-0">
              <div className="truncate font-display font-semibold text-paper-900">
                {it.name}
                {it.customDesign && (
                  <span className="ml-2 inline-block rounded-full border border-signal-violetInk/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal-violetInk">
                    Custom
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-paper-500">
                {it.size} · {it.color} · × {it.qty}
              </div>
            </div>
            <div className="shrink-0 font-mono text-paper-800">
              {formatINR(it.price * it.qty)}
            </div>
          </div>
        ))}
      </div>

      {/* Ship to */}
      {addr && (
        <div className="mt-6 rounded-xl border border-paper-200 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
            Ship to
          </div>
          <div className="mt-2 text-sm text-paper-800">
            <div className="font-semibold">{o.name}</div>
            <div>
              {addr.line1}
              {addr.line2 ? ", " + addr.line2 : ""}
            </div>
            <div>
              {addr.city}, {addr.state} {addr.pincode}
            </div>
            <div>{addr.country || "India"}</div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid gap-1 text-sm">
        <div className="flex justify-between text-paper-600">
          <span>Subtotal</span>
          <span className="font-mono">{formatINR(o.subtotal)}</span>
        </div>
        <div className="flex justify-between text-paper-600">
          <span>Shipping</span>
          <span className="font-mono">
            {o.shipping === 0 ? "Free" : formatINR(o.shipping)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-paper-200 pt-2">
          <span className="font-display font-semibold">Total</span>
          <span className="font-display text-lg font-bold">
            {formatINR(o.total)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="mailto:hi@thewearco.com" className="btn-ghost">
          Email support
        </Link>
        <Link href="/shop" className="btn-ghost">
          Keep shopping →
        </Link>
      </div>
    </div>
  );
}

function statusSteps(status: string) {
  const all = [
    { key: "pending", label: "Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];
  const idx = all.findIndex((s) => s.key === status);
  return all.map((s, i) => ({ ...s, active: idx >= 0 && i <= idx }));
}

function prettyPay(status: string, method: string) {
  if (method === "cod") {
    return status === "paid" ? "COD · Collected" : "COD · Pay on delivery";
  }
  switch (status) {
    case "paid":
      return "Paid";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return "Payment pending";
  }
}
