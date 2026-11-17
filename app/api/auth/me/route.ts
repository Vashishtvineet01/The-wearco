import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * Lightweight session probe for the Navbar.
 * Returns { email } when logged in, { email: null } otherwise.
 */
export async function GET() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json({ email: null });
  }
  return NextResponse.json({ email: session.email });
}
