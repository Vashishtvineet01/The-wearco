import type { Product, ProductCategory } from "@/lib/products";

export type Highlight = { label: string; value: string };

const CATEGORY_HIGHLIGHTS: Record<
  ProductCategory,
  Highlight[]
> = {
  tee: [
    { label: "Sleeve Style", value: "Half Sleeve" },
    { label: "Fit", value: "Oversized Fit" },
    { label: "Fabric", value: "Cotton" },
    { label: "Design", value: "Graphic Print" },
    { label: "Occasion", value: "Casual" },
    { label: "Neck", value: "Crew Neck" },
  ],
  hoodie: [
    { label: "Sleeve Style", value: "Full Sleeve" },
    { label: "Fit", value: "Relaxed Fit" },
    { label: "Fabric", value: "Fleece Cotton" },
    { label: "Design", value: "Graphic Print" },
    { label: "Occasion", value: "Casual / Winter" },
    { label: "Neck", value: "Hooded" },
  ],
  sweatshirt: [
    { label: "Sleeve Style", value: "Full Sleeve" },
    { label: "Fit", value: "Regular Fit" },
    { label: "Fabric", value: "French Terry" },
    { label: "Design", value: "Graphic Print" },
    { label: "Occasion", value: "Casual" },
    { label: "Neck", value: "Crew Neck" },
  ],
  sleeve: [
    { label: "Sleeve Style", value: "Full Sleeve" },
    { label: "Fit", value: "Regular Fit" },
    { label: "Fabric", value: "Cotton" },
    { label: "Design", value: "Graphic Print" },
    { label: "Occasion", value: "Casual" },
    { label: "Neck", value: "Crew Neck" },
  ],
  cap: [
    { label: "Style", value: "Baseball Cap" },
    { label: "Fit", value: "Adjustable" },
    { label: "Fabric", value: "Cotton Twill" },
    { label: "Design", value: "Embroidered" },
    { label: "Occasion", value: "Everyday" },
    { label: "Closure", value: "Snapback" },
  ],
  mug: [
    { label: "Material", value: "Ceramic" },
    { label: "Capacity", value: "325 ml" },
    { label: "Finish", value: "Gloss Print" },
    { label: "Design", value: "Full Wrap" },
    { label: "Occasion", value: "Gift / Desk" },
    { label: "Care", value: "Hand wash" },
  ],
  badge: [
    { label: "Style", value: "Enamel Pin" },
    { label: "Finish", value: "Metal" },
    { label: "Backing", value: "Rubber Clutch" },
    { label: "Design", value: "Custom Art" },
    { label: "Occasion", value: "Collectible" },
    { label: "Size", value: "~1 inch" },
  ],
  poster: [
    { label: "Paper", value: "Matte Art" },
    { label: "Finish", value: "Fade-resistant" },
    { label: "Design", value: "Full Bleed" },
    { label: "Frame", value: "Unframed" },
    { label: "Occasion", value: "Wall / Studio" },
    { label: "Care", value: "Keep dry" },
  ],
};

export function highlightsFor(product: Product): Highlight[] {
  return CATEGORY_HIGHLIGHTS[product.category] || CATEGORY_HIGHLIGHTS.tee;
}

export type OfferCard = {
  title: string;
  code: string;
};

export function offersFor(product: Product): OfferCard[] {
  const tier = product.price >= 1500 ? 500 : 300;
  return [
    {
      title: `Buy 2+ pieces & save ₹${tier} on apparel`,
      code: `WEAR${tier}`,
    },
    {
      title: "Extra ₹100 off on your first app order",
      code: "APP100",
    },
  ];
}

export type Review = {
  name: string;
  rating: number;
  date: string;
  text: string;
  verified?: boolean;
};

/** Deterministic sample reviews per product slug (no backend yet). */
export function reviewsFor(product: Product): Review[] {
  const seed = product.slug.length;
  const pool: Review[] = [
    {
      name: "Aarav S.",
      rating: 5,
      date: "2 weeks ago",
      text: "Fit matches the size chart. Fabric feels solid for daily wear.",
      verified: true,
    },
    {
      name: "Meera K.",
      rating: 4,
      date: "1 month ago",
      text: "Print quality is clean. Went one size up for oversized — perfect.",
      verified: true,
    },
    {
      name: "Rohan P.",
      rating: 5,
      date: "3 weeks ago",
      text: "Delivery was quick and packing was neat. Will reorder.",
      verified: true,
    },
    {
      name: "Ishita V.",
      rating: 4,
      date: "5 days ago",
      text: "Looks exactly like the mockup. Soft after first wash.",
      verified: false,
    },
  ];
  const count = 2 + (seed % 3);
  return pool.slice(0, count);
}

export function estimateDeliveryLabel(pincode: string): string | null {
  const pin = pincode.replace(/\D/g, "");
  if (pin.length !== 6) return null;
  const metroPrefixes = ["11", "12", "40", "56", "60", "70", "50", "38"];
  const isMetro = metroPrefixes.some((p) => pin.startsWith(p));
  return isMetro ? "tomorrow" : "in 3–5 days";
}
