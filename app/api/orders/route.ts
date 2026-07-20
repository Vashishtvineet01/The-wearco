import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validators";
import {
  copyDesignUrlToOrder,
  generateOrderNumber,
  saveDataUrlToOrder
} from "@/lib/uploads";

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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "pending",
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
                  rotation: item.custom.rotation
                })
              : null
          }))
        }
      },
      include: { items: true }
    });

    // Persist design images to order folder
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
        const custom = item.custom
          ? {
              text: item.custom.text,
              textColor: item.custom.textColor,
              font: item.custom.font,
              imageUrl: designImagePath,
              posX: item.custom.posX,
              posY: item.custom.posY,
              scale: item.custom.scale,
              rotation: item.custom.rotation
            }
          : null;
        await prisma.orderItem.update({
          where: { id: dbItem.id },
          data: {
            designImagePath,
            customDesign: custom ? JSON.stringify(custom) : null
          }
        });
      }
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
