"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS, formatINR, type Product, type ProductColor } from "@/lib/products";
import ProductMockup from "@/components/ProductMockup";
import { useCart } from "@/components/CartProvider";
import type { CustomDesign } from "@/lib/types";
import { downloadDataURL, renderMockupToDataURL } from "@/lib/mockup";

const FONTS = [
  { id: "display", label: "Sans", css: "'Source Sans 3', sans-serif" },
  { id: "mono", label: "Mono", css: "'Source Code Pro', monospace" },
  { id: "sans", label: "Clean", css: "ui-sans-serif, system-ui, sans-serif" }
];

const PRESET_LINES = [
  "Building...",
  "v1.0",
  "No Days Off",
  "Offline Mode",
  "Custom Print",
  "Late Night Shipping",
  "Ship It",
  "0 -> 1",
  "404 / not found",
  "$ npm run launch",
  "// founder mode",
  "Online forever"
];

const PRESET_COLORS = [
  "#f7f7f7",
  "#0a0a0a",
  "#d8ff36",
  "#ff5c3b",
  "#7c5cff",
  "#7cd0ff",
  "#ffd166",
  "#ec4899"
];

export default function StudioClient({
  products,
  embedded = false,
}: {
  products: Product[];
  embedded?: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { add } = useCart();

  const initialSlug = search.get("product");
  const initial = useMemo(() => {
    if (!products.length) {
      throw new Error("StudioClient requires at least one product");
    }
    return products.find((p) => p.slug === initialSlug) || products[0];
  }, [products, initialSlug]);

  const [product, setProduct] = useState<Product>(initial);
  const [color, setColor] = useState<ProductColor>(initial.colors[0]);
  const [size, setSize] = useState(initial.sizes[1] ?? initial.sizes[0]);
  const [qty, setQty] = useState(1);

  const [text, setText] = useState("Building...");
  const [textColor, setTextColor] = useState(initial.colors[0].printDefault);
  const [font, setFont] = useState(FONTS[0].css);

  /** Server-persisted upload path, e.g. /uploads/designs/uuid.png */
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  /** Local object URL for instant preview while / after picking a file */
  const [localPreview, setLocalPreview] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [tab, setTab] = useState<"text" | "image" | "preset">("text");
  const [adding, setAdding] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sync when products / ?product= change (e.g. navigation)
  useEffect(() => {
    setProduct(initial);
  }, [initial]);

  // When user changes product, reset color/size/position
  useEffect(() => {
    setColor(product.colors[0]);
    setSize(product.sizes[1] ?? product.sizes[0]);
    setPosX(0);
    setPosY(0);
  }, [product]);

  // Auto-pick a contrasting text color when fabric color changes
  useEffect(() => {
    setTextColor((current) =>
      current === "#f7f7f7" || current === "#0a0a0a"
        ? color.printDefault
        : current
    );
  }, [color]);

  // Revoke object URLs on unmount / replace
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const fileRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    rectW: number;
    rectH: number;
  } | null>(null);

  const clearImage = () => {
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(undefined);
    setImageUrl(undefined);
  };

  const onUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setImageUrl(undefined);
    setTab("image");
    setUploading(true);

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
      setImageUrl(data.url);
      // Prefer server path; drop local blob once we have it
      setLocalPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return undefined;
      });
    } catch (e) {
      URL.revokeObjectURL(preview);
      setLocalPreview(undefined);
      setImageUrl(undefined);
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const design: CustomDesign = {
    text,
    textColor,
    font,
    imageUrl: imageUrl || localPreview,
    posX,
    posY,
    scale,
    rotation
  };

  const customPrice = product.price + (imageUrl ? 200 : 0);

  // Drag-to-position handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!printAreaRef.current) return;
    const rect = printAreaRef.current.getBoundingClientRect();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: posX,
      startPosY: posY,
      rectW: rect.width,
      rectH: rect.height
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = ((e.clientX - drag.startX) / drag.rectW) * 100;
    const dy = ((e.clientY - drag.startY) / drag.rectH) * 100;
    setPosX(clamp(drag.startPosX + dx, -50, 50));
    setPosY(clamp(drag.startPosY + dy, -50, 50));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const custom: CustomDesign = {
      text,
      textColor,
      font,
      imageUrl,
      posX,
      posY,
      scale,
      rotation
    };
    const baseItem = {
      id: `custom-${product.slug}-${Date.now()}`,
      slug: product.slug,
      name: `${product.name} · Custom`,
      price: customPrice,
      qty,
      size,
      color: color.name,
      colorHex: color.hex,
      fabricHex: color.fabric,
      category: product.category,
      custom
    };
    try {
      // Thumbnail is optional UX; CartProvider strips data URLs on add
      const thumb = await renderMockupToDataURL({
        category: product.category,
        fabric: color.fabric,
        printArea: product.printArea,
        printShape: product.printShape,
        design: { ...custom, imageUrl: imageUrl || localPreview },
        size: 600
      });
      add({ ...baseItem, thumbnailDataUrl: thumb });
    } catch {
      add(baseItem);
    }
    setTimeout(() => {
      setAdding(false);
      router.push("/cart");
    }, 500);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await renderMockupToDataURL({
        category: product.category,
        fabric: color.fabric,
        printArea: product.printArea,
        printShape: product.printShape,
        design,
        size: 1600
      });
      const slug = `${product.slug}-${(text || "design").toLowerCase().replace(/\s+/g, "-").slice(0, 24)}`;
      downloadDataURL(url, `thewearco-${slug}.png`);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  const previewSrc = imageUrl || localPreview;

  return (
    <div
      className={
        embedded
          ? "relative"
          : "relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"
      }
    >
      {!embedded && (
        <header className="relative mb-8 flex animate-fade-in-up flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
              Design Studio
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Print your <span className="gradient-text">own</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-paper-600">
              Drop your art, type your line, drag it into place — and we print it
              on a premium garment in 5-7 days. No minimums.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="tag">Live preview · drag to position</span>
          </div>
        </header>
      )}

      {embedded && (
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            Solo · pick a garment
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-500">
            {products.length} options
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT — full product list, no max-height clip */}
        <aside className="order-2 border-y border-paper-200 py-3 lg:order-1 lg:col-span-3 lg:border-y-0 lg:border-r lg:border-paper-200 lg:py-0 lg:pr-4">
          <div className="px-1 pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
            01 · Garment
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {products.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setProduct(p)}
                className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  p.slug === product.slug
                    ? "border-paper-900 bg-paper-900 text-paper-50"
                    : "border-paper-200 bg-paper-50/80 hover:border-paper-400"
                }`}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-paper-100">
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
                  <div className="font-display text-sm font-semibold leading-snug">
                    {p.name}
                  </div>
                  <div
                    className={`mt-0.5 font-mono text-[10px] ${
                      p.slug === product.slug
                        ? "text-paper-50/70"
                        : "text-paper-500"
                    }`}
                  >
                    from {formatINR(p.price)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER — preview */}
        <section className="order-1 lg:order-2 lg:col-span-6">
          <div className="card relative overflow-hidden">
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <span className="tag">// preview</span>
              <span className="tag border-signal-lime/30 bg-signal-lime/10 text-signal-limeInk">
                {product.name}
              </span>
            </div>
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
              <span className="tag">{size}</span>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="tag border-paper-300 text-paper-800 transition hover:border-signal-lime/50 hover:text-signal-limeInk disabled:opacity-50"
                title="Download mockup as PNG"
              >
                {downloading ? (
                  "Saving..."
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3v12M5 12l7 7 7-7M4 21h16" />
                    </svg>
                    PNG
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <ProductMockup
                category={product.category}
                fabric={color.fabric}
                printArea={product.printArea}
                printShape={product.printShape}
                design={design}
                showPrintArea
                interactive
                printAreaRef={printAreaRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            </div>

            <div className="border-t border-paper-200 bg-paper-100/80 px-4 py-3 backdrop-blur">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <Stat label="Garment" value={labelFor(product.category)} />
                <Stat label="Color" value={color.name} />
                <Stat label="Total" value={formatINR(customPrice * qty)} />
              </div>
            </div>
          </div>

          {/* Position controls */}
          <div className="card mt-4 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
                03 · Fine-tune
              </div>
              <button
                onClick={() => {
                  setPosX(0);
                  setPosY(0);
                  setScale(1);
                  setRotation(0);
                }}
                className="text-xs text-paper-600 hover:text-signal-limeInk"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Slider label="Horizontal" value={posX} min={-50} max={50} onChange={setPosX} suffix="%" />
              <Slider label="Vertical" value={posY} min={-50} max={50} onChange={setPosY} suffix="%" />
              <Slider label="Scale" value={scale} min={0.4} max={1.6} step={0.05} onChange={setScale} />
              <Slider label="Rotate" value={rotation} min={-45} max={45} onChange={setRotation} suffix="°" />
            </div>
            <p className="mt-3 font-mono text-[10px] text-paper-500">
              tip — drag your design directly on the garment to position it.
            </p>
          </div>
        </section>

        {/* RIGHT — design controls */}
        <aside className="order-3 lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-3">
              {(["text", "image", "preset"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-3 text-xs uppercase tracking-[0.18em] transition ${
                    tab === t
                      ? "bg-signal-lime/10 text-signal-limeInk"
                      : "text-paper-600 hover:text-paper-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4">
              {tab === "text" && (
                <>
                  <Field label="02 · Your line">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={40}
                      placeholder="Type something legendary"
                      className="h-20 w-full resize-none rounded-lg border border-paper-200 bg-paper-200 p-3 text-sm outline-none focus:border-signal-lime/40"
                    />
                    <div className="mt-1 text-right font-mono text-[10px] text-paper-500">
                      {text.length}/40
                    </div>
                  </Field>

                  <Field label="Font">
                    <div className="grid grid-cols-3 gap-2">
                      {FONTS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFont(f.css)}
                          style={{ fontFamily: f.css }}
                          className={`rounded-lg border px-3 py-2 text-xs transition ${
                            font === f.css
                              ? "border-signal-lime bg-signal-lime/10 text-signal-limeInk"
                              : "border-paper-200 bg-paper-50 text-paper-800"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Text color">
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setTextColor(c)}
                          aria-label={c}
                          className={`h-7 w-7 rounded-full border transition ${
                            textColor === c ? "border-signal-lime" : "border-paper-300"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded-full border border-paper-200 bg-transparent"
                        aria-label="Custom color"
                      />
                    </div>
                  </Field>
                </>
              )}

              {tab === "image" && (
                <>
                  <Field label="02 · Upload your art">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f) void onUpload(f);
                      }}
                      onClick={() => fileRef.current?.click()}
                      className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-paper-300 bg-paper-200 p-6 text-center transition hover:border-signal-lime/40"
                    >
                      {previewSrc ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewSrc}
                            alt="Uploaded"
                            className="max-h-32 rounded-md"
                          />
                          <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-signal-limeInk">
                            {uploading ? "Uploading..." : "Click to replace"}
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" className="h-8 w-8 text-paper-600" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <path d="M17 8l-5-5-5 5" />
                            <path d="M12 3v12" />
                          </svg>
                          <div className="mt-3 text-sm text-paper-800">
                            Drop PNG, JPG, SVG
                          </div>
                          <div className="mt-1 font-mono text-[10px] text-paper-500">
                            up to 5 MB · transparent recommended
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onUpload(f);
                        e.target.value = "";
                      }}
                    />
                  </Field>

                  {previewSrc && (
                    <button
                      onClick={clearImage}
                      className="text-xs text-paper-600 hover:text-signal-coral"
                    >
                      Remove image
                    </button>
                  )}

                  <Field label="Pair with text (optional)">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Optional caption"
                      className="w-full rounded-lg border border-paper-200 bg-paper-200 p-3 text-sm outline-none focus:border-signal-lime/40"
                    />
                  </Field>
                </>
              )}

              {tab === "preset" && (
                <Field label="02 · Quick lines">
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_LINES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setText(p)}
                        className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                          text === p
                            ? "border-signal-lime bg-signal-lime/10 text-signal-limeInk"
                            : "border-paper-200 bg-paper-50 text-paper-800 hover:border-paper-400"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </div>
          </div>

          {/* Color & size */}
          <div className="card mt-4 p-4">
            <Field label="Garment color">
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                      color.name === c.name
                        ? "border-signal-lime bg-signal-lime/10 text-signal-limeInk"
                        : "border-paper-200 bg-paper-50 text-paper-800"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-paper-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Size">
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-10 rounded-full border px-3 py-1 text-xs transition ${
                      size === s
                        ? "border-signal-lime bg-signal-lime/10 text-signal-limeInk"
                        : "border-paper-200 bg-paper-50 text-paper-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Quantity">
              <div className="flex items-center rounded-full border border-paper-200 bg-paper-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-paper-700"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-paper-700">
                  +
                </button>
              </div>
            </Field>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn-primary mt-4 w-full"
            disabled={adding || uploading}
          >
            {adding
              ? "Adding to cart..."
              : uploading
                ? "Uploading image..."
                : `Add to cart — ${formatINR(customPrice * qty)}`}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>

          <p className="mt-3 px-1 text-[11px] leading-relaxed text-paper-500">
            Custom prints are made-to-order and ship in 5-7 working days.
            Image uploads are saved to the server when you add them.
            {" "}
            <Link href="/about" className="text-signal-limeInk">
              Print specs -&gt;
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
        {label}
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = ""
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
          {label}
        </span>
        <span className="font-mono text-[11px] text-paper-800">
          {Number.isInteger(value) ? value : value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-signal-lime"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">{label}</div>
      <div className="mt-0.5 font-display text-sm font-semibold">{value}</div>
    </div>
  );
}

function labelFor(c: string) {
  return (CATEGORY_LABELS as Record<string, string>)[c] ?? c;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
