"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/products";
import RazorpayScript, {
  type RazorpayHandlerResponse,
} from "@/components/RazorpayScript";

type PayMethod = "upi" | "card" | "cod";

export type CheckoutPrefill = {
  email: string;
  name: string;
  phone: string;
  gst: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  /** True when the buyer already has a customer session cookie. */
  isLoggedIn: boolean;
};

export default function CheckoutClient({
  prefill,
}: {
  prefill: CheckoutPrefill;
}) {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<"info" | "done">("info");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState(prefill.email);
  const [name, setName] = useState(prefill.name);
  const [phone, setPhone] = useState(prefill.phone);
  const [gst, setGst] = useState(prefill.gst);
  const [line1, setLine1] = useState(prefill.line1);
  const [line2, setLine2] = useState(prefill.line2);
  const [city, setCity] = useState(prefill.city);
  const [state, setState] = useState(prefill.state);
  const [pincode, setPincode] = useState(prefill.pincode);
  const [country, setCountry] = useState(prefill.country || "India");
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("upi");

  // Soft-prompt — guests can create a password or verify via OTP.
  const [savePrompt, setSavePrompt] = useState<
    "idle" | "password" | "otp-sent" | "done"
  >("idle");
  const [savePassword, setSavePassword] = useState("");
  const [saveCode, setSaveCode] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

  const shippingBase = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;
  const shipping = shippingBase + (paymentMethod === "cod" ? 49 : 0);
  const total = subtotal + shipping;

  if (items.length === 0 && step !== "done") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <h1 className="font-display text-3xl">Nothing to check out yet.</h1>
        <Link href="/shop" className="mt-4 inline-block text-signal-limeInk">
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
      const res = await fetch("/api/payments/create-order", {
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
                  rotation: i.custom.rotation,
                }
              : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      if (data.mode === "cod" || data.mode === "demo") {
        setOrderId(data.orderNumber);
        setStep("done");
        clear();
        return;
      }

      if (data.mode === "razorpay" && data.razorpay) {
        const rzp = data.razorpay as {
          orderId: string;
          amount: number;
          currency: string;
          keyId: string;
        };

        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error(
            "Payment gateway still loading — please try again in a moment."
          );
        }

        const checkout = new window.Razorpay({
          key: rzp.keyId,
          amount: rzp.amount,
          currency: rzp.currency,
          order_id: rzp.orderId,
          name: "TheWearCo",
          description: `Order ${data.orderNumber}`,
          prefill: { name, email, contact: phone },
          notes: { orderNumber: data.orderNumber },
          theme: { color: "#7c5cff" },
          handler: async (r: RazorpayHandlerResponse) => {
            try {
              const v = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(r),
              });
              const vd = await v.json();
              if (!v.ok) throw new Error(vd.error || "Verification failed");
              setOrderId(data.orderNumber);
              setStep("done");
              clear();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Payment taken but verification failed. Our team will reconcile it."
              );
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setError("Payment cancelled — your order is saved as pending.");
            },
          },
        });
        checkout.open();
        return;
      }

      throw new Error("Unexpected response from payment API");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
      setSubmitting(false);
    }
  };

  const onCreatePassword = async () => {
    if (!email || savePassword.length < 8) {
      setSaveError("Password must be at least 8 characters.");
      return;
    }
    setSaveBusy(true);
    setSaveError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: savePassword, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create account");
      setSavePrompt("done");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not create account"
      );
    } finally {
      setSaveBusy(false);
    }
  };

  const onSendSaveOtp = async () => {
    if (!email) return;
    setSaveBusy(true);
    setSaveError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setSavePrompt("otp-sent");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setSaveBusy(false);
    }
  };

  const onVerifySaveOtp = async () => {
    if (saveCode.length !== 6) {
      setSaveError("Enter the 6-digit code.");
      return;
    }
    setSaveBusy(true);
    setSaveError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: saveCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setSavePrompt("done");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSaveBusy(false);
    }
  };

  if (step === "done") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 lg:px-8">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-signal-lime/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-signal-lime text-ink-950">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Order confirmed
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold">
              You&apos;re shipping
            </h1>
            <p className="mt-3 text-paper-600">
              We&apos;ve sent a confirmation to{" "}
              <span className="text-paper-900">{email || "your email"}</span>.
              Custom prints typically ship in 5–7 working days.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-200 px-4 py-2 font-mono text-sm">
              <span className="text-paper-500">Order</span>
              <span className="text-paper-900">{orderId}</span>
            </div>

            {/* Soft-prompt: guest only */}
            {!prefill.isLoggedIn && (
              <div className="mt-8 rounded-2xl border border-paper-200 bg-paper-100/80 p-5 text-left">
                {savePrompt === "done" ? (
                  <>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-limeInk">
                      // You&apos;re in
                    </div>
                    <p className="mt-2 text-sm text-paper-700">
                      Account ready for{" "}
                      <span className="font-semibold text-paper-900">
                        {email}
                      </span>
                      . This order (and any past guest orders on this email) now
                      show on{" "}
                      <Link
                        href="/account"
                        className="text-signal-violetInk underline underline-offset-2"
                      >
                        your account
                      </Link>
                      .
                    </p>
                  </>
                ) : savePrompt === "otp-sent" ? (
                  <>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-limeInk">
                      // Enter code
                    </div>
                    <p className="mt-2 text-sm text-paper-700">
                      We emailed a 6-digit code to{" "}
                      <span className="font-semibold text-paper-900">
                        {email}
                      </span>
                      .
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={saveCode}
                      onChange={(e) =>
                        setSaveCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="123456"
                      className="mt-3 w-full rounded-full border border-paper-200 bg-paper-50 px-4 py-2.5 font-mono text-sm tracking-[0.3em] outline-none focus:border-signal-violetInk/50"
                    />
                    {saveError && (
                      <p className="mt-2 text-xs text-signal-coral">{saveError}</p>
                    )}
                    <button
                      type="button"
                      onClick={onVerifySaveOtp}
                      disabled={saveBusy}
                      className="btn-primary mt-3"
                    >
                      {saveBusy ? "Verifying…" : "Verify & save"}
                    </button>
                  </>
                ) : savePrompt === "password" ? (
                  <>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
                      // Create password
                    </div>
                    <p className="mt-2 text-sm text-paper-700">
                      Saving for{" "}
                      <span className="font-semibold text-paper-900">
                        {email}
                      </span>
                      . Min 8 characters.
                    </p>
                    <input
                      type="password"
                      minLength={8}
                      value={savePassword}
                      onChange={(e) => setSavePassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-3 w-full rounded-full border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-signal-violetInk/50"
                    />
                    {saveError && (
                      <p className="mt-2 text-xs text-signal-coral">{saveError}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onCreatePassword}
                        disabled={saveBusy}
                        className="btn-primary"
                      >
                        {saveBusy ? "Saving…" : "Create account"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSavePrompt("idle");
                          setSaveError("");
                        }}
                        className="btn-ghost"
                      >
                        Back
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
                      // Optional
                    </div>
                    <h2 className="mt-1 font-display text-lg font-semibold">
                      Save this order to your account
                    </h2>
                    <p className="mt-1 text-sm text-paper-600">
                      Create a password or get a one-time email code. Track this
                      order (and any past guest orders) from one place.
                    </p>
                    {saveError && (
                      <p className="mt-2 text-xs text-signal-coral">{saveError}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSavePrompt("password");
                          setSaveError("");
                        }}
                        className="btn-primary"
                      >
                        Set a password
                      </button>
                      <button
                        type="button"
                        onClick={onSendSaveOtp}
                        disabled={saveBusy}
                        className="btn-ghost"
                      >
                        {saveBusy ? "Sending…" : "Email me a code"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {prefill.isLoggedIn && (
              <p className="mt-6 text-sm text-paper-600">
                This order is already on{" "}
                <Link
                  href="/account"
                  className="text-signal-violetInk underline underline-offset-2"
                >
                  your account
                </Link>
                .
              </p>
            )}

            <div className="mt-8 flex justify-center gap-3">
              <Link href="/shop" className="btn-primary">
                Continue
              </Link>
              <Link href="/design" className="btn-ghost">
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
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Checkout
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Final layer
          </h1>
          {prefill.isLoggedIn && (
            <p className="mt-2 text-sm text-paper-600">
              Signed in as {prefill.email} — we prefilled your last details.
            </p>
          )}
        </div>
        <Stepper />
      </div>

      <form onSubmit={onPlaceOrder} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <SectionTitle index="01" title="Contact" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Full name"
                required
                value={name}
                onChange={setName}
                placeholder="Aarav Mehta"
              />
              <Input
                label="Email"
                required
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="aarav@startup.in"
              />
              <Input
                label="Phone"
                required
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98xxxxxxxx"
              />
              <Input
                label="GST (optional)"
                value={gst}
                onChange={setGst}
                placeholder="22ABCDE1234F1Z5"
              />
            </div>
          </div>

          <div className="card p-6">
            <SectionTitle index="02" title="Ship to" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Address line 1"
                required
                value={line1}
                onChange={setLine1}
                placeholder="Flat / building"
              />
              <Input
                label="Address line 2"
                value={line2}
                onChange={setLine2}
                placeholder="Street / area"
              />
              <Input
                label="City"
                required
                value={city}
                onChange={setCity}
                placeholder="Bengaluru"
              />
              <Input
                label="State"
                required
                value={state}
                onChange={setState}
                placeholder="Karnataka"
              />
              <Input
                label="Pincode"
                required
                value={pincode}
                onChange={setPincode}
                placeholder="560001"
              />
              <Input
                label="Country"
                required
                value={country}
                onChange={setCountry}
              />
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
            <p className="mt-3 text-[11px] text-paper-500">
              Payments processed by Razorpay (UPI, cards, netbanking). COD adds
              a ₹49 handling fee.
            </p>
            <RazorpayScript />
          </div>
        </div>

        <aside className="card sticky top-24 h-fit p-6">
          <SectionTitle index="04" title="Summary" />
          <ul className="space-y-3 border-b border-paper-200 pb-4 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-paper-700">
                  {i.name}
                  <span className="ml-1 font-mono text-[10px] uppercase text-paper-500">
                    × {i.qty} · {i.size}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-paper-800">
                  {formatINR(i.price * i.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-paper-600">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-paper-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-paper-200 pt-3">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">
                {formatINR(total)}
              </span>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-signal-coral">{error}</p>}

          <button
            type="submit"
            className="btn-primary mt-6 w-full"
            disabled={submitting}
          >
            {submitting
              ? "Placing order…"
              : `Place order — ${formatINR(total)}`}
          </button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-xs text-paper-600 hover:text-paper-800"
          >
            Back to cart
          </Link>
          {!prefill.isLoggedIn && (
            <p className="mt-4 text-center text-[11px] text-paper-500">
              No account needed. You can{" "}
              <Link href="/login" className="underline underline-offset-2">
                sign in later
              </Link>{" "}
              to track orders.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-limeInk">
        {index}
      </span>
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
  onChange,
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
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
        {label}
        {required && <span className="ml-1 text-signal-limeInk">*</span>}
      </div>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none transition focus:border-signal-lime/40"
      />
    </label>
  );
}

function RadioRow({
  id,
  label,
  sub,
  checked,
  onChange,
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
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-paper-200 bg-paper-100/80 p-4 transition hover:border-paper-400 has-[:checked]:border-signal-lime/50 has-[:checked]:bg-signal-lime/5"
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
        <div className="mt-0.5 text-xs text-paper-600">{sub}</div>
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
                : "border border-paper-200 bg-paper-200 text-paper-500"
            }`}
          >
            {i + 1}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-600">
            {s}
          </span>
          {i < 2 && <span className="h-px w-6 bg-paper-200" />}
        </div>
      ))}
    </div>
  );
}
