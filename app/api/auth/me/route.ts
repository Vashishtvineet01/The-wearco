import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Session probe for the Navbar.
 * Returns { name, email, phone, label, initials } when logged in.
 */
export async function GET() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.customerId) {
    return NextResponse.json({
      loggedIn: false,
      name: null,
      email: null,
      phone: null,
      label: null,
      initials: null,
    });
  }

  let name: string | null = null;
  let email = session.email ?? null;
  let phone = session.phone ?? null;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { name: true, email: true, phone: true },
    });
    name = customer?.name?.trim() || null;
    email = customer?.email ?? email;
    phone = customer?.phone ?? phone;
  } catch {
    // DB hiccup — fall back to session fields only.
  }
  const phoneDisplay = phone
    ? phone.replace(/^\+91/, "").replace(/^91/, "")
    : null;

  const label =
    name ||
    (email ? email.split("@")[0] : null) ||
    phoneDisplay ||
    "Member";

  const initialsSource = name || email || phoneDisplay || "M";
  const initials = initialsSource
    .replace(/^\+/, "")
    .slice(0, 2)
    .toUpperCase();

  return NextResponse.json({
    loggedIn: true,
    name,
    email,
    phone,
    label,
    initials,
  });
}
