import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook endpoint — authoritative source of truth for payment
 * state. Register this URL (`https://<host>/api/payments/webhook`) in the
 * Razorpay dashboard with event types:
 *   - payment.captured
 *   - payment.failed
 *   - refund.processed
 * and the secret stored in RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature({ rawBody, signature })) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string } };
      refund?: { entity?: { payment_id?: string } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad json" }, { status: 400 });
  }

  const name = event.event;
  const payment = event.payload?.payment?.entity;
  const refund = event.payload?.refund?.entity;

  try {
    if (name === "payment.captured" && payment?.order_id) {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: payment.order_id },
        include: { items: true },
      });
      if (order && order.paymentStatus !== "paid") {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "paid",
            status: "confirmed",
            razorpayPaymentId: payment.id ?? order.razorpayPaymentId,
            paidAt: new Date(),
          },
          include: { items: true },
        });
        // Only send if the browser-side verify hadn't already triggered it.
        void sendOrderConfirmationEmail(updated);
      }
    } else if (name === "payment.failed" && payment?.order_id) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: payment.order_id },
        data: { paymentStatus: "failed" },
      });
    } else if (name === "refund.processed" && refund?.payment_id) {
      await prisma.order.updateMany({
        where: { razorpayPaymentId: refund.payment_id },
        data: { paymentStatus: "refunded", status: "cancelled" },
      });
    }
  } catch (e) {
    console.error("[webhook]", e);
    // Still 200 so Razorpay doesn't retry forever — we logged it.
  }

  return NextResponse.json({ ok: true });
}
