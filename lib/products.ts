export type ProductCategory =
  | "tee"
  | "hoodie"
  | "sweatshirt"
  | "cap"
  | "sleeve"
  | "mug"
  | "badge"
  | "poster";

/**
 * Shape of the printable region on a product.
 * - "rect"     — rectangular print area (tees, hoodies, posters, mug wraps)
 * - "circle"   — circular print area (enamel pins / badges)
 * - "cylinder" — cylindrical wrap print (mugs). Visually a rectangle, but
 *                the renderer applies a slight horizontal arc to suggest wrap.
 * - "full"     — the entire garment face IS the print area (posters)
 */
export type PrintShape = "rect" | "circle" | "cylinder" | "full";

/** Categories that use the standard apparel sizing selector (S/M/L/XL/XXL). */
export const APPAREL_CATEGORIES: ProductCategory[] = [
  "tee",
  "hoodie",
  "sweatshirt",
  "sleeve"
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  tee: "Tee",
  hoodie: "Hoodie",
  sweatshirt: "Sweatshirt",
  cap: "Cap",
  sleeve: "Sleeve",
  mug: "Mug",
  badge: "Badge",
  poster: "Poster"
};

export const CATEGORY_PLURAL_LABELS: Record<ProductCategory, string> = {
  tee: "Tees",
  hoodie: "Hoodies",
  sweatshirt: "Sweatshirts",
  cap: "Caps",
  sleeve: "Sleeves",
  mug: "Mugs",
  badge: "Badges",
  poster: "Posters"
};

export type ProductColor = {
  name: string;
  hex: string;
  // Color of fabric in product mockup
  fabric: string;
  // Color of typography that looks best on this fabric
  printDefault: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  price: number; // in INR
  drop: string;
  printArea: { x: number; y: number; w: number; h: number }; // % of canvas
  /** Defaults to "rect" if omitted (for backwards compatibility). */
  printShape?: PrintShape;
  colors: ProductColor[];
  sizes: string[];
  description: string;
  details: string[];
  customizable: boolean;
};

const baseColors: Record<string, ProductColor> = {
  obsidian: { name: "Obsidian", hex: "#0a0a0a", fabric: "#0e0e10", printDefault: "#f7f7f7" },
  bone: { name: "Bone", hex: "#ece7dd", fabric: "#ece7dd", printDefault: "#0a0a0a" },
  graphite: { name: "Graphite", hex: "#2a2a2d", fabric: "#2a2a2d", printDefault: "#f7f7f7" },
  lime: { name: "Signal Lime", hex: "#d8ff36", fabric: "#d8ff36", printDefault: "#0a0a0a" }
};

