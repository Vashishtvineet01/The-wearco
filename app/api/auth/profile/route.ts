import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  establishCustomerSession,
  getCustomerSession,
  isValidEmail,
  normalizeEmail,
} from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const session = await getCustomerSession();
    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const emailRaw = String(body?.email || "").trim();
    const genderRaw = String(body?.gender || "")
      .toLowerCase()
      .trim();

    if (name && name.length < 2) {
      return NextResponse.json(
        { error: "Enter a valid full name." },
        { status: 400 },
      );
    }

    const email = emailRaw ? normalizeEmail(emailRaw) : null;
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email." },
        { status: 400 },
      );
    }

    const gender =
      genderRaw === "male" || genderRaw === "female" || genderRaw === "other"
        ? genderRaw
        : undefined;

    if (email) {
      const taken = await prisma.customer.findUnique({ where: { email } });
      if (taken && taken.id !== session.customerId) {
        return NextResponse.json(
          { error: "That email is already linked to another account." },
          { status: 409 },
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id: session.customerId },
      data: {
        ...(name ? { name } : {}),
        ...(email !== null ? { email } : {}),
        ...(gender ? { gender } : {}),
      },
    });

    await establishCustomerSession(customer);
    return NextResponse.json({
      ok: true,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gender: customer.gender,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
