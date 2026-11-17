import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Called by the browser from the Razorpay checkout success handler.
 *
 * Verifies the signature + marks the matching DB order as paid. The webhook
 * (`/api/payments/webhook`) is the authoritative source of truth if this
 * call fails or is lost — we never trust a browser-only confirmation for
 * fulfilment, we just use it to redirect the user to the success screen
 * quickly.
 */
export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ok = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!ok) {
      return NextResponse.json(
        { error: "Signature mismatch" },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotent — multiple callbacks for the same payment are fine.
    const order = await prisma.order.update({
      where: { id: existing.id },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: existing.paidAt ?? new Date(),
      },
      include: { items: true },
    });

    // Only fire the email the first time we flip to paid.
    if (!existing.paidAt) {
      void sendOrderConfirmationEmail(order);
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
    });
  } catch (e) {
    console.error("[verify]", e);
    return NextResponse.json({ error: "Verify failed" }, { status: 500 });
  }
}
