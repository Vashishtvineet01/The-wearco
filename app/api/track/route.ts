import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Guest order lookup. Returns a public-safe subset of an order when the
 * caller provides both a matching order number AND the email on record.
 * No authentication required — the email acts as the shared secret.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("order")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: "Provide ?order=...&email=..." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order || order.email.toLowerCase() !== email) {
    return NextResponse.json(
      { error: "No order with that email + number." },
      { status: 404 }
    );
  }

  // Scrub sensitive internals before returning.
  return NextResponse.json({
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      total: order.total,
      shipping: order.shipping,
      subtotal: order.subtotal,
      name: order.name,
      address: safeJson(order.address),
      items: order.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        size: i.size,
        color: i.color,
        price: i.price,
        customDesign: Boolean(i.customDesign),
      })),
    },
  });
}

function safeJson(s: string | null) {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
