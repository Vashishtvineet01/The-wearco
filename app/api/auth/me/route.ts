import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * Lightweight session probe for the Navbar.
 * Returns { email, phone, label } when logged in.
 */
export async function GET() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.customerId) {
    return NextResponse.json({ email: null, phone: null, label: null });
  }
  const label =
    session.email ||
    (session.phone ? session.phone.replace(/^\+91/, "") : null);
  return NextResponse.json({
    email: session.email ?? null,
    phone: session.phone ?? null,
    label,
  });
}
