import type { ProductCategory } from "./products";

/**
 * Bulk order pricing tiers.
 *
 * Tiers are keyed per product category family — apparel items share the same
 * discount curve, while mugs / badges / posters get their own. Each tier is
 * an INCLUSIVE minimum quantity + a discount percentage off the catalog price.
 *
 * To add a new category, add an entry to TIERS_BY_CATEGORY below.
 */

export type BulkTier = {
  /** Inclusive minimum qty for this tier to apply. */
  minQty: number;
  /** Discount percentage off the catalog unit price (0-100). */
  discountPct: number;
  /** Human label, e.g. "25-49 pcs". Optional — derived if omitted. */
  label?: string;
  /**
   * If true, the tier requires contacting sales rather than self-serve add-to-
   * cart. Used to funnel enterprise-size orders into the quote form.
   */
  requiresQuote?: boolean;
};

/** Categories that share the apparel tier curve. */
const APPAREL: ProductCategory[] = ["tee", "hoodie", "sweatshirt", "cap", "sleeve"];

const APPAREL_TIERS: BulkTier[] = [
  { minQty: 10, discountPct: 10 },
  { minQty: 25, discountPct: 15 },
  { minQty: 50, discountPct: 22 },
  { minQty: 100, discountPct: 28 },
  { minQty: 250, discountPct: 35, requiresQuote: true }
];

const MUG_TIERS: BulkTier[] = [
  { minQty: 12, discountPct: 10 },
  { minQty: 25, discountPct: 18 },
  { minQty: 50, discountPct: 25 },
  { minQty: 100, discountPct: 32 },
  { minQty: 250, discountPct: 40, requiresQuote: true }
];

const BADGE_TIERS: BulkTier[] = [
  { minQty: 25, discountPct: 15 },
  { minQty: 50, discountPct: 25 },
  { minQty: 100, discountPct: 35 },
  { minQty: 250, discountPct: 42 },
  { minQty: 500, discountPct: 50, requiresQuote: true }
];

const POSTER_TIERS: BulkTier[] = [
  { minQty: 10, discountPct: 12 },
  { minQty: 25, discountPct: 20 },
  { minQty: 50, discountPct: 28 },
  { minQty: 100, discountPct: 35, requiresQuote: true }
];

export const TIERS_BY_CATEGORY: Record<ProductCategory, BulkTier[]> = {
  tee: APPAREL_TIERS,
  hoodie: APPAREL_TIERS,
  sweatshirt: APPAREL_TIERS,
  cap: APPAREL_TIERS,
  sleeve: APPAREL_TIERS,
  mug: MUG_TIERS,
  badge: BADGE_TIERS,
  poster: POSTER_TIERS
};

/** Minimum qty to unlock *any* bulk tier for this category. */
export function minBulkQty(category: ProductCategory): number {
  return TIERS_BY_CATEGORY[category][0]?.minQty ?? 10;
}

/**
 * Returns the best (highest) applicable tier for the given qty + category,
 * or null if the quantity is below the first tier.
 */
export function pickTier(category: ProductCategory, qty: number): BulkTier | null {
  const tiers = TIERS_BY_CATEGORY[category];
  let best: BulkTier | null = null;
  for (const t of tiers) {
    if (qty >= t.minQty) best = t;
  }
  return best;
}

export type BulkQuoteSummary = {
  baseUnitPrice: number; // INR
  qty: number;
  tier: BulkTier | null;
  discountPct: number;
  unitPrice: number; // INR after discount
  total: number; // INR
  savings: number; // INR vs catalog
  requiresQuote: boolean;
};

/**
 * Calculate a bulk quote for a product + qty. Pure function — safe to run on
 * server or client. `basePrice` is the catalog price for ONE unit (in INR).
 */
export function calculateBulkQuote(
  category: ProductCategory,
  basePrice: number,
  qty: number
): BulkQuoteSummary {
  const tier = pickTier(category, qty);
  const discountPct = tier?.discountPct ?? 0;
  const unitPrice = Math.round(basePrice * (1 - discountPct / 100));
  const total = unitPrice * qty;
  const savings = basePrice * qty - total;
  return {
    baseUnitPrice: basePrice,
    qty,
    tier,
    discountPct,
    unitPrice,
    total,
    savings,
    requiresQuote: !!tier?.requiresQuote
  };
}

/** Pretty label for a tier row — "25-49 pcs" / "250+ pcs". */
export function tierLabel(tiers: BulkTier[], i: number): string {
  const t = tiers[i];
  if (t.label) return t.label;
  const next = tiers[i + 1];
  if (!next) return `${t.minQty}+ pcs`;
  return `${t.minQty}–${next.minQty - 1} pcs`;
}
