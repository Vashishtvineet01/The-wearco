import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bulkQuoteSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bulkQuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quote request", details: parsed.error.flatten() },
        { status: 400 }
      );
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

    return NextResponse.json({
      ok: true,
      id: quote.id,
      message:
        "Thanks — we've got your enquiry. We'll reach out within 1 business day."
    });
  } catch (e) {
    console.error("[bulk/quote] failed", e);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
