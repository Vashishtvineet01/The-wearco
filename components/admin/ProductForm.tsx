"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ProductMockup from "@/components/ProductMockup";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction
} from "@/lib/admin-actions";
import {
  CATEGORY_LABELS,
  type PrintShape,
  type ProductCategory
} from "@/lib/products";

type ColorRow = { name: string; hex: string; fabric: string; printDefault: string };

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  category: ProductCategory;
  price: number;
  drop: string;
  description: string;
  details: string[];
  printArea: { x: number; y: number; w: number; h: number };
  printShape: PrintShape;
  customizable: boolean;
  active: boolean;
  colors: ColorRow[];
  sizes: string[];
};

const CATEGORY_OPTIONS: ProductCategory[] = [
  "tee",
  "hoodie",
  "sweatshirt",
  "cap",
  "sleeve",
  "mug",
  "badge",
  "poster"
];

const PRINT_SHAPE_OPTIONS: { value: PrintShape; label: string }[] = [
  { value: "rect", label: "Rectangle (tees, hoodies)" },
  { value: "circle", label: "Circle (pins, badges)" },
  { value: "cylinder", label: "Cylinder wrap (mugs)" },
  { value: "full", label: "Full face (posters)" }
];

/** Suggested print area + shape for each category when the user switches. */
const CATEGORY_DEFAULTS: Record<
  ProductCategory,
  { printArea: FormState["printArea"]; printShape: PrintShape; sizes: string[] }
> = {
  tee: { printArea: { x: 30, y: 28, w: 40, h: 30 }, printShape: "rect", sizes: ["S", "M", "L", "XL", "XXL"] },
  hoodie: { printArea: { x: 32, y: 32, w: 36, h: 28 }, printShape: "rect", sizes: ["S", "M", "L", "XL"] },
  sweatshirt: { printArea: { x: 30, y: 32, w: 40, h: 28 }, printShape: "rect", sizes: ["S", "M", "L", "XL", "XXL"] },
  cap: { printArea: { x: 30, y: 35, w: 40, h: 18 }, printShape: "rect", sizes: ["One Size"] },
  sleeve: { printArea: { x: 30, y: 28, w: 40, h: 30 }, printShape: "rect", sizes: ["S", "M", "L", "XL"] },
  mug: { printArea: { x: 25, y: 38, w: 44, h: 28 }, printShape: "cylinder", sizes: ["330ml"] },
  badge: { printArea: { x: 28, y: 28, w: 44, h: 44 }, printShape: "circle", sizes: ["38mm", "58mm"] },
  poster: { printArea: { x: 14, y: 14, w: 72, h: 72 }, printShape: "full", sizes: ["A4", "A3", "A2"] }
};

