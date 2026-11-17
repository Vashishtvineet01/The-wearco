import { NextResponse } from "next/server";
import { verifyPhoneOtp } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone ?? "");
    const code = String(body?.code ?? "");
    const customer = await verifyPhoneOtp(phone, code);
    return NextResponse.json({
      ok: true,
      phone: customer.phone,
      email: customer.email,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
