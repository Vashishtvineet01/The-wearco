/**
 * Shared handler logic for the public REST API.
 *
 * These functions are framework-agnostic — they return plain data + status
 * codes so both the internal `/api/*` routes and the public `/api/v1/*`
 * routes can call the same code.
 */
import { prisma } from "@/lib/prisma";
import { getActiveProducts, getProductBySlug } from "@/lib/catalog";
import {
  bulkQuoteSchema,
  newsletterSchema,
  orderSchema
} from "@/lib/validators";
import {
  copyDesignUrlToOrder,
  generateOrderNumber,
  saveDataUrlToOrder,
  saveDesignUpload
} from "@/lib/uploads";
import { calculateBulkQuote, TIERS_BY_CATEGORY } from "@/lib/bulk";
import type { Product, ProductCategory } from "@/lib/products";

export type HandlerResult<T = unknown> = {
  status: number;
  body: T;
};

/** --------------------------------------------------------------------- */
/** PRODUCTS                                                              */
/** --------------------------------------------------------------------- */

export async function listProducts(opts?: {
  category?: string;
}): Promise<HandlerResult<{ products: Product[] }>> {
  const products = await getActiveProducts();
  const filtered = opts?.category
    ? products.filter((p) => p.category === opts.category)
    : products;
  return { status: 200, body: { products: filtered } };
}

export async function getProduct(slug: string): Promise<HandlerResult> {
  const product = await getProductBySlug(slug);
  if (!product) {
    return { status: 404, body: { error: "Product not found" } };
  }
  return { status: 200, body: { product } };
}

/** --------------------------------------------------------------------- */
/** ORDERS                                                                */
/** --------------------------------------------------------------------- */

export async function createOrder(raw: unknown): Promise<HandlerResult> {
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "Invalid order", details: parsed.error.flatten() }
    };
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

  // Persist design images under the order folder
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
        rotation: item.custom.rotation
      };
      await prisma.orderItem.update({
        where: { id: dbItem.id },
        data: {
          designImagePath,
          customDesign: JSON.stringify(custom)
        }
      });
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total
    }
  };
}

/** Look up a single order by order number (public — for post-purchase tracking). */
export async function getOrderByNumber(
  orderNumber: string
): Promise<HandlerResult> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true }
  });
  if (!order) return { status: 404, body: { error: "Order not found" } };

  // Strip internal / PII fields that a stranger with the order # shouldn't see
  return {
    status: 200,
    body: {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({
          name: i.name,
          price: i.price,
          qty: i.qty,
          size: i.size,
          color: i.color,
          productSlug: i.productSlug
        }))
      }
    }
  };
}

/** --------------------------------------------------------------------- */
/** UPLOADS                                                               */
/** --------------------------------------------------------------------- */

export async function uploadDesign(form: FormData): Promise<HandlerResult> {
  const file = form.get("file");
  if (!(file instanceof File)) {
    return { status: 400, body: { error: "No file provided" } };
  }
  try {
    const saved = await saveDesignUpload(file);
    return { status: 200, body: { url: saved.url } };
  } catch (e) {
    return {
      status: 400,
      body: { error: e instanceof Error ? e.message : "Upload failed" }
    };
  }
}

/** --------------------------------------------------------------------- */
/** BULK QUOTES                                                           */
/** --------------------------------------------------------------------- */

export async function createBulkQuote(raw: unknown): Promise<HandlerResult> {
  const parsed = bulkQuoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        error: "Invalid quote request",
        details: parsed.error.flatten()
      }
    };
  }
  const d = parsed.data;
  const quote = await prisma.bulkQuote.create({
    data: {
      status: "new",
      email: d.email.toLowerCase().trim(),
      name: d.name.trim(),
      company: d.company?.trim() || null,
      phone: d.phone?.trim() || null,
      productSlug: d.productSlug || null,
      productName: d.productName?.trim() || null,
      category: d.category || null,
      qty: d.qty,
      color: d.color || null,
      size: d.size || null,
      printShape: d.printShape || null,
      deadline: d.deadline ? new Date(d.deadline) : null,
      message: d.message.trim(),
      fileUrl: d.fileUrl || null,
      estimatedUnitPrice: d.estimatedUnitPrice ?? null,
      estimatedTotal: d.estimatedTotal ?? null,
      tierDiscountPercent: d.tierDiscountPercent ?? null
    }
  });

  return {
    status: 200,
    body: {
      ok: true,
      id: quote.id,
      message:
        "Thanks — we've got your enquiry. We'll reach out within 1 business day."
    }
  };
}

/**
 * Pricing calculator endpoint — returns tier info + estimated total for a
 * (category, basePrice, qty) triple. Pure read, no DB write.
 */
export function calculatePricing(input: {
  category: ProductCategory;
  basePrice: number;
  qty: number;
}): HandlerResult {
  const tiers = TIERS_BY_CATEGORY[input.category];
  if (!tiers) {
    return { status: 400, body: { error: "Unknown category" } };
  }
  const quote = calculateBulkQuote(input.category, input.basePrice, input.qty);
  return {
    status: 200,
    body: {
      ...quote,
      tiers
    }
  };
}

/** --------------------------------------------------------------------- */
/** NEWSLETTER                                                            */
/** --------------------------------------------------------------------- */

export async function subscribeNewsletter(raw: unknown): Promise<HandlerResult> {
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid email" } };
  }
  const email = parsed.data.email.toLowerCase().trim();
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {}
  });
  return { status: 200, body: { ok: true } };
}