const empty: FormState = {
  name: "",
  slug: "",
  tagline: "",
  category: "tee",
  price: 999,
  drop: "Drop 01 — Late Night",
  description: "",
  details: [],
  printArea: { x: 30, y: 28, w: 40, h: 30 },
  printShape: "rect",
  customizable: true,
  active: true,
  colors: [
    { name: "Obsidian", hex: "#0a0a0a", fabric: "#0e0e10", printDefault: "#f7f7f7" }
  ],
  sizes: ["S", "M", "L", "XL"]
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export default function ProductForm({
  mode,
  productId,
  initial
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: FormState;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial || empty);
  const [detailInput, setDetailInput] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const previewColor = form.colors[0];

  const payload = useMemo(() => form, [form]);

  const onSave = () => {
    setError("");
    start(async () => {
      const res =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(productId!, payload);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!productId || !confirm("Delete this product?")) return;
    start(async () => {
      await deleteProductAction(productId);
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Field label="Name">
          <input
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({
                ...f,
                name,
                slug: autoSlug ? slugify(name) : f.slug
              }));
            }}
          />
        </Field>
        <Field label="Slug">
          <input
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 font-mono text-xs outline-none focus:border-signal-lime/40"
            value={form.slug}
            onChange={(e) => {
              setAutoSlug(false);
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
            }}
          />
        </Field>
        <Field label="Tagline">
          <input
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
            value={form.tagline}
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Category">
            <select
              className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
              value={form.category}
              onChange={(e) => {
                const category = e.target.value as ProductCategory;
                const defaults = CATEGORY_DEFAULTS[category];
                setForm((f) => ({
                  ...f,
                  category,
                  // Only snap the print area + shape when the user hasn't
                  // manually tuned them (i.e. they still match the old defaults).
                  // For simplicity we always apply defaults on category change —
                  // the user can tweak afterward.
                  printArea: defaults.printArea,
                  printShape: defaults.printShape,
                  sizes: defaults.sizes
                }));
              }}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (INR)">
            <input
              type="number"
              className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Drop">
            <input
              className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
              value={form.drop}
              onChange={(e) => setForm((f) => ({ ...f, drop: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>

        <Field label="Details">
          <div className="flex flex-wrap gap-2">
            {form.details.map((d) => (
              <button
                key={d}
                type="button"
                className="tag"
                onClick={() =>
                  setForm((f) => ({ ...f, details: f.details.filter((x) => x !== d) }))
                }
              >
                {d} ×
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
              value={detailInput}
              placeholder="Add detail and press Enter"
              onChange={(e) => setDetailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!detailInput.trim()) return;
                  setForm((f) => ({ ...f, details: [...f.details, detailInput.trim()] }));
                  setDetailInput("");
                }
              }}
            />
          </div>
        </Field>

        <Field label="Sizes (comma separated)">
          <input
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
            value={form.sizes.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                sizes: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              }))
            }
          />
        </Field>

        <Field label="Print shape">
          <select
            className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
            value={form.printShape}
            onChange={(e) =>
              setForm((f) => ({ ...f, printShape: e.target.value as PrintShape }))
            }
          >
            {PRINT_SHAPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 font-mono text-[10px] text-paper-500">
            Controls how the design is clipped on the preview + export.
          </p>
        </Field>

        <Field label="Print area (%)">
          <div className="grid grid-cols-4 gap-2">
            {(["x", "y", "w", "h"] as const).map((k) => (
              <label key={k} className="block">
                <span className="font-mono text-[10px] uppercase text-paper-500">{k}</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                  value={form.printArea[k]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      printArea: { ...f.printArea, [k]: Number(e.target.value) }
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </Field>

        <Field label="Colors">
          <div className="space-y-3">
            {form.colors.map((c, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-paper-200 p-3 sm:grid-cols-4">
                <input
                  className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) => {
                    const colors = [...form.colors];
                    colors[i] = { ...c, name: e.target.value };
                    setForm((f) => ({ ...f, colors }));
                  }}
                />
                <input
                  className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                  placeholder="Hex"
                  value={c.hex}
                  onChange={(e) => {
                    const colors = [...form.colors];
                    colors[i] = { ...c, hex: e.target.value };
                    setForm((f) => ({ ...f, colors }));
                  }}
                />
                <input
                  className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                  placeholder="Fabric"
                  value={c.fabric}
                  onChange={(e) => {
                    const colors = [...form.colors];
                    colors[i] = { ...c, fabric: e.target.value };
                    setForm((f) => ({ ...f, colors }));
                  }}
                />
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
                    placeholder="Print"
                    value={c.printDefault}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[i] = { ...c, printDefault: e.target.value };
                      setForm((f) => ({ ...f, colors }));
                    }}
                  />
                  {form.colors.length > 1 && (
                    <button
                      type="button"
                      className="text-xs text-signal-coral"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          colors: f.colors.filter((_, idx) => idx !== i)
                        }))
                      }
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-signal-limeInk"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  colors: [
                    ...f.colors,
                    { name: "New", hex: "#222", fabric: "#222", printDefault: "#f7f7f7" }
                  ]
                }))
              }
            >
              + Add color
            </button>
          </div>
        </Field>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.customizable}
              onChange={(e) => setForm((f) => ({ ...f, customizable: e.target.checked }))}
            />
            Customizable
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Active (visible in shop)
          </label>
        </div>

        {error && <p className="text-sm text-signal-coral">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" className="btn-primary" disabled={pending} onClick={onSave}>
            {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              className="btn-ghost text-signal-coral"
              disabled={pending}
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card sticky top-8 p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
            Live preview
          </div>
          {previewColor && (
            <ProductMockup
              category={form.category}
              fabric={previewColor.fabric}
              printArea={form.printArea}
              printShape={form.printShape}
              printText={form.name.split(" ")[0] || "Preview"}
              printColor={previewColor.printDefault}
              showPrintArea
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
        {label}
      </div>
      {children}
    </label>
  );
}
