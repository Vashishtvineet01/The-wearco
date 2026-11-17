import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getCustomerSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
