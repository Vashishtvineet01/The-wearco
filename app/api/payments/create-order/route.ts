import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validators";
import {
  copyDesignUrlToOrder,
  generateOrderNumber,
  saveDataUrlToOrder,
} from "@/lib/uploads";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  publicRazorpayKey,
} from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Create the DB order + (for online pay) a matching Razorpay order.
 *
 * Returns everything the client needs to hand to the Razorpay checkout
 * widget. For COD we skip the gateway entirely and mark the order
 * confirmed right away.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    let shipping = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;
    if (data.paymentMethod === "cod") shipping += 49;
    const total = subtotal + shipping;
    const orderNumber = generateOrderNumber();

    // 1) Create the DB order first — same shape as before.
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: data.paymentMethod === "cod" ? "confirmed" : "pending",
        paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        gst: data.gst || null,
        subtotal,
        shipping,
        total,
        paymentMethod: data.paymentMethod,
        address: JSON.stringify(data.address),
        items: {
          create: data.items.map((item) => ({
            productSlug: item.slug,
            name: item.name,
            price: item.price,
            qty: item.qty,
            size: item.size,
            color: item.color,
            customDesign: item.custom
              ? JSON.stringify({
                  text: item.custom.text,
                  textColor: item.custom.textColor,
                  font: item.custom.font,
                  imageUrl: item.custom.imageUrl,
                  posX: item.custom.posX,
                  posY: item.custom.posY,
                  scale: item.custom.scale,
                  rotation: item.custom.rotation,
                })
              : null,
          })),
        },
      },
      include: { items: true },
    });

    // 2) Persist uploaded designs to the order folder (same logic as before).
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const dbItem = order.items[i];
      if (!item.custom || !dbItem) continue;

      let designImagePath: string | null = null;
      if (item.custom.imageDataUrl?.startsWith("data:")) {
        try {
          designImagePath = await saveDataUrlToOrder(
            order.id,
            i,
            item.custom.imageDataUrl
          );
        } catch (e) {
          console.error("Failed to save data URL", e);
        }
      } else if (item.custom.imageUrl) {
        designImagePath = await copyDesignUrlToOrder(
          order.id,
          i,
          item.custom.imageUrl
        );
      }

      if (designImagePath) {
        const custom = {
          text: item.custom.text,
          textColor: item.custom.textColor,
          font: item.custom.font,
          imageUrl: designImagePath,
          posX: item.custom.posX,
          posY: item.custom.posY,
          scale: item.custom.scale,
          rotation: item.custom.rotation,
        };
        await prisma.orderItem.update({
          where: { id: dbItem.id },
          data: {
            designImagePath,
            customDesign: JSON.stringify(custom),
          },
        });
      }
    }

    // 3a) COD — done, no gateway call. Fire the confirmation email async.
    if (data.paymentMethod === "cod") {
      void sendOrderConfirmationEmail(order);
      return NextResponse.json({
        ok: true,
        mode: "cod",
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: order.total,
      });
    }

    // 3b) Online pay — if Razorpay isn't configured (local dev), fall back
    //     to a demo-mode success path so checkout still completes.
    if (!isRazorpayConfigured()) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: "confirmed",
          paidAt: new Date(),
        },
      });
      void sendOrderConfirmationEmail(order);
      return NextResponse.json({
        ok: true,
        mode: "demo",
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: order.total,
      });
    }

    // 3c) Real Razorpay — create a gateway order and return the handles the
    //     client needs to open the hosted checkout.
    const client = getRazorpayClient();
    const rzpOrder = await client.orders.create({
      amount: total * 100, // Razorpay works in paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      ok: true,
      mode: "razorpay",
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      razorpay: {
        orderId: rzpOrder.id,
        amount: total * 100,
        currency: "INR",
        keyId: publicRazorpayKey(),
      },
    });
  } catch (e) {
    console.error("[create-order]", e);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
