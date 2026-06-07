export type ProductCategory = "tee" | "hoodie" | "cap" | "sleeve";

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
    drop: "Drop 01 — Founder Energy",
    printArea: { x: 30, y: 28, w: 40, h: 30 },
    colors: [baseColors.obsidian, baseColors.bone, baseColors.graphite],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Heavyweight 240 GSM cotton, drop-shoulder cut. Built for back-to-back demos and red-eye flights.",
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
    drop: "Drop 01 — Founder Energy",
    printArea: { x: 32, y: 32, w: 36, h: 28 },
    colors: [baseColors.obsidian, baseColors.graphite, baseColors.bone],
    sizes: ["S", "M", "L", "XL"],
    description:
      "400 GSM brushed-fleece hoodie with kangaroo pocket and metal-tipped drawcords. The internet uniform.",
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
    drop: "Drop 02 — Internet Uniform",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.bone, baseColors.obsidian],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Soft-hand print on 220 GSM single jersey. Looks like default, feels like flow state.",
    details: ["220 GSM single jersey", "Relaxed boxy fit", "Soft-hand water-based print"],
    customizable: true
  },
  {
    slug: "late-night-shipping-cap",
    name: "Late Night Shipping Cap",
    tagline: "For the 1AM commits.",
    category: "cap",
    price: 899,
    drop: "Drop 02 — Internet Uniform",
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
    name: "Founder Energy Tee",
    tagline: "Worn by the people building it themselves.",
    category: "tee",
    price: 1299,
    drop: "Drop 01 — Founder Energy",
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
    tagline: "Scan the sleeve. Unlock the playlist.",
    category: "hoodie",
    price: 2799,
    drop: "Drop 03 — QR Layer",
    printArea: { x: 32, y: 30, w: 36, h: 30 },
    colors: [baseColors.obsidian, baseColors.graphite],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Each hoodie ships with a hidden QR on the sleeve. Scan it to unlock the founder playlist + private community.",
    details: ["400 GSM brushed fleece", "Sleeve QR (silicone print)", "Lifetime community access"],
    customizable: true
  },
  {
    slug: "no-days-off-tee",
    name: "No Days Off Tee",
    tagline: "Calm on the outside. Cron job on the inside.",
    category: "tee",
    price: 1199,
    drop: "Drop 02 — Internet Uniform",
    printArea: { x: 30, y: 30, w: 40, h: 28 },
    colors: [baseColors.graphite, baseColors.obsidian, baseColors.bone],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Minimal back hit, tiny chest mark. The uniform of quiet obsession.",
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
  }
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