export const products: Product[] = [
  {
    slug: "building-tee",
    name: "Building… Oversized Tee",
    tagline: "For the ones still shipping at 2:14 AM.",
    category: "tee",
    price: 1299,
    drop: "Drop 01 — Late Night",
    printArea: { x: 30, y: 28, w: 40, h: 30 },
    colors: [baseColors.obsidian, baseColors.bone, baseColors.graphite],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Heavyweight 240 GSM cotton, drop-shoulder cut. Everyday oversized tee for long days and late nights.",
    details: [
      "240 GSM combed cotton",
      "Drop-shoulder oversized fit",
      "Pre-shrunk, bio-washed",
      "Screen printed in India"
    ],
    customizable: true
  },
  {
    slug: "v1-hoodie",
    name: "v1.0 Premium Hoodie",
    tagline: "The first version is the bravest version.",
    category: "hoodie",
    price: 2499,
    drop: "Drop 01 — Late Night",
    printArea: { x: 32, y: 32, w: 36, h: 28 },
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.bone],
    sizes: ["S", "M", "L", "XL"],
    description:
      "400 GSM brushed-fleece hoodie with kangaroo pocket and metal-tipped drawcords. Premium everyday wear.",
    details: [
      "400 GSM brushed fleece",
      "Boxy oversized fit",
      "Metal-tipped drawcords",
      "Embroidered ‘v1.0’ chest mark"
    ],
    customizable: true
  },
  {
    slug: "offline-mode-tee",
    name: "Offline Mode Tee",
    tagline: "Notifications off. Build mode on.",
    category: "tee",
    price: 1199,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Soft-hand print on 220 GSM single jersey. Clean everyday tee with a quiet front mark.",
    details: ["220 GSM single jersey", "Relaxed boxy fit", "Soft-hand water-based print"],
    customizable: true
  },
  {
    slug: "late-night-shipping-cap",
    name: "Late Night Shipping Cap",
    tagline: "For the 1AM commits.",
    category: "cap",
    price: 899,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 35, w: 40, h: 18 },
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.lime],
    sizes: ["One Size"],
    description:
      "Unstructured 6-panel dad cap with brass buckle closure. Embroidered or printed — your call.",
    details: ["Unstructured 6-panel", "Brass buckle closure", "100% cotton twill"],
    customizable: true
  },
  {
    slug: "founder-energy-tee",
    name: "Signal Mark Tee",
    tagline: "A clean chest mark for everyday wear.",
    category: "tee",
    price: 1299,
    drop: "Drop 01 — Late Night",
    printArea: { x: 28, y: 28, w: 44, h: 32 },
    colors: [baseColors.obsidian, baseColors.bone, baseColors.lime],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Oversized statement tee with a screen-printed chest typeline.",
    details: ["240 GSM combed cotton", "Drop-shoulder oversized", "Limited run of 300 units"],
    customizable: true
  },
  {
    slug: "qr-secret-hoodie",
    name: "QR Secret Drop Hoodie",
    tagline: "Scan the sleeve. Unlock extras.",
    category: "hoodie",
    price: 2799,
    drop: "Drop 03 — QR Layer",
    printArea: { x: 32, y: 30, w: 36, h: 30 },
    colors: [baseColors.obsidian, baseColors.graphite],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Each hoodie ships with a hidden QR on the sleeve. Scan it to unlock member extras on select pieces.",
    details: ["400 GSM brushed fleece", "Sleeve QR (silicone print)", "Members extras on unlock"],
    customizable: true
  },
  {
    slug: "no-days-off-tee",
    name: "No Days Off Tee",
    tagline: "Minimal front. Quiet back hit.",
    category: "tee",
    price: 1199,
    drop: "Drop 02 — Essentials",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.graphite, baseColors.obsidian, baseColors.bone],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Minimal back hit, tiny chest mark. Easy everyday tee.",
    details: ["220 GSM single jersey", "Front + back print", "Pre-shrunk"],
    customizable: true
  },
  {
    slug: "blank-canvas-tee",
    name: "Blank Canvas Tee — Print Yours",
    tagline: "Bring your art. We’ll print it.",
    category: "tee",
    price: 999,
    drop: "Studio — Made by You",
    printArea: { x: 25, y: 25, w: 50, h: 40 },
    colors: [baseColors.bone, baseColors.obsidian, baseColors.graphite],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "The canvas. Open the Design Studio, drop your artwork or type your own line, and we’ll print it on a premium 240 GSM tee.",
    details: ["240 GSM combed cotton", "DTG + screen print options", "Ships in 5–7 days"],
    customizable: true
  },
  {
    slug: "studio-poster",
    name: "Studio Print Poster",
    tagline: "Wall-ready print. Customize or take the drop.",
    category: "poster",
    price: 799,
    drop: "Studio — Made by You",
    printArea: { x: 8, y: 8, w: 84, h: 84 },
    printShape: "full",
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["A3", "A2"],
    description:
      "Matte archival poster stock. Shop the ready design or open Design Studio and print your own artwork edge to edge.",
    details: ["200 GSM matte stock", "A3 / A2 sizes", "Ships flat or rolled"],
    customizable: true
  },
  {
    slug: "city-mug",
    name: "Desk Mug",
    tagline: "Wrap print for the everyday desk.",
    category: "mug",
    price: 599,
    drop: "Drop 02 — Essentials",
    printArea: { x: 10, y: 25, w: 80, h: 45 },
    printShape: "cylinder",
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["One Size"],
    description: "Ceramic mug with wrap print. Customize in Design Studio or buy the ready mark.",
    details: ["Ceramic", "Dishwasher safe print", "Wrap artwork area"],
    customizable: true
  },
  {
    slug: "pin-badge",
    name: "Mark Badge",
    tagline: "Small enamel-style pin. Big shelf energy.",
    category: "badge",
    price: 349,
    drop: "Drop 02 — Essentials",
    printArea: { x: 25, y: 25, w: 50, h: 50 },
    printShape: "circle",
    colors: [baseColors.obsidian, baseColors.lime, baseColors.bone],
    sizes: ["One Size"],
    description: "Circular badge for bags, boards and jackets. Custom art available in studio.",
    details: ["Metal pin back", "Circular print face", "Ships with backing card"],
    customizable: true
  },
  {
    slug: "crew-sweatshirt",
    name: "Everyday Crew Sweatshirt",
    tagline: "Midweight crew for cooler days.",
    category: "sweatshirt",
    price: 1999,
    drop: "Drop 01 — Late Night",
    printArea: { x: 32, y: 30, w: 36, h: 28 },
    colors: [baseColors.graphite, baseColors.bone, baseColors.obsidian],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "320 GSM crewneck with rib cuffs. Shop ready or customize the chest print.",
    details: ["320 GSM fleece", "Rib collar and cuffs", "Customizable chest print"],
    customizable: true
  }
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
