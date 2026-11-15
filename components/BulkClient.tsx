"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  formatINR,
  type Product,
  type ProductCategory
} from "@/lib/products";
import {
  calculateBulkQuote,
  minBulkQty,
  TIERS_BY_CATEGORY,
  tierLabel
} from "@/lib/bulk";
import ProductMockup from "./ProductMockup";

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "done"; url: string; name: string }
  | { status: "error"; message: string };

export default function BulkClient({ products }: { products: Product[] }) {
  // Pick a sensible first product — prefer a hoodie (highest-ticket + popular for bulk)
  const defaultProduct =
    products.find((p) => p.category === "hoodie") || products[0] || null;

  const [product, setProduct] = useState<Product | null>(defaultProduct);
  const [qty, setQty] = useState<number>(() =>
    defaultProduct ? Math.max(25, minBulkQty(defaultProduct.category)) : 25
  );

  // Enquiry form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [color, setColor] = useState<string>(
    defaultProduct?.colors[0]?.name || ""
  );
  const [size, setSize] = useState<string>(defaultProduct?.sizes[0] || "");
  const [deadline, setDeadline] = useState<string>(""); // yyyy-mm-dd
  const [message, setMessage] = useState("");

  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { message: string }>(null);
  const [error, setError] = useState("");

  const quote = useMemo(() => {
    if (!product) return null;
    return calculateBulkQuote(product.category, product.price, qty);
  }, [product, qty]);

  const onPickProduct = (slug: string) => {
    const next = products.find((p) => p.slug === slug) || null;
    setProduct(next);
    if (next) {
      setQty((cur) => Math.max(cur, minBulkQty(next.category)));
      setColor(next.colors[0]?.name || "");
      setSize(next.sizes[0] || "");
    }
  };

  const onFile = async (file: File) => {
    setUpload({ status: "uploading" });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/design", {
        method: "POST",
        body: form
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setUpload({ status: "done", url: data.url, name: file.name });
    } catch (e) {
      setUpload({
        status: "error",
        message: e instanceof Error ? e.message : "Upload failed"
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const body = {
        email,
        name,
        company: company || null,
        phone: phone || null,
        productSlug: product?.slug || null,
        productName: product?.name || null,
        category: product?.category || null,
        qty,
        color: color || null,
        size: size || null,
        printShape: product?.printShape || "rect",
        deadline: deadline || null,
        message,
        fileUrl: upload.status === "done" ? upload.url : null,
        estimatedUnitPrice: quote?.unitPrice ?? null,
        estimatedTotal: quote?.total ?? null,
        tierDiscountPercent: quote?.discountPct ?? null
      };

      const res = await fetch("/api/bulk/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setSubmitted({
        message:
          data.message ||
          "Thanks — we've got your enquiry. We'll reach out within 1 business day."
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const tiers = product ? TIERS_BY_CATEGORY[product.category] : [];

  if (submitted) {
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
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
              // Enquiry received
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold">Got it.</h1>
            <p className="mt-3 text-ink-300">{submitted.message}</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/shop" className="btn-primary">
                Keep browsing
              </Link>
              <Link href="/" className="btn-ghost">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] animate-drift rounded-full bg-signal-violet/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-[-80px] h-[440px] w-[440px] animate-drift-slow rounded-full bg-signal-coral/10 blur-3xl"
      />
      <header className="relative mb-10 flex animate-fade-in-up flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
            // Bulk orders
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Kit out your <span className="gradient-text">team.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-200 md:text-lg">
            Tees, hoodies, sweatshirts, caps, mugs, pins, posters — printed with
            your artwork. Volume pricing from 10 units, discounts up to{" "}
            <span className="gradient-text font-semibold">50%</span>. Teams,
            launches, conferences, YC batches, Discord drops.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag">
            <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-lime" />
            Replies in &lt; 1 business day
          </span>
        </div>
      </header>

      <div className="relative grid gap-6 lg:grid-cols-12">
        {/* LEFT — product + calc */}
        <section className="lg:col-span-7">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
                01 · Pick a product
              </div>
              {product && (
                <span className="tag">
                  {CATEGORY_LABELS[product.category]} · from{" "}
                  {formatINR(product.price)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {products.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onPickProduct(p.slug)}
                  className={`card group flex items-center gap-3 p-2 text-left transition ${
                    product?.slug === p.slug
                      ? "border-signal-lime/60 bg-signal-lime/5"
                      : "hover:border-white/30"
                  }`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-900">
                    <ProductMockup
                      category={p.category}
                      fabric={p.colors[0].fabric}
                      printArea={p.printArea}
                      printShape={p.printShape}
                      printText={p.name.split(" ")[0]}
                      printColor={p.colors[0].printDefault}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-semibold">
                      {p.name}
                    </div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {formatINR(p.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {product && quote && (
            <div className="card mt-4 overflow-hidden">
              <div className="grid gap-6 p-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <div className="overflow-hidden rounded-xl bg-ink-900">
                    <ProductMockup
                      category={product.category}
                      fabric={product.colors[0].fabric}
                      printArea={product.printArea}
                      printShape={product.printShape}
                      printText={product.name.split(" ")[0]}
                      printColor={product.colors[0].printDefault}
                    />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
                    02 · Quantity
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min={Math.max(1, minBulkQty(product.category))}
                      max={500}
                      step={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full accent-signal-lime"
                    />
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))
                      }
                      className="w-24 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-right font-mono text-sm outline-none focus:border-signal-lime/40"
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <Stat label="Unit price" value={formatINR(quote.unitPrice)} sub={`was ${formatINR(product.price)}`} />
                    <Stat label="Discount" value={`${quote.discountPct}%`} sub={quote.discountPct > 0 ? `save ${formatINR(quote.savings)}` : "add qty to unlock"} highlight={quote.discountPct > 0} />
                    <Stat label="Total" value={formatINR(quote.total)} sub={`${qty} pcs`} />
                  </div>

                  {quote.requiresQuote && (
                    <div className="mt-4 rounded-xl border border-signal-lime/30 bg-signal-lime/5 p-3 text-xs text-signal-lime">
                      Enterprise tier — send the enquiry form and our team will
                      confirm the final rate within one business day.
                    </div>
                  )}
                </div>
              </div>

              {/* Tier table */}
              <div className="border-t border-white/[0.06] bg-black/30 p-6">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
                  Tier pricing · {CATEGORY_LABELS[product.category]}
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] text-ink-300">
                        <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider">Discount</th>
                        <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wider">Unit price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tiers.map((t, i) => {
                        const unit = Math.round(product.price * (1 - t.discountPct / 100));
                        const active =
                          quote.tier && quote.tier.minQty === t.minQty;
                        return (
                          <tr
                            key={t.minQty}
                            className={active ? "bg-signal-lime/10 text-signal-lime" : "text-ink-100"}
                          >
                            <td className="px-4 py-2 font-mono">
                              {tierLabel(tiers, i)}
                              {t.requiresQuote && (
                                <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase text-ink-400">
                                  quote
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 font-mono">-{t.discountPct}%</td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatINR(unit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-4 p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
              What's included
            </div>
            <ul className="grid gap-2 text-sm text-ink-100 sm:grid-cols-2">
              {[
                "Free custom artwork placement",
                "Mockup PDF for sign-off",
                "DTG / screen print / embroidery",
                "Pan-India shipping, GST invoice",
                "Dedicated account manager",
                "Co-branded tags (add-on)"
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-signal-lime" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* RIGHT — enquiry form */}
        <section className="lg:col-span-5">
          <form onSubmit={onSubmit} className="card sticky top-24 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
                03 · Send enquiry
              </div>
              <span className="tag">no commitment</span>
            </div>

            <div className="grid gap-3">
              <Input label="Full name" required value={name} onChange={setName} placeholder="Aarav Mehta" />
              <Input label="Work email" required type="email" value={email} onChange={setEmail} placeholder="aarav@startup.in" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Company (optional)" value={company} onChange={setCompany} placeholder="TheWearCo Inc." />
                <Input label="Phone (optional)" type="tel" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" />
              </div>

              {product && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Color">
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                    >
                      {product.colors.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Size">
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                    >
                      {product.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              <Field label="Deadline (optional)">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-signal-lime/40"
                />
              </Field>

              <Field label="Brief / message">
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="We're a 32-person team shipping v2 at TechSparks. Need chest + sleeve print on hoodies, pantone 180C, delivered to Bengaluru by Dec 20."
                  className="h-28 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-signal-lime/40"
                />
              </Field>

              <Field label="Artwork (optional)">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-white/15 bg-black/40 px-3 py-3 text-xs transition hover:border-signal-lime/40">
                  <div>
                    {upload.status === "done" && (
                      <>
                        <div className="text-signal-lime">✓ {upload.name}</div>
                        <div className="font-mono text-[10px] text-ink-400">
                          uploaded — click to replace
                        </div>
                      </>
                    )}
                    {upload.status === "uploading" && (
                      <div className="text-ink-200">Uploading…</div>
                    )}
                    {upload.status === "error" && (
                      <div className="text-signal-coral">{upload.message}</div>
                    )}
                    {upload.status === "idle" && (
                      <>
                        <div className="text-ink-100">Drop PNG, SVG, PDF mockup</div>
                        <div className="font-mono text-[10px] text-ink-400">
                          up to 5 MB — optional
                        </div>
                      </>
                    )}
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-ink-200">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onFile(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </Field>

              {quote && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-ink-200">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                    Attached quote estimate
                  </div>
                  <div className="mt-1">
                    {product?.name} · {qty} pcs · {quote.discountPct}% off ·{" "}
                    <span className="font-mono text-signal-lime">
                      {formatINR(quote.total)}
                    </span>
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-signal-coral">{error}</p>}

              <button
                type="submit"
                disabled={submitting || upload.status === "uploading"}
                className="btn-primary mt-2 w-full"
              >
                {submitting ? "Sending…" : "Send enquiry"}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>

              <p className="text-[11px] leading-relaxed text-ink-400">
                By sending this you&apos;re not committing to buy. We&apos;ll
                confirm the final quote by email within 1 business day.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
        {label}
      </div>
      {children}
    </label>
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
    <Field label={label + (required ? " *" : "")}>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
      />
    </Field>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight = false
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-signal-lime/40 bg-signal-lime/5"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-lg font-bold ${
          highlight ? "text-signal-lime" : ""
        }`}
      >
        {value}
      </div>
      {sub && <div className="font-mono text-[10px] text-ink-400">{sub}</div>}
    </div>
  );
}
