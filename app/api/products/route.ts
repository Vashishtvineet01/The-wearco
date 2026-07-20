import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({ products });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
