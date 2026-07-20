"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/products";

type PayMethod = "upi" | "card" | "cod";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<"info" | "done">("info");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("upi");

  const shippingBase = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;
  const shipping = shippingBase + (paymentMethod === "cod" ? 49 : 0);
  const total = subtotal + shipping;

  if (items.length === 0 && step !== "done") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <h1 className="font-display text-3xl">Nothing to check out yet.</h1>
        <Link href="/shop" className="mt-4 inline-block text-signal-lime">
          ← Browse drops
        </Link>
      </div>
    );
  }

  const onPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          gst: gst || null,
          paymentMethod,
          address: { line1, line2, city, state, pincode, country },
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            qty: i.qty,
            size: i.size,
            color: i.color,
            custom: i.custom
              ? {
                  text: i.custom.text,
                  textColor: i.custom.textColor,
                  font: i.custom.font,
                  imageUrl: i.custom.imageUrl,
                  posX: i.custom.posX,
                  posY: i.custom.posY,
                  scale: i.custom.scale,
                  rotation: i.custom.rotation
                }
              : undefined
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.orderNumber);
      setStep("done");
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 lg:px-8">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-signal-lime/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-signal-lime text-ink-950">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
              // Order confirmed
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold">You&apos;re shipping</h1>
            <p className="mt-3 text-ink-300">
              We&apos;ve sent a confirmation to{" "}
              <span className="text-ink-50">{email || "your email"}</span>.
              Custom prints typically ship in 5–7 working days.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 font-mono text-sm">
              <span className="text-ink-400">Order</span>
              <span className="text-ink-50">{orderId}</span>
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/shop" className="btn-primary">
                Continue
              </Link>
              <Link href="/studio" className="btn-ghost">
                Print another
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Checkout
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Final layer
          </h1>
        </div>
        <Stepper />
      </div>

      <form onSubmit={onPlaceOrder} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <SectionTitle index="01" title="Contact" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full name" required value={name} onChange={setName} placeholder="Aarav Mehta" />
              <Input label="Email" required type="email" value={email} onChange={setEmail} placeholder="aarav@startup.in" />
              <Input label="Phone" required type="tel" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" />
              <Input label="GST (optional)" value={gst} onChange={setGst} placeholder="22ABCDE1234F1Z5" />
            </div>
          </div>

          <div className="card p-6">
            <SectionTitle index="02" title="Ship to" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Address line 1" required value={line1} onChange={setLine1} placeholder="Flat / building" />
              <Input label="Address line 2" value={line2} onChange={setLine2} placeholder="Street / area" />
              <Input label="City" required value={city} onChange={setCity} placeholder="Bengaluru" />
              <Input label="State" required value={state} onChange={setState} placeholder="Karnataka" />
              <Input label="Pincode" required value={pincode} onChange={setPincode} placeholder="560001" />
              <Input label="Country" required value={country} onChange={setCountry} />
            </div>
          </div>

          <div className="card p-6">
            <SectionTitle index="03" title="Payment" />
            <div className="grid gap-3">
              <RadioRow
                id="upi"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
                label="UPI"
                sub="Pay with Google Pay, PhonePe, Paytm"
              />
              <RadioRow
                id="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                label="Card"
                sub="Visa, Mastercard, Rupay"
              />
              <RadioRow
                id="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                label="Cash on Delivery"
                sub="₹49 handling fee"
              />
            </div>
            <p className="mt-3 text-[11px] text-ink-400">
              Demo checkout — orders are saved to the admin panel. No real payment is processed.
            </p>
          </div>
        </div>

        <aside className="card sticky top-24 h-fit p-6">
          <SectionTitle index="04" title="Summary" />
          <ul className="space-y-3 border-b border-white/10 pb-4 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-ink-200">
                  {i.name}
                  <span className="ml-1 font-mono text-[10px] uppercase text-ink-400">
                    × {i.qty} · {i.size}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-ink-100">
                  {formatINR(i.price * i.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-300">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-300">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-signal-coral">{error}</p>}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Placing order…" : `Place order — ${formatINR(total)}`}
          </button>
          <Link href="/cart" className="mt-3 block text-center text-xs text-ink-300 hover:text-ink-100">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-lime">{index}</span>
      <span className="font-display text-lg font-semibold">{title}</span>
    </div>
  );
}

function Input({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
        {label}
        {required && <span className="ml-1 text-signal-lime">*</span>}
      </div>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none transition focus:border-signal-lime/40"
      />
    </label>
  );
}

function RadioRow({
  id,
  label,
  sub,
  checked,
  onChange
}: {
  id: string;
  label: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-white/30 has-[:checked]:border-signal-lime/50 has-[:checked]:bg-signal-lime/5"
    >
      <input
        type="radio"
        id={id}
        name="pay"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-signal-lime"
      />
      <div>
        <div className="font-display text-sm font-semibold">{label}</div>
        <div className="mt-0.5 text-xs text-ink-300">{sub}</div>
      </div>
    </label>
  );
}

function Stepper() {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      {["Cart", "Details", "Done"].map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
              i <= 1
                ? "bg-signal-lime text-ink-950"
                : "border border-white/10 bg-black/40 text-ink-400"
            }`}
          >
            {i + 1}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-300">{s}</span>
          {i < 2 && <span className="h-px w-6 bg-white/10" />}
        </div>
      ))}
    </div>
  );
}
