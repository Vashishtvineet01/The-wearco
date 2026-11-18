import type { ProductCategory } from "@/lib/products";

export type SizeRow = {
  size: string;
  chest: number;
  frontLength: number;
  sleeveLength: number;
};

/** Apparel size chart in inches (converted to cm in UI). */
export const APPAREL_SIZE_CHART: SizeRow[] = [
  { size: "S", chest: 38, frontLength: 27, sleeveLength: 8.5 },
  { size: "M", chest: 40, frontLength: 28, sleeveLength: 9 },
  { size: "L", chest: 42, frontLength: 29, sleeveLength: 9.5 },
  { size: "XL", chest: 44, frontLength: 30, sleeveLength: 10 },
  { size: "XXL", chest: 46, frontLength: 31, sleeveLength: 10.5 },
  { size: "3XL", chest: 48, frontLength: 32, sleeveLength: 11 },
];

export const HOODIE_SIZE_CHART: SizeRow[] = [
  { size: "S", chest: 40, frontLength: 27, sleeveLength: 24 },
  { size: "M", chest: 42, frontLength: 28, sleeveLength: 25 },
  { size: "L", chest: 44, frontLength: 29, sleeveLength: 26 },
  { size: "XL", chest: 46, frontLength: 30, sleeveLength: 27 },
  { size: "XXL", chest: 48, frontLength: 31, sleeveLength: 28 },
];

export function sizeChartFor(category: ProductCategory): SizeRow[] {
  if (category === "hoodie" || category === "sweatshirt") return HOODIE_SIZE_CHART;
  if (category === "tee" || category === "sleeve") return APPAREL_SIZE_CHART;
  return APPAREL_SIZE_CHART;
}

export function hasApparelSizing(category: ProductCategory): boolean {
  return ["tee", "hoodie", "sweatshirt", "sleeve"].includes(category);
}

export function fitCopy(category: ProductCategory): string {
  if (category === "hoodie" || category === "sweatshirt") {
    return "Relaxed fit — Room at chest, straight through the body";
  }
  return "Regular fit — Fitted at Chest and Straight on Waist Down";
}

export function toCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

/** Display MRP (~1.75×) and discount % for shop-front urgency. */
export function priceMeta(price: number) {
  const mrp = Math.round(price * 1.75);
  const off = Math.round(((mrp - price) / mrp) * 100);
  return { mrp, off };
}
